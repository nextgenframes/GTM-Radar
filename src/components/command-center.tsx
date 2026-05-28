"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Activity,
  ChevronDown,
  ClipboardCheck,
  Download,
  Loader2,
  Languages,
  Lightbulb,
  Plus,
  Radar,
  Save,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

type SavedProject = {
  id: string;
  name: string;
  idea: string;
  savedAt: string;
};

type ResearchResult = Record<string, unknown> & {
  competitors?: string[];
  marketSignals?: string[];
  customerPainPoints?: string[];
  positioningIdeas?: string[];
  recommendedGtmStrategy?: string[];
  sourceUrls?: string[];
};

const workflow = [
  ["1", "Analyze idea", "Start with one clear startup idea or website."],
  ["2", "Review signals", "Check demand, urgency, competitor pressure, and confidence."],
  ["3", "Choose ICP", "Pick buyer segment most likely to act now."],
  ["4", "Launch plan", "Turn recommendations into 30-day execution steps."],
];

const recommendations = [
  "Prioritize founder-led outbound before paid acquisition.",
  "Create comparison content for top competitor alternatives.",
  "Test one vertical ICP before broad horizontal messaging.",
];

const signals = [
  ["High", "Buyers search competitor alternatives", "86% confidence"],
  ["Medium", "Pricing pages show clear monetization path", "74% confidence"],
  ["High", "Pain language clusters around wasted research time", "82% confidence"],
];

const swot = [
  ["Strength", "Source-backed GTM plans feel more credible than generic AI output."],
  ["Weakness", "Needs clear proof quality and export workflow to win trust."],
  ["Opportunity", "Comparison SEO and founder communities create fast distribution."],
  ["Threat", "Large AI suites may bundle similar research features."],
];

function Panel({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/50 dark:border-white/10 dark:bg-white/[0.055] dark:shadow-black/15 sm:rounded-[1.5rem] sm:p-5"
    >
      <div className="flex items-center gap-2">
        <span className="rounded-2xl bg-blue-500/10 p-2 text-blue-700 dark:text-blue-200">{icon}</span>
        <h2 className="font-semibold text-slate-950 dark:text-white">{title}</h2>
      </div>
      <div className="mt-4">{children}</div>
    </motion.section>
  );
}

