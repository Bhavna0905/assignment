"use client";

import { useRef } from "react";
import { LogOut, RefreshCw } from "lucide-react";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useCurrentUser, useZoomStore } from "@/store/zoomStore";
import DropdownPanel from "../DropdownPanel";

export default function ProfileDropdown() {
  const ref = useRef<HTMLDivElement>(null);
  const user = useCurrentUser();
  const openPanel = useZoomStore((s) => s.openPanel);
  const togglePanel = useZoomStore((s) => s.togglePanel);
  const setOpenPanel = useZoomStore((s) => s.setOpenPanel);
  const signOut = useZoomStore((s) => s.signOut);
  const switchAccount = useZoomStore((s) => s.switchAccount);

  const open = openPanel === "profile";

  useClickOutside(ref, () => {
    if (open) setOpenPanel(null);
  }, open);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => togglePanel("profile")}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7C3AED] text-xs font-bold text-white ring-2 ring-transparent transition-shadow hover:ring-[#0B5CFF]/50"
        title={user.name}
      >
        {user.initials}
      </button>

      <DropdownPanel open={open} className="w-64 p-0">
        <div className="border-b border-[#3D3D3D] px-4 py-3">
          <p className="font-semibold text-white">{user.name}</p>
          <p className="text-xs text-[#8C8C8C]">{user.email}</p>
        </div>
        <div className="p-1">
          <button
            type="button"
            onClick={() => {
              switchAccount();
              setOpenPanel(null);
            }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-white hover:bg-[#3D3D3D]"
          >
            <RefreshCw className="h-4 w-4" />
            Switch Account
          </button>
          <button
            type="button"
            onClick={() => {
              signOut();
              setOpenPanel(null);
            }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-white hover:bg-[#3D3D3D]"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </DropdownPanel>
    </div>
  );
}
