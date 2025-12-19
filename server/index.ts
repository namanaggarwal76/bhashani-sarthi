import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import express from "express";
import cors from "cors";
import multer from "multer";
import { handleSpeechPipeline } from "./routes/speech_pipeline.ts";
import { handleChat } from "./routes/chat.ts";
import { handleOCRSession } from "./routes/ocr.ts";

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local explicitly (prioritize it over .env)
dotenv.config({ path: join(__dirname, "../.env.local") });
dotenv.config(); // Also load .env as fallback

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  // Multer instance for file uploads
  const upload = multer();

  // Speech pipeline endpoint (accepts single file field `audio`)
  app.post('/api/speech/pipeline', upload.single('audio'), handleSpeechPipeline);

  // Chat endpoint (AI chatbot)
  app.post('/api/chat', handleChat);

  // OCR endpoints
  app.post('/api/start_image_session', upload.single('file'), handleOCRSession);
  app.post('/api/image_chat_session', upload.single('file'), handleOCRSession);
  app.post('/api/ocr', upload.single('file'), handleOCRSession);

  return app;
}
