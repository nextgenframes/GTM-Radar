"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, CheckCircle2, Download, Info, Loader2, Save, Search, Sparkles } from "lucide-react";

type WorkbenchType =
  | "research"
  | "competitors"
  | "pain-points"
  | "icp"
  | "strategy"
  | "content"
  | "opportunity-score";

type WorkbenchProps = {
  type: WorkbenchType;
  title: string;
  description: string;
  placeholder?: string;
  prefillIdea?: string;
};

type ApiResult = Record<string, unknown> & {
  isDemoFallback?: boolean;
  error?: string;
};

type StoredAnalysis = {
  type: WorkbenchType;
  idea: string;
  result: ApiResult;
  savedAt: string;
};

const progressSteps = [
  "Searching web data",
  "Finding competitors",
  "Mining pain points",
  "Generating ICP",
  "Building GTM strategy",
];

function Badge({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "high" | "medium" | "low";
}) {
  const tones = {
    default: "border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200",
    high: "border-red-400/20 bg-red-400/10 text-red-700 dark:text-red-100",
    medium: "border-amber-400/20 bg-amber-400/10 text-amber-700 dark:text-amber-100",
    low: "border-emerald-400/20 bg-emerald-400/10 text-emerald-700 dark:text-emerald-100",
  };
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

function Card({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.22 }}
      className="rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/50 backdrop-blur dark:border-white/10 dark:bg-white/[0.055] dark:shadow-black/15 sm:rounded-[1.5rem] sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">{title}</h2>
        {hint ? (
          <span title={hint} className="rounded-full border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/10 p-1 text-slate-500 dark:text-slate-300">
            <Info className="size-3.5" />
          </span>
        ) : null}
      </div>
      <div className="mt-4 text-sm leading-6 text-slate-700 dark:text-slate-200">{children}</div>
    </motion.section>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="rounded-2xl border border-slate-200 bg-slate-100 px-3 py-2 text-slate-700 dark:border-white/10 dark:bg-slate-950/35 dark:text-slate-200">
          {item}
        </li>
      ))}
    </ul>
  );
}

function ScoreMeter({ score, label }: { score: number; label: string }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>{label}</span>
        <span>{score}/100</span>
      </div>
      <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-violet-400 shadow-lg shadow-blue-500/30"
          style={{ width: `${Math.min(Math.max(score, 0), 100)}%` }}
        />
      </div>
    </div>
  );
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function severityTone(value: unknown): "high" | "medium" | "low" {
  const severity = String(value).toLowerCase();
  if (severity.includes("high")) return "high";
  if (severity.includes("medium")) return "medium";
  return "low";
}

