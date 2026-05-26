import { AppShell } from "@/components/app-shell";
import { GtmWorkbench } from "@/components/gtm-workbench";

export default function ResearchPage() {
  return (
    <AppShell title="Research hub" description="Run Bright Data SERP and Web Unlocker research for market signals, pain points, sources, and GTM strategy.">
      <GtmWorkbench type="research" title="Market research" description="Search competitors, market keywords, and customer pain points." />
    </AppShell>
  );
}
