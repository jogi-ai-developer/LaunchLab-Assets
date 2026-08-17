import test from "node:test";
import assert from "node:assert/strict";
import {
  allocateBudget,
  assessRisk,
  determineBudgetTier,
  scoreChannels,
} from "../server/logic/campaignLogic.js";
import { validateCampaignInput } from "../server/utils/validation.js";

test("budget tiers and allocations are deterministic", () => {
  assert.equal(determineBudgetTier(4999), "Small");
  assert.equal(determineBudgetTier(5000), "Medium");
  assert.equal(determineBudgetTier(25001), "Large");

  const allocation = allocateBudget(10000, scoreChannels("College students aged 18-24"));
  assert.equal(Object.values(allocation).reduce((sum, value) => sum + value, 0), 10000);
});

test("audience rules influence channel scores and risk rules stay inspectable", () => {
  const scores = scoreChannels("B2B founders");
  assert.equal(scores.find((entry) => entry.channel === "LinkedIn").score, 80);
  assert.equal(scores.find((entry) => entry.channel === "Google").score, 80);
  assert.equal(assessRisk(4000, 4).level, "HIGH");
  assert.equal(assessRisk(4000, 3).level, "MEDIUM");
  assert.equal(assessRisk(10000, 4).level, "LOW");
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