function RenderResult({ type, result }: { type: WorkbenchType; result: ApiResult }) {
  if (type === "competitors") {
    const competitors = Array.isArray(result.competitors) ? (result.competitors as Record<string, string>[]) : [];
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        {competitors.map((competitor) => (
          <Card key={competitor.url} title={competitor.name} hint="Competitor found from search results. Review page manually before using in sales copy.">
            <div className="space-y-4">
              <p>{competitor.positioning}</p>
              <div className="flex flex-wrap gap-2">
                <Badge>{competitor.url}</Badge>
                <Badge>{competitor.pricingPageUrl}</Badge>
              </div>
              <p className="text-slate-500 dark:text-slate-400">{competitor.notes}</p>
              <Link className="inline-flex items-center gap-2 font-semibold text-blue-700 dark:text-blue-200" href={`/competitors/${slugify(competitor.name)}`}>
                Open detail <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (type === "pain-points") {
    const painPoints = Array.isArray(result.painPoints) ? (result.painPoints as Record<string, unknown>[]) : [];
    return (
      <div className="grid gap-4 lg:grid-cols-3">
        {painPoints.map((point) => (
          <Card key={String(point.theme)} title={String(point.theme)} hint="Frequency is demo-weighted signal from repeated public complaints and reviews.">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge tone={severityTone(point.severity)}>{String(point.severity)} severity</Badge>
                <Badge>{String(point.frequency)} mentions</Badge>
              </div>
              <ScoreMeter score={Number(point.frequency) || 0} label="Signal strength" />
              <List items={asStringArray(point.examples)} />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (type === "icp") {
    const icp = result.icp as Record<string, unknown>;
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Job titles" hint="People most likely to own this buying decision."><List items={asStringArray(icp.jobTitles)} /></Card>
        <Card title="Industries"><List items={asStringArray(icp.industries)} /></Card>
        <Card title="Company size"><p className="text-lg font-semibold text-slate-950 dark:text-white">{String(icp.companySize)}</p></Card>
        <Card title="Pain points"><List items={asStringArray(icp.painPoints)} /></Card>
        <Card title="Buying triggers"><List items={asStringArray(icp.buyingTriggers)} /></Card>
        <Card title="Objections"><List items={asStringArray(icp.objections)} /></Card>
        <Card title="Where to reach"><List items={asStringArray(icp.whereToReach)} /></Card>
      </div>
    );
  }

  if (type === "strategy") {
    const strategy = result.strategy as Record<string, unknown>;
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Positioning" hint="Simple way to explain why buyers should care now."><p className="text-lg font-medium text-slate-950 dark:text-white">{String(strategy.positioning)}</p></Card>
        <Card title="Channels"><List items={asStringArray(strategy.channels)} /></Card>
        <Card title="30-day launch plan"><List items={asStringArray(strategy.thirtyDayLaunchPlan)} /></Card>
        <Card title="Content ideas"><List items={asStringArray(strategy.contentIdeas)} /></Card>
        <Card title="Cold email angle"><p>{String(strategy.coldEmailAngle)}</p></Card>
        <Card title="Success metrics"><List items={asStringArray(strategy.successMetrics)} /></Card>
      </div>
    );
  }

  if (type === "content") {
    const content = result.content as Record<string, unknown>;
    const hero = content.landingPageHero as Record<string, unknown>;
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="LinkedIn post"><p className="whitespace-pre-line">{String(content.linkedInPost)}</p></Card>
        <Card title="Cold email"><p className="whitespace-pre-line">{String(content.coldEmail)}</p></Card>
        <Card title="Landing page hero">
          <div className="space-y-3">
            <h3 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{String(hero.headline)}</h3>
            <p className="text-slate-500 dark:text-slate-300">{String(hero.subheadline)}</p>
            <Badge tone="low">{String(hero.cta)}</Badge>
          </div>
        </Card>
        <Card title="Product Hunt copy"><p>{String(content.productHuntLaunchCopy)}</p></Card>
        <Card title="Demo script"><List items={asStringArray(content.shortDemoScript)} /></Card>
      </div>
    );
  }

  if (type === "opportunity-score") {
    const score = result.opportunityScore as Record<string, unknown>;
    const total = Number(score.total) || 0;
    const categories = Array.isArray(score.categories) ? (score.categories as Record<string, unknown>[]) : [];
    return (
      <div className="space-y-4">
        <Card title="Opportunity score" hint="Composite score across demand, urgency, competition, monetization, SEO, and launch ease.">
          <div className="grid gap-5 md:grid-cols-[180px_1fr] md:items-center">
            <div
              className="relative grid size-40 place-items-center rounded-full"
              style={{ background: `conic-gradient(#60a5fa ${total}%, rgba(30, 41, 59, 0.9) ${total}%)` }}
            >
              <div className="absolute inset-2 rounded-full bg-white dark:bg-slate-950" />
              <span className="relative text-5xl font-bold text-slate-950 dark:text-white">{total}</span>
            </div>
            <div className="space-y-3">
              {categories.map((category) => (
                <ScoreMeter key={String(category.name)} score={Number(category.score) || 0} label={String(category.name)} />
              ))}
            </div>
          </div>
        </Card>
        <div className="grid gap-4 lg:grid-cols-3">
          {categories.map((category) => (
            <Card key={String(category.name)} title={String(category.name)}>
              <div className="space-y-3">
                <Badge>{String(category.score)} / 100</Badge>
                <p>{String(category.explanation)}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="Competitors"><List items={asStringArray(result.competitors)} /></Card>
      <Card title="Market signals"><List items={asStringArray(result.marketSignals)} /></Card>
      <Card title="Customer pain points"><List items={asStringArray(result.customerPainPoints)} /></Card>
      <Card title="Positioning ideas"><List items={asStringArray(result.positioningIdeas)} /></Card>
      <Card title="Recommended GTM strategy"><List items={asStringArray(result.recommendedGtmStrategy)} /></Card>
      <Card title="Source URLs"><List items={asStringArray(result.sourceUrls)} /></Card>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-5 rounded-[1.5rem] border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.05] p-5">
      <div className="space-y-3">
        {progressSteps.map((step, index) => (
          <motion.div
            key={step}
            initial={{ opacity: 0.25, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.12, repeat: Infinity, repeatType: "reverse", duration: 0.8 }}
            className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200"
          >
            <Loader2 className="size-4 animate-spin text-blue-300" />
            {step}
          </motion.div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-36 rounded-[1.5rem] shimmer" />
        ))}
      </div>
    </div>
  );
}

export function GtmWorkbench({ type, title, description, placeholder, prefillIdea }: WorkbenchProps) {
  const [idea, setIdea] = useState(prefillIdea ?? "");
  const [result, setResult] = useState<ApiResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const endpoint = useMemo(() => `/api/${type}`, [type]);
  const didAutoSubmit = useRef(false);

  function latestKey() {
    return `launchpilot-latest-v2-${type}`;
  }

  function persistResult(ideaToSave: string, data: ApiResult) {
    const stored: StoredAnalysis = {
      type,
      idea: ideaToSave,
      result: data,
      savedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(latestKey(), JSON.stringify(stored));
    window.localStorage.setItem("launchpilot-current-idea", ideaToSave);
  }

  async function runAnalysis(ideaToAnalyze: string) {
    if (!ideaToAnalyze.trim()) return;
    setError(null);
    setResult(null);
    setIsLoading(true);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: ideaToAnalyze }),
      });
      const data = (await response.json()) as ApiResult | { error: string };
      if (!response.ok) throw new Error("error" in data ? data.error : "Request failed.");
      const nextResult = data as ApiResult;
      setResult(nextResult);
      persistResult(ideaToAnalyze, nextResult);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Request failed.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const saved = window.localStorage.getItem(latestKey());
    if (!prefillIdea && saved) {
      try {
        const stored = JSON.parse(saved) as StoredAnalysis;
        if (stored.result?.isDemoFallback) {
          window.localStorage.removeItem(latestKey());
        } else {
          setIdea(stored.idea);
          setResult(stored.result);
        }
      } catch {
        window.localStorage.removeItem(latestKey());
      }
    }

    if (!prefillIdea) {
      const currentIdea = window.localStorage.getItem("launchpilot-current-idea");
      if (currentIdea) setIdea((existing) => existing || currentIdea);
    }

    if (prefillIdea && !didAutoSubmit.current) {
      didAutoSubmit.current = true;
      runAnalysis(prefillIdea);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runAnalysis(idea);
  }

  function saveReport() {
    if (!result) return;
    const stored: StoredAnalysis = {
      type,
      idea,
      result,
      savedAt: new Date().toISOString(),
    };
    const saved = window.localStorage.getItem("launchpilot-saved-analyses");
    const existing = saved ? (JSON.parse(saved) as StoredAnalysis[]) : [];
    window.localStorage.setItem("launchpilot-saved-analyses", JSON.stringify([stored, ...existing].slice(0, 20)));
  }

  function downloadReport() {
    if (!result) return;
    const blob = new Blob([JSON.stringify({ type, idea, result, savedAt: new Date().toISOString() }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `launchpilot-${type}-${idea.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "analysis"}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="rounded-[1.5rem] border border-slate-200 bg-white/80 p-4 shadow-2xl shadow-slate-200/60 backdrop-blur dark:border-white/10 dark:bg-slate-950/60 dark:shadow-black/20 sm:rounded-[2rem] sm:p-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-100">
              <Sparkles className="size-3.5" /> Plain-English GTM output
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-2xl">{title}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-300">{description}</p>
          </div>
          <span title="Keys stay server-side. Results are shown as cards, not raw data." className="hidden rounded-full border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/10 p-2 text-slate-500 dark:text-slate-300 sm:inline-flex">
            <Info className="size-4" />
          </span>
        </div>
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
            <input
              value={idea}
              onChange={(event) => setIdea(event.target.value)}
              placeholder={placeholder ?? "AI copilot for auto repair shops"}
              className="min-h-14 w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.07] pl-11 pr-4 text-sm text-slate-950 dark:text-white outline-none transition placeholder:text-slate-400 focus:border-blue-400/60 focus:ring-4 focus:ring-blue-500/10"
              maxLength={240}
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !idea.trim()}
            className="min-h-14 rounded-2xl bg-gradient-to-r from-blue-500 to-violet-500 px-6 text-sm font-semibold text-white shadow-xl shadow-blue-500/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Analyzing..." : "Analyze Startup Idea"}
          </button>
        </div>
      </form>

      {!result && !error && !isLoading ? (
        <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white/70 p-6 text-center dark:border-white/15 dark:bg-white/[0.035] sm:p-8">
          <p className="text-lg font-semibold text-slate-950 dark:text-white">Ready when you are.</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Enter idea. LaunchPilot will organize web findings into clean GTM cards.
          </p>
        </div>
      ) : null}

      {isLoading ? <LoadingState /> : null}

      {error ? (
        <div className="rounded-[1.5rem] border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      {result?.isDemoFallback ? (
        <div className="rounded-[1.5rem] border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
          Demo fallback shown. A data or AI request failed, or required env vars are missing.
          {result.error ? ` ${result.error}` : ""}
        </div>
      ) : null}

      {result?.error && !result.isDemoFallback ? (
        <div className="rounded-[1.5rem] border border-blue-400/20 bg-blue-400/10 p-4 text-sm text-blue-700 dark:text-blue-100">
          Source note: {result.error}
        </div>
      ) : null}

      {result ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-200">
              <CheckCircle2 className="size-4" /> Analysis ready
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={saveReport}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-white"
              >
                <Save className="size-4" /> Save
              </button>
              <button
                type="button"
                onClick={downloadReport}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-violet-500 px-3 py-2 text-sm font-semibold text-white"
              >
                <Download className="size-4" /> Download
              </button>
            </div>
          </div>
          <RenderResult type={type} result={result} />
        </motion.div>
      ) : null}
    </div>
  );
}
