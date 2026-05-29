export type BrightDataFormat = "raw" | "json";

export async function brightDataRequest<T = unknown>(
  zone: string | undefined,
  url: string,
  format: BrightDataFormat,
  timeoutMs = 5000,
  dataFormat?: "parsed_light",
): Promise<T> {
  const apiKey = process.env.BRIGHT_DATA_API_KEY;

  if (!apiKey) {
    throw new Error("Missing BRIGHT_DATA_API_KEY environment variable.");
  }

  if (!zone) {
    throw new Error("Missing Bright Data zone environment variable.");
  }

  const response = await fetch("https://api.brightdata.com/request", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ zone, url, format, ...(dataFormat ? { data_format: dataFormat } : {}) }),
    cache: "no-store",
    signal: AbortSignal.timeout(timeoutMs),
  });

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const detail =
      typeof payload === "string" ? payload : JSON.stringify(payload, null, 2);
    throw new Error(
      `Bright Data request failed (${response.status} ${response.statusText}): ${detail}`,
    );
  }

  return payload as T;
}
