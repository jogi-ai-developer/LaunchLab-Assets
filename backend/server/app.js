import cors from "cors";
import express from "express";
import campaignsRouter from "./routes/campaigns.js";
import healthRouter from "./routes/health.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "32kb" }));
app.use((request, response, next) => {
  const startedAt = Date.now();
  response.on("finish", () => {
    console.info(`${request.method} ${request.originalUrl} ${response.statusCode} ${Date.now() - startedAt}ms`);
  });
  next();
});

app.use("/api", healthRouter);
app.use("/api/campaigns", campaignsRouter);
app.use(errorHandler);

export default app;