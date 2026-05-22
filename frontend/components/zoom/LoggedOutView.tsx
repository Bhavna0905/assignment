"use client";

import { useZoomStore } from "@/store/zoomStore";

export default function LoggedOutView() {
  const setSignedIn = useZoomStore((s) => s.setSignedIn);

  return (
    <div className="flex min-h-[calc(100dvh-56px)] flex-col items-center justify-center bg-[#1C1C1C] px-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold text-white">You are signed out</h1>
        <p className="mt-3 text-[#8C8C8C]">
          Sign in again to access Home, Chat, Meetings, and Contacts.
        </p>
        <button
          type="button"
          onClick={() => setSignedIn(true)}
          className="mt-8 rounded-md bg-[#0B5CFF] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0952d9]"
        >
          Sign In
        </button>
      </div>
    </div>
  );
}
