import { Router } from "express";
import {
  importCsvHandler,
  parseCsvHandler,
  importStreamHandler,
} from "@/controllers/csvController.js";
import multer from "multer";

const csvRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

csvRouter.post("/parse", upload.single("file"), parseCsvHandler);
csvRouter.post("/import-csv", upload.single("file"), importCsvHandler);
csvRouter.post("/import-stream", importStreamHandler);

export default csvRouter;
