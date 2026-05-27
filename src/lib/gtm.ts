import { brightDataRequest } from "@/lib/brightdata";
import { geminiJson } from "@/lib/gemini";

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

const SYSTEM_PROMPT =
  "You are a practical GTM strategist. Return only valid JSON. Make every item specific to the startup idea and source context. Avoid generic SaaS filler.";

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

function marketProfile(idea: string, corpus = "") {
  const text = `${idea} ${corpus}`.toLowerCase();
  const hasLocal = /shop|repair|clinic|restaurant|salon|gym|contractor|local/.test(text);
  const hasDeveloper = /developer|api|devtool|github|code|engineer/.test(text);
  const hasCreator = /creator|content|newsletter|podcast|influencer|video/.test(text);
  const hasHealthcare = /health|clinic|patient|medical|dental|therapy/.test(text);
  const hasAuto = /auto|vehicle|car|repair|mechanic|dealership/.test(text);
  const hasSales = /sales|outbound|lead|crm|revenue|gtm/.test(text);

  if (hasAuto) {
    return {
      titles: ["Shop Owner", "Service Manager", "Operations Manager", "Fleet Manager", "Auto Repair Advisor"],
      industries: ["Auto repair", "Fleet services", "Dealership service", "Mobile mechanics"],
      channels: ["Google Business Profile SEO", "local trade groups", "fleet owner outreach", "repair shop associations"],
      pain: ["Missed calls during busy bays", "Low trust in estimates", "Slow customer follow-up", "Hard-to-predict shop capacity"],
      size: "Independent shops and small chains, 3-50 employees",
    };
  }

  if (hasHealthcare) {
    return {
      titles: ["Clinic Owner", "Practice Manager", "Operations Director", "Patient Experience Lead"],
      industries: ["Healthcare clinics", "Dental practices", "Therapy practices", "Specialty care"],
      channels: ["local SEO", "referral partner outreach", "healthcare operator communities", "webinars"],
      pain: ["Patient scheduling friction", "No-shows", "Staff admin overload", "Trust and compliance concerns"],
      size: "Small to mid-market practices, 5-100 employees",
    };
  }

  if (hasDeveloper) {
    return {
      titles: ["CTO", "Engineering Manager", "Developer Relations Lead", "Platform PM", "Staff Engineer"],
      industries: ["Developer tools", "Infrastructure", "AI platforms", "B2B SaaS"],
      channels: ["GitHub content", "technical SEO", "developer communities", "API comparison pages"],
      pain: ["Slow integration work", "Poor documentation", "Unclear reliability", "Tool sprawl"],
      size: "Seed to growth-stage engineering teams, 10-300 employees",
    };
  }

  if (hasCreator) {
    return {
      titles: ["Creator", "Newsletter Operator", "Content Lead", "Community Manager", "Solo Founder"],
      industries: ["Creator businesses", "Media startups", "Education products", "Communities"],
      channels: ["creator partnerships", "short-form demos", "newsletter swaps", "community launches"],
      pain: ["Content consistency", "Audience growth stalls", "Monetization uncertainty", "Manual repurposing"],
      size: "Solo operators to small media teams, 1-20 people",
    };
  }

  if (hasSales || hasLocal) {
    return {
      titles: ["Founder", "Head of Growth", "Sales Lead", "RevOps Manager", "Agency Strategist"],
      industries: ["B2B SaaS", "Services agencies", "Vertical software", "Local service businesses"],
      channels: ["cold email", "LinkedIn", "SEO comparison pages", "partner webinars"],
      pain: ["Weak lead quality", "Slow research", "Low reply rates", "Unclear buyer urgency"],
      size: "Seed to Series B or local teams, 5-150 employees",
    };
  }

  return {
    titles: ["Founder", "Head of Growth", "GTM Lead", "Operations Manager", "Agency Strategist"],
    industries: ["B2B SaaS", "AI tools", "Services agencies", "Vertical software"],
    channels: ["Founder-led LinkedIn", "cold email", "SEO comparison pages", "Product Hunt", "partner webinars"],
    pain: ["Slow market research", "Weak positioning", "Unclear ICP", "Low outbound reply rates"],
    size: "Seed to Series B, 5-150 employees",
  };
}

