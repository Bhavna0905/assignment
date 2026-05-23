"use client";

import { MicOff, Pin, UserMinus, X } from "lucide-react";
import type { MeetingParticipant } from "@/lib/types";

interface ParticipantsPanelProps {
  open: boolean;
  onClose: () => void;
  participants: MeetingParticipant[];
  isHost: boolean;
  onMuteAll: () => void;
  onRemoveParticipant: (peerId: string) => void;
  pinnedPeerId?: string | null;
  onTogglePin?: (peerId: string) => void;
}

export default function ParticipantsPanel({
  open,
  onClose,
  participants,
  isHost,
  onMuteAll,
  onRemoveParticipant,
  pinnedPeerId = null,
  onTogglePin,
}: ParticipantsPanelProps) {
  if (!open) return null;

  const remoteCount = participants.filter((p) => !p.isLocal).length;

  return (
    <>
      <button
        type="button"
        aria-label="Close participants"
        className="fixed inset-0 z-40 bg-black/50 sm:hidden"
        onClick={onClose}
      />

      <div
        className="fixed inset-x-0 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-50 flex max-h-[min(55dvh,380px)] flex-col rounded-t-2xl border border-gray-700 bg-zoom-navy shadow-xl sm:absolute sm:inset-x-auto sm:bottom-full sm:right-0 sm:mb-2 sm:max-h-80 sm:w-72 sm:rounded-xl"
        role="dialog"
        aria-label="Participants"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#3D3D3D] px-4 py-3">
          <h3 className="text-sm font-semibold text-white">
            Participants ({participants.length})
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded p-1 text-[#747487] hover:bg-[#2C2C2C] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {isHost && remoteCount > 0 && (
          <div className="shrink-0 border-b border-[#3D3D3D] px-4 py-2">
            <button
              type="button"
              onClick={onMuteAll}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-zoom-primary px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-zoom-primary-hover"
            >
              <MicOff className="h-4 w-4" />
              Mute all
            </button>
          </div>
        )}

        <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-2">
          {participants.map((p) => (
            <li
              key={p.peerId}
              className="flex items-center justify-between gap-2 px-4 py-2.5 text-sm"
            >
              <div className="min-w-0 flex-1">
                <span className="block truncate text-white">
                  {p.name}
                  {p.isLocal && (
                    <span className="text-[#747487]"> (You)</span>
                  )}
                </span>
                {p.muted && (
                  <span className="text-xs text-[#747487]">Muted</span>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {onTogglePin && !p.isLocal && (
                  <button
                    type="button"
                    onClick={() => onTogglePin(p.peerId)}
                    className={`rounded p-2 transition ${
                      pinnedPeerId === p.peerId
                        ? "bg-zoom-primary/20 text-zoom-primary"
                        : "text-[#747487] hover:bg-[#2C2C2C] hover:text-white"
                    }`}
                    aria-label={
                      pinnedPeerId === p.peerId
                        ? `Unpin ${p.name}`
                        : `Pin ${p.name}`
                    }
                    title={
                      pinnedPeerId === p.peerId ? "Unpin" : "Pin participant"
                    }
                  >
                    <Pin className="h-4 w-4" />
                  </button>
                )}
                {isHost && !p.isLocal && (
                  <button
                    type="button"
                    onClick={() => onRemoveParticipant(p.peerId)}
                    className="rounded p-2 text-red-400 transition hover:bg-red-600/20 hover:text-red-300"
                    aria-label={`Remove ${p.name}`}
                    title="Remove from meeting"
                  >
                    <UserMinus className="h-4 w-4" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
