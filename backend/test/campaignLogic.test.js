import test from "node:test";
import assert from "node:assert/strict";
import {
  assessRisk,
  buildCampaignLogic,
  determineBudgetTier,
  ensureAbVariants,
  maxChannelsForBudget,
  scoreChannels,
} from "../server/logic/campaignLogic.js";
import { validateCampaignInput } from "../server/utils/validation.js";

const aiOutput = {
  campaignIdeas: [
    { title: "Idea one", description: "Description one" },
    { title: "Idea two", description: "Description two" },
    { title: "Idea three", description: "Description three" },
  ],
  adCopies: [
    { variant: "benefit-led", headline: "Benefit", body: "Benefit body", cta: "Learn more" },
    { variant: "urgency-led", headline: "Urgency", body: "Urgency body", cta: "Start now" },
  ],
  suggestedChannels: ["Instagram", "TikTok", "YouTube"],
};

function buildLogic(budget, audience = "College students aged 18-24", suggestedChannels = aiOutput.suggestedChannels) {
  return buildCampaignLogic({
    input: { product: "Protein Bar", audience, budget },
    aiOutput: { ...aiOutput, suggestedChannels },
  });
}

test("budget tiers and budget-aware channel limits are deterministic", () => {
  assert.equal(determineBudgetTier(3000), "Small");
  assert.equal(determineBudgetTier(10000), "Medium");
  assert.equal(determineBudgetTier(50000), "Large");
  assert.equal(maxChannelsForBudget(3000), 2);
  assert.equal(maxChannelsForBudget(10000), 3);
  assert.equal(maxChannelsForBudget(50000), 4);

  assert.equal(buildLogic(3000).recommendedChannels.length, 2);
  assert.equal(buildLogic(10000).recommendedChannels.length, 3);
  assert.equal(buildLogic(50000).recommendedChannels.length, 4);
});

test("audience rules score young and B2B channels clearly", () => {
  const youngScores = scoreChannels("College students aged 18-24");
  assert.ok(youngScores.find((entry) => entry.channel === "Instagram").score > youngScores.find((entry) => entry.channel === "Facebook").score);
  assert.ok(youngScores.find((entry) => entry.channel === "TikTok").score > youngScores.find((entry) => entry.channel === "Facebook").score);
  assert.ok(youngScores.find((entry) => entry.channel === "YouTube").score > youngScores.find((entry) => entry.channel === "Facebook").score);

  const b2bScores = scoreChannels("B2B founders");
  assert.ok(b2bScores.find((entry) => entry.channel === "LinkedIn").score > b2bScores.find((entry) => entry.channel === "Facebook").score);
  assert.ok(b2bScores.find((entry) => entry.channel === "Google").score > b2bScores.find((entry) => entry.channel === "Facebook").score);
  assert.ok(b2bScores.every((entry) => entry.score >= 0 && entry.score <= 100));
});

test("AI suggestions influence candidates without overriding deterministic scoring", () => {
  const generalScores = scoreChannels("General audience");
  const suggestedScores = scoreChannels("General audience", ["LinkedIn"]);
  assert.ok(
    suggestedScores.find((entry) => entry.channel === "LinkedIn").score >
      generalScores.find((entry) => entry.channel === "LinkedIn").score,
  );

  const b2bLogic = buildLogic(10000, "B2B founders", ["Facebook"]);
  assert.ok(b2bLogic.recommendedChannels.includes("LinkedIn"));
  assert.ok(b2bLogic.recommendedChannels.includes("Google"));
  assert.ok(!b2bLogic.recommendedChannels.includes("Facebook"));
});

test("budget allocation always equals the supplied budget", () => {
  for (const budget of [3000, 10000, 50000]) {
    const logic = buildLogic(budget);
    const total = Object.values(logic.budgetAllocation).reduce((sum, amount) => sum + amount, 0);
    assert.equal(total, budget);
  }
});

test("A/B logic always returns benefit-led and urgency-led copy", () => {
  const variants = ensureAbVariants(
    [{ variant: "benefit-led", headline: "Benefit", body: "Body", cta: "Go" }],
    { product: "Protein Bar", audience: "Students" },
  );
  assert.deepEqual(variants.map((variant) => variant.type), ["benefit-led", "urgency-led"]);
  assert.equal(variants[0].headline, "Benefit");
  assert.ok(variants[1].headline);
});

test("risk uses the final recommended channel count", () => {
  assert.equal(assessRisk(3000, 4).level, "HIGH");
  assert.equal(assessRisk(3000, 3).level, "MEDIUM");
  assert.equal(assessRisk(10000, 4).level, "LOW");
  assert.equal(buildLogic(3000).risk.level, "MEDIUM");
});

test("campaign input validation rejects empty and invalid budgets", () => {
  assert.deepEqual(validateCampaignInput({ product: "Protein Bar", audience: "Students", budget: "10,000" }), {
    product: "Protein Bar",
    audience: "Students",
    budget: 10000,
  });
  assert.throws(() => validateCampaignInput({ product: "", audience: "Students", budget: 10000 }), {
    message: "Product is required",
  });
  assert.throws(() => validateCampaignInput({ product: "Product", audience: "Students", budget: 0 }), {
    message: "Budget must be greater than 0",
  });
});