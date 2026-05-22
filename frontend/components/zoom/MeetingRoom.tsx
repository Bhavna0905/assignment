"use client";

import { useEffect, useRef, useState } from "react";
import {
  MessageSquare,
  Mic,
  MicOff,
  Monitor,
  Phone,
  Users,
  Video,
  VideoOff,
} from "lucide-react";
import { useCurrentUser, useZoomStore } from "@/store/zoomStore";

export default function MeetingRoom() {
  const user = useCurrentUser();
  const meetingCode = useZoomStore((s) => s.meetingCode);
  const meetingEntryMode = useZoomStore((s) => s.meetingEntryMode);
  const inMeetingMuted = useZoomStore((s) => s.inMeetingMuted);
  const inMeetingVideoOff = useZoomStore((s) => s.inMeetingVideoOff);
  const inMeetingSharing = useZoomStore((s) => s.inMeetingSharing);
  const setInMeetingMuted = useZoomStore((s) => s.setInMeetingMuted);
  const setInMeetingVideoOff = useZoomStore((s) => s.setInMeetingVideoOff);
  const setInMeetingSharing = useZoomStore((s) => s.setInMeetingSharing);
  const leaveMeeting = useZoomStore((s) => s.leaveMeeting);
  const settings = useZoomStore((s) => s.settings);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const screenRef = useRef<MediaStream | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const setup = async () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      screenRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      screenRef.current = null;

      if (inMeetingSharing || meetingEntryMode === "screen-only") {
        try {
          const screen = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: settings.shareScreen.shareSound,
          });
          if (cancelled) {
            screen.getTracks().forEach((t) => t.stop());
            return;
          }
          screenRef.current = screen;
          if (videoRef.current) {
            videoRef.current.srcObject = screen;
            await videoRef.current.play().catch(() => {});
          }
          screen.getVideoTracks()[0]?.addEventListener("ended", () => {
            leaveMeeting();
          });
        } catch {
          if (!cancelled) setMediaError("Screen share cancelled or denied");
        }
        return;
      }

      if (inMeetingVideoOff) {
        setMediaError(null);
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: settings.video.deviceId
            ? { deviceId: { exact: settings.video.deviceId } }
            : true,
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setMediaError(null);
      } catch {
        if (!cancelled) setMediaError("Camera unavailable");
      }
    };

    void setup();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      screenRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [
    inMeetingVideoOff,
    inMeetingSharing,
    meetingEntryMode,
    settings.video.deviceId,
    settings.shareScreen.shareSound,
    leaveMeeting,
  ]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: settings.video.deviceId
          ? { deviceId: { exact: settings.video.deviceId } }
          : true,
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setMediaError(null);
      return true;
    } catch {
      setMediaError("Could not start camera");
      return false;
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current && !inMeetingSharing) {
      videoRef.current.srcObject = null;
    }
  };

  const toggleVideo = async () => {
    if (inMeetingSharing) return;
    const next = !inMeetingVideoOff;
    if (next) {
      stopCamera();
      setInMeetingVideoOff(true);
    } else {
      const ok = await startCamera();
      setInMeetingVideoOff(!ok);
    }
  };

  const toggleShare = async () => {
    if (inMeetingSharing) {
      screenRef.current?.getTracks().forEach((t) => t.stop());
      screenRef.current = null;
      setInMeetingSharing(false);
      stopCamera();
      if (!inMeetingVideoOff) {
        const ok = await startCamera();
        if (!ok) setInMeetingVideoOff(true);
      }
      return;
    }
    try {
      const screen = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: settings.shareScreen.shareSound,
      });
      screenRef.current = screen;
      setInMeetingSharing(true);
      if (videoRef.current) {
        videoRef.current.srcObject = screen;
        await videoRef.current.play().catch(() => {});
      }
      screen.getVideoTracks()[0]?.addEventListener("ended", () => {
        setInMeetingSharing(false);
      });
    } catch {
      /* cancelled */
    }
  };

  const showVideo =
    !inMeetingVideoOff || inMeetingSharing || meetingEntryMode === "screen-only";

  return (
    <div className="flex h-[calc(100dvh-6.75rem)] flex-col bg-[#1C1C1C] md:h-[calc(100dvh-3.5rem)]">
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="relative aspect-video w-full max-w-4xl overflow-hidden rounded-lg bg-[#2D2D2D]">
          {showVideo && !mediaError ? (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className={`h-full w-full object-cover ${
                settings.video.mirrorVideo && !inMeetingSharing
                  ? "scale-x-[-1]"
                  : ""
              }`}
            />
          ) : (
            <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-3">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#7C3AED] text-3xl font-bold text-white">
                {user.initials}
              </div>
              <p className="text-lg font-medium text-white">{user.name}</p>
              {mediaError && (
                <p className="text-sm text-[#8C8C8C]">{mediaError}</p>
              )}
              {inMeetingMuted && (
                <span className="text-xs text-[#8C8C8C]">Muted</span>
              )}
            </div>
          )}
          <span className="absolute bottom-3 left-3 rounded bg-black/60 px-2 py-1 text-sm text-white">
            {user.name} (You)
          </span>
          <span className="absolute right-3 top-3 rounded bg-black/60 px-2 py-1 font-mono text-xs text-white">
            {meetingCode}
          </span>
        </div>
      </div>

      <footer className="flex shrink-0 items-center justify-center gap-2 border-t border-[#3D3D3D] px-4 py-3 pb-safe">
        <ToolbarButton
          label={inMeetingMuted ? "Unmute" : "Mute"}
          active={inMeetingMuted}
          onClick={() => setInMeetingMuted(!inMeetingMuted)}
        >
          {inMeetingMuted ? (
            <MicOff className="h-5 w-5" />
          ) : (
            <Mic className="h-5 w-5" />
          )}
        </ToolbarButton>

        <ToolbarButton
          label={inMeetingVideoOff ? "Start Video" : "Stop Video"}
          active={inMeetingVideoOff}
          onClick={() => void toggleVideo()}
        >
          {inMeetingVideoOff ? (
            <VideoOff className="h-5 w-5" />
          ) : (
            <Video className="h-5 w-5" />
          )}
        </ToolbarButton>

        <ToolbarButton
          label="Share"
          active={inMeetingSharing}
          activeStyle="primary"
          onClick={() => void toggleShare()}
        >
          <Monitor className="h-5 w-5" />
        </ToolbarButton>

        <ToolbarButton label="Participants">
          <Users className="h-5 w-5" />
        </ToolbarButton>

        <ToolbarButton label="Chat">
          <MessageSquare className="h-5 w-5" />
        </ToolbarButton>

        <button
          type="button"
          onClick={leaveMeeting}
          className="ml-4 flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
        >
          <Phone className="h-4 w-4 rotate-[135deg]" />
          Leave
        </button>
      </footer>
    </div>
  );
}

function ToolbarButton({
  children,
  label,
  onClick,
  active,
  activeStyle = "danger",
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
  activeStyle?: "danger" | "primary";
}) {
  const activeClass =
    activeStyle === "primary"
      ? "bg-[#0B5CFF] text-white"
      : "bg-red-600 text-white";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`flex h-11 w-11 items-center justify-center rounded-full text-white transition-colors ${
        active ? activeClass : "bg-[#3D3D3D] hover:bg-[#4a4a4a]"
      }`}
    >
      {children}
    </button>
  );
}
