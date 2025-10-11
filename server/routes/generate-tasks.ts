import { RequestHandler } from "express";
import { generateTasksForCity } from "../services/ai-service";
import type { GenerateTasksRequest, GenerateTasksResponse } from "@shared/api";

export const handleGenerateTasks: RequestHandler = async (req, res) => {
  try {
    const { city, country, preferences } = req.body as GenerateTasksRequest;

    // Validate request
    if (!city) {
      return res.status(400).json({ error: "City is required" });
    }

    if (!preferences || !preferences.interests || !preferences.travel_style || !preferences.budget) {
      return res.status(400).json({ error: "Preferences are required" });
    }

    // Generate tasks using AI
    const tasks = await generateTasksForCity(
      city,
      country || "",
      preferences
    );

    const response: GenerateTasksResponse = { tasks };
    res.json(response);
  } catch (error) {
    console.error("Error in generateTasks endpoint:", error);
    res.status(500).json({ 
      error: "Failed to generate tasks",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
