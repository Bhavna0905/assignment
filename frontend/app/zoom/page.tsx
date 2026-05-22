"use client";

import { useEffect } from "react";
import ZoomApp from "@/components/zoom/ZoomApp";

export default function ZoomDesktopPage() {
  useEffect(() => {
    document.title = "Zoom Desktop | Zoom Clone";
  }, []);

  return <ZoomApp />;
}
