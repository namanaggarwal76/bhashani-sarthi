import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import multer from "multer";
import { handleSpeechPipeline } from "./routes/speech_pipeline";

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
  // Speech pipeline endpoint (accepts single file field `audio`)
  const upload = multer();
  app.post('/api/speech/pipeline', upload.single('audio'), handleSpeechPipeline);

  return app;
}
