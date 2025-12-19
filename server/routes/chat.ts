import { Request, Response } from "express";
import { spawn } from "child_process";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function handleChat(req: Request, res: Response) {
  try {
    const { user_language, message, user_context } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    const userLang = user_language || "en";
    const pythonScript = join(__dirname, "../../python_services/chat_service.py");
    const pythonExe = join(__dirname, "../../python_services/venv/bin/python3");

    // Prepare arguments
    const args = [pythonScript, userLang, message];
    
    // Add user context if provided (chapters for travel recommendations)
    if (user_context) {
      args.push(JSON.stringify(user_context));
    }

    // Spawn Python process
    const pythonProcess = spawn(pythonExe, args, {
      env: {
        ...process.env,
        GEMINI_API_KEY: process.env.GEMINI_API_KEY || ""
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

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        console.error("Chat service error:", stderr);
        return res.status(500).json({
          error: "Chat service failed",
          detail: stderr,
        });
      }

      try {
        const result = JSON.parse(stdout);
        if (result.error) {
          return res.status(500).json(result);
        }
        res.json(result);
      } catch (parseError: any) {
        console.error("Failed to parse chat response:", stdout);
        res.status(500).json({
          error: "Invalid response from chat service",
          detail: parseError.message,
        });
      }
    });
  } catch (error: any) {
    console.error("Chat error:", error);
    res.status(500).json({
      error: "Failed to process chat request",
      detail: error.message,
    });
  }
}
