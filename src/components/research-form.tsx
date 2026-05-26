"use client";

import { FormEvent, useState } from "react";

type ResearchResult = {
  competitors: string[];
  sourceUrls: string[];
  marketSignals: string[];
  customerPainPoints: string[];
  positioningIdeas: string[];
  recommendedGtmStrategy: string[];
  isDemoFallback: boolean;
  error?: string;
};

function ResultCard({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </h2>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
        {items.map((item) => (
          <li key={item} className="rounded-md bg-slate-50 px-3 py-2">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ResearchForm() {
  const [idea, setIdea] = useState("");
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      });

      const data = (await response.json()) as ResearchResult | { error: string };

      if (!response.ok) {
        throw new Error("error" in data ? data.error : "Research request failed.");
      }

      setResult(data as ResearchResult);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Research request failed.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
      >
        <label
          htmlFor="startup-idea"
          className="text-sm font-medium text-slate-700"
        >
          Startup idea
        </label>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            id="startup-idea"
            value={idea}
            onChange={(event) => setIdea(event.target.value)}
            placeholder="AI copilot for auto repair shops"
            className="min-h-11 flex-1 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            maxLength={240}
            required
          />
          <button
            type="submit"
            disabled={isLoading || !idea.trim()}
            className="min-h-11 rounded-md bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isLoading ? "Researching..." : "Run research"}
          </button>
        </div>
      </form>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="space-y-4">
          {result.isDemoFallback ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Demo fallback shown. Bright Data request failed or env vars missing.
              {result.error ? ` ${result.error}` : ""}
            </div>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-2">
            <ResultCard title="Competitors" items={result.competitors} />
            <ResultCard title="Market signals" items={result.marketSignals} />
            <ResultCard
              title="Customer pain points"
              items={result.customerPainPoints}
            />
            <ResultCard
              title="Positioning ideas"
              items={result.positioningIdeas}
            />
            <ResultCard
              title="Recommended GTM strategy"
              items={result.recommendedGtmStrategy}
            />
            <ResultCard title="Source URLs" items={result.sourceUrls} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
