import { AppShell } from "@/components/app-shell";
import { GtmWorkbench } from "@/components/gtm-workbench";

export default async function ResearchPage({
  searchParams,
}: {
  searchParams: Promise<{ idea?: string }>;
}) {
  const { idea } = await searchParams;
  return (
    <AppShell title="Research hub" description="Run Bright Data SERP research for market signals, pain points, sources, and GTM strategy.">
      <GtmWorkbench type="research" title="Market research" description="Search competitors, market keywords, and customer pain points." prefillIdea={idea} />
    </AppShell>
  );
}