export function buildIcp(idea: string, corpus = ""): IcpProfile {
  const profile = marketProfile(idea, corpus);

  return {
    jobTitles: profile.titles,
    industries: profile.industries,
    companySize: profile.size,
    painPoints: profile.pain,
    buyingTriggers: [`Planning launch for ${idea}`, "New category exploration", "Fundraise or growth sprint"],
    objections: ["Need proof from real sources", "Concern about generic output", "Budget owner not clear"],
    whereToReach: profile.channels,
  };
}

export function buildStrategy(idea: string, corpus = ""): StrategyPlan {
  const profile = marketProfile(idea, corpus);
  const primaryChannel = profile.channels[0] ?? "founder-led outreach";
  const primaryPain = profile.pain[0] ?? "slow market research";

  return {
    positioning: `${idea} helps ${profile.titles[0].toLowerCase()}s solve ${primaryPain.toLowerCase()} with source-backed recommendations, not generic research.`,
    channels: profile.channels,
    thirtyDayLaunchPlan: [
      `Days 1-5: interview 15 ${profile.titles[0].toLowerCase()}s and collect exact language around ${primaryPain.toLowerCase()}.`,
      `Days 6-10: publish landing page, proof examples, and comparison against current ${profile.industries[0].toLowerCase()} workflows.`,
      `Days 11-20: test ${primaryChannel} with 100 personalized messages or posts.`,
      "Days 21-30: convert strongest responses into pilots, case studies, and retargeting audiences.",
    ],
    contentIdeas: [
      `"${idea}" competitor teardown`,
      `How ${profile.titles[0]}s can reduce ${primaryPain.toLowerCase()}`,
      `${profile.industries[0]} workflow checklist`,
      `Live teardown: ${idea} market map`,
    ],
    coldEmailAngle: `Lead with one observed ${profile.industries[0].toLowerCase()} pain and offer a short teardown showing how to fix ${primaryPain.toLowerCase()}.`,
    successMetrics: ["Qualified replies", "demo bookings", "pilot conversion", "activation rate", "retention signals"],
  };
}

export function buildOpportunityScore(corpus: string, idea = ""): OpportunityScore {
  const profile = marketProfile(idea, corpus);
  const hasPricing = corpus.includes("pricing") || corpus.includes("cost") || corpus.includes("demo");
  const hasAlternatives = corpus.includes("alternative") || corpus.includes("competitor") || corpus.includes("compare");
  const demandScore = hasAlternatives ? 84 : 72;
  const monetizationScore = hasPricing ? 80 : 68;

  const categories = [
    ["Demand", demandScore, `Search context points to active ${profile.industries[0].toLowerCase()} interest.`],
    ["Urgency", corpus.includes("manual") ? 80 : 70, `Pain centers on ${profile.pain[0].toLowerCase()}.`],
    ["Competition", hasAlternatives ? 66 : 58, "Enough market activity to validate demand, but positioning still matters."],
    ["Monetization", monetizationScore, `${profile.titles[0]} is likely close to the budget or workflow owner.`],
    ["SEO potential", hasAlternatives ? 82 : 70, "Comparison, checklist, and template pages can capture high-intent searches."],
    ["Ease of launch", 74, "MVP can ship with focused research, structured outputs, and a feedback loop."],
  ] as const;

  const scored = categories.map(([name, score, explanation]) => ({ name, score, explanation }));
  const total = Math.round(scored.reduce((sum, item) => sum + item.score, 0) / scored.length);
  return { total, categories: scored };
}

