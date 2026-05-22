"use client";

export default function PromoBanner() {
  return (
    <div className="zoom-card relative mt-6 overflow-hidden p-6 sm:p-8">
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full bg-zoom-primary/10 blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-indigo-200/40 blur-2xl dark:bg-indigo-900/30"
        aria-hidden
      />
      <div className="relative max-w-xl">
        <h2 className="text-2xl font-bold tracking-tight text-zoom-text sm:text-3xl dark:text-gray-100">
          Connect anywhere, work together
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-zoom-muted sm:text-base">
          Host secure video meetings with your team. Schedule ahead or start an
          instant meeting in one click.
        </p>
        <button type="button" className="zoom-btn-primary mt-5">
          Get started
        </button>
      </div>
      <div
        className="absolute bottom-4 right-4 hidden h-28 w-28 items-end justify-center sm:flex"
        aria-hidden
      >
        <div className="flex h-24 w-20 flex-col items-center">
          <div className="h-10 w-10 rounded-full bg-emerald-400" />
          <div className="mt-1 h-14 w-16 rounded-t-2xl bg-zoom-primary/20" />
        </div>
      </div>
    </div>
  );
}
