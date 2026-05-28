type GeminiPart = {
  text?: string;
};

type GeminiResponse = {
  candidates?: {
    content?: {
      parts?: GeminiPart[];
    };
  }[];
  error?: {
    message?: string;
  };
};

function readGeminiText(payload: GeminiResponse): string {
  return (payload.candidates ?? [])
    .flatMap((candidate) => candidate.content?.parts ?? [])
    .map((part) => part.text ?? "")
    .join("")
    .trim();
}

function parseJson<T>(text: string): T {
  const cleaned = text.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const objectText = firstJsonObject(cleaned);
    if (!objectText) throw new Error("Gemini response did not contain JSON.");
    return JSON.parse(objectText) as T;
  }
}

function firstJsonObject(text: string): string | null {
  const start = text.indexOf("{");
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = start; index < text.length; index += 1) {
    const char = text[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (char === "\"") {
      inString = !inString;
      continue;
    }

    if (inString) continue;
    if (char === "{") depth += 1;
    if (char === "}") depth -= 1;
    if (depth === 0) return text.slice(start, index + 1);
  }

  return null;
}

export function geminiModelName(): string {
  const configured = (process.env.GEMINI_MODEL ?? process.env.GOOGLE_GENERATIVE_AI_MODEL ?? "gemini-2.5-flash").replace(/^models\//, "");

  if (configured === "gemini-2.0-flash") {
    return "gemini-2.5-flash";
  }

  return configured;
}

function geminiApiKey(): string | undefined {
  return process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GOOGLE_API_KEY;
}

async function geminiGenerate(prompt: string, jsonMode: boolean) {
  const apiKey = geminiApiKey();
  if (!apiKey) {
    throw new Error("Missing Gemini API key. Set GEMINI_API_KEY, GOOGLE_GENERATIVE_AI_API_KEY, or GOOGLE_API_KEY.");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${geminiModelName()}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: jsonMode ? 2048 : 32,
          ...(jsonMode ? { responseMimeType: "application/json" } : {}),
        },
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(7500),
    },
  );

  const payload = (await response.json()) as GeminiResponse;

  if (!response.ok) {
    throw new Error(payload.error?.message ?? `Gemini request failed (${response.status})`);
  }

  return readGeminiText(payload);
}

export async function geminiStatus() {
  await geminiJson<{ status: string }>('Return only JSON: {"status":"ok"}');
  return { model: geminiModelName() };
}

export async function geminiJson<T>(prompt: string): Promise<T | null> {
  const strictPrompt = `${prompt}

Return compact valid JSON only. No markdown. No prose. Escape all quotes inside strings. Do not use line breaks inside string values.`;
  const text = await geminiGenerate(strictPrompt, true);
  if (!text) return null;

  return parseJson<T>(text);
}
