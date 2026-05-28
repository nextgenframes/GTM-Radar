import { NextResponse } from "next/server";
import { aiPainPoints, buildPainPoints, getResearchData, normalizeIdea } from "@/lib/gtm";

export async function POST(request: Request) {
  let idea = "your startup idea";

  try {
    const body = (await request.json()) as { idea?: unknown };
    idea = normalizeIdea(body.idea);
    if (!idea) return NextResponse.json({ error: "Startup idea is required." }, { status: 400 });

    const quickAiResult = await aiPainPoints(idea, "");
    if (quickAiResult) {
      return NextResponse.json({ painPoints: quickAiResult, sourceUrls: [], isDemoFallback: false });
    }

    try {
      const research = await getResearchData(`${idea} complaints reviews reddit forum pain points`);
      const aiResult = await aiPainPoints(idea, research.corpus);
      return NextResponse.json({
        painPoints: aiResult ?? buildPainPoints(research.corpus),
        sourceUrls: research.sourceUrls,
        isDemoFallback: false,
      });
    } catch (error) {
      return NextResponse.json({ painPoints: buildPainPoints(""), sourceUrls: [], isDemoFallback: false, error: error instanceof Error ? error.message : "Source lookup failed." });
    }
  } catch (error) {
    return NextResponse.json({ painPoints: buildPainPoints(""), sourceUrls: [], isDemoFallback: false, error: error instanceof Error ? error.message : "Unknown error." });
  }
}
