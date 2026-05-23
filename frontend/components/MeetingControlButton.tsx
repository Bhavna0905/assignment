"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";

interface MeetingControlButtonProps {
  onClick: () => void;
  label: string;
  tooltip: string;
  active?: boolean;
  activeStyle?: "danger" | "primary" | "leave";
  children: ReactNode;
  className?: string;
  badge?: React.ReactNode;
  ariaExpanded?: boolean;
}

export default function MeetingControlButton({
  onClick,
  label,
  tooltip,
  active = false,
  activeStyle,
  children,
  className = "",
  badge,
  ariaExpanded,
}: MeetingControlButtonProps) {
  const [pressed, setPressed] = useState(false);
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const baseIdle = "bg-[#3D3D3D] text-white hover:bg-[#4D4D4D] focus-visible:ring-2 focus-visible:ring-zoom-primary/60";
  const activeClass =
    activeStyle === "primary"
      ? "bg-zoom-primary text-white hover:bg-zoom-primary-hover"
      : activeStyle === "leave"
        ? "bg-red-600 text-white hover:bg-red-700"
        : activeStyle === "danger" || active
          ? "bg-red-600 text-white hover:bg-red-700"
          : baseIdle;

  const clearLongPress = useCallback(() => {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
    setPressed(false);
  }, []);

  const handlePointerDown = () => {
    longPressRef.current = setTimeout(() => setPressed(true), 400);
  };

  return (
    <div className="group/control relative flex shrink-0 flex-col items-center">
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        aria-expanded={ariaExpanded}
        onPointerDown={handlePointerDown}
        onPointerUp={clearLongPress}
        onPointerLeave={clearLongPress}
        onPointerCancel={clearLongPress}
        className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-200 active:scale-95 sm:h-11 sm:w-11 ${activeClass} ${className}`}
      >
        {children}
        {badge}
      </button>

      <span
        role="tooltip"
        className={`pointer-events-none absolute bottom-[calc(100%+0.35rem)] left-1/2 z-50 max-w-[min(11rem,calc(100vw-2rem))] -translate-x-1/2 truncate rounded-md bg-[#1a1a1a] px-2 py-1 text-center text-[11px] font-medium text-white shadow-lg transition-opacity duration-200 ${
          pressed
            ? "opacity-100"
            : "opacity-0 [@media(hover:hover)]:group-hover/control:opacity-100 group-focus-within/control:opacity-100"
        }`}
      >
        {tooltip}
      </span>

      <span className="mt-0.5 max-w-[3.5rem] truncate text-center text-[9px] leading-tight text-[#949494] sm:hidden">
        {tooltip}
      </span>
    </div>
  );
}
