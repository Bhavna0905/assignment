"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Meeting } from "@/lib/types";
import { getMeetingInviteUrl } from "@/lib/utils";

interface ScheduleModalProps {
  open: boolean;
  onClose: () => void;
  onScheduled: (meeting: Meeting) => void;
}

const DURATIONS = [15, 30, 45, 60, 90];

function todayDateString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function ScheduleModal({
  open,
  onClose,
  onScheduled,
}: ScheduleModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(30);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [scheduledMeeting, setScheduledMeeting] = useState<Meeting | null>(
    null
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) {
      setTitle("");
      setDescription("");
      setDate("");
      setTime("");
      setDuration(30);
      setError("");
      setSubmitting(false);
      setScheduledMeeting(null);
      setCopied(false);
    }
  }, [open]);

  if (!open) return null;

  const inviteUrl = scheduledMeeting
    ? getMeetingInviteUrl(scheduledMeeting.meeting_code)
    : "";

  const handleSchedule = async () => {
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!date || !time) {
      setError("Date and start time are required.");
      return;
    }

    const scheduledStart = new Date(`${date}T${time}`);
    if (Number.isNaN(scheduledStart.getTime())) {
      setError("Invalid date or time.");
      return;
    }

    if (scheduledStart.getTime() <= Date.now()) {
      setError("Please choose a date and time in the future.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const meeting = await api.scheduleMeeting({
        title: title.trim(),
        description: description.trim() || undefined,
        scheduled_start: scheduledStart.toISOString(),
        duration_minutes: duration,
      });
      setScheduledMeeting(meeting);
      onScheduled(meeting);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to schedule meeting. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
      <div className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-lg sm:p-6 dark:bg-[#2C2C2C]">
        <h2 className="text-xl font-semibold text-[#1A1A1A] dark:text-[#F7F7F7]">
          Schedule a meeting
        </h2>

        {scheduledMeeting ? (
          <div className="mt-4">
            <p className="text-sm text-[#747487]">
              Meeting scheduled. Share this invite link:
            </p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                readOnly
                value={inviteUrl}
                className="min-w-0 flex-1 rounded-md border border-[#E0E0E0] bg-[#F7F7F7] px-3 py-2 text-sm text-[#1A1A1A] dark:border-[#3D3D3D] dark:bg-[#1A1A1A] dark:text-[#F7F7F7]"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="shrink-0 rounded-md bg-[#2D8CFF] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#0E71EB] sm:py-2"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <p className="mt-2 font-mono text-sm text-[#747487]">
              ID: {scheduledMeeting.meeting_code}
            </p>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-md bg-[#2D8CFF] px-4 py-2 text-sm font-medium text-white hover:bg-[#0E71EB]"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-4 space-y-4">
              <label className="block text-sm text-[#747487]">
                Title *
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-md border border-[#E0E0E0] bg-white px-3 py-2 text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#2D8CFF] dark:border-[#3D3D3D] dark:bg-[#1A1A1A] dark:text-[#F7F7F7]"
                />
              </label>
              <label className="block text-sm text-[#747487]">
                Description
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-md border border-[#E0E0E0] bg-white px-3 py-2 text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#2D8CFF] dark:border-[#3D3D3D] dark:bg-[#1A1A1A] dark:text-[#F7F7F7]"
                />
              </label>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block text-sm text-[#747487]">
                  Date *
                  <input
                    type="date"
                    value={date}
                    min={todayDateString()}
                    onChange={(e) => setDate(e.target.value)}
                    className="mt-1 w-full rounded-md border border-[#E0E0E0] bg-white px-3 py-2 text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#2D8CFF] dark:border-[#3D3D3D] dark:bg-[#1A1A1A] dark:text-[#F7F7F7]"
                  />
                </label>
                <label className="block text-sm text-[#747487]">
                  Start time *
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="mt-1 w-full rounded-md border border-[#E0E0E0] bg-white px-3 py-2 text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#2D8CFF] dark:border-[#3D3D3D] dark:bg-[#1A1A1A] dark:text-[#F7F7F7]"
                  />
                </label>
              </div>
              <label className="block text-sm text-[#747487]">
                Duration
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="mt-1 w-full rounded-md border border-[#E0E0E0] bg-white px-3 py-2 text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#2D8CFF] dark:border-[#3D3D3D] dark:bg-[#1A1A1A] dark:text-[#F7F7F7]"
                >
                  {DURATIONS.map((m) => (
                    <option key={m} value={m}>
                      {m} minutes
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {error && (
              <p className="mt-3 text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            <div className="mt-6 flex flex-col-reverse gap-2 pb-safe sm:flex-row sm:justify-end sm:gap-3 sm:pb-0">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md px-4 py-3 text-sm font-medium text-[#747487] hover:bg-[#F7F7F7] dark:hover:bg-[#3D3D3D] sm:py-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSchedule}
                disabled={submitting}
                className="rounded-md bg-[#0E71EB] px-4 py-3 text-sm font-medium text-white hover:bg-[#2D8CFF] disabled:opacity-60 sm:py-2"
              >
                {submitting ? "Scheduling…" : "Schedule"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
