import { Request, Response } from "express";
import { spawn } from "child_process";
import { writeFile, unlink } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { randomBytes } from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function handleOCRSession(req: Request, res: Response) {
  let tempFilePath: string | null = null;

  try {
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ error: "Image file is required" });
    }

    const { latitude, longitude, target_language, location_info } = req.body;

    // Save uploaded file temporarily
    const sessionId = `session_${randomBytes(8).toString("hex")}`;
    tempFilePath = join(__dirname, "../../tmp", `${sessionId}.png`);
    await writeFile(tempFilePath, file.buffer);

    const targetLang = target_language || "English";
    const lat = latitude || "0";
    const lon = longitude || "0";

    const pythonScript = join(__dirname, "../../python_services/ocr_service.py");
    const pythonExe = join(__dirname, "../../python_services/venv/bin/python3");

    // Spawn Python process with venv python
    const pythonProcess = spawn(pythonExe, [
      pythonScript,
      tempFilePath,
      targetLang,
      lat,
      lon,
    ], {
      env: {
        ...process.env,
        GEMINI_API_KEY: process.env.GEMINI_API_KEY || "AIzaSyCukxYVbX0sY6SYmVxVuhJlTu_SMmQzOP4"
      }
    });

    let stdout = "";
    let stderr = "";

    pythonProcess.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    pythonProcess.on("close", async (code) => {
      // Clean up temp file
      if (tempFilePath) {
        try {
          await unlink(tempFilePath);
        } catch (e) {
          console.error("Failed to delete temp file:", e);
        }
      }

      if (code !== 0) {
        console.error("OCR service error:", stderr);
        return res.status(500).json({
          error: "OCR service failed",
          detail: stderr,
        });
      }

      try {
        const result = JSON.parse(stdout);
        if (result.error) {
          return res.status(500).json(result);
        }
        res.json({
          session_id: sessionId,
          ...result,
        });
      } catch (parseError: any) {
        console.error("Failed to parse OCR response:", stdout);
        res.status(500).json({
          error: "Invalid response from OCR service",
          detail: parseError.message,
        });
      }
    });
  } catch (error: any) {
    // Clean up on error
    if (tempFilePath) {
      try {
        await unlink(tempFilePath);
      } catch (e) {
        // Ignore cleanup errors
      }
    }

    console.error("OCR error:", error);
    res.status(500).json({
      error: "Failed to process OCR request",
      detail: error.message,
    });
  }
}
