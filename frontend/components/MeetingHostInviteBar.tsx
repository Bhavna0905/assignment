"use client";

import { useCallback, useState } from "react";
import { Copy, MoreHorizontal, Share2 } from "lucide-react";
import { getMeetingInviteUrl } from "@/lib/utils";

interface MeetingHostInviteBarProps {
  meetingCode: string;
  onLinkCopied: () => void;
}

export default function MeetingHostInviteBar({
  meetingCode,
  onLinkCopied,
}: MeetingHostInviteBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const inviteUrl = getMeetingInviteUrl(meetingCode);
  const shareText = `Join my meeting: ${inviteUrl}`;

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
    } catch {
      const input = document.createElement("textarea");
      input.value = inviteUrl;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
    onLinkCopied();
    setMenuOpen(false);
  }, [inviteUrl, onLinkCopied]);

  const shareLink = useCallback(async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Join my meeting",
          text: shareText,
          url: inviteUrl,
        });
        setMenuOpen(false);
        return;
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
      }
    }
    await copyLink();
  }, [copyLink, inviteUrl, shareText]);

  return (
    <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[#3D3D3D]/80 bg-[#252525]/95 px-3 py-2 sm:px-4">
      <p className="min-w-0 truncate text-xs text-[#949494] sm:text-sm">
        <span className="font-mono text-white">{meetingCode}</span>
        <span className="hidden sm:inline"> · Host controls</span>
      </p>

      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          onClick={copyLink}
          className="hidden items-center gap-1.5 rounded-full bg-[#3D3D3D] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#4D4D4D] focus-visible:ring-2 focus-visible:ring-zoom-primary sm:inline-flex"
        >
          <Copy className="h-3.5 w-3.5" />
          Copy link
        </button>
        <button
          type="button"
          onClick={shareLink}
          className="hidden items-center gap-1.5 rounded-full bg-zoom-primary px-3 py-1.5 text-xs font-medium text-white transition hover:bg-zoom-primary-hover focus-visible:ring-2 focus-visible:ring-white/30 sm:inline-flex"
        >
          <Share2 className="h-3.5 w-3.5" />
          Share link
        </button>

        <div className="relative sm:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Invite options"
            aria-expanded={menuOpen}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3D3D3D] text-white transition hover:bg-[#4D4D4D]"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
          {menuOpen && (
            <>
              <button
                type="button"
                aria-label="Close menu"
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-full z-50 mt-1 min-w-[160px] overflow-hidden rounded-lg border border-[#3D3D3D] bg-[#2D2D2D] py-1 shadow-xl">
                <button
                  type="button"
                  onClick={copyLink}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-white hover:bg-[#3D3D3D]"
                >
                  <Copy className="h-4 w-4" />
                  Copy link
                </button>
                <button
                  type="button"
                  onClick={shareLink}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-white hover:bg-[#3D3D3D]"
                >
                  <Share2 className="h-4 w-4" />
                  Share link
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
