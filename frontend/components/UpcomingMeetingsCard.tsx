"use client";

import { CalendarX } from "lucide-react";
import { useState } from "react";
import type { Meeting } from "@/lib/types";
import { formatMeetingDateTime, getMeetingInviteUrl } from "@/lib/utils";

interface UpcomingMeetingsCardProps {
  upcoming: Meeting[];
}

export default function UpcomingMeetingsCard({
  upcoming,
}: UpcomingMeetingsCardProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyInvite = async (code: string) => {
    await navigator.clipboard.writeText(getMeetingInviteUrl(code));
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="zoom-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-zoom-text dark:text-gray-100">
          Meetings
        </h2>
        <span className="text-sm font-medium text-zoom-primary">Visit Meetings</span>
      </div>
      {upcoming.length === 0 ? (
        <div className="py-4 text-center">
          <CalendarX
            className="mx-auto h-10 w-10 text-zoom-muted/60"
            strokeWidth={1.5}
          />
          <p className="mt-3 text-sm text-zoom-muted">No Upcoming Meetings</p>
          <button type="button" className="zoom-btn-outline mt-4 w-full">
            Test Audio and Video
          </button>
        </div>
      ) : (
        <ul className="space-y-3">
          {upcoming.slice(0, 3).map((meeting) => (
            <li
              key={meeting.id}
              className="rounded-lg border border-zoom-border p-3 dark:border-gray-600"
            >
              <p className="truncate font-semibold text-zoom-text dark:text-gray-100">
                {meeting.title}
              </p>
              {meeting.scheduled_start && (
                <p className="mt-1 text-xs text-zoom-muted">
                  {formatMeetingDateTime(meeting.scheduled_start)}
                </p>
              )}
              <div className="relative mt-2">
                <button
                  type="button"
                  onClick={() => handleCopyInvite(meeting.meeting_code)}
                  className="text-sm font-semibold text-zoom-primary hover:text-zoom-primary-hover"
                >
                  Copy invite
                </button>
                {copiedCode === meeting.meeting_code && (
                  <span className="absolute -top-6 left-0 rounded bg-zoom-navy px-2 py-0.5 text-xs text-white">
                    Copied!
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
