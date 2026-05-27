import { AppShell } from "@/components/app-shell";
import { GtmWorkbench } from "@/components/gtm-workbench";

export default async function CompetitorsPage({
  searchParams,
}: {
  searchParams: Promise<{ idea?: string }>;
}) {
  const { idea } = await searchParams;
  return (
    <AppShell title="Competitor tracker" description="Identify competitors from SERP results and map positioning, pricing links, and notes.">
      <GtmWorkbench type="competitors" title="Track competitors" description="Enter startup idea or website to discover competitor set." placeholder="launchpilot.ai or AI GTM research agent" prefillIdea={idea} />
    </AppShell>
  );
}
