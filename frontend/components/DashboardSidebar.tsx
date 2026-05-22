"use client";

import {
  Calendar,
  ChevronDown,
  Home,
  Settings,
  Shield,
  User,
  Video,
} from "lucide-react";
import { useState } from "react";

export type DashboardSection = "home" | "meetings" | "scheduler";

interface DashboardSidebarProps {
  activeSection: DashboardSection;
  onNavigate: (section: DashboardSection) => void;
}

function NavSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-zoom-border py-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-2 text-left text-sm font-semibold text-zoom-text transition-colors hover:text-zoom-primary"
      >
        {title}
        <ChevronDown
          className={`h-4 w-4 text-zoom-muted transition-transform ${open ? "" : "-rotate-90"}`}
        />
      </button>
      {open && <ul className="pb-2">{children}</ul>}
    </div>
  );
}

function NavItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={`zoom-nav-item ${
          active ? "zoom-nav-item-active" : "zoom-nav-item-inactive"
        }`}
      >
        {icon}
        {label}
      </button>
    </li>
  );
}

const MAIN_NAV: {
  id: DashboardSection;
  label: string;
  icon: typeof Home;
}[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "meetings", label: "Meetings", icon: Video },
  { id: "scheduler", label: "Scheduler", icon: Calendar },
];

export default function DashboardSidebar({
  activeSection,
  onNavigate,
}: DashboardSidebarProps) {
  return (
    <>
      {/* Mobile / tablet nav */}
      <nav className="flex gap-1 overflow-x-auto border-b border-zoom-border bg-zoom-card px-2 py-2 lg:hidden">
        {MAIN_NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onNavigate(id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              activeSection === id
                ? "bg-zoom-primary text-white"
                : "text-zoom-muted hover:bg-zoom-border/50 hover:text-zoom-text"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </nav>

      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-zoom-border bg-zoom-card lg:flex xl:w-64">
        <nav className="flex-1 overflow-y-auto py-3">
          <NavItem
            icon={<Home className="h-4 w-4" />}
            label="Home"
            active={activeSection === "home"}
            onClick={() => onNavigate("home")}
          />
          <p className="px-4 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wide text-zoom-muted">
            My Products
          </p>
          <NavItem
            icon={<Video className="h-4 w-4" />}
            label="Meetings"
            active={activeSection === "meetings"}
            onClick={() => onNavigate("meetings")}
          />
          <NavItem
            icon={<Calendar className="h-4 w-4" />}
            label="Scheduler"
            active={activeSection === "scheduler"}
            onClick={() => onNavigate("scheduler")}
          />
          <NavSection title="My Account">
            <NavItem
              icon={<User className="h-4 w-4" />}
              label="Profile"
              onClick={() => onNavigate("home")}
            />
            <NavItem
              icon={<Settings className="h-4 w-4" />}
              label="Settings"
              onClick={() => onNavigate("home")}
            />
          </NavSection>
        </nav>
        <div className="border-t border-zoom-border p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zoom-primary/10 text-zoom-primary">
            <Shield className="h-5 w-5" />
          </div>
        </div>
      </aside>
    </>
  );
}
