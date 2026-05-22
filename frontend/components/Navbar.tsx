"use client";

import { signOut, useSession } from "next-auth/react";
import { Moon, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/lib/theme";
import { getInitials } from "@/lib/utils";

export default function Navbar() {
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const name = session?.user?.name ?? "User";
  const image = session?.user?.image;
  const initials = getInitials(name);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#E0E0E0] bg-white dark:border-[#3D3D3D] dark:bg-[#1A1A1A]">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-3 pt-safe sm:px-6">
        <span className="truncate text-lg font-bold text-[#2D8CFF] sm:text-2xl">zoom</span>

        <div className="flex items-center gap-3 sm:gap-4">
          <input
            type="search"
            placeholder="Search"
            className="hidden h-9 w-48 rounded-md border border-[#E0E0E0] bg-[#F7F7F7] px-3 text-sm text-[#1A1A1A] placeholder:text-[#747487] focus:outline-none focus:ring-2 focus:ring-[#2D8CFF] dark:border-[#3D3D3D] dark:bg-[#2C2C2C] dark:text-[#F7F7F7] dark:placeholder:text-[#747487] sm:block md:w-64"
          />
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={
              theme === "light" ? "Switch to dark mode" : "Switch to light mode"
            }
            title={theme === "light" ? "Dark mode" : "Light mode"}
            className="rounded-full p-2 text-[#747487] transition hover:bg-[#F7F7F7] hover:text-[#1A1A1A] dark:hover:bg-[#2C2C2C] dark:hover:text-[#F7F7F7]"
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </button>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[#2D8CFF] text-sm font-semibold text-white"
              title={name}
            >
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={image}
                  alt={name}
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-40 rounded-md border border-[#E8E8ED] bg-white py-1 shadow-lg dark:border-[#3D3D3D] dark:bg-[#2C2C2C]">
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full px-4 py-2 text-left text-sm text-[#1A1A1A] hover:bg-[#F7F7F7] dark:text-[#F7F7F7] dark:hover:bg-[#3D3D3D]"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
