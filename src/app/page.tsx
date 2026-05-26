import Link from "next/link";
import { ArrowRight, BarChart3, CheckCircle2, Search, Sparkles, Target } from "lucide-react";

const features = [
  "Competitor tracker",
  "Pain point miner",
  "ICP generator",
  "GTM strategy builder",
  "Opportunity score",
  "Content engine",
];

export default function LandingPage() {
  return (
    <main className="min-h-screen text-white">
      <section className="mx-auto flex max-w-7xl flex-col gap-10 px-3 py-6 sm:gap-12 sm:px-6 sm:py-10 lg:px-8">
        <nav className="flex items-center justify-between">
          <Link href="/" className="text-lg font-bold tracking-tight sm:text-xl">LaunchPilot AI</Link>
          <Link href="/dashboard" className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15">
            Open app
          </Link>
        </nav>

        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-7">
            <span className="inline-flex rounded-full border border-blue-400/25 bg-blue-400/10 px-4 py-2 text-sm text-blue-100">
              Live web intelligence for startup launches
            </span>
            <div className="space-y-5">
              <h1 className="max-w-4xl text-4xl font-semibold leading-[1.04] tracking-tight sm:text-6xl lg:text-7xl">
                Turn live web data into a go-to-market plan.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
                LaunchPilot AI uses web intelligence agents to find competitors, customer pain points, ICPs, and launch strategies in minutes.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/research" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-violet-500 px-6 py-3 font-semibold shadow-xl shadow-blue-500/20 transition hover:scale-[1.02]">
                Analyze Startup Idea <ArrowRight className="size-4" />
              </Link>
              <Link href="/dashboard" className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] px-6 py-3 font-semibold text-slate-100 transition hover:bg-white/10">
                View demo dashboard
              </Link>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-3 shadow-2xl shadow-blue-950/40 backdrop-blur sm:rounded-[2rem] sm:p-4">
            <div className="rounded-[1.25rem] bg-slate-950/80 p-4 sm:rounded-[1.5rem] sm:p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-semibold">Opportunity score</p>
                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">Demo preview</span>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {["Demand", "Urgency", "SEO", "Monetization"].map((label, index) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                    <p className="text-xs text-slate-400">{label}</p>
                    <p className="mt-2 text-3xl font-bold">{[82, 78, 81, 76][index]}</p>
                    <div className="mt-3 h-2 rounded-full bg-slate-800">
                      <div className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-violet-400" style={{ width: `${[82, 78, 81, 76][index]}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            [Search, "Analyze", "Enter one startup idea. LaunchPilot searches market pages and public web sources."],
            [BarChart3, "Map", "See competitors, pain themes, ICP, and score in clean cards."],
            [Target, "Launch", "Generate strategy, content, outreach angle, and success metrics."],
          ].map(([Icon, title, body]) => {
            const TypedIcon = Icon as typeof Search;
            return (
              <div key={String(title)} className="rounded-3xl border border-white/10 bg-white/[0.05] p-6">
                <TypedIcon className="size-5 text-blue-300" />
                <h2 className="mt-4 text-lg font-semibold">{String(title)}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">{String(body)}</p>
              </div>
            );
          })}
        </section>

        <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-4 sm:rounded-[2rem] sm:p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-200">
            <Sparkles className="size-4" /> Features
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-3 rounded-2xl bg-slate-950/50 p-4 text-sm">
                <CheckCircle2 className="size-4 text-emerald-300" />
                {feature}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[1.5rem] bg-gradient-to-r from-blue-500 to-violet-500 p-6 text-center sm:rounded-[2rem] sm:p-8">
          <h2 className="text-2xl font-semibold sm:text-3xl">Ready to turn idea into launch plan?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-blue-50">Run one analysis, then move from market signal to ICP, strategy, and content without switching tools.</p>
          <Link href="/research" className="mt-6 inline-flex rounded-2xl bg-white px-6 py-3 font-semibold text-slate-950">
            Analyze Startup Idea
          </Link>
        </section>
      </section>
    </main>
  );
}
