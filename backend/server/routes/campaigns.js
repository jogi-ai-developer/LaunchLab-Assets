import { Router } from "express";
import { generateCampaignContent } from "../services/aiService.js";
import { buildCampaignLogic } from "../logic/campaignLogic.js";
import { getCampaignById, getCampaigns, saveCampaign } from "../db/database.js";
import { validateCampaignInput } from "../utils/validation.js";

const router = Router();

router.post("/", async (request, response, next) => {
  try {
    const input = validateCampaignInput(request.body);
    const aiOutput = await generateCampaignContent(input);
    const logicOutput = buildCampaignLogic({ input, aiOutput });
    const campaign = saveCampaign({ input, aiOutput, logicOutput });

    console.info(`Campaign generated successfully: ${campaign.id}`);
    response.status(201).json(campaign);
  } catch (error) {
    next(error);
  }
});

router.get("/", (_request, response, next) => {
  try {
    response.json({ campaigns: getCampaigns() });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", (request, response, next) => {
  try {
    const id = Number(request.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      response.status(404).json({ error: "Campaign not found" });
      return;
    }

    const campaign = getCampaignById(id);
    if (!campaign) {
      response.status(404).json({ error: "Campaign not found" });
      return;
    }

    response.json(campaign);
  } catch (error) {
    next(error);
  }
});

export default router;