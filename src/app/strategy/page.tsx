import { AppShell } from "@/components/app-shell";
import { GtmWorkbench } from "@/components/gtm-workbench";

export default async function StrategyPage({
  searchParams,
}: {
  searchParams: Promise<{ idea?: string }>;
}) {
  const { idea } = await searchParams;
  return (
    <AppShell title="GTM strategy builder" description="Create positioning, channel plan, 30-day launch plan, content ideas, email angle, and success metrics.">
      <GtmWorkbench type="strategy" title="Build strategy" description="Generate launch strategy from idea and market context." prefillIdea={idea} />
      <GtmWorkbench type="opportunity-score" title="Score opportunity" description="Score demand, urgency, competition, monetization, SEO, and ease of launch." prefillIdea={idea} />
    </AppShell>
  );
}
