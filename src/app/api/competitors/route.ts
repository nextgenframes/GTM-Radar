import { NextResponse } from "next/server";
import { aiCompetitors, buildCompetitors, getResearchData, normalizeIdea } from "@/lib/gtm";

export async function POST(request: Request) {
  let idea = "your startup idea";

  try {
    const body = (await request.json()) as { idea?: unknown };
    idea = normalizeIdea(body.idea);
    if (!idea) return NextResponse.json({ error: "Startup idea or website is required." }, { status: 400 });

    const quickAiResult = await aiCompetitors(idea, "");
    if (quickAiResult) {
      return NextResponse.json({
        competitors: quickAiResult,
        sourceUrls: [],
        isDemoFallback: false,
      });
    }

    try {
      const research = await getResearchData(idea);
      const aiResult = await aiCompetitors(idea, research.corpus);
      return NextResponse.json({
        competitors: aiResult ?? buildCompetitors(idea, research.sourceUrls),
        sourceUrls: research.sourceUrls,
        isDemoFallback: false,
      });
    } catch (error) {
      return NextResponse.json({
        competitors: buildCompetitors(idea, []),
        sourceUrls: [],
        isDemoFallback: false,
        error: error instanceof Error ? error.message : "Source lookup failed.",
      });
    }
  } catch (error) {
    return NextResponse.json(
      {
        competitors: buildCompetitors(idea, []),
        sourceUrls: [],
        isDemoFallback: false,
        error: error instanceof Error ? error.message : "Unknown error.",
      },
      { status: 200 },
    );
  }
}
