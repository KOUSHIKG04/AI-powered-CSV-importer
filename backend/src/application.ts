import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";

import { errorHandler } from "@/middleware/errorHandler.js";

const application = express();
application.use(
  cors({
    // origin : ["http://localhost:3000", ],
    // credentials: true,
    // methods : ["GET" , "POST" , "PUT" , "DELETE"],
    // allowedHeaders : ["Content-Type" , "Authorization"],
  }),
);
application.use(express.json());


application.use((req: Request, res: Response) => {
  return res.status(404).json({
    success: false,
    error: `Route not found: ${req.originalUrl}`,
  });
});

application.use(errorHandler);

export default application;
