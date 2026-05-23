"use client";

import { signOut, useSession } from "next-auth/react";
import { ChevronDown, Menu, Search, Settings, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { getInitials } from "@/lib/utils";

interface NavbarProps {
  onSchedule?: () => void;
  onJoin?: () => void;
  onHost?: () => void;
}

export default function Navbar({ onSchedule, onJoin, onHost }: NavbarProps) {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [hostOpen, setHostOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);

  const name = session?.user?.name ?? "User";
  const email = session?.user?.email;
  const image = session?.user?.image;
  const initials = getInitials(name);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
      if (hostRef.current && !hostRef.current.contains(e.target as Node)) {
        setHostOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed left-0 right-0 top-0 z-50">
      <div className="hidden border-b border-zoom-navy/20 bg-zoom-navy text-xs text-white lg:block">
        <div className="mx-auto flex max-w-[1600px] items-center justify-end gap-6 px-6 py-2">
          <span className="flex items-center gap-1.5 opacity-90">
            <Search className="h-3.5 w-3.5" />
            Search
          </span>
          <span className="opacity-90">Support</span>
          <span className="opacity-90">Contact Sales</span>
        </div>
      </div>

      <div className="border-b border-zoom-border bg-zoom-card shadow-sm">
        <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between gap-3 px-4">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileNavOpen((o) => !o)}
              className="rounded-lg p-2 text-zoom-muted hover:bg-zoom-border/40 lg:hidden"
              aria-label="Open menu"
            >
              {mobileNavOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
            <span className="shrink-0 text-xl font-bold tracking-tight text-zoom-primary">
              zoom
            </span>
            <nav className="ml-4 hidden items-center gap-5 text-sm font-medium text-zoom-muted lg:flex">
              <span className="cursor-default hover:text-zoom-text">Products</span>
              <span className="cursor-default hover:text-zoom-text">Solutions</span>
              <span className="cursor-default hover:text-zoom-text">Resources</span>
            </nav>
          </div>

          <div className="mx-4 hidden max-w-md flex-1 md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zoom-muted" />
              <input
                type="search"
                placeholder="Search"
                className="zoom-input w-full py-2 pl-9 text-sm"
                aria-label="Search"
              />
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {onSchedule && (
              <button
                type="button"
                onClick={onSchedule}
                className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-zoom-text transition-colors hover:bg-zoom-border/40 sm:block"
              >
                Schedule
              </button>
            )}
            {onJoin && (
              <button
                type="button"
                onClick={onJoin}
                className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-zoom-text transition-colors hover:bg-zoom-border/40 sm:block"
              >
                Join
              </button>
            )}
            {onHost && (
              <div className="relative hidden sm:block" ref={hostRef}>
                <button
                  type="button"
                  onClick={() => setHostOpen((o) => !o)}
                  className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-zoom-text transition-colors hover:bg-zoom-border/40"
                >
                  Host
                  <ChevronDown className="h-4 w-4" />
                </button>
                {hostOpen && (
                  <div className="absolute right-0 mt-1 w-48 rounded-xl border border-zoom-border bg-zoom-card py-1 shadow-zoom-md">
                    <button
                      type="button"
                      onClick={() => {
                        setHostOpen(false);
                        onHost();
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-zoom-text hover:bg-zoom-border/40"
                    >
                      Start with video
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setHostOpen(false);
                        onHost();
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-zoom-text hover:bg-zoom-border/40"
                    >
                      New meeting
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            <button
              type="button"
              className="hidden rounded-full p-2 text-zoom-muted transition-colors hover:bg-zoom-border/40 hover:text-zoom-text md:block"
              aria-label="Settings"
            >
              <Settings className="h-5 w-5" />
            </button>

            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-zoom-purple text-sm font-semibold text-white ring-2 ring-transparent hover:ring-zoom-primary/30"
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
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-zoom-border bg-zoom-card py-2 shadow-zoom-md">
                  <div className="border-b border-zoom-border px-4 py-3">
                    <p className="truncate font-semibold text-zoom-text">{name}</p>
                    {email && (
                      <p className="truncate text-xs text-zoom-muted">{email}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2.5 sm:hidden">
                    <ThemeToggle size="sm" />
                    <span className="text-sm text-zoom-text">Toggle theme</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full px-4 py-2.5 text-left text-sm text-zoom-text hover:bg-zoom-border/40"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {mobileNavOpen && (
          <div className="border-t border-zoom-border bg-zoom-card px-4 py-3 lg:hidden">
            <nav className="flex flex-col gap-1">
              {onSchedule && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileNavOpen(false);
                    onSchedule();
                  }}
                  className="rounded-lg px-3 py-3 text-left text-sm font-medium text-zoom-text hover:bg-zoom-border/40"
                >
                  Schedule
                </button>
              )}
              {onJoin && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileNavOpen(false);
                    onJoin();
                  }}
                  className="rounded-lg px-3 py-3 text-left text-sm font-medium text-zoom-text hover:bg-zoom-border/40"
                >
                  Join
                </button>
              )}
              {onHost && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileNavOpen(false);
                    onHost();
                  }}
                  className="rounded-lg px-3 py-3 text-left text-sm font-medium text-zoom-text hover:bg-zoom-border/40"
                >
                  Host meeting
                </button>
              )}
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg px-3 py-3 text-left text-sm font-medium text-zoom-text hover:bg-zoom-border/40"
              >
                <Settings className="h-4 w-4" />
                Settings
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
