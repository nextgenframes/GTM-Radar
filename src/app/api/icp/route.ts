import { NextResponse } from "next/server";
import { aiIcp, buildIcp, getResearchData, normalizeIdea } from "@/lib/gtm";

export async function POST(request: Request) {
  let idea = "your startup idea";

  try {
    const body = (await request.json()) as { idea?: unknown };
    idea = normalizeIdea(body.idea);
    if (!idea) return NextResponse.json({ error: "Startup idea is required." }, { status: 400 });

    const quickAiResult = await aiIcp(idea, "");
    if (quickAiResult) {
      return NextResponse.json({ icp: quickAiResult, isDemoFallback: false });
    }

    try {
      const research = await getResearchData(idea);
      const aiResult = await aiIcp(idea, research.corpus);
      return NextResponse.json({
        icp: aiResult ?? buildIcp(idea, research.corpus),
        isDemoFallback: false,
      });
    } catch (error) {
      return NextResponse.json({
        icp: buildIcp(idea),
        isDemoFallback: false,
        error: error instanceof Error ? error.message : "Source lookup failed.",
      });
    }
  } catch (error) {
    return NextResponse.json(
      {
        icp: buildIcp(idea),
        isDemoFallback: false,
        error: error instanceof Error ? error.message : "Unknown error.",
      },
      { status: 200 },
    );
  }
}
