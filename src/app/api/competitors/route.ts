import { NextResponse } from "next/server";
import { aiCompetitors, buildCompetitors, getResearchData, normalizeIdea } from "@/lib/gtm";

export async function POST(request: Request) {
  let idea = "your startup idea";

  try {
    const body = (await request.json()) as { idea?: unknown };
    idea = normalizeIdea(body.idea);
    if (!idea) return NextResponse.json({ error: "Startup idea or website is required." }, { status: 400 });

    let sourceUrls: string[] = [];
    let corpus = "";
    let sourceError: string | undefined;

    try {
      const research = await getResearchData(idea);
      sourceUrls = research.sourceUrls;
      corpus = research.corpus;
    } catch (error) {
      sourceError = error instanceof Error ? error.message : "Source lookup failed.";
    }

    const aiResult = await aiCompetitors(idea, corpus);
    const competitors = aiResult ?? buildCompetitors(idea, sourceUrls);

    return NextResponse.json({
      competitors,
      sourceUrls,
      isDemoFallback: false,
      error: sourceError,
    });
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
