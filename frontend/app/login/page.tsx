"use client";

import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Globe,
  Shield,
  Users,
  Video,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Video,
    title: "HD video meetings",
    description: "Crystal-clear video and audio powered by WebRTC.",
  },
  {
    icon: Users,
    title: "Team collaboration",
    description: "Host instant or scheduled meetings with anyone.",
  },
  {
    icon: Shield,
    title: "Secure by design",
    description: "Google sign-in and encrypted peer connections.",
  },
  {
    icon: Globe,
    title: "Works everywhere",
    description: "Join from any modern browser — no downloads required.",
  },
];

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/");
    }
  }, [status, router]);

  if (status === "loading" || session) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-zoom-bg">
        <p className="text-zoom-muted">Redirecting…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-zoom-bg">
      <header className="border-b border-zoom-border bg-white dark:border-gray-700 dark:bg-zoom-card">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <span className="text-2xl font-bold text-zoom-primary">zoom</span>
          <nav className="hidden items-center gap-6 text-sm font-medium text-zoom-muted md:flex">
            <span>Products</span>
            <span>Solutions</span>
            <span>Pricing</span>
          </nav>
          <button
            type="button"
            onClick={() => signIn("google")}
            className="zoom-btn-primary text-sm"
          >
            Sign in
          </button>
        </div>
      </header>

      <main className="flex-1">
        <section className="border-b border-zoom-border bg-white dark:border-gray-700 dark:bg-zoom-card">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-20">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-zoom-primary/10 px-3 py-1 text-sm font-semibold text-zoom-primary">
                <Zap className="h-4 w-4" />
                Video conferencing reimagined
              </p>
              <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-zoom-text sm:text-5xl dark:text-gray-100">
                One platform to{" "}
                <span className="text-zoom-primary">connect</span> your world
              </h1>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-zoom-muted">
                Host meetings, collaborate in real time, and stay productive —
                all in a clean, professional experience inspired by Zoom.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => signIn("google")}
                  className="zoom-btn-primary px-8 py-3.5 text-base"
                >
                  Sign in with Google
                </button>
                <button
                  type="button"
                  onClick={() => signIn("google")}
                  className="zoom-btn-outline px-8 py-3.5 text-base"
                >
                  Join a meeting
                </button>
              </div>
            </div>
            <div className="zoom-card relative overflow-hidden p-8">
              <div className="absolute -right-6 -top-6 h-40 w-40 rounded-full bg-zoom-primary/15 blur-2xl" />
              <div className="relative aspect-video rounded-xl bg-gradient-to-br from-zoom-primary/20 to-indigo-100 dark:from-zoom-primary/30 dark:to-gray-800" />
              <p className="relative mt-4 text-center text-sm font-medium text-zoom-muted">
                Enterprise-grade meetings for teams of every size
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-center text-2xl font-bold text-zoom-text sm:text-3xl dark:text-gray-100">
            Everything you need to meet online
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-zoom-muted">
            Built for reliability, simplicity, and the workflows you already
            know.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="zoom-card p-6 transition-transform duration-200 hover:-translate-y-0.5"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zoom-primary/10 text-zoom-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-bold text-zoom-text dark:text-gray-100">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zoom-muted">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-zoom-border bg-white dark:border-gray-700 dark:bg-zoom-card">
          <div className="mx-auto max-w-md px-4 py-12 text-center sm:px-6">
            <h2 className="text-xl font-bold text-zoom-text dark:text-gray-100">
              Ready to get started?
            </h2>
            <button
              type="button"
              onClick={() => signIn("google")}
              className="zoom-btn-primary mt-6 w-full max-w-sm"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </span>
            </button>
          </div>
        </section>
      </main>

      <footer className="border-t border-zoom-border bg-zoom-navy py-8 text-center text-sm text-gray-400">
        <p>© {new Date().getFullYear()} Zoom Clone — For demonstration purposes</p>
      </footer>
    </div>
  );
}
