"use client";

import { useRef } from "react";
import { Monitor, Video, VideoOff } from "lucide-react";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useZoomStore } from "@/store/zoomStore";
import DropdownPanel from "../DropdownPanel";

export default function HostDropdown() {
  const ref = useRef<HTMLDivElement>(null);
  const openPanel = useZoomStore((s) => s.openPanel);
  const togglePanel = useZoomStore((s) => s.togglePanel);
  const setOpenPanel = useZoomStore((s) => s.setOpenPanel);
  const startMeeting = useZoomStore((s) => s.startMeeting);

  const open = openPanel === "host";

  useClickOutside(ref, () => {
    if (open) setOpenPanel(null);
  }, open);

  const handleScreenOnly = async () => {
    setOpenPanel(null);
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      stream.getTracks().forEach((t) => {
        t.onended = () => useZoomStore.getState().leaveMeeting();
      });
      startMeeting("screen-only");
    } catch {
      /* user cancelled picker */
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => togglePanel("host")}
        className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
          open
            ? "bg-[#0B5CFF] text-white"
            : "text-white hover:bg-[#3D3D3D]"
        }`}
      >
        Host
      </button>

      <DropdownPanel open={open} className="w-64 p-2">
        <button
          type="button"
          onClick={() => {
            setOpenPanel(null);
            startMeeting("with-video");
          }}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm text-white transition-colors hover:bg-[#3D3D3D]"
        >
          <Video className="h-4 w-4 text-[#0B5CFF]" />
          Start with Video
        </button>
        <button
          type="button"
          onClick={() => {
            setOpenPanel(null);
            startMeeting("without-video");
          }}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm text-white transition-colors hover:bg-[#3D3D3D]"
        >
          <VideoOff className="h-4 w-4 text-[#8C8C8C]" />
          Start without Video
        </button>
        <button
          type="button"
          onClick={() => void handleScreenOnly()}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm text-white transition-colors hover:bg-[#3D3D3D]"
        >
          <Monitor className="h-4 w-4 text-[#8C8C8C]" />
          Screen Share only
        </button>
      </DropdownPanel>
    </div>
  );
}
