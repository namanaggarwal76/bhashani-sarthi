import { GoogleGenAI } from "@google/genai";
import type { Preferences, AIGeneratedPlace } from "../../shared/api";

interface AITaskResponse {
  tasks: AIGeneratedPlace[];
}

/**
 * Generate personalized tasks for a city based on user preferences using AI
 */
export async function generateTasksForCity(
  city: string,
  country: string,
  preferences: Preferences
): Promise<AIGeneratedPlace[]> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("❌ Gemini API key not configured, returning mock data");
    return generateMockTasks(city);
  }

  try {
    const prompt = buildPrompt(city, country, preferences);

    // Initialize Gemini client
    const ai = new GoogleGenAI({ apiKey });

    console.log(`✓ Sending request to Gemini API for ${city}...`);

    // Generate content using Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingBudget: 0, // Disable thinking for faster response
        },
      },
    });

    const content = response.text;

    if (!content) {
      console.error("No content in Gemini response");
      throw new Error("No content in Gemini response");
    }

    console.log("✓ Gemini Content received:", content.substring(0, 200) + "...");

    // Parse the JSON response - handle if AI returns text before/after JSON
    let parsedData: AITaskResponse;
    try {
      // Try to find JSON in the content
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        parsedData = JSON.parse(content);
      }
    } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON:", content);
      throw new Error("Invalid JSON in Gemini response");
    }

    if (!parsedData.tasks || !Array.isArray(parsedData.tasks)) {
      console.error("Invalid task structure:", parsedData);
      throw new Error("Invalid task structure in Gemini response");
    }

    console.log(`✓ Successfully parsed ${parsedData.tasks.length} tasks`);

    // Validate and normalize the tasks
    const tasks = parsedData.tasks.map((task, index) => ({
      place_id: task.place_id || `${city.toLowerCase()}_ai_${Date.now()}_${index}`,
      name: task.name,
      type: task.type || "Attraction",
      rating: Math.min(Math.max(task.rating || 4.0, 0), 5),
      xp: calculateXP(task.xp, task.rating),
      status: "pending" as const,
      description: task.description,
      estimated_duration: task.estimated_duration,
    }));

    console.log(`✓ Gemini AI generated ${tasks.length} tasks for ${city}`);
    return tasks;
  } catch (error) {
    console.error("Error generating tasks with Gemini AI:", error);
    console.warn("⚠ Falling back to mock data");
    return generateMockTasks(city);
  }
}

/**
 * Build a detailed prompt for AI task generation
 */
function buildPrompt(
  city: string,
  country: string,
  preferences: Preferences
): string {
  const location = country ? `${city}, ${country}` : city;
  const interests = preferences.interests.length > 0 
    ? preferences.interests.join(", ") 
    : "general sightseeing, culture, food";
  
  return `You are a travel expert. Generate 8-12 personalized travel recommendations for ${location}.

User Profile:
- Interests: ${interests}
- Travel Style: ${preferences.travel_style}
- Budget: ${preferences.budget}

Task Requirements:
1. Recommend real, popular places and activities in ${city}
2. Match recommendations to user's interests: ${interests}
3. Consider their ${preferences.travel_style} travel style and ${preferences.budget} budget
4. Assign XP points (20-200) based on place popularity:
   - World-famous landmarks: 150-200 XP
   - Popular attractions: 100-150 XP
   - Notable spots: 60-100 XP
   - Local gems: 20-60 XP
5. Include diverse types: Attraction, Food, Museum, Nature, Culture, Shopping, Entertainment
6. Provide brief descriptions and estimated visit durations

Response Format - Return ONLY valid JSON, no other text:
{
  "tasks": [
    {
      "place_id": "${city.toLowerCase()}_001",
      "name": "Place Name",
      "type": "Attraction",
      "rating": 4.5,
      "xp": 120,
      "description": "Why visit this place",
      "estimated_duration": "2 hours"
    }
  ]
}

IMPORTANT: Output must be ONLY the JSON object above, nothing else.`;
}

/**
 * Calculate appropriate XP based on AI suggestion and rating
 */
function calculateXP(suggestedXP: number | undefined, rating: number): number {
  // Base XP from AI suggestion or default based on rating
  let xp = suggestedXP || Math.round(rating * 30);

  // Ensure XP is within reasonable bounds
  xp = Math.max(20, Math.min(200, xp));

  // Round to nearest 10
  return Math.round(xp / 10) * 10;
}

/**
 * Generate mock tasks as fallback
 */
function generateMockTasks(city: string): AIGeneratedPlace[] {
  return [
    {
      place_id: `${city.toLowerCase()}_001`,
      name: `${city} Central Park`,
      type: "Nature",
      rating: 4.6,
      xp: 80,
      status: "pending",
      description: "Beautiful green space perfect for relaxation",
      estimated_duration: "2 hours",
    },
    {
      place_id: `${city.toLowerCase()}_002`,
      name: `Historic ${city} Museum`,
      type: "Museum",
      rating: 4.5,
      xp: 100,
      status: "pending",
      description: "Learn about the rich history and culture",
      estimated_duration: "3 hours",
    },
    {
      place_id: `${city.toLowerCase()}_003`,
      name: `${city} Food Market`,
      type: "Food",
      rating: 4.7,
      xp: 60,
      status: "pending",
      description: "Experience authentic local cuisine",
      estimated_duration: "1.5 hours",
    },
    {
      place_id: `${city.toLowerCase()}_004`,
      name: `${city} Old Town`,
      type: "Culture",
      rating: 4.8,
      xp: 120,
      status: "pending",
      description: "Explore historic architecture and culture",
      estimated_duration: "4 hours",
    },
    {
      place_id: `${city.toLowerCase()}_005`,
      name: `${city} Viewpoint`,
      type: "Attraction",
      rating: 4.9,
      xp: 150,
      status: "pending",
      description: "Breathtaking panoramic views of the city",
      estimated_duration: "1 hour",
    },
  ];
}
