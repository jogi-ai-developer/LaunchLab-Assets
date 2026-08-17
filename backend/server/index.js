import "dotenv/config";
import app from "./app.js";

const port = Number(process.env.PORT || 3000);

if (!Number.isInteger(port) || port <= 0) {
  throw new Error("PORT must be a positive integer.");
}

app.listen(port, "0.0.0.0", () => {
  console.info(`LaunchLab backend listening on port ${port}`);
  if (
    !process.env.AI_INTEGRATIONS_GEMINI_API_KEY &&
    !process.env.GEMINI_API_KEY &&
    !process.env.OPENAI_API_KEY
  ) {
    console.warn("Gemini is not configured. POST /api/campaigns will return a configuration error.");
  }
});