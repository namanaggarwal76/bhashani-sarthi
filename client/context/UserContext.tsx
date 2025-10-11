import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Language = {
  code: string; // e.g., "en-US"
  name: string; // e.g., "English"
};

export type BasicInfo = {
  name: string;
  email: string;
  country: string;
  age: number;
  sex: string;
  language: Language;
};

export type Preferences = {
  interests: string[];
  travel_style: string;
  budget: string;
};

export type Place = {
  place_id: string;
  name: string;
  type: string;
  rating: number;
  status: "done" | "pending";
  visited_on?: number;
};

export type Chapter = {
  id: string;
  city: string;
  country: string;
  description?: string;
  ai_suggested_places: Place[];
};

export type Stats = {
  xp: number;
  tier: string;
  chapters_created: number;
  places_visited: number;
};

export type User = {
  basic_info: BasicInfo;
  preferences: Preferences;
  stats: Stats;
  chapters: Chapter[];
};

const STORAGE_KEY = "sarthi.user";

// Simple tier calculator based on XP
export function tierFromXp(xp: number): string {
  if (xp >= 10000) return "Sarthi Elite";
  if (xp >= 6000) return "World Explorer";
  if (xp >= 3000) return "Pathfinder";
  if (xp >= 1000) return "Trailblazer";
  return "Wanderer";
}

function loadUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function saveUser(user: User) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export type UserContextType = {
  user: User | null;
  setUser: (u: User | null) => void;
  completeOnboarding: (data: {
    basic_info: BasicInfo;
    preferences: Preferences;
  }) => void;
  addChapter: (input: {
    city: string;
    country: string;
    description?: string;
  }) => Chapter;
  togglePlaceDone: (chapterId: string, placeId: string) => void;
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
  const [user, setUser] = useState<User | null>(() => loadUser());

  useEffect(() => {
    if (user) saveUser(user);
  }, [user]);

  const completeOnboarding = (data: {
    basic_info: BasicInfo;
    preferences: Preferences;
  }) => {
    const initial: User = {
      basic_info: data.basic_info,
      preferences: data.preferences,
      stats: {
        xp: 0,
        tier: "Wanderer",
        chapters_created: 0,
        places_visited: 0,
      },
      chapters: [],
    };
    initial.stats.tier = tierFromXp(initial.stats.xp);
    setUser(initial);
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

  const addChapter = (input: {
    city: string;
    country: string;
    description?: string;
  }): Chapter => {
    if (!user) throw new Error("User not initialized");
    const id = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    const newChapter: Chapter = {
      id,
      city: input.city,
      country: input.country,
      description: input.description,
      ai_suggested_places: mockPlaces(input.city),
    };
    const updated: User = {
      ...user,
      chapters: [newChapter, ...user.chapters],
      stats: {
        ...user.stats,
        chapters_created: user.stats.chapters_created + 1,
      },
    };
    setUser(updated);
    return newChapter;
  };

  const togglePlaceDone = (chapterId: string, placeId: string) => {
    if (!user) return;
    const updatedChapters = user.chapters.map((c) => {
      if (c.id !== chapterId) return c;
      const places = c.ai_suggested_places.map((p) => {
        if (p.place_id !== placeId) return p;
        const nextStatus = p.status === "done" ? "pending" : "done";
        return {
          ...p,
          status: nextStatus,
          visited_on: nextStatus === "done" ? Date.now() : undefined,
        };
      });
      return { ...c, ai_suggested_places: places };
    });

    // compute xp changes: +50 per place completed
    const completedCount = updatedChapters
      .flatMap((c) => c.ai_suggested_places)
      .filter((p) => p.status === "done").length;

    const xp = completedCount * 50;

    const updated: User = {
      ...user,
      chapters: updatedChapters,
      stats: {
        ...user.stats,
        xp,
        places_visited: completedCount,
        tier: tierFromXp(xp),
      },
    };
    setUser(updated);
  };

  const t = (key: string) => {
    const lang = user?.basic_info.language.code ?? "en-US";
    const table = dictionary[lang] || dictionary["en-US"];
    return table[key] ?? key;
  };

  const value = useMemo(
    () => ({
      user,
      setUser,
      completeOnboarding,
      addChapter,
      togglePlaceDone,
      t,
    }),
    [user],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
