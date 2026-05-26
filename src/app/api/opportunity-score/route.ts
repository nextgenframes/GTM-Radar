import { NextResponse } from "next/server";
import { buildOpportunityScore, demoData, getResearchData, normalizeIdea } from "@/lib/gtm";

export async function POST(request: Request) {
  let idea = "your startup idea";

  try {
    const body = (await request.json()) as { idea?: unknown };
    idea = normalizeIdea(body.idea);
    if (!idea) return NextResponse.json({ error: "Startup idea is required." }, { status: 400 });

    const { corpus } = await getResearchData(idea);
    return NextResponse.json({
      opportunityScore: buildOpportunityScore(corpus),
      isDemoFallback: false,
    });
  } catch (error) {
    return NextResponse.json(demoData(idea, "opportunity-score", error instanceof Error ? error.message : "Unknown error."));
  }
}
