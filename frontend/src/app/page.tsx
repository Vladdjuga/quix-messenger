
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="relative isolate min-h-[calc(100dvh-4rem)] overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
      {/* Decorative background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 translate-x-1/3 translate-y-1/3 rounded-full bg-indigo-500/20 blur-2xl" />
        <div className="absolute inset-0 bg-[radial-gradient(transparent_1px,rgba(255,255,255,0.04)_1px)] [background-size:24px_24px]" />
      </div>

      <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-16 md:grid-cols-2 md:py-24">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-600/10 px-3 py-1 text-sm text-blue-300 ring-1 ring-inset ring-blue-500/30">
            <span className="size-1.5 rounded-full bg-blue-400" />
            <span>Now with real‑time messaging</span>
          </span>
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-white md:text-5xl">
            Chat faster. Connect smarter. With Quix.
          </h1>
          <p className="text-pretty text-base leading-relaxed text-slate-300 md:text-lg">
            Quix Messenger keeps your conversations instant, secure, and beautifully simple—across friends, teams, and everything in between.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white shadow-[0_0_0_1px_rgba(59,130,246,0.35)_inset] transition-colors hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60">
              Get started
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg bg-white/5 px-5 py-3 text-sm font-medium text-slate-200 ring-1 ring-inset ring-white/10 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40">
              Sign in
            </Link>
            <Link
              href="/chats"
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600/20 px-5 py-3 text-sm font-medium text-indigo-200 ring-1 ring-inset ring-indigo-500/30 transition-colors hover:bg-indigo-600/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60">
              Open chats
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 text-sm text-slate-300/90 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <div className="mb-2 text-slate-200">Real‑time</div>
              <p className="text-slate-400">Instant delivery powered by websockets.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <div className="mb-2 text-slate-200">Private</div>
              <p className="text-slate-400">Secure by design with modern auth.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <div className="mb-2 text-slate-200">Simple</div>
              <p className="text-slate-400">Clean UI that stays out of the way.</p>
            </div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-2 text-slate-300">
              <span className="size-2 rounded-full bg-emerald-400" />
              <span className="size-2 rounded-full bg-amber-400" />
              <span className="size-2 rounded-full bg-rose-400" />
            </div>
            <div className="relative aspect-[4/3] w-full">
              <Image
                src="/globe.svg"
                alt="Quix Messenger illustration"
                fill
                className="object-contain opacity-90"
                priority
              />
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-slate-300/90">
              <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                <div className="text-slate-200">Typing indicators</div>
                <div className="mt-1 h-1.5 w-16 animate-pulse rounded-full bg-slate-500/40" />
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                <div className="text-slate-200">Presence</div>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-emerald-400" />
                  <span className="text-slate-400">Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
