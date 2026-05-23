"use client";

interface ZoomLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-3xl",
};

/** Reliable brand mark — no external image fetch (avoids broken logo on join/login). */
export default function ZoomLogo({ className = "", size = "md" }: ZoomLogoProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 ${className}`}
      aria-label="Zoom"
    >
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#2D8CFF] text-sm font-bold text-white sm:h-9 sm:w-9"
        aria-hidden
      >
        z
      </span>
      <span
        className={`font-bold tracking-tight text-[#2D8CFF] ${sizes[size]}`}
      >
        zoom
      </span>
    </div>
  );
}
