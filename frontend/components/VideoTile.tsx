"use client";

import { Mic, MicOff } from "lucide-react";
import { useEffect, useRef } from "react";
import { getInitials } from "@/lib/utils";

interface VideoTileProps {
  stream: MediaStream | null;
  name: string;
  muted: boolean;
  cameraOff: boolean;
  isSharingScreen?: boolean;
  isLocal: boolean;
}

export default function VideoTile({
  stream,
  name,
  muted,
  cameraOff,
  isSharingScreen = false,
  isLocal,
}: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const showVideo = stream && (!cameraOff || isSharingScreen);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.srcObject = showVideo ? stream : null;
  }, [stream, showVideo]);

  return (
    <div className="relative flex aspect-video min-h-0 w-full max-w-full items-center justify-center overflow-hidden rounded-lg bg-[#2C2C2C]">
      {showVideo ? (
        <video
          ref={videoRef}
          autoPlay
          muted={isLocal}
          playsInline
          className={`h-full w-full ${isSharingScreen ? "object-contain" : "object-cover"}`}
        />
      ) : (
        <div className="flex flex-col items-center gap-2 px-2">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#3D3D3D] text-xl font-semibold text-white sm:h-20 sm:w-20 sm:text-2xl">
            {getInitials(name)}
          </div>
          <span className="max-w-full truncate text-center text-xs text-[#747487] sm:text-sm">
            {name}
          </span>
        </div>
      )}

      {isLocal && (
        <span className="absolute right-2 top-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
          You
        </span>
      )}

      <span className="absolute bottom-1.5 left-1.5 max-w-[calc(100%-3rem)] truncate rounded bg-black/60 px-1.5 py-0.5 text-xs text-white sm:bottom-2 sm:left-2 sm:max-w-[70%] sm:px-2 sm:text-sm">
        {name}
      </span>

      <span className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2">
        {muted ? (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600 sm:h-7 sm:w-7">
            <MicOff className="h-3.5 w-3.5 text-white sm:h-4 sm:w-4" />
          </span>
        ) : (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black/60 sm:h-7 sm:w-7">
            <Mic className="h-3.5 w-3.5 text-white sm:h-4 sm:w-4" />
          </span>
        )}
      </span>
    </div>
  );
}
