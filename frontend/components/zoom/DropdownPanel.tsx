"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { ReactNode } from "react";

interface DropdownPanelProps {
  open: boolean;
  children: ReactNode;
  className?: string;
  align?: "left" | "right" | "center";
}

export default function DropdownPanel({
  open,
  children,
  className = "",
  align = "right",
}: DropdownPanelProps) {
  const alignClass =
    align === "left"
      ? "left-0"
      : align === "center"
        ? "left-1/2 -translate-x-1/2"
        : "right-0";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.98 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className={`absolute top-full z-[200] mt-2 min-w-[280px] rounded-lg border border-[#3D3D3D] bg-[#2D2D2D] shadow-xl ${alignClass} ${className}`}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
