import { NextResponse } from "next/server";
import { buildPainPoints, demoData, getResearchData, normalizeIdea } from "@/lib/gtm";

export async function POST(request: Request) {
  let idea = "your startup idea";

  try {
    const body = (await request.json()) as { idea?: unknown };
    idea = normalizeIdea(body.idea);
    if (!idea) return NextResponse.json({ error: "Startup idea is required." }, { status: 400 });

    const { sourceUrls, corpus } = await getResearchData(`${idea} complaints reviews reddit forum pain points`);
    return NextResponse.json({
      painPoints: buildPainPoints(corpus),
      sourceUrls,
      isDemoFallback: false,
    });
  } catch (error) {
    return NextResponse.json(demoData(idea, "pain-points", error instanceof Error ? error.message : "Unknown error."));
  }
}
