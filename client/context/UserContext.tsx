import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "./AuthContext";
import {
  getUserWithChapters,
  createUser as createFirestoreUser,
  createChapter as createFirestoreChapter,
  togglePlaceStatus,
  tierFromXp,
} from "@/lib/firestore-service";
import type { User, BasicInfo, Preferences, Chapter, Place } from "@/lib/firebase-types";

export type Language = {
  code: string; // e.g., "en-US"
  name: string; // e.g., "English"
};

// Re-export types for backward compatibility
export type { BasicInfo, Preferences, Place, Chapter };

export type Stats = {
  xp: number;
  tier: string;
  chapters_created: number;
  places_visited: number;
};

// Client user type (includes chapters as array)
export type UserContextUser = {
  uid: string;
  basic_info: BasicInfo;
  preferences: Preferences;
  stats: Stats;
  chapters: Chapter[];
};

export type UserContextType = {
  user: UserContextUser | null;
  loading: boolean;
  setUser: (u: UserContextUser | null) => void;
  completeOnboarding: (data: {
    basic_info: BasicInfo;
    preferences: Preferences;
  }) => Promise<void>;
  addChapter: (input: {
    city: string;
    country?: string;
    description?: string;
  }) => Promise<Chapter>;
  togglePlaceDone: (chapterId: string, placeId: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  t: (key: string) => string;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

// Minimal i18n dictionary
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { currentUser } = useAuth();
  const { t } = useTranslation();
  const [user, setUser] = useState<UserContextUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user data from Firestore when auth state changes
  useEffect(() => {
    async function loadUser() {
      if (!currentUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userData = await getUserWithChapters(currentUser.uid);
        if (userData) {
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error loading user:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [currentUser]);

  const refreshUser = async () => {
    if (!currentUser) return;
    
    try {
      const userData = await getUserWithChapters(currentUser.uid);
      if (userData) {
        setUser(userData);
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  };

  const completeOnboarding = async (data: {
    basic_info: BasicInfo;
    preferences: Preferences;
  }) => {
    if (!currentUser) {
      throw new Error("No authenticated user");
    }

    try {
      await createFirestoreUser(currentUser.uid, data);
      const userData = await getUserWithChapters(currentUser.uid);
      if (userData) {
        setUser(userData);
      }
    } catch (error) {
      console.error("Error completing onboarding:", error);
      throw error;
    }
  };

  const generateAITasks = async (city: string, country?: string): Promise<Place[]> => {
    try {
      if (!user) return [];

      // Get language name from localStorage language code
      const languageCode = localStorage.getItem("selectedLanguage") || "en";
      const languageMap: { [key: string]: string } = {
        en: "English",
        hi: "Hindi",
        te: "Telugu",
        kn: "Kannada",
        mr: "Marathi",
        pa: "Punjabi",
        gu: "Gujarati",
        or: "Odia",
        bn: "Bengali",
        ml: "Malayalam",
        ta: "Tamil",
        ur: "Urdu",
      };
      const language = languageMap[languageCode] || "English";

      const response = await fetch("/api/generate-tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          city,
          country: country || "",
          preferences: user.preferences,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate tasks");
      }

      const data = await response.json();
      
      // Convert AI tasks to Place format with XP
      return data.tasks.map((task: any) => ({
        place_id: task.place_id,
        name: task.name,
        type: task.type,
        rating: task.rating,
        status: "pending" as const,
        xp: task.xp, // XP from AI based on popularity
        description: task.description,
        estimated_duration: task.estimated_duration,
      }));
    } catch (error) {
      console.error("Failed to generate AI tasks, using fallback:", error);
      // Fallback to simple mock if API fails
      return [
        {
          place_id: `${city.toLowerCase()}_001`,
          name: `${city} Central Park`,
          type: "Nature",
          rating: 4.6,
          status: "pending",
          xp: 80,
        },
        {
          place_id: `${city.toLowerCase()}_002`,
          name: `${city} Museum`,
          type: "Museum",
          rating: 4.5,
          status: "pending",
          xp: 100,
        },
        {
          place_id: `${city.toLowerCase()}_003`,
          name: `${city} Food Market`,
          type: "Food",
          rating: 4.7,
          status: "pending",
          xp: 60,
        },
      ];
    }
  };

  const addChapter = async (input: {
    city: string;
    country?: string;
    description?: string;
  }): Promise<Chapter> => {
    if (!currentUser) {
      throw new Error("User not authenticated. Please log in.");
    }
    
    if (!user) {
      throw new Error("User profile not loaded. Please complete onboarding first.");
    }

    try {
      // Generate AI-powered tasks based on user preferences
      const aiTasks = await generateAITasks(input.city, input.country);

      const newChapter = await createFirestoreChapter(currentUser.uid, {
        city: input.city,
        country: input.country || "",
        description: input.description,
        ai_suggested_places: aiTasks,
      });

      // Refresh user data to get updated stats
      await refreshUser();

      return newChapter;
    } catch (error) {
      console.error("Error adding chapter:", error);
      throw error;
    }
  };

  const togglePlaceDone = async (chapterId: string, placeId: string) => {
    if (!currentUser) return;

    try {
      await togglePlaceStatus(currentUser.uid, chapterId, placeId);
      // Refresh user data to get updated stats and chapters
      await refreshUser();
    } catch (error) {
      console.error("Error toggling place status:", error);
      throw error;
    }
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      setUser,
      completeOnboarding,
      addChapter,
      togglePlaceDone,
      refreshUser,
      t,
    }),
    [user, loading, currentUser],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}

// Export tierFromXp for backward compatibility
export { tierFromXp };
