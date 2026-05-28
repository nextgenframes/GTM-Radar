import { AppShell } from "@/components/app-shell";
import { SourcesPanel } from "@/components/source-status";

export default function SourcesPage() {
  return (
    <AppShell
      title="Sources"
      description="Monitor the live tools used for GTM analysis: Gemini API, Bright Data SERP API, and Bright Data Web Unlocker."
    >
      <SourcesPanel />
    </AppShell>
  );
}
