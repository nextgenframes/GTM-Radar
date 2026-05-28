import { NextResponse } from "next/server";
import { aiContent, buildContent, getResearchData, normalizeIdea } from "@/lib/gtm";

export async function POST(request: Request) {
  let idea = "your startup idea";

  try {
    const body = (await request.json()) as { idea?: unknown };
    idea = normalizeIdea(body.idea);
    if (!idea) return NextResponse.json({ error: "Startup idea is required." }, { status: 400 });

    let corpus = "";
    let sourceError: string | undefined;

    try {
      const research = await getResearchData(idea);
      corpus = research.corpus;
    } catch (error) {
      sourceError = error instanceof Error ? error.message : "Source lookup failed.";
    }

    const aiResult = await aiContent(idea, corpus);
    return NextResponse.json({ content: aiResult ?? buildContent(idea, corpus), isDemoFallback: Boolean(sourceError && !aiResult), error: sourceError });
  } catch (error) {
    return NextResponse.json({ content: buildContent(idea), isDemoFallback: true, error: error instanceof Error ? error.message : "Unknown error." });
  }
}
