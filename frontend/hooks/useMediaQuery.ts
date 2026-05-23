"use client";

import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/** Mobile browsers often lack getDisplayMedia — hide share button, still allow viewing. */
export function useCanScreenShare(): boolean {
  const isDesktop = useMediaQuery("(min-width: 640px)");
  const [uaMobile, setUaMobile] = useState(false);

  useEffect(() => {
    setUaMobile(/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
  }, []);

  return isDesktop && !uaMobile;
}
