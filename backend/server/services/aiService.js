import { GoogleGenAI } from "@google/genai";
import { AppError } from "../utils/errors.js";
import { LAUNCHLAB_AI_SYSTEM_PROMPT } from "./aiSystemPrompt.js";

const MODEL = "gemini-2.5-flash";

function getGeminiClient() {
  const apiKey =
    process.env.AI_INTEGRATIONS_GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.OPENAI_API_KEY;
  const baseUrl = process.env.AI_INTEGRATIONS_GEMINI_BASE_URL;

  if (!apiKey) {
    throw new AppError(
      500,
      "Unable to generate campaign",
      "Gemini is not configured. Set GEMINI_API_KEY or provision the Replit Gemini integration.",
    );
  }

  const options = { apiKey };
  if (baseUrl) {
    options.httpOptions = { apiVersion: "", baseUrl };
  }

  return new GoogleGenAI(options);
}

export function buildCampaignPrompt({ product, audience, budget }) {
  return `
Product: ${product}
Target audience: ${audience}
Working budget: ${budget}
`.trim();
}

function parseJsonResponse(text) {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new AppError(
      500,
      "Unable to generate campaign",
      "Gemini returned invalid JSON.",
    );
  }
}

function requiredText(value, fieldName) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new AppError(
      500,
      "Unable to generate campaign",
      `Gemini response is missing ${fieldName}.`,
    );
  }

  return value.trim();
}

function validateAiOutput(value) {
  if (!value || typeof value !== "object") {
    throw new AppError(500, "Unable to generate campaign", "Gemini returned an invalid object.");
  }

  if (!Array.isArray(value.campaignIdeas) || value.campaignIdeas.length !== 3) {
    throw new AppError(500, "Unable to generate campaign", "Gemini must return exactly 3 campaign ideas.");
  }

  if (!Array.isArray(value.adCopies) || value.adCopies.length !== 2) {
    throw new AppError(500, "Unable to generate campaign", "Gemini must return exactly 2 ad copy variants.");
  }

  if (
    !Array.isArray(value.suggestedChannels) ||
    value.suggestedChannels.length < 3 ||
    value.suggestedChannels.some((channel) => typeof channel !== "string" || channel.trim() === "")
  ) {
    throw new AppError(500, "Unable to generate campaign", "Gemini must return suggested channels.");
  }

  const campaignIdeas = value.campaignIdeas.map((idea) => ({
    title: requiredText(idea?.title, "campaign idea title"),
    description: requiredText(idea?.description, "campaign idea description"),
  }));

  const adCopies = value.adCopies.map((copy) => ({
    variant: requiredText(copy?.variant, "ad copy variant"),
    headline: requiredText(copy?.headline, "ad copy headline"),
    body: requiredText(copy?.body, "ad copy body"),
    cta: requiredText(copy?.cta, "ad copy CTA"),
  }));

  return {
    campaignIdeas,
    adCopies,
    suggestedChannels: value.suggestedChannels.map((channel) => channel.trim()),
  };
}

export async function generateCampaignContent(input) {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [{ role: "user", parts: [{ text: buildCampaignPrompt(input) }] }],
    config: {
      systemInstruction: LAUNCHLAB_AI_SYSTEM_PROMPT,
      responseMimeType: "application/json",
      maxOutputTokens: 8192,
      temperature: 0.4,
    },
  });

  if (typeof response.text !== "string" || response.text.trim() === "") {
    throw new AppError(500, "Unable to generate campaign", "Gemini returned an empty response.");
  }

  return validateAiOutput(parseJsonResponse(response.text));
}