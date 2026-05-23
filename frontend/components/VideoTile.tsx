"use client";

import { Mic, MicOff, MoreVertical, Pin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getInitials } from "@/lib/utils";

interface VideoTileProps {
  stream: MediaStream | null;
  name: string;
  muted: boolean;
  cameraOff: boolean;
  isSharingScreen?: boolean;
  isScreen?: boolean;
  small?: boolean;
  isLocal: boolean;
  peerId?: string;
  isPinned?: boolean;
  onTogglePin?: (peerId: string) => void;
  showPinMenu?: boolean;
}

export default function VideoTile({
  stream,
  name,
  muted,
  cameraOff,
  isSharingScreen = false,
  isScreen = false,
  small = false,
  isLocal,
  peerId,
  isPinned = false,
  onTogglePin,
  showPinMenu = false,
}: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const showVideo =
    stream && (isScreen || !cameraOff || isSharingScreen);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (showVideo && stream) {
      video.srcObject = stream;
      void video.play().catch(() => {});
    } else {
      video.srcObject = null;
    }
  }, [stream, showVideo]);

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  const containerClass = small
    ? "relative flex h-[120px] w-full shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#2C2C2C] transition-transform duration-300"
    : "relative flex aspect-video min-h-0 w-full max-w-full items-center justify-center overflow-hidden rounded-lg bg-[#2C2C2C] transition-transform duration-300";

  const canPin = showPinMenu && peerId && onTogglePin && !isScreen;

  return (
    <div className={containerClass}>
      {showVideo ? (
        <video
          ref={videoRef}
          autoPlay
          muted={isLocal}
          playsInline
          className={`h-full w-full ${
            isScreen || isSharingScreen ? "object-contain" : "object-cover"
          }`}
        />
      ) : (
        <div className="flex flex-col items-center gap-2 px-2">
          <div
            className={`flex items-center justify-center rounded-full bg-[#3D3D3D] font-semibold text-white ${
              small ? "h-12 w-12 text-base" : "h-16 w-16 text-xl sm:h-20 sm:w-20 sm:text-2xl"
            }`}
          >
            {getInitials(name)}
          </div>
          {!isScreen && (
            <span
              className={`max-w-full truncate text-center text-[#747487] ${
                small ? "text-[10px]" : "text-xs sm:text-sm"
              }`}
            >
              {name}
            </span>
          )}
        </div>
      )}

      {isPinned && !isScreen && (
        <span
          className={`absolute left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full bg-zoom-primary px-2 py-0.5 text-[10px] font-semibold text-white shadow ${
            small ? "top-1" : "top-2"
          }`}
        >
          <Pin className="h-3 w-3" />
          Pinned
        </span>
      )}

      {isLocal && !isScreen && (
        <span
          className={`absolute rounded bg-black/60 text-white ${
            small
              ? "right-1 top-1 px-1.5 py-0.5 text-[10px]"
              : "right-2 top-2 px-2 py-0.5 text-xs"
          }`}
        >
          You
        </span>
      )}

      {canPin && (
        <div
          ref={menuRef}
          className={`absolute z-20 ${small ? "right-1 top-1" : "right-2 top-2"}`}
        >
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={`Options for ${name}`}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 min-w-[140px] overflow-hidden rounded-lg border border-[#3D3D3D] bg-[#2D2D2D] py-1 shadow-lg">
              <button
                type="button"
                onClick={() => {
                  onTogglePin(peerId);
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-white transition hover:bg-[#3D3D3D]"
              >
                <Pin className="h-4 w-4 text-zoom-primary" />
                {isPinned ? "Unpin" : "Pin User"}
              </button>
            </div>
          )}
        </div>
      )}

      {!isScreen && (
        <span
          className={`absolute max-w-[calc(100%-3rem)] truncate rounded bg-black/60 text-white ${
            small
              ? "bottom-1 left-1 px-1 py-0.5 text-[10px]"
              : "bottom-1.5 left-1.5 px-1.5 py-0.5 text-xs sm:bottom-2 sm:left-2 sm:max-w-[70%] sm:px-2 sm:text-sm"
          }`}
        >
          {name}
        </span>
      )}

      {!isScreen && (
        <span
          className={`absolute ${
            small ? "bottom-1 right-1" : "bottom-1.5 right-1.5 sm:bottom-2 sm:right-2"
          }`}
        >
          {muted ? (
            <span
              className={`flex items-center justify-center rounded-full bg-red-600 ${
                small ? "h-5 w-5" : "h-6 w-6 sm:h-7 sm:w-7"
              }`}
            >
              <MicOff
                className={`text-white ${small ? "h-2.5 w-2.5" : "h-3.5 w-3.5 sm:h-4 sm:w-4"}`}
              />
            </span>
          ) : (
            <span
              className={`flex items-center justify-center rounded-full bg-black/60 ${
                small ? "h-5 w-5" : "h-6 w-6 sm:h-7 sm:w-7"
              }`}
            >
              <Mic
                className={`text-white ${small ? "h-2.5 w-2.5" : "h-3.5 w-3.5 sm:h-4 sm:w-4"}`}
              />
            </span>
          )}
        </span>
      )}
    </div>
  );
}
