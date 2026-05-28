import { NextResponse } from "next/server";
import { brightDataRequest } from "@/lib/brightdata";
import { geminiModelName, geminiStatus } from "@/lib/gemini";
import { googleSearchUrl } from "@/lib/gtm";

type SourceStatus = {
  name: string;
  key: string;
  purpose: string;
  status: "online" | "offline";
  detail: string;
};

function offline(name: string, key: string, purpose: string, error: unknown): SourceStatus {
  return {
    name,
    key,
    purpose,
    status: "offline",
    detail: error instanceof Error ? error.message : "Status check failed.",
  };
}

async function checkGemini(): Promise<SourceStatus> {
  try {
    const { model } = await geminiStatus();
    return {
      name: "Gemini API",
      key: "gemini",
      purpose: "Synthesizes Bright Data findings into GTM cards.",
      status: "online",
      detail: `Using ${model}.`,
    };
  } catch (error) {
    return offline("Gemini API", "gemini", "Synthesizes Bright Data findings into GTM cards.", error);
  }
}

async function checkSerp(): Promise<SourceStatus> {
  try {
    await brightDataRequest<unknown>(
      process.env.BRIGHT_DATA_SERP_ZONE,
      googleSearchUrl("LaunchPilot AI status check"),
      "json",
      8000,
    );
    return {
      name: "SERP API",
      key: "serp",
      purpose: "Finds competitors, keywords, and market search signals.",
      status: "online",
      detail: "Bright Data SERP zone responded.",
    };
  } catch (error) {
    return offline("SERP API", "serp", "Finds competitors, keywords, and market search signals.", error);
  }
}

export async function GET() {
  const sources = await Promise.all([checkGemini(), checkSerp()]);
  const overall = sources.every((source) => source.status === "online") ? "online" : "offline";

  return NextResponse.json({
    overall,
    checkedAt: new Date().toISOString(),
    model: geminiModelName(),
    sources,
  });
}
