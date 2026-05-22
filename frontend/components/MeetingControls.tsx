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
}

function ControlButton({
  onClick,
  active,
  activeStyle = "danger",
  children,
  label,
}: {
  onClick: () => void;
  active?: boolean;
  activeStyle?: "danger" | "primary";
  children: React.ReactNode;
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
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition sm:h-11 sm:w-11 ${
        active
          ? activeClass
          : "bg-transparent text-white hover:bg-[#3D3D3D]"
      }`}
    >
      {children}
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
}: MeetingControlsProps) {
  const [participantsOpen, setParticipantsOpen] = useState(false);

  const time = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <footer className="shrink-0 border-t border-gray-700/50 bg-zoom-navy pb-safe">
      <div className="touch-pan-x scrollbar-thin flex items-center justify-center gap-1 overflow-x-auto px-2 py-2 sm:hidden">
        <ControlButton
          onClick={onToggleMic}
          active={isMuted}
          label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <MicOff className="h-5 w-5" />
          ) : (
            <Mic className="h-5 w-5" />
          )}
        </ControlButton>

        <ControlButton
          onClick={onToggleCamera}
          active={isCameraOff}
          label={isCameraOff ? "Turn on camera" : "Turn off camera"}
        >
          {isCameraOff ? (
            <VideoOff className="h-5 w-5" />
          ) : (
            <Video className="h-5 w-5" />
          )}
        </ControlButton>

        <ControlButton
          onClick={onToggleScreenShare}
          active={isSharingScreen}
          activeStyle="primary"
          label={
            isSharingScreen
              ? "Stop sharing"
              : "Share screen — select a tab, then click Share"
          }
        >
          {isSharingScreen ? (
            <MonitorOff className="h-5 w-5" />
          ) : (
            <Monitor className="h-5 w-5" />
          )}
        </ControlButton>

        <button
          type="button"
          onClick={onToggleChat}
          aria-label="Meeting chat"
          aria-expanded={chatOpen}
          className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition hover:bg-[#3D3D3D] ${
            chatOpen ? "bg-[#3D3D3D]" : ""
          }`}
        >
          <MessageSquare className="h-5 w-5" />
          {chatUnreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold">
              {chatUnreadCount > 9 ? "9+" : chatUnreadCount}
            </span>
          )}
        </button>

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setParticipantsOpen((open) => !open)}
            aria-label={`Participants (${participantCount})`}
            aria-expanded={participantsOpen}
            className={`relative flex h-10 w-10 items-center justify-center rounded-full text-white transition hover:bg-[#3D3D3D] ${
              participantsOpen ? "bg-[#3D3D3D]" : ""
            }`}
          >
            <Users className="h-5 w-5" />
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
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-[#3D3D3D]/60 px-2 py-2 sm:border-t-0 sm:px-4 sm:py-3 md:h-16">
        <div className="min-w-0 flex-1 text-xs text-[#747487] sm:text-sm lg:max-w-[240px]">
          <span className="block truncate font-mono text-white sm:inline">
            {meetingCode}
          </span>
          <span className="hidden sm:inline"> · </span>
          <span className="hidden sm:inline">{time}</span>
          <span className="sm:hidden"> · {time}</span>
        </div>

        <div className="hidden items-center gap-1 sm:flex md:gap-2">
          <ControlButton
            onClick={onToggleMic}
            active={isMuted}
            label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <MicOff className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </ControlButton>

          <ControlButton
            onClick={onToggleCamera}
            active={isCameraOff}
            label={isCameraOff ? "Turn on camera" : "Turn off camera"}
          >
            {isCameraOff ? (
              <VideoOff className="h-5 w-5" />
            ) : (
              <Video className="h-5 w-5" />
            )}
          </ControlButton>

          <ControlButton
            onClick={onToggleScreenShare}
            active={isSharingScreen}
            activeStyle="primary"
            label={
              isSharingScreen
                ? "Stop sharing"
                : "Share screen — select a tab, then click Share"
            }
          >
            {isSharingScreen ? (
              <MonitorOff className="h-5 w-5" />
            ) : (
              <Monitor className="h-5 w-5" />
            )}
          </ControlButton>

          <button
            type="button"
            onClick={onToggleChat}
            aria-label="Meeting chat"
            aria-expanded={chatOpen}
            className={`relative flex h-11 items-center gap-1.5 rounded-full px-3 text-sm text-white transition hover:bg-[#3D3D3D] ${
              chatOpen ? "bg-[#3D3D3D]" : ""
            }`}
          >
            <MessageSquare className="h-5 w-5" />
            <span className="hidden md:inline">Chat</span>
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
              aria-label="Participants"
              aria-expanded={participantsOpen}
              className={`flex h-11 items-center gap-1.5 rounded-full px-3 text-sm text-white transition hover:bg-[#3D3D3D] ${
                participantsOpen ? "bg-[#3D3D3D]" : ""
              }`}
            >
              <Users className="h-5 w-5" />
              <span>{participantCount}</span>
            </button>
            <ParticipantsPanel
              open={participantsOpen}
              onClose={() => setParticipantsOpen(false)}
              participants={participants}
              isHost={isHost}
              onMuteAll={onMuteAll}
              onRemoveParticipant={onRemoveParticipant}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onLeave}
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700 sm:gap-2 sm:px-4"
        >
          <Phone className="h-4 w-4 rotate-[135deg]" />
          <span className="sr-only sm:not-sr-only sm:inline">Leave</span>
        </button>
      </div>
    </footer>
  );
}