function ConfidenceBar({ value }: { value: number }) {
  return (
    <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800">
      <div
        className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export function CommandCenter() {
  const router = useRouter();
  const [idea, setIdea] = useState("");
  const [analysis, setAnalysis] = useState<ResearchResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [openInsight, setOpenInsight] = useState("recommendations");

  useEffect(() => {
    const saved = window.localStorage.getItem("launchpilot-projects");
    if (saved) {
      setProjects(JSON.parse(saved) as SavedProject[]);
    }

    window.localStorage.removeItem("launchpilot-current-idea");
    window.localStorage.removeItem("launchpilot-latest-research");
    window.localStorage.removeItem("launchpilot-latest-v2-research");
  }, []);

  const dynamicSignals = analysis?.marketSignals?.length
    ? analysis.marketSignals.map((signal, index) => [index === 1 ? "Medium" : "High", signal, `${84 - index * 7}% confidence`])
    : signals;

  const dynamicRecommendations = analysis?.recommendedGtmStrategy?.length ? analysis.recommendedGtmStrategy : recommendations;
  const dynamicQuotes = analysis?.customerPainPoints?.length
    ? analysis.customerPainPoints.map((point) => `Pain signal: ${point}`)
    : ["I waste too much time researching competitors.", "I need a launch plan I can act on today.", "Generic AI advice does not feel source-backed."];
  const readinessScore = analysis ? Math.min(92, 68 + (analysis.sourceUrls?.length ?? 0) * 3) : 79;

  async function analyzeOnDashboard() {
    const ideaToAnalyze = idea.trim();
    if (!ideaToAnalyze) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: ideaToAnalyze }),
      });
      const data = (await response.json()) as ResearchResult | { error: string };
      if (!response.ok) throw new Error("error" in data && typeof data.error === "string" ? data.error : "Request failed.");
      const result = data as ResearchResult;
      setAnalysis(result);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Request failed.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  function saveProject() {
    const next = [
      {
        id: crypto.randomUUID(),
        name: idea.split(" ").slice(0, 5).join(" "),
        idea,
        savedAt: new Date().toLocaleDateString(),
      },
      ...projects,
    ].slice(0, 4);
    setProjects(next);
    window.localStorage.setItem("launchpilot-projects", JSON.stringify(next));
  }

  function downloadAnalysis() {
    if (!analysis) return;
    const blob = new Blob([JSON.stringify({ idea, analysis, savedAt: new Date().toISOString() }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `launchpilot-dashboard-${idea.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "analysis"}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <Panel title="AI command center" icon={<Sparkles className="size-4" />}>
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
          <input
            value={idea}
            onChange={(event) => setIdea(event.target.value)}
            className="min-h-12 min-w-0 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.07] dark:text-white"
            placeholder="Describe startup idea"
          />
          <button
            type="button"
            onClick={analyzeOnDashboard}
            disabled={isAnalyzing || !idea.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-violet-500 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {isAnalyzing ? <Loader2 className="size-4 animate-spin" /> : null}
            {isAnalyzing ? "Analyzing..." : "Analyze Startup Idea"}
          </button>
          <button
            type="button"
            onClick={saveProject}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-white"
          >
            <Save className="size-4" /> Save project
          </button>
        </div>
        {error ? <p className="mt-3 text-sm text-red-600 dark:text-red-200">{error}</p> : null}
        {analysis ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={saveProject}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-white"
            >
              <Save className="size-4" /> Save
            </button>
            <button
              type="button"
              onClick={downloadAnalysis}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white"
            >
              <Download className="size-4" /> Download
            </button>
          </div>
        ) : null}
      </Panel>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel title="Guided workflow mode" icon={<ClipboardCheck className="size-4" />}>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {workflow.map(([step, title, body]) => (
              <div key={step} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-950/35">
                <span className="grid size-8 place-items-center rounded-full bg-slate-950 text-sm font-bold text-white dark:bg-white dark:text-slate-950">
                  {step}
                </span>
                <p className="mt-3 font-semibold text-slate-950 dark:text-white">{title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{body}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Launch readiness score" icon={<ShieldCheck className="size-4" />}>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div
              className="grid size-28 place-items-center rounded-full"
              style={{ background: `conic-gradient(#6366f1 ${readinessScore}%, rgba(148,163,184,.25) ${readinessScore}%)` }}
            >
              <div className="grid size-20 place-items-center rounded-full bg-white text-3xl font-bold text-slate-950 dark:bg-slate-950 dark:text-white">
                {readinessScore}
              </div>
            </div>
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <p>{analysis ? `Updated for ${idea}. Biggest unlock: validate ICP and source-backed proof.` : "Strong demo readiness. Biggest unlock: sharpen ICP and launch proof."}</p>
              <ConfidenceBar value={readinessScore} />
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-200">
                81% confidence
              </span>
            </div>
          </div>
        </Panel>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Panel title="Live market signals" icon={<Radar className="size-4" />}>
          <div className="space-y-3">
            {dynamicSignals.map(([severity, signal, confidence]) => (
              <div key={signal} className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-950/35">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{signal}</p>
                  <span className="rounded-full bg-blue-500/10 px-2 py-1 text-xs font-semibold text-blue-700 dark:text-blue-200">{severity}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{confidence}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Customer language extractor" icon={<Languages className="size-4" />}>
          <div className="space-y-2 text-sm">
            {dynamicQuotes.map((quote) => (
              <blockquote key={quote} className="rounded-2xl border-l-4 border-blue-500 bg-slate-50 p-3 text-slate-700 dark:bg-slate-950/35 dark:text-slate-200">
                “{quote}”
              </blockquote>
            ))}
          </div>
        </Panel>

        <Panel title="Quick actions" icon={<Plus className="size-4" />}>
          <div className="grid gap-2">
            {([
              ["Generate outreach angle", "/strategy"],
              ["Create Product Hunt copy", "/content"],
              ["Find competitor gaps", "/competitors"],
              ["Build launch checklist", "/strategy"],
            ] as const).map(([action, href]) => (
              <button
                key={action}
                type="button"
                onClick={() => router.push(`${href}?idea=${encodeURIComponent(idea.trim())}`)}
                disabled={!idea.trim()}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:border-blue-300 dark:border-white/10 dark:bg-slate-950/35 dark:text-slate-200"
              >
                {action}
              </button>
            ))}
          </div>
        </Panel>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Panel title="Autonomous recommendations" icon={<Lightbulb className="size-4" />}>
          <button
            type="button"
            onClick={() => setOpenInsight(openInsight === "recommendations" ? "" : "recommendations")}
            className="flex w-full items-center justify-between rounded-2xl bg-slate-50 p-3 text-left text-sm font-semibold text-slate-800 dark:bg-slate-950/35 dark:text-white"
          >
            Next best moves <ChevronDown className="size-4" />
          </button>
          {openInsight === "recommendations" ? <div className="mt-3"><ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">{dynamicRecommendations.map((item) => <li key={item}>• {item}</li>)}</ul></div> : null}
        </Panel>

        <Panel title="AI SWOT analysis" icon={<Activity className="size-4" />}>
          <div className="grid gap-3 sm:grid-cols-2">
            {swot.map(([label, body]) => (
              <div key={label} className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-950/35">
                <p className="text-sm font-semibold text-slate-950 dark:text-white">{label}</p>
                <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{body}</p>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Panel title="Saved projects" icon={<Save className="size-4" />}>
          {projects.length ? (
            <div className="space-y-2">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/research?idea=${encodeURIComponent(project.idea)}`}
                  className="block rounded-2xl bg-slate-50 p-3 transition hover:bg-slate-100 dark:bg-slate-950/35 dark:hover:bg-slate-950/60"
                >
                  <p className="font-semibold text-slate-950 dark:text-white">{project.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{project.idea}</p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-white/15 dark:text-slate-400">
              No saved projects yet. Save current idea to keep demo flow moving.
            </div>
          )}
        </Panel>

        <Panel title="Timeline / activity feed" icon={<Activity className="size-4" />}>
          <div className="space-y-3">
            {["Research scan queued", "Competitor set refreshed", "ICP recommendation updated", "Launch copy ready"].map((item, index) => (
              <div key={item} className="flex gap-3">
                <div className="mt-1 size-2 rounded-full bg-blue-500" />
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{item}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{index + 1} min ago</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </section>
    </div>
  );
}
