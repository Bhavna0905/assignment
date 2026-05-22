"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

interface ApiStatusBannerProps {
  message: string;
  onRetry?: () => void;
  retrying?: boolean;
}

export default function ApiStatusBanner({
  message,
  onRetry,
  retrying,
}: ApiStatusBannerProps) {
  return (
    <div
      className="flex flex-col gap-3 border-b border-amber-200 bg-amber-50 px-4 py-3 text-amber-950 sm:flex-row sm:items-center sm:justify-between dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100"
      role="alert"
    >
      <div className="flex items-start gap-2">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
        <p className="text-sm">{message}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          disabled={retrying}
          className="flex shrink-0 items-center justify-center gap-2 rounded-md bg-amber-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
        >
          <RefreshCw
            className={`h-4 w-4 ${retrying ? "animate-spin" : ""}`}
          />
          {retrying ? "Retrying…" : "Retry"}
        </button>
      )}
    </div>
  );
}
