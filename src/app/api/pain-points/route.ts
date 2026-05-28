import { NextResponse } from "next/server";
import { aiPainPoints, buildPainPoints, getResearchData, normalizeIdea } from "@/lib/gtm";

export async function POST(request: Request) {
  let idea = "your startup idea";

  try {
    const body = (await request.json()) as { idea?: unknown };
    idea = normalizeIdea(body.idea);
    if (!idea) return NextResponse.json({ error: "Startup idea is required." }, { status: 400 });

    let sourceUrls: string[] = [];
    let corpus = "";
    let sourceError: string | undefined;

    try {
      const research = await getResearchData(`${idea} complaints reviews reddit forum pain points`);
      sourceUrls = research.sourceUrls;
      corpus = research.corpus;
    } catch (error) {
      sourceError = error instanceof Error ? error.message : "Source lookup failed.";
    }

    const aiResult = await aiPainPoints(idea, corpus);
    return NextResponse.json({
      painPoints: aiResult ?? buildPainPoints(corpus),
      sourceUrls,
      isDemoFallback: false,
      error: sourceError,
    });
  } catch (error) {
    return NextResponse.json({ painPoints: buildPainPoints(""), sourceUrls: [], isDemoFallback: false, error: error instanceof Error ? error.message : "Unknown error." });
  }
}
