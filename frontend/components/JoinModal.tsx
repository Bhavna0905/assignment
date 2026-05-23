"use client";

import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { parseMeetingCode } from "@/lib/utils";

interface JoinModalProps {
  open: boolean;
  onClose: () => void;
  onJoin: (code: string) => void;
}

export default function JoinModal({ open, onClose, onJoin }: JoinModalProps) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setInput("");
      setError("");
    }
  }, [open]);

  if (!open) return null;

  const handleJoin = () => {
    const code = parseMeetingCode(input);
    if (!code) {
      setError("Please enter a meeting ID or link.");
      return;
    }
    setError("");
    onJoin(code);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center md:bg-black/50 md:p-4">
      <div
        className="flex h-full w-full flex-col bg-zoom-card p-6 text-zoom-text shadow-zoom-md md:h-auto md:max-h-[92dvh] md:max-w-md md:overflow-y-auto md:rounded-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="join-modal-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="mb-4 flex items-center gap-2 text-sm text-zoom-muted hover:text-zoom-text md:hidden"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </button>

        <h2
          id="join-modal-title"
          className="text-xl font-bold text-zoom-text"
        >
          Join a meeting
        </h2>
        <label className="mt-4 block text-sm font-medium text-zoom-muted">
          Enter Meeting ID or Link
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            className="zoom-input mt-2 min-h-[44px] text-base"
            placeholder="824-117-9032 or https://..."
            autoFocus
          />
        </label>
        {error && (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        <div className="mt-auto flex flex-col-reverse gap-2 pt-6 pb-safe md:mt-6 md:flex-row md:justify-end md:gap-3 md:pb-0">
          <button
            type="button"
            onClick={onClose}
            className="hidden rounded-lg px-4 py-3 text-sm font-semibold text-zoom-muted transition-colors hover:bg-zoom-bg min-h-[44px] md:inline-flex md:items-center md:py-2"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleJoin}
            className="zoom-btn-primary min-h-[44px] w-full md:w-auto"
          >
            Join
          </button>
        </div>
      </div>
    </div>
  );
}
