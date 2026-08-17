const CHANNELS = ["Instagram", "TikTok", "YouTube", "Google", "Facebook", "LinkedIn", "Influencers"];
const BUDGET_WEIGHTS = [0.4, 0.3, 0.2, 0.1];

export function determineBudgetTier(budget) {
  if (budget < 5000) return "Small";
  if (budget <= 25000) return "Medium";
  return "Large";
}

function addScores(scores, channels, amount) {
  for (const channel of channels) {
    if (scores[channel] !== undefined) scores[channel] += amount;
  }
}

export function scoreChannels(audience) {
  const normalizedAudience = audience.toLowerCase();
  const scores = Object.fromEntries(CHANNELS.map((channel) => [channel, 45]));

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
    addScores(scores, ["Facebook"], -5);
  }

  return Object.entries(scores)
    .map(([channel, score]) => ({ channel, score: Math.max(0, Math.min(100, score)) }))
    .sort((left, right) => right.score - left.score || left.channel.localeCompare(right.channel));
}

export function allocateBudget(budget, channelScores) {
  const totalCents = Math.round(budget * 100);
  const channels = channelScores.slice(0, 4);
  let allocatedCents = 0;

  const allocation = {};
  channels.forEach(({ channel }, index) => {
    const cents =
      index === channels.length - 1
        ? totalCents - allocatedCents
        : Math.round(totalCents * BUDGET_WEIGHTS[index]);
    allocation[channel] = cents / 100;
    allocatedCents += cents;
  });

  return allocation;
}

function findVariant(adCopies, variant) {
  return adCopies.find((copy) => copy.variant.toLowerCase() === variant);
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
  const channelScores = scoreChannels(input.audience);
  const budgetAllocation = allocateBudget(input.budget, channelScores);

  return {
    budgetTier: determineBudgetTier(input.budget),
    channelScores,
    recommendedChannels: Object.keys(budgetAllocation),
    budgetAllocation,
    abVariants: ensureAbVariants(aiOutput.adCopies, input),
    risk: assessRisk(input.budget, Object.keys(budgetAllocation).length),
  };
}