"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ZoomLogo from "@/components/ZoomLogo";

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
    <div className="flex min-h-dvh items-center justify-center bg-[#1A1A1A] p-4">
      {onBack && (
        <button
          type="button"
          onClick={handleBack}
          className="fixed left-3 top-[max(0.75rem,env(safe-area-inset-top))] z-10 flex items-center gap-2 rounded-md px-3 py-2 text-sm text-[#747487] transition hover:bg-[#2C2C2C] hover:text-white sm:left-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      )}

      <div className="flex w-full max-w-3xl flex-col gap-6 md:flex-row">
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-[#2C2C2C] md:w-1/2">
          {previewLoading && (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-zoom-primary" />
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

        <div className="flex w-full flex-col justify-center gap-4 md:w-1/2">
          <div className="flex justify-center">
            <ZoomLogo size="lg" />
          </div>
          <p className="text-center text-sm text-[#747487]">
            You are about to join
          </p>
          <p className="break-all text-center font-mono text-xl text-[#2D8CFF]">
            {meetingCode}
          </p>

          <label className="text-sm text-[#747487]">
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
              className="mt-2 w-full min-h-[48px] rounded-lg border border-gray-600 bg-gray-800 px-3 py-3 text-base text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-zoom-primary"
              autoComplete="name"
              autoFocus
            />
          </label>

          {error && (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleJoin}
            disabled={joining}
            className="w-full min-h-[48px] rounded-lg bg-[#2D8CFF] text-lg font-semibold text-white transition hover:bg-[#0952d9] disabled:opacity-60"
          >
            {joining ? "Joining…" : "Join Meeting"}
          </button>
        </div>
      </div>
    </div>
  );
}
