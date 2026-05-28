import { NextResponse } from "next/server";
import { aiResearchResult, buildResearchResult, getResearchData, normalizeIdea } from "@/lib/gtm";

export async function POST(request: Request) {
  let idea = "your startup idea";

  try {
    const body = (await request.json()) as { idea?: unknown };
    idea = normalizeIdea(body.idea);

    if (!idea) {
      return NextResponse.json({ error: "Startup idea is required." }, { status: 400 });
    }

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

    const aiResult = await aiResearchResult(idea, sourceUrls, corpus);
    return NextResponse.json({
      ...(aiResult ?? buildResearchResult(idea, sourceUrls, corpus)),
      isDemoFallback: Boolean(sourceError && !aiResult),
      error: sourceError,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown research error.";
    return NextResponse.json({ ...buildResearchResult(idea, [], ""), isDemoFallback: true, error: message });
  }
}