export function buildContent(idea: string, corpus = ""): ContentPack {
  const profile = marketProfile(idea, corpus);
  const primaryPain = profile.pain[0].toLowerCase();

  return {
    linkedInPost: `${profile.titles[0]}s dealing with ${primaryPain} usually have enough signals already. The hard part is turning those signals into a next move. Testing a source-backed GTM brief for: ${idea}.`,
    coldEmail: `Subject: quick teardown for ${idea}\n\nNoticed ${profile.industries[0].toLowerCase()} teams often struggle with ${primaryPain}. I put together a short source-backed brief with competitor gaps and one practical GTM move. Worth sending over?`,
    landingPageHero: {
      headline: `Launch ${idea} with sharper market signal.`,
      subheadline: `Find ${profile.industries[0].toLowerCase()} competitors, pain points, ICPs, and launch angles from Bright Data-backed research.`,
      cta: "Run GTM research",
    },
    productHuntLaunchCopy: `LaunchPilot AI turns ${idea} into a focused GTM workspace with competitor maps, ICP, pain points, opportunity score, and launch copy.`,
    shortDemoScript: [
      "Enter your startup idea.",
      "Watch LaunchPilot AI search the market and identify competitors.",
      "Review pain themes, ICP, and opportunity score.",
      "Generate launch strategy and copy assets.",
      "Export or share the GTM plan with your team.",
    ],
  };
}

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, 700) : fallback;
}

function asStrings(value: unknown, fallback: string[], max = 6): string[] {
  const items = Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
    : [];

  return items.length > 0 ? items.slice(0, max).map((item) => item.trim().slice(0, 240)) : fallback;
}

function contextPrompt(idea: string, corpus = "") {
  return [
    SYSTEM_PROMPT,
    `Startup idea: ${idea}`,
    `Source context: ${corpus.slice(0, 6000) || "No source context available. Infer carefully from the idea."}`,
  ].join("\n\n");
}

async function safeGeminiJson<T>(prompt: string): Promise<T | null> {
  try {
    return await geminiJson<T>(prompt);
  } catch {
    return null;
  }
}

export async function aiPainPoints(idea: string, corpus: string): Promise<PainPoint[] | null> {
  const fallback = buildPainPoints(corpus);
  const data = await safeGeminiJson<{ painPoints?: Partial<PainPoint>[] }>(`${contextPrompt(idea, corpus)}

Return JSON shape:
{"painPoints":[{"theme":"specific pain theme","severity":"Low|Medium|High","frequency":0-100,"examples":["buyer quote-like example","operational symptom"]}]}`);

  if (!data?.painPoints?.length) return null;

  return data.painPoints.slice(0, 5).map((point, index) => ({
    theme: asString(point.theme, fallback[index % fallback.length].theme),
    severity: point.severity === "Low" || point.severity === "Medium" || point.severity === "High" ? point.severity : fallback[index % fallback.length].severity,
    frequency: Math.min(Math.max(Number(point.frequency) || fallback[index % fallback.length].frequency, 0), 100),
    examples: asStrings(point.examples, fallback[index % fallback.length].examples, 3),
  }));
}

export async function aiIcp(idea: string, corpus = ""): Promise<IcpProfile | null> {
  const fallback = buildIcp(idea, corpus);
  const data = await safeGeminiJson<Partial<IcpProfile>>(`${contextPrompt(idea, corpus)}

Return JSON shape:
{"jobTitles":[],"industries":[],"companySize":"","painPoints":[],"buyingTriggers":[],"objections":[],"whereToReach":[]}`);

  if (!data) return null;

  return {
    jobTitles: asStrings(data.jobTitles, fallback.jobTitles),
    industries: asStrings(data.industries, fallback.industries),
    companySize: asString(data.companySize, fallback.companySize),
    painPoints: asStrings(data.painPoints, fallback.painPoints),
    buyingTriggers: asStrings(data.buyingTriggers, fallback.buyingTriggers),
    objections: asStrings(data.objections, fallback.objections),
    whereToReach: asStrings(data.whereToReach, fallback.whereToReach),
  };
}

export async function aiStrategy(idea: string, corpus = ""): Promise<StrategyPlan | null> {
  const fallback = buildStrategy(idea, corpus);
  const data = await safeGeminiJson<Partial<StrategyPlan>>(`${contextPrompt(idea, corpus)}

Return JSON shape:
{"positioning":"","channels":[],"thirtyDayLaunchPlan":[],"contentIdeas":[],"coldEmailAngle":"","successMetrics":[]}`);

  if (!data) return null;

  return {
    positioning: asString(data.positioning, fallback.positioning),
    channels: asStrings(data.channels, fallback.channels),
    thirtyDayLaunchPlan: asStrings(data.thirtyDayLaunchPlan, fallback.thirtyDayLaunchPlan),
    contentIdeas: asStrings(data.contentIdeas, fallback.contentIdeas),
    coldEmailAngle: asString(data.coldEmailAngle, fallback.coldEmailAngle),
    successMetrics: asStrings(data.successMetrics, fallback.successMetrics),
  };
}

