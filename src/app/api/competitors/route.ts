import { NextResponse } from "next/server";
import { buildCompetitors, demoData, getResearchData, normalizeIdea } from "@/lib/gtm";

export async function POST(request: Request) {
  let idea = "your startup idea";

  try {
    const body = (await request.json()) as { idea?: unknown };
    idea = normalizeIdea(body.idea);
    if (!idea) return NextResponse.json({ error: "Startup idea or website is required." }, { status: 400 });

    const { sourceUrls } = await getResearchData(idea);
    return NextResponse.json({
      competitors: buildCompetitors(idea, sourceUrls),
      sourceUrls,
      isDemoFallback: false,
    });
  } catch (error) {
    return NextResponse.json(demoData(idea, "competitors", error instanceof Error ? error.message : "Unknown error."));
  }
}
