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
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
      <div
        className="max-h-[92dvh] w-full overflow-y-auto overscroll-contain rounded-t-2xl bg-white px-4 py-5 shadow-xl sm:max-w-md sm:rounded-lg sm:px-6 sm:py-6 dark:bg-[#2C2C2C]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="join-modal-title"
      >
        <h2
          id="join-modal-title"
          className="text-xl font-semibold text-[#1A1A1A] dark:text-[#F7F7F7]"
        >
          Join a meeting
        </h2>
        <label className="mt-4 block text-sm text-[#747487]">
          Enter Meeting ID or Link
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            className="mt-2 w-full rounded-md border border-[#E0E0E0] bg-white px-3 py-3 text-base text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#2D8CFF] dark:border-[#3D3D3D] dark:bg-[#1A1A1A] dark:text-[#F7F7F7] sm:py-2 sm:text-sm"
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
            className="rounded-md px-4 py-3 text-sm font-medium text-[#747487] hover:bg-[#F7F7F7] dark:hover:bg-[#3D3D3D] sm:py-2"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleJoin}
            className="rounded-md bg-[#2D8CFF] px-4 py-3 text-sm font-medium text-white hover:bg-[#0E71EB] sm:py-2"
          >
            Join
          </button>
        </div>
      </div>
    </div>
  );
}
