"use client";

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
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div
        className="max-h-[92dvh] w-full overflow-y-auto overscroll-contain rounded-t-2xl bg-zoom-card px-4 py-5 text-zoom-text shadow-zoom-md sm:max-w-md sm:rounded-xl sm:px-6 sm:py-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="join-modal-title"
      >
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
            className="zoom-input mt-2 text-base sm:text-sm"
            placeholder="824-117-9032 or https://..."
            autoFocus
          />
        </label>
        {error && (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        <div className="mt-6 flex flex-col-reverse gap-2 pb-safe sm:flex-row sm:justify-end sm:gap-3 sm:pb-0">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-3 text-sm font-semibold text-zoom-muted transition-colors hover:bg-zoom-bg sm:py-2"
          >
            Cancel
          </button>
          <button type="button" onClick={handleJoin} className="zoom-btn-primary sm:py-2">
            Join
          </button>
        </div>
      </div>
    </div>
  );
}
