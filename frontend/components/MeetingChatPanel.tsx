"use client";

import { useEffect, useRef } from "react";
import { MessageSquare, Send, X } from "lucide-react";
import { formatChatTime } from "@/lib/chat";
import type { ChatMessage } from "@/lib/types";

interface MeetingChatPanelProps {
  open: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  myPeerId: string;
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  sendError: string | null;
}

export default function MeetingChatPanel({
  open,
  onClose,
  messages,
  myPeerId,
  draft,
  onDraftChange,
  onSend,
  sendError,
}: MeetingChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [open, messages]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSend();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Close chat"
        className="fixed inset-0 z-40 bg-black/40 md:bg-transparent md:pointer-events-none"
        onClick={onClose}
      />

      <aside
        className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] top-auto z-50 flex max-h-[min(65dvh,520px)] w-full flex-col rounded-t-2xl border border-[#3D3D3D] bg-[#1A1A1A] shadow-2xl sm:max-h-[70dvh] md:relative md:inset-auto md:bottom-auto md:top-auto md:z-30 md:max-h-full md:w-80 md:shrink-0 md:rounded-none md:border-l md:border-t-0"
        role="dialog"
        aria-label="Meeting chat"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#3D3D3D] px-4 py-3">
          <div className="flex items-center gap-2 text-white">
            <MessageSquare className="h-4 w-4 text-[#2D8CFF]" />
            <h3 className="text-sm font-semibold">In-meeting chat</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close chat panel"
            className="rounded p-1 text-[#747487] transition hover:bg-[#2C2C2C] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div
          ref={scrollRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3"
        >
          {messages.length === 0 ? (
            <p className="px-1 py-8 text-center text-sm text-[#747487]">
              No messages yet. Say hello to everyone in the meeting.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {messages.map((msg) => {
                const isOwn = msg.senderPeerId === myPeerId;
                return (
                  <li
                    key={msg.id}
                    className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[90%] rounded-lg px-3 py-2 text-sm ${
                        isOwn
                          ? "bg-[#0E71EB] text-white"
                          : "bg-[#2C2C2C] text-white"
                      }`}
                    >
                      <div
                        className={`mb-0.5 flex flex-wrap items-baseline gap-x-2 gap-y-0 text-xs ${
                          isOwn ? "text-white/80" : "text-[#747487]"
                        }`}
                      >
                        <span className="font-medium text-white/95">
                          {isOwn ? "You" : msg.senderName}
                        </span>
                        <time dateTime={msg.timestamp}>
                          {formatChatTime(msg.timestamp)}
                        </time>
                      </div>
                      <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="shrink-0 border-t border-[#3D3D3D] p-3 pb-safe"
        >
          {sendError && (
            <p className="mb-2 text-xs text-red-400" role="alert">
              {sendError}
            </p>
          )}
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={draft}
              onChange={(e) => onDraftChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message…"
              maxLength={2000}
              className="min-w-0 flex-1 rounded-lg border border-[#3D3D3D] bg-[#2C2C2C] px-3 py-2.5 text-sm text-white placeholder:text-[#747487] focus:border-[#2D8CFF] focus:outline-none focus:ring-1 focus:ring-[#2D8CFF]"
              aria-label="Chat message"
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              aria-label="Send message"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#2D8CFF] text-white transition hover:bg-[#0E71EB] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </aside>
    </>
  );
}
