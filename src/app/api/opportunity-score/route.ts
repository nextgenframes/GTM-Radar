import { NextResponse } from "next/server";
import { aiOpportunityScore, buildOpportunityScore, getResearchData, normalizeIdea } from "@/lib/gtm";

export async function POST(request: Request) {
  let idea = "your startup idea";

  try {
    const body = (await request.json()) as { idea?: unknown };
    idea = normalizeIdea(body.idea);
    if (!idea) return NextResponse.json({ error: "Startup idea is required." }, { status: 400 });

    const quickAiResult = await aiOpportunityScore(idea, "");
    if (quickAiResult) {
      return NextResponse.json({ opportunityScore: quickAiResult, isDemoFallback: false });
    }

    try {
      const research = await getResearchData(idea);
      const aiResult = await aiOpportunityScore(idea, research.corpus);
      return NextResponse.json({
        opportunityScore: aiResult ?? buildOpportunityScore(research.corpus, idea),
        isDemoFallback: false,
      });
    } catch (error) {
      return NextResponse.json({ opportunityScore: buildOpportunityScore("", idea), isDemoFallback: false, error: error instanceof Error ? error.message : "Source lookup failed." });
    }
  } catch (error) {
    return NextResponse.json({ opportunityScore: buildOpportunityScore("", idea), isDemoFallback: false, error: error instanceof Error ? error.message : "Unknown error." });
  }
}
