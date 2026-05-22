"use client";

import { CalendarX, History } from "lucide-react";
import { useState } from "react";
import type { Meeting } from "@/lib/types";
import { formatMeetingDateTime, getMeetingInviteUrl } from "@/lib/utils";

interface MeetingListProps {
  upcoming: Meeting[];
  recent: Meeting[];
}

export default function MeetingList({ upcoming, recent }: MeetingListProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyInvite = async (code: string) => {
    const url = getMeetingInviteUrl(code);
    await navigator.clipboard.writeText(url);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="mt-10 grid gap-8 sm:mt-12 md:grid-cols-2">
      <section>
        <h2 className="mb-4 text-lg font-semibold text-[#1A1A1A] dark:text-[#F7F7F7]">
          Upcoming
        </h2>
        {upcoming.length === 0 ? (
          <div className="flex flex-col items-center rounded-lg border border-dashed border-[#E8E8ED] bg-white px-6 py-10 text-center dark:border-[#3D3D3D] dark:bg-[#2C2C2C]">
            <CalendarX className="h-10 w-10 text-[#747487]" strokeWidth={1.5} />
            <p className="mt-3 text-sm text-[#747487]">
              No upcoming meetings scheduled
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {upcoming.map((meeting) => (
              <li
                key={meeting.id}
                className="rounded-lg border border-[#E8E8ED] bg-white p-4 shadow-sm dark:border-[#3D3D3D] dark:bg-[#2C2C2C]"
              >
                <h3 className="truncate font-semibold text-[#1A1A1A] dark:text-[#F7F7F7]">
                  {meeting.title}
                </h3>
                {meeting.scheduled_start && (
                  <p className="mt-1 text-sm text-[#747487]">
                    {formatMeetingDateTime(meeting.scheduled_start)}
                    {meeting.duration_minutes
                      ? ` · ${meeting.duration_minutes} min`
                      : ""}
                  </p>
                )}
                <p className="mt-1 font-mono text-sm text-[#747487]">
                  {meeting.meeting_code}
                </p>
                <div className="relative mt-3 inline-block">
                  <button
                    type="button"
                    onClick={() => handleCopyInvite(meeting.meeting_code)}
                    className="rounded-md bg-[#2D8CFF] px-3 py-1.5 text-sm font-medium text-white transition hover:bg-[#0E71EB]"
                  >
                    Copy invite
                  </button>
                  {copiedCode === meeting.meeting_code && (
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-[#1A1A1A] px-2 py-1 text-xs text-white shadow">
                      Copied!
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-[#1A1A1A] dark:text-[#F7F7F7]">
          Recent
        </h2>
        {recent.length === 0 ? (
          <div className="flex flex-col items-center rounded-lg border border-dashed border-[#E8E8ED] bg-white px-6 py-10 text-center dark:border-[#3D3D3D] dark:bg-[#2C2C2C]">
            <History className="h-10 w-10 text-[#747487]" strokeWidth={1.5} />
            <p className="mt-3 text-sm text-[#747487]">No recent meetings</p>
          </div>
        ) : (
          <ul className="divide-y divide-[#E8E8ED] rounded-lg border border-[#E8E8ED] bg-white dark:divide-[#3D3D3D] dark:border-[#3D3D3D] dark:bg-[#2C2C2C]">
            {recent.map((meeting) => (
              <li
                key={meeting.id}
                className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-[#1A1A1A] dark:text-[#F7F7F7]">
                    {meeting.title}
                  </p>
                  <p className="text-xs text-[#747487]">
                    {formatMeetingDateTime(
                      meeting.scheduled_start ?? meeting.created_at
                    )}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-medium text-[#747487]">
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
