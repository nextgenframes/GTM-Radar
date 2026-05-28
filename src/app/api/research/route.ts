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

    const quickAiResult = await aiResearchResult(idea, [], "");
    if (quickAiResult) {
      return NextResponse.json({ ...quickAiResult, isDemoFallback: false });
    }

    try {
      const research = await getResearchData(idea);
      const aiResult = await aiResearchResult(idea, research.sourceUrls, research.corpus);
      return NextResponse.json({
        ...(aiResult ?? buildResearchResult(idea, research.sourceUrls, research.corpus)),
        isDemoFallback: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Source lookup failed.";
      return NextResponse.json({ ...buildResearchResult(idea, [], ""), isDemoFallback: false, error: message });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown research error.";
    return NextResponse.json({ ...buildResearchResult(idea, [], ""), isDemoFallback: false, error: message });
  }
}
