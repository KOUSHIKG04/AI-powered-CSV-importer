import express, { type Request, type Response } from "express";
import cors from "cors";
import { errorHandler } from "./middleware/errorHandler.js";

const application = express();
application.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "*",
  }),
);

application.use(express.json({ limit: "50mb" }));

application.get("/health", (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    status: "ok",
  });
});

// app-routes
import csvRouter from "./routes/csvRoutes.js";
application.use("/api/v1", csvRouter);


application.use((req: Request, res: Response) => {
  return res.status(404).json({
    success: false,
    error: `Route not found: ${req.originalUrl}`,
  });
});

application.use(errorHandler);

export default application;
