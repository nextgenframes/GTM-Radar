"use client";

import { useEffect, useState } from "react";
import { Activity, CheckCircle2, RefreshCw, XCircle } from "lucide-react";

type Source = {
  name: string;
  key: string;
  purpose: string;
  status: "online" | "offline";
  detail: string;
};

type StatusPayload = {
  overall: "online" | "offline";
  checkedAt: string;
  model: string;
  sources: Source[];
};

function statusTone(status: "online" | "offline") {
  return status === "online"
    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-700 dark:text-emerald-100"
    : "border-red-400/20 bg-red-400/10 text-red-700 dark:text-red-100";
}

export function SourceIndicator() {
  const [status, setStatus] = useState<StatusPayload["overall"] | "checking">("checking");

  useEffect(() => {
    let alive = true;

    fetch("/api/sources/status", { cache: "no-store" })
      .then((response) => response.json() as Promise<StatusPayload>)
      .then((data) => {
        if (alive) setStatus(data.overall);
      })
      .catch(() => {
        if (alive) setStatus("offline");
      });

    return () => {
      alive = false;
    };
  }, []);

  const online = status === "online";
  const label = status === "checking" ? "Checking" : online ? "Online" : "Offline";

  return (
    <span
      title="Source status"
      className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-semibold shadow-sm ${
        online
          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-700 dark:text-emerald-100"
          : "border-red-400/20 bg-red-400/10 text-red-700 dark:text-red-100"
      }`}
    >
      <span className={`size-2 rounded-full ${online ? "bg-emerald-400" : "bg-red-400"} animate-pulse`} />
      {label}
    </span>
  );
}

export function SourcesPanel() {
  const [payload, setPayload] = useState<StatusPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadStatus() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/sources/status", { cache: "no-store" });
      const data = (await response.json()) as StatusPayload;
      if (!response.ok) throw new Error("Status check failed.");
      setPayload(data);
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : "Status check failed.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadStatus();
  }, []);

  return (
    <div className="space-y-5">
      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 dark:border-white/10 dark:bg-white/[0.055] dark:shadow-black/15">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-100">
              <Activity className="size-3.5" /> Live source status
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
              {payload?.overall === "online" ? "All systems online" : "Source check needs attention"}
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              OpenRouter synthesizes analysis. Bright Data SERP and Web Unlocker collect source context.
            </p>
          </div>
          <button
            type="button"
            onClick={loadStatus}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
          >
            <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {payload ? (
          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
            Last checked {new Date(payload.checkedAt).toLocaleString()} · OpenRouter model {payload.model}
          </p>
        ) : null}
        {error ? <p className="mt-4 text-sm text-red-600 dark:text-red-200">{error}</p> : null}
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        {(payload?.sources ?? []).map((source) => (
          <section
            key={source.key}
            className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 dark:border-white/10 dark:bg-white/[0.055] dark:shadow-black/15"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-slate-950 dark:text-white">{source.name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{source.purpose}</p>
              </div>
              {source.status === "online" ? (
                <CheckCircle2 className="size-5 text-emerald-500" />
              ) : (
                <XCircle className="size-5 text-red-500" />
              )}
            </div>
            <span className={`mt-4 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusTone(source.status)}`}>
              {source.status}
            </span>
            <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{source.detail}</p>
          </section>
        ))}

        {isLoading && !payload
          ? ["OpenRouter API", "SERP API", "Web Unlocker"].map((name) => (
              <section key={name} className="h-48 rounded-[1.5rem] shimmer" />
            ))
          : null}
      </div>
    </div>
  );
}
