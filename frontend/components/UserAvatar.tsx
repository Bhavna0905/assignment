"use client";

import { useState } from "react";
import { getInitials } from "@/lib/utils";

interface UserAvatarProps {
  name: string;
  imageUrl?: string | null;
  className?: string;
  textClassName?: string;
  shape?: "circle" | "rounded";
}

export default function UserAvatar({
  name,
  imageUrl,
  className = "h-10 w-10",
  textClassName = "text-sm",
  shape = "circle",
}: UserAvatarProps) {
  const shapeClass = shape === "rounded" ? "rounded-xl" : "rounded-full";
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(imageUrl) && !failed;

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden bg-zoom-purple font-semibold text-white ${shapeClass} ${className}`}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl!}
          alt=""
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className={textClassName}>{getInitials(name)}</span>
      )}
    </div>
  );
}
