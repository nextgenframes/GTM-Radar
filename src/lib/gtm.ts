import { brightDataRequest } from "@/lib/brightdata";

export type SerpResult = {
  title?: string;
  link?: string;
  url?: string;
  displayed_link?: string;
  snippet?: string;
  description?: string;
};

export type Competitor = {
  name: string;
  url: string;
  positioning: string;
  pricingPageUrl: string;
  notes: string;
};

export type PainPoint = {
  theme: string;
  severity: "Low" | "Medium" | "High";
  frequency: number;
  examples: string[];
};

export type IcpProfile = {
  jobTitles: string[];
  industries: string[];
  companySize: string;
  painPoints: string[];
  buyingTriggers: string[];
  objections: string[];
  whereToReach: string[];
};

export type StrategyPlan = {
  positioning: string;
  channels: string[];
  thirtyDayLaunchPlan: string[];
  contentIdeas: string[];
  coldEmailAngle: string;
  successMetrics: string[];
};

export type OpportunityScore = {
  total: number;
  categories: {
    name: string;
    score: number;
    explanation: string;
  }[];
};

export type ContentPack = {
  linkedInPost: string;
  coldEmail: string;
  landingPageHero: {
    headline: string;
    subheadline: string;
    cta: string;
  };
  productHuntLaunchCopy: string;
  shortDemoScript: string[];
};

export type ResearchResult = {
  competitors: string[];
  sourceUrls: string[];
  marketSignals: string[];
  customerPainPoints: string[];
  positioningIdeas: string[];
  recommendedGtmStrategy: string[];
  isDemoFallback: boolean;
  error?: string;
};

export type GtmPayload =
  | { competitors: Competitor[]; sourceUrls: string[]; isDemoFallback: boolean; error?: string }
  | { painPoints: PainPoint[]; sourceUrls: string[]; isDemoFallback: boolean; error?: string }
  | { icp: IcpProfile; isDemoFallback: boolean; error?: string }
  | { strategy: StrategyPlan; isDemoFallback: boolean; error?: string }
  | { opportunityScore: OpportunityScore; isDemoFallback: boolean; error?: string }
  | { content: ContentPack; isDemoFallback: boolean; error?: string };

const SERP_ZONE = process.env.BRIGHT_DATA_SERP_ZONE;
const UNLOCKER_ZONE = process.env.BRIGHT_DATA_UNLOCKER_ZONE;

export function normalizeIdea(input: unknown): string {
  return typeof input === "string" ? input.trim().slice(0, 240) : "";
}

