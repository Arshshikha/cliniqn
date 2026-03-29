import "dotenv/config";

import express from "express";
import cors from "cors";

import routes from "./app/routes";
import { errorHandler } from "./app/middleware/error.middleware";
import { notFound } from "./app/middleware/notFound.middleware";

const app = express();

//////////////////////////////
// CORS CONFIG
//////////////////////////////

const origins = (
  process.env.CORS_ORIGINS ||
  "http://localhost:3000,http://127.0.0.1:3000"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: origins,
    credentials: true,
  })
);

//////////////////////////////
// GLOBAL MIDDLEWARE
//////////////////////////////

app.use(express.json());

//////////////////////////////
// HEALTH CHECK
//////////////////////////////

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

//////////////////////////////
// ROUTES
//////////////////////////////

app.use("/api", routes);

//////////////////////////////
// ERROR HANDLING
//////////////////////////////

app.use(notFound);
app.use(errorHandler);

export default app;

//////////////////////////////
// SERVER START
//////////////////////////////

if (require.main === module) {
  const port = Number(process.env.PORT ?? 5000);

  app.listen(port, () => {
    console.log(` Server running on http://localhost:${port}`);
  });
}