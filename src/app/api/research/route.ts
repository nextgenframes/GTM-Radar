import { NextResponse } from "next/server";
import { aiResearchResult, buildResearchResult, demoResearch, getResearchData, normalizeIdea } from "@/lib/gtm";

export async function POST(request: Request) {
  let idea = "your startup idea";

  try {
    const body = (await request.json()) as { idea?: unknown };
    idea = normalizeIdea(body.idea);

    if (!idea) {
      return NextResponse.json({ error: "Startup idea is required." }, { status: 400 });
    }

    const { sourceUrls, corpus } = await getResearchData(idea);
    const aiResult = await aiResearchResult(idea, sourceUrls, corpus);
    return NextResponse.json(aiResult ?? buildResearchResult(idea, sourceUrls, corpus));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown research error.";
    return NextResponse.json(demoResearch(idea, message));
  }
}
