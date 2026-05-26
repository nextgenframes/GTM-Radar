import { AppShell } from "@/components/app-shell";
import { GtmWorkbench } from "@/components/gtm-workbench";

export default function PainPointsPage() {
  return (
    <AppShell title="Pain point miner" description="Mine public complaints, reviews, Reddit discussions, and forums for repeated customer pain.">
      <GtmWorkbench type="pain-points" title="Mine pain points" description="Group pain themes by severity and frequency." />
    </AppShell>
  );
}
