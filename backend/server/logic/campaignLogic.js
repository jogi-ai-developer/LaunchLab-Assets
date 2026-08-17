const CHANNELS = ["Instagram", "TikTok", "YouTube", "Google", "Facebook", "LinkedIn", "Influencers"];
const AI_CANDIDATE_BONUS = 5;
const ALLOCATION_WEIGHTS = {
  1: [1],
  2: [0.4, 0.6],
  3: [0.4, 0.3, 0.3],
  4: [0.4, 0.3, 0.2, 0.1],
};

export function determineBudgetTier(budget) {
  if (budget < 5000) return "Small";
  if (budget <= 25000) return "Medium";
  return "Large";
}

export function maxChannelsForBudget(budget) {
  if (budget < 5000) return 2;
  if (budget <= 25000) return 3;
  return 4;
}

function addScores(scores, channels, amount) {
  for (const channel of channels) {
    if (scores[channel] !== undefined) scores[channel] += amount;
  }
}

function normalizeSuggestedChannels(suggestedChannels = []) {
  const aliases = {
    Instagram: ["instagram"],
    TikTok: ["tiktok"],
    YouTube: ["youtube"],
    Google: ["google", "search", "ppc"],
    Facebook: ["facebook"],
    LinkedIn: ["linkedin"],
    Influencers: ["influencer", "creator", "micro-influencer"],
  };
  const normalizedCandidates = new Set();

  for (const suggestion of suggestedChannels) {
    if (typeof suggestion !== "string") continue;
    const normalizedSuggestion = suggestion.toLowerCase();
    for (const [channel, channelAliases] of Object.entries(aliases)) {
      if (channelAliases.some((alias) => normalizedSuggestion.includes(alias))) {
        normalizedCandidates.add(channel);
      }
    }
  }

  return normalizedCandidates;
}

export function scoreChannels(audience, suggestedChannels = []) {
  const normalizedAudience = audience.toLowerCase();
  const scores = Object.fromEntries(CHANNELS.map((channel) => [channel, 45]));
  const aiCandidates = normalizeSuggestedChannels(suggestedChannels);

  if (/(18|19|20|21|22|23|24|college|student|gen z|young)/.test(normalizedAudience)) {
    addScores(scores, ["Instagram", "TikTok", "YouTube"], 35);
    addScores(scores, ["Influencers"], 20);
  }

  if (/(25|26|27|28|29|30|31|32|33|34|professional|urban)/.test(normalizedAudience)) {
    addScores(scores, ["Instagram", "YouTube", "Google"], 25);
    addScores(scores, ["LinkedIn"], 10);
  }

  if (/(35|36|37|38|39|40|41|42|43|44|45|46|47|48|49|50|51|52|53|54|parent|family)/.test(normalizedAudience)) {
    addScores(scores, ["Facebook", "Google", "YouTube"], 25);
  }

  if (/(b2b|business|founder|enterprise|hr|recruit|professional services)/.test(normalizedAudience)) {
    addScores(scores, ["LinkedIn", "Google"], 35);
    addScores(scores, ["Facebook"], -20);
  }

  addScores(scores, [...aiCandidates], AI_CANDIDATE_BONUS);

  return Object.entries(scores)
    .map(([channel, score]) => ({ channel, score: Math.max(0, Math.min(100, score)) }))
    .sort((left, right) => right.score - left.score || left.channel.localeCompare(right.channel));
}

export function selectRecommendedChannels(budget, channelScores) {
  return channelScores
    .slice(0, maxChannelsForBudget(budget))
    .map(({ channel }) => channel);
}

export function allocateBudget(budget, channelScores, channelLimit = maxChannelsForBudget(budget)) {
  const totalCents = Math.round(budget * 100);
  const channels = channelScores.slice(0, Math.max(1, Math.min(4, channelLimit)));
  const weights = ALLOCATION_WEIGHTS[channels.length];
  let allocatedCents = 0;

  const allocation = {};
  channels.forEach(({ channel }, index) => {
    const cents =
      index === channels.length - 1
        ? totalCents - allocatedCents
        : Math.round(totalCents * weights[index]);
    allocation[channel] = cents / 100;
    allocatedCents += cents;
  });

  const allocatedTotalCents = Object.values(allocation).reduce(
    (sum, amount) => sum + Math.round(amount * 100),
    0,
  );
  if (allocatedTotalCents !== totalCents) {
    throw new Error("Budget allocation must equal the supplied budget.");
  }

  return allocation;
}

function findVariant(adCopies, variant) {
  return adCopies.find((copy) => copy?.variant?.toLowerCase() === variant);
}

export function ensureAbVariants(adCopies, { product, audience }) {
  const benefit = findVariant(adCopies, "benefit-led") || adCopies[0];
  const urgency = findVariant(adCopies, "urgency-led") || adCopies[1] || adCopies[0];

  return [
    {
      type: "benefit-led",
      headline: benefit?.headline || `${product} that fits real life.`,
      body: benefit?.body || `${product} helps ${audience} get more from every day.`,
      cta: benefit?.cta || "Learn more",
    },
    {
      type: "urgency-led",
      headline: urgency?.headline || `Make your next move with ${product}.`,
      body: urgency?.body || `Start today and see why ${audience} are choosing a better way forward.`,
      cta: urgency?.cta || "Get started",
    },
  ];
}

export function assessRisk(budget, channelCount) {
  if (budget < 5000 && channelCount >= 4) {
    return {
      level: "HIGH",
      reason: "The budget is spread across four or more channels before enough signal is available.",
    };
  }

  if (budget < 5000 && channelCount >= 2) {
    return {
      level: "MEDIUM",
      reason: "The budget is workable, but the first test should stay focused across only a few channels.",
    };
  }

  return {
    level: "LOW",
    reason: "Budget is sufficient for the recommended channel mix.",
  };
}

export function buildCampaignLogic({ input, aiOutput }) {
  const channelScores = scoreChannels(input.audience, aiOutput.suggestedChannels);
  const recommendedChannels = selectRecommendedChannels(input.budget, channelScores);
  const recommendedScores = recommendedChannels.map((channel) =>
    channelScores.find((entry) => entry.channel === channel),
  );
  const budgetAllocation = allocateBudget(input.budget, recommendedScores, recommendedChannels.length);

  return {
    budgetTier: determineBudgetTier(input.budget),
    channelScores,
    recommendedChannels,
    budgetAllocation,
    abVariants: ensureAbVariants(aiOutput.adCopies, input),
    risk: assessRisk(input.budget, recommendedChannels.length),
  };
}