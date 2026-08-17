import { AppError } from "./errors.js";

function parseBudget(value) {
  if (typeof value === "number") return value;
  if (typeof value !== "string" || value.trim() === "") return Number.NaN;

  return Number(value.replace(/[₹$,\s]/g, ""));
}

export function validateCampaignInput(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new AppError(400, "Request body is required");
  }

  if (typeof body.product !== "string" || body.product.trim() === "") {
    throw new AppError(400, "Product is required");
  }

  if (typeof body.audience !== "string" || body.audience.trim() === "") {
    throw new AppError(400, "Audience is required");
  }

  if (body.budget === undefined || body.budget === null || body.budget === "") {
    throw new AppError(400, "Budget is required");
  }

  const budget = parseBudget(body.budget);
  if (!Number.isFinite(budget)) {
    throw new AppError(400, "Budget must be numeric");
  }

  if (budget <= 0) {
    throw new AppError(400, "Budget must be greater than 0");
  }

  return {
    product: body.product.trim(),
    audience: body.audience.trim(),
    budget: Math.round(budget * 100) / 100,
  };
}