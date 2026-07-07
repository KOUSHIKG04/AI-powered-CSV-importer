import type { Request, Response, NextFunction } from "express";
import { parseCsv } from "@/utils/csvParser.js";
import { mapBatchWithAI, type CRMLead } from "@/services/aiService.js";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function parseCsvHandler(
  req: Request,
  res: Response,
): Promise<any> {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No CSV file uploaded.",
      });
    }

    const rawRows = await parseCsv(req.file.buffer);
    return res.status(200).json({
      success: true,
      rows: rawRows,
    });
  } catch (error: any) {
    console.error("CSV Parse Handler Error:", error);
    return res.status(500).json({
      success: false,
      error: `Failed to parse CSV file: ${error.message}`,
    });
  }
}


export async function importStreamHandler(
  req: Request,
  res: Response,
): Promise<any> {
  const { records } = req.body;

  if (!records || !Array.isArray(records)) {
    return res.status(400).json({
      success: false,
      error: "Invalid input. Expected a JSON body with a 'records' array.",
    });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Cache-Control", "no-cache");
  
  
  res.flushHeaders(); 


  let processedCount = 0; const batchSize = 30;
  const totalRecords = records.length;
 
  for (let i = 0; i < totalRecords; i += batchSize) {

    let attempt = 0;
    const batch = records.slice(i, i + batchSize);
    let success = false;
    const maxRetries = 3;
    let mappedRecords: CRMLead[] = [];

   
    while (attempt < maxRetries && !success) {
      try {
        mappedRecords = await mapBatchWithAI(batch);
        success = true;
      } catch (error: any) {
        attempt++;
        console.warn(
          `Batch mapping attempt ${attempt} failed. Retrying... Error: ${error.message}`,
        );

        if (attempt < maxRetries) await sleep(1500); 
      }
    }

    if (!success) {
      console.error(`Batch starting at index ${i} failed all retry attempts.`);
      mappedRecords = batch.map((row) => ({
        ...row,
        __skipped: true,
        __skip_reason: "AI processing failed after multiple retries.",
      }));
    }

    processedCount += batch.length;

    const progressData = {
      type: "batch_result", records: mappedRecords, progress: Math.round((processedCount / totalRecords) * 100), processed: processedCount,
      total: totalRecords,
    };

    res.write(`data: ${JSON.stringify(progressData)}\n\n`);
  }


  const doneData = {
    type: "done",
    message: "AI CSV Import completed successfully.",
  };
  
  res.write(`data: ${JSON.stringify(doneData)}\n\n`);
  res.end();
}
