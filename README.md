# LaunchPilot AI

LaunchPilot AI is a demo-ready GTM operating system for startup founders. It turns one startup idea into a practical go-to-market workspace: competitor tracking, pain point mining, ICP generation, launch strategy, opportunity scoring, and launch content.

The product is designed to feel like an AI chief of staff for startup growth. It helps a founder move from vague idea to clear GTM action without jumping across search tabs, spreadsheets, notes, and generic chat tools.

## What It Does

LaunchPilot AI lets a user enter a startup idea or website and receive structured GTM output:

- Competitors
- Source URLs
- Market signals
- Customer pain points
- Positioning ideas
- Recommended GTM strategy
- ICP profile
- Opportunity score
- Content assets
- Launch readiness score
- AI SWOT analysis
- Customer language snippets
- Autonomous recommendations
- Timeline/activity feed

Bright Data integrations are server-side only. If API credentials are missing or Bright Data fails, the app returns clearly labeled demo fallback data so hackathon demos stay smooth.

## Product Positioning

**Headline:** Turn live web data into a go-to-market plan.

**Subheadline:** LaunchPilot AI uses web intelligence agents to find competitors, customer pain points, ICPs, and launch strategies in minutes.

**Product feel:** Premium SaaS dashboard, AI chief of staff, founder command center.

## Core Features

### 1. AI Command Center

Dashboard workspace for founders:

- One clear idea input
- Main CTA: `Analyze Startup Idea`
- Project saving in local storage
- Launch readiness score
- Live market signals
- Quick actions
- Autonomous recommendations
- Timeline/activity feed
- AI SWOT analysis

### 2. Guided Workflow Mode

Step-by-step flow:

1. Analyze idea
2. Review market signals
3. Choose ICP
4. Build launch plan

This keeps the product approachable for non-technical founders.

### 3. Competitor Tracker

Route: `/competitors`

API: `/api/competitors`

Output:

- Competitor name
- URL
- Positioning
- Pricing page link
- Notes
- Detail page link

Competitor detail route:

```txt
/competitors/[slug]
```

### 4. Pain Point Miner

Route: `/pain-points`

API: `/api/pain-points`

Searches for public web complaint/review/forum-style signals and groups likely customer pain by:

- Theme
- Severity
- Frequency
- Example language

### 5. ICP Generator

Route: `/icp`

API: `/api/icp`

Output:

- Job titles
- Industries
- Company size
- Pain points
- Buying triggers
- Objections
- Where to reach buyers

### 6. GTM Strategy Builder

Route: `/strategy`

API: `/api/strategy`

Output:

- Positioning
- Channels
- 30-day launch plan
- Content ideas
- Cold email angle
- Success metrics

### 7. Opportunity Score

API: `/api/opportunity-score`

Score range: `0-100`

Categories:

- Demand
- Urgency
- Competition
- Monetization
- SEO potential
- Ease of launch

The UI renders progress meters and explanations for each category.

### 8. Content Engine

Route: `/content`

API: `/api/content`

Generates:

- LinkedIn post
- Cold email
- Landing page hero
- Product Hunt launch copy
- Short demo script

### 9. Customer Language Extractor

Dashboard module that shows plain-language buyer phrases:

- "I waste too much time researching competitors."
- "I need a launch plan I can act on today."
- "Generic AI advice does not feel source-backed."

This gives founders copy-ready language for positioning and outreach.

### 10. Light/Dark Mode

LaunchPilot supports:

- Dark mode default
- Light mode toggle
- Persistent preference via local storage
- Mobile-friendly toggle in top header

## Pages

```txt
/
/dashboard
/research
/competitors
/competitors/[slug]
/pain-points
/icp
/strategy
/content
/settings
```

## API Routes

```txt
POST /api/research
POST /api/competitors
POST /api/pain-points
POST /api/icp
POST /api/strategy
POST /api/content
POST /api/opportunity-score
```

All API routes accept:

```json
{
  "idea": "AI copilot for auto repair shops"
}
```

## Bright Data Integration

Bright Data helper:

```txt
src/lib/brightdata.ts
```

Main helper:

```ts
brightDataRequest(zone, url, format)
```

It sends:

```ts
POST https://api.brightdata.com/request
```

With body:

```json
{
  "zone": "zone_name",
  "url": "https://www.google.com/search?q=...",
  "format": "json"
}
```

Headers:

```txt
Authorization: Bearer process.env.BRIGHT_DATA_API_KEY
Content-Type: application/json
```

## Environment Variables

Create `.env.local`:

```bash
BRIGHT_DATA_API_KEY="your_api_key"
BRIGHT_DATA_SERP_ZONE="your_serp_zone"
BRIGHT_DATA_UNLOCKER_ZONE="your_unlocker_zone"
```

