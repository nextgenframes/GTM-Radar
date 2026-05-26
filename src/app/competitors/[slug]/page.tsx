import Link from "next/link";
import { AppShell } from "@/components/app-shell";

export default async function CompetitorDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const name = decodeURIComponent(slug).replace(/-/g, " ");

  return (
    <AppShell title={`${name} detail`} description="Competitor snapshot for demo workflows. Live competitor cards link here from tracker results.">
      <div className="grid gap-4 lg:grid-cols-3">
        {[
          ["Positioning", "Fast research and automation narrative. Compare homepage promise, proof, and CTA."],
          ["Pricing", "Check /pricing, free trial, usage-based limits, and sales-led plan language."],
          ["Gaps", "Look for weak citations, slow setup, shallow ICP guidance, or missing launch assets."],
        ].map(([title, body]) => (
          <section key={title} className="rounded-[1.5rem] border border-white/10 bg-white/[0.055] p-5 shadow-xl shadow-black/15">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">{body}</p>
          </section>
        ))}
      </div>
      <Link href="/competitors" className="inline-flex rounded-2xl bg-gradient-to-r from-blue-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white">
        Back to tracker
      </Link>
    </AppShell>
  );
}
