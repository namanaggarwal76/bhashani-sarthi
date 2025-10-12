import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
<<<<<<< HEAD
import multer from "multer";
import { handleSpeechPipeline } from "./routes/speech_pipeline";
=======
import { handleGenerateTasks } from "./routes/generate-tasks";

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local explicitly (prioritize it over .env)
dotenv.config({ path: join(__dirname, "../.env.local") });
dotenv.config(); // Also load .env as fallback

// Verify API key is loaded
if (process.env.GEMINI_API_KEY) {
  console.log("✅ Gemini API key loaded successfully");
} else {
  console.warn("⚠️  Gemini API key not found - AI features will use mock data");
}
>>>>>>> origin/main

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);
<<<<<<< HEAD
  // Speech pipeline endpoint (accepts single file field `audio`)
  const upload = multer();
  app.post('/api/speech/pipeline', upload.single('audio'), handleSpeechPipeline);
=======
  
  // AI-powered task generation
  app.post("/api/generate-tasks", handleGenerateTasks);
>>>>>>> origin/main

  return app;
}