Security notes:

- Never expose Bright Data API keys to browser.
- Do not prefix these env vars with `NEXT_PUBLIC_`.
- All Bright Data calls happen from Next.js API routes.
- Fallback data is labeled as demo fallback.

## Tech Stack

- Next.js 15
- TypeScript
- React 19
- Tailwind CSS
- Framer Motion
- Lucide React
- Bright Data SERP API
- Bright Data Web Unlocker
- Local storage for demo project saving

Supabase is listed in project context but auth/billing/data persistence are intentionally not overbuilt yet.

## Project Structure

```txt
src/
  app/
    api/
      competitors/route.ts
      content/route.ts
      icp/route.ts
      opportunity-score/route.ts
      pain-points/route.ts
      research/route.ts
      strategy/route.ts
    competitors/
      [slug]/page.tsx
      page.tsx
    content/page.tsx
    dashboard/page.tsx
    icp/page.tsx
    pain-points/page.tsx
    research/page.tsx
    settings/page.tsx
    strategy/page.tsx
    globals.css
    layout.tsx
    page.tsx
  components/
    app-shell.tsx
    command-center.tsx
    gtm-workbench.tsx
    research-form.tsx
    theme-toggle.tsx
  lib/
    brightdata.ts
    gtm.ts
```

## Local Development

Install dependencies:

```bash
npm install
```

Run dev server:

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

Build:

```bash
npm run build
```

Start production build:

```bash
npm run start
```

## Demo Flow

Recommended demo path:

1. Open `/`
2. Click `Analyze Startup Idea`
3. Enter idea like:

```txt
AI chief of staff for startup growth
```

4. Show guided workflow and loading states
5. Visit `/dashboard`
6. Show command center, readiness score, SWOT, signals, recommendations
7. Visit `/competitors`
8. Run competitor scan
9. Open competitor detail page
10. Visit `/strategy`
11. Generate GTM strategy and opportunity score
12. Visit `/content`
13. Generate launch copy

## Mobile UX

Mobile improvements include:

- Responsive shell padding
- Horizontal top navigation
- Fixed bottom navigation for core pages
- Smaller card padding on narrow screens
- Stacked command center actions
- Stacked launch readiness score
- Mobile-friendly landing page hero
- Touch-friendly buttons
- No raw JSON dumps
- Cards and panels collapse into one-column layouts

Core mobile breakpoints:

- Base: phone-first
- `sm`: larger phones/small tablets
- `md`: tablets
- `lg`: desktop shell/sidebar
- `xl`: wide dashboard layouts

## Fallback Data Behavior

If Bright Data env vars are missing, API routes still return useful demo output with:

```json
{
  "isDemoFallback": true,
  "error": "Missing BRIGHT_DATA_API_KEY environment variable."
}
```

The UI displays a visible demo fallback notice. This keeps demos stable while making data source status clear.

## Design System

Style direction:

- Premium SaaS
- Dark mode first
- Light mode supported
- Soft gradients
- Rounded cards
- Clear hierarchy
- Blue/violet accent
- Minimal glow
- Founder-friendly microcopy

Component patterns:

- `AppShell` handles navigation, header, breadcrumbs, mobile nav, theme toggle.
- `GtmWorkbench` handles idea input, loading states, API calls, and result cards.
- `CommandCenter` handles dashboard intelligence widgets and project saving.
- `ThemeToggle` manages light/dark persistence.

## Current Limitations

- Project saving uses local storage only.
- Supabase persistence is not implemented yet.
- API output is deterministic demo-style analysis, not full LLM reasoning.
- Bright Data parsing supports common SERP payload shapes but may need adjustment per zone response format.
- Auth and billing are intentionally out of scope for MVP demo.

## Suggested Next Steps

- Add Supabase project persistence.
- Add user accounts.
- Add export to PDF/Markdown.
- Add saved reports.
- Add actual LLM synthesis over Bright Data source text.
- Add citation-level source mapping per insight.
- Add background jobs for recurring competitor monitoring.
- Add alerts when competitor messaging or pricing changes.

## Troubleshooting

### Missing Bright Data API key

Check `.env.local`:

```bash
BRIGHT_DATA_API_KEY="..."
```

Restart dev server after editing env vars.

### API returns demo fallback

Likely cause:

- Missing API key
- Missing SERP zone
- Missing Web Unlocker zone
- Bright Data request failed
- Bright Data response format changed

### Dev server cache acts stale

Stop and restart:

```bash
Ctrl+C
npm run dev
```

### Build check

Run:

```bash
npm run build
```

## License

Private MVP/demo project.
