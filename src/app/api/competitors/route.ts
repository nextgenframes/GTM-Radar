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

    const aiResult = sourceUrls.length > 0 ? null : await aiCompetitors(idea, corpus);
    const competitors = sourceUrls.length > 0 ? buildCompetitors(idea, sourceUrls) : aiResult ?? buildCompetitors(idea, []);

    return NextResponse.json({
      competitors,
      sourceUrls,
      isDemoFallback: Boolean(sourceError && !aiResult),
      error: sourceError,
    });
  } catch (error) {
    return NextResponse.json(
      {
        competitors: buildCompetitors(idea, []),
        sourceUrls: [],
        isDemoFallback: true,
        error: error instanceof Error ? error.message : "Unknown error.",
      },
      { status: 200 },
    );
  }
}
