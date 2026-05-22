"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useCameraPreview, useMediaDevices, useMicLevelMeter } from "@/hooks/useMediaDevices";
import { useZoomStore } from "@/store/zoomStore";

type SettingsTab = "general" | "video" | "audio" | "share";

const TABS: { id: SettingsTab; label: string }[] = [
  { id: "general", label: "General" },
  { id: "video", label: "Video" },
  { id: "audio", label: "Audio" },
  { id: "share", label: "Share Screen" },
];

export default function SettingsModal() {
  const open = useZoomStore((s) => s.openPanel === "settings");
  const setOpenPanel = useZoomStore((s) => s.setOpenPanel);
  const settings = useZoomStore((s) => s.settings);
  const patchSettingsSection = useZoomStore((s) => s.patchSettingsSection);

  const [tab, setTab] = useState<SettingsTab>("general");
  const [micTestActive, setMicTestActive] = useState(false);

  const { devices } = useMediaDevices(open);
  const { videoRef, status: previewStatus } = useCameraPreview(
    settings.video.deviceId || undefined,
    open && tab === "video"
  );
  const micLevel = useMicLevelMeter(
    settings.audio.deviceId || undefined,
    open && tab === "audio" && micTestActive
  );

  useEffect(() => {
    if (!open) setMicTestActive(false);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/60"
            onClick={() => setOpenPanel(null)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 z-[301] flex h-[min(520px,90dvh)] w-[min(640px,95vw)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-[#3D3D3D] bg-[#2D2D2D] shadow-2xl"
            role="dialog"
            aria-label="Settings"
          >
            <div className="flex items-center justify-between border-b border-[#3D3D3D] px-5 py-4">
              <h2 className="text-lg font-semibold text-white">Settings</h2>
              <button
                type="button"
                onClick={() => setOpenPanel(null)}
                className="rounded-md p-1 text-[#8C8C8C] hover:bg-[#3D3D3D] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex min-h-0 flex-1">
              <nav className="w-36 shrink-0 border-r border-[#3D3D3D] p-2">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTab(t.id)}
                    className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                      tab === t.id
                        ? "bg-[#0B5CFF] text-white"
                        : "text-[#8C8C8C] hover:bg-[#3D3D3D] hover:text-white"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </nav>

              <div className="min-h-0 flex-1 overflow-y-auto p-5">
                {tab === "general" && (
                  <div className="space-y-4">
                    <ToggleRow
                      label="Start with video"
                      checked={settings.general.startWithVideo}
                      onChange={(v) =>
                        patchSettingsSection("general", { startWithVideo: v })
                      }
                    />
                    <ToggleRow
                      label="Mute on join"
                      checked={settings.general.muteOnJoin}
                      onChange={(v) =>
                        patchSettingsSection("general", { muteOnJoin: v })
                      }
                    />
                    <ToggleRow
                      label="Show meeting time"
                      checked={settings.general.showMeetingTime}
                      onChange={(v) =>
                        patchSettingsSection("general", { showMeetingTime: v })
                      }
                    />
                  </div>
                )}

                {tab === "video" && (
                  <div className="space-y-4">
                    <label className="block text-sm text-[#8C8C8C]">
                      Camera
                      <select
                        value={settings.video.deviceId}
                        onChange={(e) =>
                          patchSettingsSection("video", {
                            deviceId: e.target.value,
                          })
                        }
                        className="mt-1 w-full rounded-md border border-[#3D3D3D] bg-[#1C1C1C] px-3 py-2 text-sm text-white"
                      >
                        <option value="">Default camera</option>
                        {devices.videoInputs.map((d) => (
                          <option key={d.deviceId} value={d.deviceId}>
                            {d.label || `Camera ${d.deviceId.slice(0, 8)}`}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="relative aspect-video overflow-hidden rounded-lg bg-[#1C1C1C]">
                      {previewStatus === "live" ? (
                        <video
                          ref={videoRef}
                          autoPlay
                          muted
                          playsInline
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-[#8C8C8C]">
                          {previewStatus === "denied"
                            ? "Camera permission denied"
                            : "Camera preview"}
                        </div>
                      )}
                    </div>
                    <ToggleRow
                      label="Mirror my video"
                      checked={settings.video.mirrorVideo}
                      onChange={(v) =>
                        patchSettingsSection("video", { mirrorVideo: v })
                      }
                    />
                    <ToggleRow
                      label="HD video"
                      checked={settings.video.hdVideo}
                      onChange={(v) =>
                        patchSettingsSection("video", { hdVideo: v })
                      }
                    />
                  </div>
                )}

                {tab === "audio" && (
                  <div className="space-y-4">
                    <label className="block text-sm text-[#8C8C8C]">
                      Microphone
                      <select
                        value={settings.audio.deviceId}
                        onChange={(e) =>
                          patchSettingsSection("audio", {
                            deviceId: e.target.value,
                          })
                        }
                        className="mt-1 w-full rounded-md border border-[#3D3D3D] bg-[#1C1C1C] px-3 py-2 text-sm text-white"
                      >
                        <option value="">Default microphone</option>
                        {devices.audioInputs.map((d) => (
                          <option key={d.deviceId} value={d.deviceId}>
                            {d.label || `Mic ${d.deviceId.slice(0, 8)}`}
                          </option>
                        ))}
                      </select>
                    </label>
                    <ToggleRow
                      label="Suppress background noise"
                      checked={settings.audio.suppressNoise}
                      onChange={(v) =>
                        patchSettingsSection("audio", { suppressNoise: v })
                      }
                    />
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white">Mic test</span>
                        <button
                          type="button"
                          onClick={() => setMicTestActive((a) => !a)}
                          className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                            micTestActive
                              ? "bg-red-600 text-white"
                              : "bg-[#0B5CFF] text-white"
                          }`}
                        >
                          {micTestActive ? "Stop" : "Test"}
                        </button>
                      </div>
                      <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#1C1C1C]">
                        <div
                          className="h-full rounded-full bg-[#0B5CFF] transition-all duration-75"
                          style={{ width: `${micLevel}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-[#8C8C8C]">
                        Input level: {micLevel}%
                      </p>
                    </div>
                  </div>
                )}

                {tab === "share" && (
                  <div className="space-y-4">
                    <ToggleRow
                      label="Share computer sound"
                      checked={settings.shareScreen.shareSound}
                      onChange={(v) =>
                        patchSettingsSection("shareScreen", { shareSound: v })
                      }
                    />
                    <ToggleRow
                      label="Optimize for video clip"
                      checked={settings.shareScreen.optimizeForVideo}
                      onChange={(v) =>
                        patchSettingsSection("shareScreen", {
                          optimizeForVideo: v,
                        })
                      }
                    />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4">
      <span className="text-sm text-white">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-[#0B5CFF]" : "bg-[#3D3D3D]"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </label>
  );
}