export function googleSearchUrl(query: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}&hl=en&gl=us`;
}

export function domainName(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function extractSerpItems(payload: unknown): SerpResult[] {
  if (!payload || typeof payload !== "object") {
    return [];
  }

  const data = payload as Record<string, unknown>;
  for (const candidate of [data.organic, data.organic_results, data.results, data.items]) {
    if (Array.isArray(candidate)) {
      return candidate as SerpResult[];
    }
  }

  return [];
}

export function uniqueUrls(results: SerpResult[]): string[] {
  return [
    ...new Set(
      results
        .map((item) => item.link ?? item.url)
        .filter((url): url is string => Boolean(url?.startsWith("http")))
        .filter((url) => !url.includes("google.com/search")),
    ),
  ].slice(0, 10);
}

export function stripHtml(input: string): string {
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function runSerpQueries(queries: string[]) {
  const responses = await Promise.all(
    queries.map((query) =>
      brightDataRequest<unknown>(SERP_ZONE, googleSearchUrl(query), "json"),
    ),
  );
  return responses.flatMap(extractSerpItems);
}

async function scrapeUrls(urls: string[]) {
  const scraped = await Promise.allSettled(
    urls.map((url) => brightDataRequest<string>(UNLOCKER_ZONE, url, "raw")),
  );

  return scraped
    .filter(
      (result): result is PromiseFulfilledResult<string> =>
        result.status === "fulfilled",
    )
    .map((result) => stripHtml(String(result.value)).slice(0, 1800));
}

function serpText(items: SerpResult[]) {
  return items
    .map((item) => `${item.title ?? ""} ${item.snippet ?? item.description ?? ""}`)
    .join(" ")
    .toLowerCase();
}

export async function getResearchData(idea: string) {
  const serpItems = await runSerpQueries([
    `${idea} competitors`,
    `${idea} market keywords`,
    `${idea} customer pain points`,
  ]);
  const sourceUrls = uniqueUrls(serpItems);
  const pageText = await scrapeUrls(sourceUrls.slice(0, 4));
  return { serpItems, sourceUrls, pageText, corpus: `${serpText(serpItems)} ${pageText.join(" ")}` };
}

export function buildCompetitors(idea: string, sourceUrls: string[]): Competitor[] {
  const urls =
    sourceUrls.length > 0
      ? sourceUrls.slice(0, 6)
      : [
          "https://www.perplexity.ai/",
          "https://www.clay.com/",
          "https://tavily.com/",
          "https://www.similarweb.com/",
        ];

  return urls.map((url) => {
    const name = domainName(url);
    return {
      name,
      url,
      positioning: `${name} competes near "${idea}" through speed, data access, or workflow automation.`,
      pricingPageUrl: `${url.replace(/\/$/, "")}/pricing`,
      notes: "Validate pricing page, ICP language, integrations, and proof points before outreach.",
    };
  });
}

export function buildPainPoints(corpus: string): PainPoint[] {
  const hasIntegration = corpus.includes("integration");
  const hasPricing = corpus.includes("pricing") || corpus.includes("expensive");

  return [
    {
      theme: "Manual research drag",
      severity: "High",
      frequency: 84,
      examples: ["Teams lose hours collecting sources.", "Outputs live across tabs and spreadsheets."],
    },
    {
      theme: hasIntegration ? "Integration friction" : "Workflow handoff friction",
      severity: "High",
      frequency: hasIntegration ? 72 : 61,
      examples: ["Tools do not fit current stack.", "Research does not become next actions."],
    },
    {
      theme: hasPricing ? "Pricing uncertainty" : "Trust gap",
      severity: "Medium",
      frequency: hasPricing ? 58 : 49,
      examples: ["Buyers need ROI proof.", "Generic AI output lacks citations."],
    },
  ];
}

export function buildIcp(idea: string): IcpProfile {
  return {
    jobTitles: ["Founder", "Head of Growth", "GTM Lead", "RevOps Manager", "Agency Strategist"],
    industries: ["B2B SaaS", "AI tools", "Services agencies", "Vertical software"],
    companySize: "Seed to Series B, 5-150 employees",
    painPoints: ["Slow market research", "Weak positioning", "Unclear ICP", "Low outbound reply rates"],
    buyingTriggers: [`Planning launch for ${idea}`, "New category exploration", "Fundraise or growth sprint"],
    objections: ["Need source quality", "Concern about generic AI", "Budget owner not clear"],
    whereToReach: ["LinkedIn", "Founder communities", "Product Hunt", "niche Slack groups", "cold email"],
  };
}

export function buildStrategy(idea: string): StrategyPlan {
  return {
    positioning: `${idea} becomes source-backed GTM command center for teams that need decisions, not raw search results.`,
    channels: ["Founder-led LinkedIn", "cold email", "SEO comparison pages", "Product Hunt", "partner webinars"],
    thirtyDayLaunchPlan: [
      "Days 1-5: run 20 customer interviews and collect exact pain language.",
      "Days 6-10: publish landing page, demo video, and competitor comparison.",
      "Days 11-20: outbound to 150 ICP contacts with personalized research brief.",
      "Days 21-30: launch on Product Hunt, retarget visitors, convert pilots.",
    ],
    contentIdeas: [
      `"${idea}" competitor teardown`,
      "5 GTM mistakes early teams make before launch",
      "Template: idea to ICP in 15 minutes",
      "Live build: market map from one startup idea",
    ],
    coldEmailAngle: "Lead with a free GTM brief showing competitor gaps and one quick win.",
    successMetrics: ["Brief generations", "qualified replies", "demo bookings", "activation rate", "pilot conversion"],
  };
}

export function buildOpportunityScore(corpus: string): OpportunityScore {
  const categories = [
    ["Demand", 82, "Search and competitor signals indicate active interest."],
    ["Urgency", corpus.includes("manual") ? 78 : 70, "Pain ties to time loss and missed launch momentum."],
    ["Competition", 63, "Crowded enough to validate demand, open enough for sharper workflow positioning."],
    ["Monetization", 76, "Clear B2B buyer with budget around growth, research, and automation."],
    ["SEO potential", 81, "Comparison and template pages can capture high-intent queries."],
    ["Ease of launch", 74, "MVP can ship with API research, structured outputs, and export loop."],
  ] as const;

  const scored = categories.map(([name, score, explanation]) => ({ name, score, explanation }));
  const total = Math.round(scored.reduce((sum, item) => sum + item.score, 0) / scored.length);
  return { total, categories: scored };
}

export function buildContent(idea: string): ContentPack {
  return {
    linkedInPost: `Most startup teams do GTM research backwards. They start with opinions, then hunt for proof. LaunchPilot AI starts with sources: competitors, pain points, ICP, and launch plan from one idea. Testing it now for: ${idea}.`,
    coldEmail: `Subject: quick GTM brief for ${idea}\n\nSaw your team is exploring growth plays. I built a source-backed GTM brief with competitor gaps, ICP signals, and launch angles. Worth sending over?`,
    landingPageHero: {
      headline: "Turn one startup idea into a GTM launch plan.",
      subheadline: "LaunchPilot AI finds competitors, mines pain points, scores opportunity, and generates launch assets with source-backed research.",
      cta: "Run GTM research",
    },
    productHuntLaunchCopy: "LaunchPilot AI is a GTM operating system for founders. Enter an idea, get competitor maps, ICP, pain points, opportunity score, and launch copy in minutes.",
    shortDemoScript: [
      "Enter your startup idea.",
      "Watch LaunchPilot AI search the market and identify competitors.",
      "Review pain themes, ICP, and opportunity score.",
      "Generate launch strategy and copy assets.",
      "Export or share the GTM plan with your team.",
    ],
  };
}

export function buildResearchResult(idea: string, sourceUrls: string[], corpus: string): ResearchResult {
  return {
    competitors: buildCompetitors(idea, sourceUrls).map((competitor) => competitor.name),
    sourceUrls,
    marketSignals: [
      `Search demand exists around "${idea}" competitors and alternatives.`,
      corpus.includes("ai") ? "AI-native positioning appears common." : "Workflow automation language appears important.",
      corpus.includes("pricing") || corpus.includes("demo") ? "Competitors push demo/pricing paths early." : "Conversion paths need manual validation.",
    ],
    customerPainPoints: buildPainPoints(corpus).map((point) => point.theme),
    positioningIdeas: [
      `Position as fastest path from "${idea}" to ranked GTM moves.`,
      "Lead with citations, outputs, and recommended actions.",
      "Differentiate on operator-ready briefs, not generic brainstorming.",
    ],
    recommendedGtmStrategy: buildStrategy(idea).thirtyDayLaunchPlan,
    isDemoFallback: false,
  };
}

export function demoResearch(idea: string, error?: string): ResearchResult {
  const sourceUrls = [
    "https://www.perplexity.ai/",
    "https://www.clay.com/",
    "https://tavily.com/",
    "https://www.similarweb.com/",
  ];
  return { ...buildResearchResult(idea, sourceUrls, "ai pricing demo manual integration"), isDemoFallback: true, error };
}

export function demoData(idea: string, feature: string, error?: string): GtmPayload {
  const sourceUrls = demoResearch(idea).sourceUrls;
  const corpus = "ai pricing demo manual integration complaints reviews reddit forums";
  const base = { isDemoFallback: true, error };

  switch (feature) {
    case "competitors":
      return { competitors: buildCompetitors(idea, sourceUrls), sourceUrls, ...base };
    case "pain-points":
      return { painPoints: buildPainPoints(corpus), sourceUrls, ...base };
    case "icp":
      return { icp: buildIcp(idea), ...base };
    case "strategy":
      return { strategy: buildStrategy(idea), ...base };
    case "content":
      return { content: buildContent(idea), ...base };
    default:
      return { opportunityScore: buildOpportunityScore(corpus), ...base };
  }
}
