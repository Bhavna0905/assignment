"use client";

import { CalendarX, History } from "lucide-react";
import { useState } from "react";
import type { Meeting } from "@/lib/types";
import { formatMeetingDateTime, getMeetingInviteUrl } from "@/lib/utils";

interface MeetingListProps {
  upcoming: Meeting[];
  recent: Meeting[];
  hideUpcoming?: boolean;
}

export default function MeetingList({
  upcoming,
  recent,
  hideUpcoming = false,
}: MeetingListProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyInvite = async (code: string) => {
    const url = getMeetingInviteUrl(code);
    await navigator.clipboard.writeText(url);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="mt-6 grid grid-cols-1 gap-6 px-4 md:grid-cols-2 md:gap-8 md:px-0">
      <section className={hideUpcoming ? "hidden" : undefined}>
        <h2 className="mb-4 text-lg font-bold text-zoom-text">
          Upcoming Meetings
        </h2>
        {upcoming.length === 0 ? (
          <div className="zoom-card flex flex-col items-center border-dashed px-6 py-10 text-center">
            <CalendarX className="h-10 w-10 text-zoom-muted" strokeWidth={1.5} />
            <p className="mt-3 text-sm text-zoom-muted">
              No upcoming meetings scheduled
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {upcoming.map((meeting) => (
              <li
                key={meeting.id}
                className="zoom-card flex flex-col gap-2 p-4 transition-shadow hover:shadow-zoom-md md:flex-row md:items-center md:justify-between md:gap-4"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold text-zoom-text">
                    {meeting.title}
                  </h3>
                  {meeting.scheduled_start && (
                    <p className="mt-1 text-sm text-zoom-muted">
                      {formatMeetingDateTime(meeting.scheduled_start)}
                      {meeting.duration_minutes
                        ? ` · ${meeting.duration_minutes} min`
                        : ""}
                    </p>
                  )}
                  <p className="mt-1 font-mono text-sm text-zoom-muted">
                    {meeting.meeting_code}
                  </p>
                </div>
                <div className="relative w-full shrink-0 md:w-auto">
                  <button
                    type="button"
                    onClick={() => handleCopyInvite(meeting.meeting_code)}
                    className="zoom-btn-primary min-h-[44px] w-full md:w-auto"
                  >
                    Copy invite
                  </button>
                  {copiedCode === meeting.meeting_code && (
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-zoom-navy px-2 py-1 text-xs text-white shadow">
                      Copied!
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={hideUpcoming ? "lg:col-span-2" : ""}>
        {!hideUpcoming && (
          <h2 className="mb-4 text-lg font-bold text-zoom-text">
            Recent Meetings
          </h2>
        )}
        {recent.length === 0 ? (
          <div className="zoom-card flex flex-col items-center border-dashed px-6 py-10 text-center">
            <History className="h-10 w-10 text-zoom-muted" strokeWidth={1.5} />
            <p className="mt-3 text-sm text-zoom-muted">No recent meetings</p>
          </div>
        ) : (
          <ul className="zoom-card divide-y divide-zoom-border overflow-hidden">
            {recent.map((meeting) => (
              <li
                key={meeting.id}
                className="flex flex-col gap-1 px-4 py-3 transition-colors hover:bg-zoom-border/30 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-zoom-text">
                    {meeting.title}
                  </p>
                  <p className="text-xs text-zoom-muted">
                    {formatMeetingDateTime(
                      meeting.scheduled_start ?? meeting.created_at
                    )}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-medium text-zoom-muted">
                  Ended
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
