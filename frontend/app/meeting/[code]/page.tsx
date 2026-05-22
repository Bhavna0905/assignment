"use client";

import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import MeetingChatPanel from "@/components/MeetingChatPanel";
import MeetingControls from "@/components/MeetingControls";
import PreJoin from "@/components/PreJoin";
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
    peers,
    isMuted,
    isCameraOff,
    isSharingScreen,
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
      <div className="flex min-h-dvh items-center justify-center bg-[#1A1A1A] px-4 text-[#747487]">
        Loading meeting…
      </div>
    );
  }

  if (pageError && !joined) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[#1A1A1A] px-4 pb-safe text-center">
        <p className="text-red-400">{pageError}</p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="rounded-md bg-[#2D8CFF] px-4 py-2 text-white hover:bg-[#0E71EB]"
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

  return (
    <div className="flex h-dvh max-h-dvh flex-col overflow-hidden bg-[#1A1A1A]">
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
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="min-h-0 min-w-0 flex-1">
        <VideoGrid
          localStream={localStream}
          localName={displayName}
          isMuted={isMuted}
          isCameraOff={isCameraOff}
          isSharingScreen={isSharingScreen}
          peers={peers}
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
      />
    </div>
  );
}
