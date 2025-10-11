/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * User preferences for personalization
 */
export interface Preferences {
  interests: string[];
  travel_style: string;
  budget: string;
}

/**
 * AI-generated place/task with XP points
 */
export interface AIGeneratedPlace {
  place_id: string;
  name: string;
  type: string;
  rating: number;
  xp: number;
  status: "pending" | "done";
  description?: string;
  estimated_duration?: string;
}

/**
 * Request to generate tasks for a city
 */
export interface GenerateTasksRequest {
  city: string;
  country?: string;
  preferences: Preferences;
}

/**
 * Response with generated tasks
 */
export interface GenerateTasksResponse {
  tasks: AIGeneratedPlace[];
}
