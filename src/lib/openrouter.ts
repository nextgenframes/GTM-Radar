type OpenRouterResponse = {
  choices?: {
    message?: {
      content?: string;
    };
  }[];
  error?: {
    message?: string;
  };
};

function readContent(payload: OpenRouterResponse): string {
  return payload.choices?.[0]?.message?.content?.trim() ?? "";
}

function parseJson<T>(text: string): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("OpenRouter response did not contain JSON.");
    return JSON.parse(match[0]) as T;
  }
}

export function openRouterModelName(): string {
  return process.env.OPENROUTER_MODEL ?? "google/gemini-2.5-flash";
}

async function openRouterChat(prompt: string, jsonMode: boolean) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENROUTER_API_KEY environment variable.");
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.OPENROUTER_SITE_URL ?? "https://launchpilot.ai",
      "X-Title": process.env.OPENROUTER_APP_NAME ?? "LaunchPilot AI",
    },
    body: JSON.stringify({
      model: openRouterModelName(),
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(12000),
  });

  const payload = (await response.json()) as OpenRouterResponse;

  if (!response.ok) {
    throw new Error(payload.error?.message ?? `OpenRouter request failed (${response.status})`);
  }

  return readContent(payload);
}

export async function openRouterStatus() {
  await openRouterChat("Reply with exactly: ok", false);
  return { model: openRouterModelName() };
}

export async function openRouterJson<T>(prompt: string): Promise<T | null> {
  const text = await openRouterChat(prompt, true);
  if (!text) return null;

  return parseJson<T>(text);
}
