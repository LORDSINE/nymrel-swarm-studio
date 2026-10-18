import type { IncomeLaneEntry, IncomeScoreDimensions } from '../types';

/** Source: studio issue #21 — Income Opportunity Registry, "Portfolio map — Wave 1". */
export const REGISTRY_SOURCE = 'Issue #21 · Income Opportunity Registry — Wave 1 portfolio map excerpt';

/**
 * Every value in this module is an illustrative fixture. This page connects to
 * no billing, marketplace, purchase, or customer system, and the scores below
 * are illustrative examples — not verified demand, revenue, or customer
 * evidence. New concepts enter the registry on evidence and compete for
 * execution priority on their score.
 */
export const REGISTRY_NOTICE =
  'Illustrative reference excerpt only. Scores are not verified revenue evidence.';

export const INCOME_REGISTRY_WAVE_1: IncomeLaneEntry[] = [
  {
    id: 'registry-nymrel-studio-services',
    asset: 'Nymrel Studio / services',
    incomeLanes: [
      'AI agent sprint',
      'MCP integration',
      'automation rescue',
      'deployment rescue',
      'Next.js/Supabase hardening',
      'Stripe integration',
      'mobile launch rescue',
      'fractional engineering',
    ],
    commercialState:
      'Marketplace positioning PR #179 merged to main; fixed-scope offer work tracked in #18/#19.',
    primaryBlocker: 'Consistent outbound / marketplace acquisition.',
    nextRevenueAction:
      'Publish and use the sharpened commercial page; qualify and apply to highest-value matching leads; attach public proof.',
    class: 'Cash now',
    illustrativeScore: {
      demand: 4,
      timeToFirstDollar: 5,
      recurring: 2,
      reuse: 4,
      distribution: 3,
      margin: 4,
      fulfillment: 3,
      proof: 4,
    },
  },
  {
    id: 'registry-website-intelligence',
    asset: 'Nymrel Website Intelligence',
    incomeLanes: [
      'paid audit',
      'monitoring subscription',
      'AI visibility',
      'answer-accuracy monitoring',
      'compliance/SEO/AEO monitoring',
    ],
    commercialState: 'Live Stripe catalog + direct purchase surfaces exist.',
    primaryBlocker:
      'Need verified pay→intake→fulfillment→delivery evidence and clearer purchase sequencing.',
    nextRevenueAction:
      'Make one canonical diagnostic + care offer the default promoted funnel; verify money path.',
    class: 'Recurring',
    illustrativeScore: {
      demand: 4,
      timeToFirstDollar: 3,
      recurring: 5,
      reuse: 4,
      distribution: 3,
      margin: 4,
      fulfillment: 3,
      proof: 2,
    },
  },
  {
    id: 'registry-mcp-hub-remote',
    asset: 'Nymrel MCP Hub / Remote',
    incomeLanes: [
      'hosted MCP gateway',
      'developer SaaS',
      'team subscription',
      'GitHub Marketplace app',
      'enterprise support',
    ],
    commercialState: 'Production infrastructure exists; Remote healthy; OAuth/read tooling still evolving.',
    primaryBlocker: 'activation/reliability + packaging for external customer.',
    nextRevenueAction:
      'define one external developer offer with minimal permissions, hosted plan, and support boundary.',
    class: 'Recurring / marketplace',
    illustrativeScore: {
      demand: 3,
      timeToFirstDollar: 3,
      recurring: 4,
      reuse: 5,
      distribution: 4,
      margin: 4,
      fulfillment: 3,
      proof: 3,
    },
  },
  {
    id: 'registry-publisher',
    asset: 'Nymrel Publisher',
    incomeLanes: ['content-ops SaaS', 'social publishing subscription', 'agency retainer', 'API'],
    commercialState: 'PR #52 exact-head CI green; Railway history runtime provisioned but not yet live.',
    primaryBlocker: 'merge/deploy/health + later delivery/OAuth canary gates.',
    nextRevenueAction:
      'land history/read side, prove persistent hourly observation, then package read/ops tier before enabling live posting.',
    class: 'Recurring',
    illustrativeScore: {
      demand: 3,
      timeToFirstDollar: 2,
      recurring: 4,
      reuse: 4,
      distribution: 2,
      margin: 4,
      fulfillment: 3,
      proof: 2,
    },
  },
  {
    id: 'registry-crawler-mesh',
    asset: 'Crawler Mesh',
    incomeLanes: [
      'paid API',
      'hosted crawling/data extraction',
      'MCP tool',
      'developer license/support',
    ],
    commercialState: 'canonical replacement code built; release issue #15 open.',
    primaryBlocker: 'v1.0 registry publication + MCP Hub cutover.',
    nextRevenueAction:
      'publish verified v1.0 and consume canonical package in MCP Hub; then expose metered hosted tier.',
    class: 'Recurring / API',
    illustrativeScore: {
      demand: 4,
      timeToFirstDollar: 3,
      recurring: 4,
      reuse: 5,
      distribution: 3,
      margin: 4,
      fulfillment: 3,
      proof: 3,
    },
  },
];

export const REGISTRY_SCORING = {
  name: 'Weighted execution score',
  scale: 'Each dimension scored 1–5.',
  formula: '2×Demand + 2×TTF$ + 2×Recurring + 2×Reuse + Distribution + Margin + Fulfillment + Proof',
  maxScore: 60,
  guidance:
    'Score each opportunity on evidence. A new concept can outrank existing work whenever its evidence produces the stronger score.',
} as const;

export function computeWeightedScore(dimensions: IncomeScoreDimensions): number {
  const values = [
    dimensions.demand,
    dimensions.timeToFirstDollar,
    dimensions.recurring,
    dimensions.reuse,
    dimensions.distribution,
    dimensions.margin,
    dimensions.fulfillment,
    dimensions.proof,
  ];

  for (const value of values) {
    if (!Number.isFinite(value) || value < 1 || value > 5) {
      throw new RangeError('Each registry score dimension must be a number between 1 and 5.');
    }
  }

  return (
    2 * dimensions.demand +
    2 * dimensions.timeToFirstDollar +
    2 * dimensions.recurring +
    2 * dimensions.reuse +
    dimensions.distribution +
    dimensions.margin +
    dimensions.fulfillment +
    dimensions.proof
  );
}
