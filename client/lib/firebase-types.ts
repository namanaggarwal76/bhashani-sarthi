import { Timestamp } from "firebase/firestore";

// Firebase document types matching the schema

export interface Language {
  code: string; // e.g., "hi-IN"
  name: string; // e.g., "Hindi"
}

export interface BasicInfo {
  name: string;
  email: string;
  country: string;
  age: number;
  language: Language;
}

export interface Preferences {
  interests: string[]; // ["food", "monuments"]
  travel_style: string; // "adventurous"
  budget: string; // "moderate"
}

export interface Stats {
  xp: number;
  tier: string; // "Trailblazer"
  chapters_created: number;
  places_visited: number;
}

export interface Place {
  place_id: string;
  name: string;
  type: string;
  rating: number;
  status: "done" | "pending";
  visited_on?: Timestamp | null; // Firebase Timestamp
  xp?: number; // XP points earned for completing this place
  description?: string; // AI-generated description
  estimated_duration?: string; // Estimated time to complete
}

export interface ChapterDoc {
  city: string;
  country: string;
  description: string;
  ai_suggested_places: Place[];
}

export interface UserDoc {
  basic_info: BasicInfo;
  preferences: Preferences;
  stats: Stats;
}

// Client-side types with string IDs
export interface Chapter extends ChapterDoc {
  id: string;
}

export interface User extends UserDoc {
  uid: string;
  chapters: Chapter[];
}
