import { AppShell } from "@/components/app-shell";
import { GtmWorkbench } from "@/components/gtm-workbench";

export default function ContentPage() {
  return (
    <AppShell title="Content engine" description="Generate launch-ready LinkedIn, cold email, hero copy, Product Hunt copy, and demo script.">
      <GtmWorkbench type="content" title="Generate content pack" description="Create GTM assets from one startup idea." />
    </AppShell>
  );
}