export async function aiContent(idea: string, corpus = ""): Promise<ContentPack | null> {
  const fallback = buildContent(idea, corpus);
  const data = await safeGeminiJson<Partial<ContentPack>>(`${contextPrompt(idea, corpus)}

Return JSON shape:
{"linkedInPost":"","coldEmail":"","landingPageHero":{"headline":"","subheadline":"","cta":""},"productHuntLaunchCopy":"","shortDemoScript":[]}`);

  if (!data) return null;

  const hero = (data.landingPageHero ?? {}) as Partial<ContentPack["landingPageHero"]>;
  return {
    linkedInPost: asString(data.linkedInPost, fallback.linkedInPost),
    coldEmail: asString(data.coldEmail, fallback.coldEmail),
    landingPageHero: {
      headline: asString(hero.headline, fallback.landingPageHero.headline),
      subheadline: asString(hero.subheadline, fallback.landingPageHero.subheadline),
      cta: asString(hero.cta, fallback.landingPageHero.cta),
    },
    productHuntLaunchCopy: asString(data.productHuntLaunchCopy, fallback.productHuntLaunchCopy),
    shortDemoScript: asStrings(data.shortDemoScript, fallback.shortDemoScript),
  };
}

export async function aiOpportunityScore(idea: string, corpus: string): Promise<OpportunityScore | null> {
  const fallback = buildOpportunityScore(corpus, idea);
  const data = await safeGeminiJson<Partial<OpportunityScore>>(`${contextPrompt(idea, corpus)}

Return JSON shape:
{"total":0-100,"categories":[{"name":"Demand","score":0-100,"explanation":"specific reason"}]}`);

  if (!data?.categories?.length) return null;

  const categories = data.categories.slice(0, 6).map((category, index) => ({
    name: asString(category.name, fallback.categories[index % fallback.categories.length].name),
    score: Math.min(Math.max(Number(category.score) || fallback.categories[index % fallback.categories.length].score, 0), 100),
    explanation: asString(category.explanation, fallback.categories[index % fallback.categories.length].explanation),
  }));
  const total = Math.min(Math.max(Number(data.total) || Math.round(categories.reduce((sum, item) => sum + item.score, 0) / categories.length), 0), 100);

  return { total, categories };
}

export async function aiResearchResult(idea: string, sourceUrls: string[], corpus: string): Promise<ResearchResult | null> {
  const fallback = buildResearchResult(idea, sourceUrls, corpus);
  const data = await safeGeminiJson<Partial<ResearchResult>>(`${contextPrompt(idea, corpus)}

Return JSON shape:
{"competitors":[],"marketSignals":[],"customerPainPoints":[],"positioningIdeas":[],"recommendedGtmStrategy":[]}`);

  if (!data) return null;

  return {
    competitors: asStrings(data.competitors, fallback.competitors),
    sourceUrls,
    marketSignals: asStrings(data.marketSignals, fallback.marketSignals),
    customerPainPoints: asStrings(data.customerPainPoints, fallback.customerPainPoints),
    positioningIdeas: asStrings(data.positioningIdeas, fallback.positioningIdeas),
    recommendedGtmStrategy: asStrings(data.recommendedGtmStrategy, fallback.recommendedGtmStrategy),
    isDemoFallback: false,
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
    recommendedGtmStrategy: buildStrategy(idea, corpus).thirtyDayLaunchPlan,
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
      return { icp: buildIcp(idea, corpus), ...base };
    case "strategy":
      return { strategy: buildStrategy(idea, corpus), ...base };
    case "content":
      return { content: buildContent(idea, corpus), ...base };
    default:
      return { opportunityScore: buildOpportunityScore(corpus, idea), ...base };
  }
}
