import { NextResponse } from "next/server";
import { buildIcp, demoData, normalizeIdea } from "@/lib/gtm";

export async function POST(request: Request) {
  let idea = "your startup idea";

  try {
    const body = (await request.json()) as { idea?: unknown };
    idea = normalizeIdea(body.idea);
    if (!idea) return NextResponse.json({ error: "Startup idea is required." }, { status: 400 });

    return NextResponse.json({ icp: buildIcp(idea), isDemoFallback: false });
  } catch (error) {
    return NextResponse.json(demoData(idea, "icp", error instanceof Error ? error.message : "Unknown error."));
  }
}
