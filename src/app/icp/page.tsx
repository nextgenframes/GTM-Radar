import { AppShell } from "@/components/app-shell";
import { GtmWorkbench } from "@/components/gtm-workbench";

export default function IcpPage() {
  return (
    <AppShell title="ICP generator" description="Generate buyer profile, titles, industries, objections, triggers, and channels.">
      <GtmWorkbench type="icp" title="Generate ICP" description="Turn research context into ideal customer profile." />
    </AppShell>
  );
}
