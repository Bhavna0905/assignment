"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface PreJoinProps {
  meetingCode: string;
  defaultDisplayName?: string;
  onJoin: (displayName: string) => void | Promise<void>;
  onBack?: () => void;
}

export default function PreJoin({
  meetingCode,
  defaultDisplayName = "",
  onJoin,
  onBack,
}: PreJoinProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [displayName, setDisplayName] = useState(defaultDisplayName);
  const [error, setError] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (defaultDisplayName) {
      setDisplayName(defaultDisplayName);
    }
  }, [defaultDisplayName]);

  useEffect(() => {
    let cancelled = false;
    setPreviewLoading(true);

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Camera/mic access denied. You can still join without preview.");
        }
      })
      .finally(() => {
        if (!cancelled) setPreviewLoading(false);
      });

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  const handleBack = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    onBack?.();
  };

  const handleJoin = async () => {
    const name = displayName.trim();
    if (!name) {
      setError("Please enter your display name.");
      return;
    }
    setJoining(true);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    try {
      await onJoin(name);
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#1A1A1A] px-4 py-6 text-white sm:py-8">
      {onBack && (
        <button
          type="button"
          onClick={handleBack}
          className="fixed left-3 top-[max(0.75rem,env(safe-area-inset-top))] flex items-center gap-2 rounded-md px-3 py-2 text-sm text-[#747487] transition hover:bg-[#2C2C2C] hover:text-white sm:left-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      )}
      <div className="w-full max-w-md text-center">
        <p className="text-sm text-[#747487]">You are about to join</p>
        <p className="mt-1 break-all font-mono text-lg text-[#2D8CFF] sm:text-xl">
          {meetingCode}
        </p>

        <div className="relative mt-8 aspect-video overflow-hidden rounded-xl bg-[#2C2C2C]">
          {previewLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-[#2D8CFF]" />
            </div>
          )}
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className={`h-full w-full object-cover ${previewLoading ? "opacity-0" : "opacity-100"}`}
          />
        </div>

        <label className="mt-6 block text-left text-sm text-[#747487]">
          Display name
          <input
            type="text"
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            placeholder="Your name"
            className="mt-2 w-full rounded-md border border-[#3D3D3D] bg-[#2C2C2C] px-3 py-3 text-base text-white placeholder:text-[#747487] focus:outline-none focus:ring-2 focus:ring-[#2D8CFF] sm:py-2 sm:text-sm"
            autoComplete="name"
            autoFocus
          />
        </label>

        {error && (
          <p className="mt-2 text-sm text-red-400" role="alert">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleJoin}
          disabled={joining}
          className="mt-6 w-full rounded-md bg-[#2D8CFF] py-3.5 text-base font-semibold text-white transition hover:bg-[#0E71EB] disabled:opacity-60 sm:py-3 sm:text-sm"
        >
          {joining ? "Joining…" : "Join Meeting"}
        </button>
      </div>
    </div>
  );
}
