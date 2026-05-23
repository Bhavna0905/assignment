"use client";

import UserAvatar from "@/components/UserAvatar";

interface ProfileCardProps {
  name: string;
  email?: string | null;
  avatarUrl?: string | null;
  planLabel?: string;
}

export default function ProfileCard({
  name,
  email,
  avatarUrl,
  planLabel = "Workplace Basic",
}: ProfileCardProps) {
  return (
    <div className="zoom-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div className="flex min-w-0 items-center gap-4">
        <UserAvatar
          name={name}
          imageUrl={avatarUrl}
          shape="rounded"
          className="h-14 w-14 sm:h-16 sm:w-16"
          textClassName="text-lg"
        />
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold text-zoom-text sm:text-2xl">
            {name}
          </h1>
          {email && (
            <p className="truncate text-sm text-zoom-muted">{email}</p>
          )}
          <p className="mt-0.5 text-sm text-zoom-muted">
            Plan: <span className="font-medium text-zoom-text">{planLabel}</span>
          </p>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-3">
        <button type="button" className="zoom-btn-outline">
          Manage Plan
        </button>
        <button
          type="button"
          className="text-sm font-semibold text-zoom-primary transition-colors hover:text-zoom-primary-hover"
        >
          View Plan Details
        </button>
      </div>
    </div>
  );
}
