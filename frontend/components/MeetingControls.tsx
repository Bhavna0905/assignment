"use client";

import { useCallback, useState } from "react";
import {
  Copy,
  MessageSquare,
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
  Phone,
  Share2,
  Users,
  Video,
  VideoOff,
} from "lucide-react";
import MeetingControlButton from "@/components/MeetingControlButton";
import ParticipantsPanel from "@/components/ParticipantsPanel";
import { useCanScreenShare } from "@/hooks/useMediaQuery";
import type { MeetingParticipant } from "@/lib/types";
import { getMeetingInviteUrl } from "@/lib/utils";

interface MeetingControlsProps {
  meetingCode: string;
  isMuted: boolean;
  isCameraOff: boolean;
  isSharingScreen: boolean;
  participantCount: number;
  isHost: boolean;
  participants: MeetingParticipant[];
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
  onMuteAll: () => void;
  onRemoveParticipant: (peerId: string) => void;
  onLeave: () => void;
  chatOpen: boolean;
  chatUnreadCount: number;
  onToggleChat: () => void;
  pinnedPeerId?: string | null;
  onTogglePin?: (peerId: string) => void;
  onLinkCopied?: () => void;
}

export default function MeetingControls({
  meetingCode,
  isMuted,
  isCameraOff,
  isSharingScreen,
  participantCount,
  isHost,
  participants,
  onToggleMic,
  onToggleCamera,
  onToggleScreenShare,
  onMuteAll,
  onRemoveParticipant,
  onLeave,
  chatOpen,
  chatUnreadCount,
  onToggleChat,
  pinnedPeerId = null,
  onTogglePin,
  onLinkCopied,
}: MeetingControlsProps) {
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const canScreenShare = useCanScreenShare();

  const time = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const inviteUrl = getMeetingInviteUrl(meetingCode);
  const shareText = `Join my meeting: ${inviteUrl}`;

  const copyMeetingLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
    } catch {
      try {
        const input = document.createElement("textarea");
        input.value = inviteUrl;
        input.style.position = "fixed";
        input.style.opacity = "0";
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      } catch {
        return;
      }
    }
    onLinkCopied?.();
  }, [inviteUrl, onLinkCopied]);

  const shareMeetingLink = useCallback(async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Join my meeting",
          text: shareText,
          url: inviteUrl,
        });
        return;
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
      }
    }
    await copyMeetingLink();
  }, [copyMeetingLink, inviteUrl, shareText]);

  return (
    <footer className="shrink-0 border-t border-gray-700/50 bg-[#2D2D2D] pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div className="hidden min-w-0 px-3 pt-2 text-xs text-[#747487] md:block md:px-4">
        <span className="truncate font-mono text-white">{meetingCode}</span>
        <span> · {time}</span>
      </div>

      <div
        className="mx-auto flex w-full max-w-[100vw] flex-wrap items-end justify-center gap-x-2 gap-y-2 px-2 py-2 sm:gap-x-2.5 sm:px-4 md:gap-x-3"
        role="toolbar"
        aria-label="Meeting controls"
      >
        <MeetingControlButton
          onClick={onToggleMic}
          active={isMuted}
          label={isMuted ? "Unmute microphone" : "Mute microphone"}
          tooltip={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <MicOff className="h-5 w-5" aria-hidden />
          ) : (
            <Mic className="h-5 w-5" aria-hidden />
          )}
        </MeetingControlButton>

        <MeetingControlButton
          onClick={onToggleCamera}
          active={isCameraOff}
          label={isCameraOff ? "Turn on camera" : "Turn off camera"}
          tooltip={isCameraOff ? "Start Video" : "Stop Video"}
        >
          {isCameraOff ? (
            <VideoOff className="h-5 w-5" aria-hidden />
          ) : (
            <Video className="h-5 w-5" aria-hidden />
          )}
        </MeetingControlButton>

        {canScreenShare && (
          <MeetingControlButton
            onClick={onToggleScreenShare}
            active={isSharingScreen}
            activeStyle="primary"
            label={
              isSharingScreen ? "Stop screen sharing" : "Share your screen"
            }
            tooltip="Share Screen"
          >
            {isSharingScreen ? (
              <MonitorOff className="h-5 w-5" aria-hidden />
            ) : (
              <Monitor className="h-5 w-5" aria-hidden />
            )}
          </MeetingControlButton>
        )}

        {isHost && (
          <>
            <MeetingControlButton
              onClick={copyMeetingLink}
              label="Copy meeting link"
              tooltip="Copy Meeting Link"
            >
              <Copy className="h-5 w-5" aria-hidden />
            </MeetingControlButton>

            <MeetingControlButton
              onClick={shareMeetingLink}
              label="Share meeting link"
              tooltip="Share Meeting Link"
            >
              <Share2 className="h-5 w-5" aria-hidden />
            </MeetingControlButton>
          </>
        )}

        <MeetingControlButton
          onClick={onToggleChat}
          active={chatOpen}
          activeStyle="primary"
          label="Meeting chat"
          tooltip="Open Chat"
          ariaExpanded={chatOpen}
          badge={
            chatUnreadCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold">
                {chatUnreadCount > 9 ? "9+" : chatUnreadCount}
              </span>
            ) : undefined
          }
        >
          <MessageSquare className="h-5 w-5" aria-hidden />
        </MeetingControlButton>

        <div className="relative shrink-0">
          <MeetingControlButton
            onClick={() => setParticipantsOpen((open) => !open)}
            active={participantsOpen}
            activeStyle="primary"
            label={`Participants (${participantCount})`}
            tooltip="Participants"
            ariaExpanded={participantsOpen}
            badge={
              <span className="absolute -bottom-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-zoom-primary px-1 text-[10px] font-semibold text-white">
                {participantCount}
              </span>
            }
          >
            <Users className="h-5 w-5" aria-hidden />
          </MeetingControlButton>
          <ParticipantsPanel
            open={participantsOpen}
            onClose={() => setParticipantsOpen(false)}
            participants={participants}
            isHost={isHost}
            onMuteAll={onMuteAll}
            onRemoveParticipant={onRemoveParticipant}
            pinnedPeerId={pinnedPeerId}
            onTogglePin={onTogglePin}
          />
        </div>

        <MeetingControlButton
          onClick={onLeave}
          activeStyle="leave"
          label="Leave meeting"
          tooltip="Leave Meeting"
          className="!h-10 !w-auto !px-4 sm:!h-11 sm:!px-5"
        >
          <Phone className="h-5 w-5 rotate-[135deg]" aria-hidden />
        </MeetingControlButton>
      </div>

      <div className="border-t border-[#3D3D3D]/60 px-3 py-1.5 text-center text-[11px] text-[#747487] md:hidden">
        <span className="font-mono text-white">{meetingCode}</span>
        <span> · {time}</span>
      </div>
    </footer>
  );
}
