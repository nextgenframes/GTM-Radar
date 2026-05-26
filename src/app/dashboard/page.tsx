import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { CommandCenter } from "@/components/command-center";

const modules = [
  ["Research", "/research", "Turn one idea into market signals and source-backed direction."],
  ["Competitors", "/competitors", "Map rival positioning, pricing pages, and gaps."],
  ["Pain Points", "/pain-points", "Mine public complaints and group pain by theme."],
  ["ICP", "/icp", "Clarify buyers, triggers, objections, and where to reach them."],
  ["Strategy", "/strategy", "Create positioning, channels, and 30-day launch plan."],
  ["Content", "/content", "Generate launch copy, emails, hero copy, and demo script."],
];

export default function DashboardPage() {
  return (
    <AppShell
      title="AI command center"
      description="LaunchPilot AI acts like an AI chief of staff for startup growth: it organizes web signals, recommends next moves, and turns research into launch execution."
    >
      <CommandCenter />

      <section className="grid gap-4 lg:grid-cols-3">
        {modules.map(([title, href, description]) => (
          <Link
            key={href}
            href={href}
            className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 transition hover:-translate-y-1 hover:border-blue-300 dark:border-white/10 dark:bg-white/[0.055] dark:shadow-black/15 dark:hover:border-blue-400/40 dark:hover:bg-white/[0.075]"
          >
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
            <span className="mt-4 inline-flex rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-100">
              Open module
            </span>
          </Link>
        ))}
      </section>
    </AppShell>
  );
}
