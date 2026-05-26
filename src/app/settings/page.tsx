import { AppShell } from "@/components/app-shell";

const envVars = ["BRIGHT_DATA_API_KEY", "BRIGHT_DATA_SERP_ZONE", "BRIGHT_DATA_UNLOCKER_ZONE"];

export default function SettingsPage() {
  return (
    <AppShell title="Settings" description="Server-side integration checklist. Keys stay in environment variables and never ship to browser.">
      <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.055] p-5 shadow-xl shadow-black/15">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Bright Data env vars</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {envVars.map((envVar) => (
            <div key={envVar} className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
              <p className="font-mono text-sm font-semibold text-white">{envVar}</p>
              <p className="mt-1 text-sm text-slate-400">Server only. Never exposed to browser.</p>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
