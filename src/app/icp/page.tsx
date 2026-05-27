import { AppShell } from "@/components/app-shell";
import { GtmWorkbench } from "@/components/gtm-workbench";

export default async function IcpPage({
  searchParams,
}: {
  searchParams: Promise<{ idea?: string }>;
}) {
  const { idea } = await searchParams;
  return (
    <AppShell title="ICP generator" description="Generate buyer profile, titles, industries, objections, triggers, and channels.">
      <GtmWorkbench type="icp" title="Generate ICP" description="Turn research context into ideal customer profile." prefillIdea={idea} />
    </AppShell>
  );
}
