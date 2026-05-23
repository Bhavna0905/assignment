"use client";

import { useState } from "react";
import {
  MessageSquare,
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
  Phone,
  Users,
  Video,
  VideoOff,
} from "lucide-react";
import ParticipantsPanel from "@/components/ParticipantsPanel";
import { useCanScreenShare } from "@/hooks/useMediaQuery";
import type { MeetingParticipant } from "@/lib/types";

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
}

function ControlButton({
  onClick,
  active,
  activeStyle = "danger",
  icon: Icon,
  label,
}: {
  onClick: () => void;
  active?: boolean;
  activeStyle?: "danger" | "primary";
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  const activeClass =
    activeStyle === "primary"
      ? "bg-zoom-primary text-white hover:bg-zoom-primary-hover"
      : "bg-red-600 text-white hover:bg-red-700";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`flex h-12 w-12 min-h-[48px] min-w-[48px] items-center justify-center rounded-full transition md:h-14 md:w-14 ${
        active
          ? activeClass
          : "bg-[#3D3D3D] text-white hover:bg-[#4D4D4D]"
      }`}
    >
      <Icon className="h-5 w-5 md:h-6 md:w-6" />
    </button>
  );
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
}: MeetingControlsProps) {
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const canScreenShare = useCanScreenShare();

  const time = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const shareLabel = isSharingScreen ? "Stop Share" : "Share Screen";

  return (
    <footer className="shrink-0 border-t border-gray-700/50 bg-[#2D2D2D] pb-safe">
      <div className="flex h-16 items-center justify-between px-3 md:h-20 md:px-4">
        <div className="hidden min-w-0 flex-1 text-sm text-[#747487] md:block lg:max-w-[240px]">
          <span className="truncate font-mono text-white">{meetingCode}</span>
          <span> · {time}</span>
        </div>

        <div className="mx-auto flex items-center gap-2 md:gap-4">
          <ControlButton
            onClick={onToggleMic}
            active={isMuted}
            icon={isMuted ? MicOff : Mic}
            label="Mute"
          />
          <ControlButton
            onClick={onToggleCamera}
            active={isCameraOff}
            icon={isCameraOff ? VideoOff : Video}
            label="Video"
          />

          {canScreenShare && (
            <div className="hidden sm:flex">
              <ControlButton
                onClick={onToggleScreenShare}
                active={isSharingScreen}
                activeStyle="primary"
                icon={isSharingScreen ? MonitorOff : Monitor}
                label={shareLabel}
              />
            </div>
          )}

          <button
            type="button"
            onClick={onToggleChat}
            aria-label="Meeting chat"
            aria-expanded={chatOpen}
            className={`relative flex h-12 w-12 min-h-[48px] min-w-[48px] items-center justify-center rounded-full text-white transition hover:bg-[#4D4D4D] md:h-14 md:w-14 ${
              chatOpen ? "bg-[#4D4D4D]" : "bg-[#3D3D3D]"
            }`}
          >
            <MessageSquare className="h-5 w-5 md:h-6 md:w-6" />
            {chatUnreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold">
                {chatUnreadCount > 9 ? "9+" : chatUnreadCount}
              </span>
            )}
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setParticipantsOpen((open) => !open)}
              aria-label={`Participants (${participantCount})`}
              aria-expanded={participantsOpen}
              className={`relative flex h-12 w-12 min-h-[48px] min-w-[48px] items-center justify-center rounded-full text-white transition hover:bg-[#4D4D4D] md:h-14 md:w-14 ${
                participantsOpen ? "bg-[#4D4D4D]" : "bg-[#3D3D3D]"
              }`}
            >
              <Users className="h-5 w-5 md:h-6 md:w-6" />
              <span className="absolute -bottom-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-zoom-primary px-1 text-[10px] font-semibold text-white">
                {participantCount}
              </span>
            </button>
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

          <button
            type="button"
            onClick={onLeave}
            className="flex min-h-[48px] items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 md:px-6"
          >
            <Phone className="h-4 w-4 rotate-[135deg]" />
            <span className="hidden md:inline">Leave</span>
          </button>
        </div>

        <div className="hidden w-24 md:block" aria-hidden />
      </div>

      <div className="border-t border-[#3D3D3D]/60 px-3 py-1 text-center text-xs text-[#747487] md:hidden">
        <span className="font-mono text-white">{meetingCode}</span>
        <span> · {time}</span>
      </div>
    </footer>
  );
}
