"use client";

import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import MeetingChatPanel from "@/components/MeetingChatPanel";
import MeetingControls from "@/components/MeetingControls";
import MeetingHostInviteBar from "@/components/MeetingHostInviteBar";
import PreJoin from "@/components/PreJoin";
import Toast from "@/components/Toast";
import VideoGrid from "@/components/VideoGrid";
import { useWebRTC } from "@/hooks/useWebRTC";
import { api, setApiUserEmail } from "@/lib/api";
import { setFlash } from "@/lib/flash";

type JoinSession = {
  displayName: string;
  isHost: boolean;
};

export default function MeetingPage() {
  const params = useParams();
  const router = useRouter();
  const { data: authSession } = useSession();
  const defaultDisplayName = authSession?.user?.name ?? "";
  const code =
    typeof params.code === "string"
      ? decodeURIComponent(params.code)
      : Array.isArray(params.code)
        ? decodeURIComponent(params.code[0] ?? "")
        : "";

  const [joinSession, setJoinSession] = useState<JoinSession | null>(null);
  const [validating, setValidating] = useState(true);
  const [meetingValid, setMeetingValid] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatDraft, setChatDraft] = useState("");
  const [pinnedPeerId, setPinnedPeerId] = useState<string | null>(null);
  const [linkCopiedToast, setLinkCopiedToast] = useState(false);

  const displayName = joinSession?.displayName ?? "";
  const isMeetingHost = joinSession?.isHost ?? false;
  const joined = joinSession !== null;

  const handleKicked = useCallback(() => {
    setFlash({
      type: "info",
      message: "You were removed from the meeting by the host.",
    });
    router.push("/");
  }, [router]);

  useEffect(() => {
    if (authSession?.user?.email) {
      setApiUserEmail(authSession.user.email);
    }
  }, [authSession]);

  const {
    localStream,
    localCameraStream,
    peers,
    isMuted,
    isCameraOff,
    isSharingScreen,
    screenStream,
    activeSpeaker,
    shareError,
    clearShareError,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
    isHost,
    participants,
    muteAllParticipants,
    removeParticipant,
    leave,
    error: rtcError,
    retry,
    canRetry,
    myPeerId,
    chatMessages,
    chatUnreadCount,
    chatError,
    sendChatMessage,
    clearChatUnread,
  } = useWebRTC(code, displayName, joined, isMeetingHost, handleKicked, chatOpen);

  const handleTogglePin = useCallback((peerId: string) => {
    setPinnedPeerId((current) => (current === peerId ? null : peerId));
  }, []);

  useEffect(() => {
    if (pinnedPeerId && pinnedPeerId !== myPeerId && !peers.has(pinnedPeerId)) {
      setPinnedPeerId(null);
    }
  }, [peers, pinnedPeerId, myPeerId]);

  const handleToggleChat = useCallback(() => {
    setChatOpen((open) => {
      if (!open) clearChatUnread();
      return !open;
    });
  }, [clearChatUnread]);

  const handleSendChat = useCallback(() => {
    const text = chatDraft.trim();
    if (!text) return;
    sendChatMessage(text);
    setChatDraft("");
  }, [chatDraft, sendChatMessage]);

  useEffect(() => {
    if (!code) {
      setFlash({ type: "error", message: "Meeting not found" });
      router.replace("/");
      return;
    }

    api
      .validateMeeting(code)
      .then(({ ok }) => {
        if (!ok) {
          setFlash({ type: "error", message: "Meeting not found" });
          router.replace("/");
          return;
        }
        setMeetingValid(true);
      })
      .catch(() => {
        setPageError(
          "Could not reach the server. Make sure the backend is running."
        );
        setMeetingValid(false);
      })
      .finally(() => setValidating(false));
  }, [code, router]);

  const handleJoin = useCallback(
    async (name: string) => {
      if (!meetingValid || joining) return;
      setJoining(true);
      setPageError(null);
      try {
        const join = await api.joinMeeting(code, name);
        setJoinSession({ displayName: name, isHost: join.is_host });
      } catch (err) {
        setPageError(
          err instanceof Error ? err.message : "Failed to join meeting."
        );
      } finally {
        setJoining(false);
      }
    },
    [code, meetingValid, joining]
  );

  if (validating) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-zoom-navy px-4 text-gray-400">
        Loading meeting…
      </div>
    );
  }

  if (pageError && !joined) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-zoom-navy px-4 pb-safe text-center">
        <p className="text-red-400">{pageError}</p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="zoom-btn-primary"
        >
          Back to Home
        </button>
      </div>
    );
  }

  if (!joined) {
    return (
      <>
        <PreJoin
          meetingCode={code}
          defaultDisplayName={defaultDisplayName}
          onJoin={handleJoin}
          onBack={() => router.push("/")}
        />
        {joining && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 text-white">
            Joining…
          </div>
        )}
        {pageError && (
          <div className="fixed bottom-4 left-4 right-4 z-[200] mx-auto max-w-md rounded-md bg-red-600 px-4 py-2 text-center text-sm text-white sm:left-1/2 sm:right-auto sm:-translate-x-1/2">
            {pageError}
          </div>
        )}
      </>
    );
  }

  const showServerError = rtcError && canRetry;

  const screenSharingPeerId = activeSpeaker;

  return (
    <div className="flex h-[100dvh] max-h-[100dvh] w-full max-w-[100vw] flex-col overflow-hidden overflow-x-hidden bg-zoom-navy">
      {linkCopiedToast && (
        <Toast
          message="Meeting link copied successfully"
          variant="success"
          onDismiss={() => setLinkCopiedToast(false)}
        />
      )}
      {shareError && (
        <Toast
          message={shareError}
          variant="info"
          onDismiss={clearShareError}
        />
      )}
      {showServerError && (
        <div className="flex flex-col gap-2 bg-red-600 px-3 py-2 text-sm text-white sm:flex-row sm:items-center sm:justify-between sm:px-4">
          <span className="text-center sm:text-left">
            Could not connect to meeting server
          </span>
          <button
            type="button"
            onClick={retry}
            className="shrink-0 rounded-md bg-white/20 px-3 py-1.5 font-medium hover:bg-white/30 sm:py-1"
          >
            Retry
          </button>
        </div>
      )}
      {rtcError && !canRetry && (
        <div className="bg-red-600 px-3 py-2 text-center text-xs text-white sm:px-4 sm:text-sm">
          {rtcError}
        </div>
      )}
      {isHost && (
        <MeetingHostInviteBar
          meetingCode={code}
          onLinkCopied={() => {
            setLinkCopiedToast(true);
            window.setTimeout(() => setLinkCopiedToast(false), 2500);
          }}
        />
      )}
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden md:flex-row">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <VideoGrid
            localStream={localStream}
            localCameraStream={localCameraStream}
            localName={displayName}
            isMuted={isMuted}
            isCameraOff={isCameraOff}
            isSharingScreen={isSharingScreen}
            screenStream={screenStream}
            screenSharingPeerId={screenSharingPeerId}
            peers={peers}
            myPeerId={myPeerId}
            pinnedPeerId={pinnedPeerId}
            onTogglePin={handleTogglePin}
          />
        </div>
        <MeetingChatPanel
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          messages={chatMessages}
          myPeerId={myPeerId}
          draft={chatDraft}
          onDraftChange={setChatDraft}
          onSend={handleSendChat}
          sendError={chatError}
        />
      </div>
      <MeetingControls
        meetingCode={code}
        isMuted={isMuted}
        isCameraOff={isCameraOff}
        isSharingScreen={isSharingScreen}
        participantCount={peers.size + 1}
        isHost={isHost}
        participants={participants}
        onToggleMic={toggleMic}
        onToggleCamera={toggleCamera}
        onToggleScreenShare={toggleScreenShare}
        onMuteAll={muteAllParticipants}
        onRemoveParticipant={removeParticipant}
        onLeave={leave}
        chatOpen={chatOpen}
        chatUnreadCount={chatUnreadCount}
        onToggleChat={handleToggleChat}
        pinnedPeerId={pinnedPeerId}
        onTogglePin={handleTogglePin}
        onLinkCopied={() => {
          setLinkCopiedToast(true);
          window.setTimeout(() => setLinkCopiedToast(false), 2500);
        }}
      />
    </div>
  );
}
