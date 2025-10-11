import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
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
    country: string;
    description?: string;
  }) => Promise<Chapter>;
  togglePlaceDone: (chapterId: string, placeId: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  t: (key: string) => string;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

// Minimal i18n dictionary
const dictionary: Record<string, Record<string, string>> = {
  "en-US": {
    home: "Home",
    translate: "Translate",
    speech: "Speech",
    ocr: "OCR",
    guide: "Guide",
    welcome: "Welcome",
    tier: "Tier",
    xp: "XP",
    yourChapters: "Your Chapters",
    createChapter: "Create New Chapter",
    startJourney: "Start your journey by creating your first travel chapter.",
    city: "City",
    country: "Country",
    description: "Description",
    add: "Add",
    cancel: "Cancel",
  },
  "hi-IN": {
    home: "होम",
    translate: "अनुवाद",
    speech: "वॉइस",
    ocr: "ओसीआर",
    guide: "गाइड",
    welcome: "स्वागत है",
    tier: "स्तर",
    xp: "एक्सपी",
    yourChapters: "आपके अध्याय",
    createChapter: "नया अध्याय बनाएँ",
    startJourney: "अपनी पहली यात्रा का अध्याय बनाकर शुरुआत करें।",
    city: "शहर",
    country: "देश",
    description: "विवरण",
    add: "जोड़ें",
    cancel: "रद्द करें",
  },
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { currentUser } = useAuth();
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

  const mockPlaces = (city: string): Place[] => {
    // Replace with Google Places in future; mocked now
    return [
      {
        place_id: `${city.toLowerCase()}_001`,
        name: `${city} Central Park`,
        type: "Attraction",
        rating: 4.6,
        status: "pending",
      },
      {
        place_id: `${city.toLowerCase()}_002`,
        name: `Top Food Street`,
        type: "Food",
        rating: 4.4,
        status: "pending",
      },
      {
        place_id: `${city.toLowerCase()}_003`,
        name: `Historic Museum`,
        type: "Museum",
        rating: 4.5,
        status: "pending",
      },
    ];
  };

  const addChapter = async (input: {
    city: string;
    country: string;
    description?: string;
  }): Promise<Chapter> => {
    if (!currentUser) throw new Error("User not authenticated");
    if (!user) throw new Error("User not initialized");

    try {
      const newChapter = await createFirestoreChapter(currentUser.uid, {
        city: input.city,
        country: input.country,
        description: input.description,
        ai_suggested_places: mockPlaces(input.city),
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

  const t = (key: string) => {
    const lang = user?.basic_info.language.code ?? "en-US";
    const table = dictionary[lang] || dictionary["en-US"];
    return table[key] ?? key;
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
