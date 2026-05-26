import { AppShell } from "@/components/app-shell";
import { GtmWorkbench } from "@/components/gtm-workbench";

export default function CompetitorsPage() {
  return (
    <AppShell title="Competitor tracker" description="Identify competitors from SERP results and map positioning, pricing links, and notes.">
      <GtmWorkbench type="competitors" title="Track competitors" description="Enter startup idea or website to discover competitor set." placeholder="launchpilot.ai or AI GTM research agent" />
    </AppShell>
  );
}
