import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const serverDirectory = path.dirname(fileURLToPath(import.meta.url));
const backendDirectory = path.resolve(serverDirectory, "..", "..");
const databasePath =
  process.env.SQLITE_DB_PATH || path.join(backendDirectory, "data", "launchlab.sqlite");
const schemaPath = path.join(serverDirectory, "schema.sql");

fs.mkdirSync(path.dirname(databasePath), { recursive: true });

export const database = new DatabaseSync(databasePath);
database.exec(fs.readFileSync(schemaPath, "utf8"));

function parseJson(value, fieldName) {
  try {
    return JSON.parse(value);
  } catch {
    throw new Error(`Stored ${fieldName} is not valid JSON.`);
  }
}

export function saveCampaign({ input, aiOutput, logicOutput }) {
  const createdAt = new Date().toISOString();
  const statement = database.prepare(`
    INSERT INTO campaigns (product, audience, budget, ai_output, logic_output, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const result = statement.run(
    input.product,
    input.audience,
    input.budget,
    JSON.stringify(aiOutput),
    JSON.stringify(logicOutput),
    createdAt,
  );

  return getCampaignById(Number(result.lastInsertRowid));
}

export function getCampaignById(id) {
  const row = database.prepare("SELECT * FROM campaigns WHERE id = ?").get(id);
  if (!row) return null;

  return {
    id: Number(row.id),
    input: {
      product: row.product,
      audience: row.audience,
      budget: Number(row.budget),
    },
    campaignIdeas: parseJson(row.ai_output, "AI output").campaignIdeas,
    suggestedChannels: parseJson(row.ai_output, "AI output").suggestedChannels,
    adCopies: parseJson(row.logic_output, "logic output").abVariants,
    channelScores: parseJson(row.logic_output, "logic output").channelScores,
    budgetTier: parseJson(row.logic_output, "logic output").budgetTier,
    budgetAllocation: parseJson(row.logic_output, "logic output").budgetAllocation,
    risk: parseJson(row.logic_output, "logic output").risk,
    createdAt: row.created_at,
  };
}

export function getCampaigns() {
  const rows = database
    .prepare("SELECT id FROM campaigns ORDER BY datetime(created_at) DESC, id DESC")
    .all();
  return rows.map((row) => getCampaignById(Number(row.id)));
}