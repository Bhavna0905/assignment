"use client";

import { useRef, useState } from "react";
import { useClickOutside } from "@/hooks/useClickOutside";
import {
  isValidMeetingId,
  normalizeMeetingId,
} from "@/lib/zoom-mock-data";
import { useZoomStore } from "@/store/zoomStore";
import DropdownPanel from "../DropdownPanel";

export default function JoinDropdown() {
  const ref = useRef<HTMLDivElement>(null);
  const openPanel = useZoomStore((s) => s.openPanel);
  const togglePanel = useZoomStore((s) => s.togglePanel);
  const setOpenPanel = useZoomStore((s) => s.setOpenPanel);
  const meetingId = useZoomStore((s) => s.meetingId);
  const setMeetingId = useZoomStore((s) => s.setMeetingId);
  const joinWithoutAudio = useZoomStore((s) => s.joinWithoutAudio);
  const joinWithoutVideo = useZoomStore((s) => s.joinWithoutVideo);
  const setJoinWithoutAudio = useZoomStore((s) => s.setJoinWithoutAudio);
  const setJoinWithoutVideo = useZoomStore((s) => s.setJoinWithoutVideo);
  const startMeeting = useZoomStore((s) => s.startMeeting);

  const [error, setError] = useState("");
  const open = openPanel === "join";

  useClickOutside(ref, () => {
    if (open) setOpenPanel(null);
  }, open);

  const handleJoin = () => {
    const normalized = normalizeMeetingId(meetingId);
    if (!isValidMeetingId(normalized)) {
      setError("Use format xxx-xxxx-xxxx (11 digits)");
      return;
    }
    setError("");
    setOpenPanel(null);
    startMeeting(
      joinWithoutVideo ? "without-video" : "with-video",
      normalized
    );
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => togglePanel("join")}
        className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
          open
            ? "bg-[#0B5CFF] text-white"
            : "text-white hover:bg-[#3D3D3D]"
        }`}
      >
        Join
      </button>

      <DropdownPanel open={open} className="w-80 p-4">
        <label className="block text-xs font-medium text-[#8C8C8C]">
          Meeting ID
          <input
            type="text"
            value={meetingId}
            onChange={(e) => {
              const raw = e.target.value;
              const digits = raw.replace(/\D/g, "").slice(0, 11);
              let formatted = digits;
              if (digits.length > 3) {
                formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`;
              }
              if (digits.length > 7) {
                formatted = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
              }
              setMeetingId(formatted);
              setError("");
            }}
            placeholder="000-0000-0000"
            className="mt-1.5 w-full rounded-md border border-[#3D3D3D] bg-[#1C1C1C] px-3 py-2 text-sm text-white placeholder:text-[#8C8C8C] focus:border-[#0B5CFF] focus:outline-none focus:ring-1 focus:ring-[#0B5CFF]"
          />
        </label>
        {error && (
          <p className="mt-1.5 text-xs text-red-400" role="alert">
            {error}
          </p>
        )}

        <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-white">
          <input
            type="checkbox"
            checked={joinWithoutAudio}
            onChange={(e) => setJoinWithoutAudio(e.target.checked)}
            className="h-4 w-4 rounded border-[#3D3D3D] accent-[#0B5CFF]"
          />
          Don&apos;t connect to audio
        </label>
        <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm text-white">
          <input
            type="checkbox"
            checked={joinWithoutVideo}
            onChange={(e) => setJoinWithoutVideo(e.target.checked)}
            className="h-4 w-4 rounded border-[#3D3D3D] accent-[#0B5CFF]"
          />
          Turn off my video
        </label>

        <button
          type="button"
          onClick={handleJoin}
          className="mt-4 w-full rounded-md bg-[#0B5CFF] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0952d9]"
        >
          Join
        </button>
      </DropdownPanel>
    </div>
  );
}
