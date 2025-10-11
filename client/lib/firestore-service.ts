import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  Timestamp,
  CollectionReference,
  DocumentReference,
} from "firebase/firestore";
import { db } from "./firebase";
import type {
  UserDoc,
  ChapterDoc,
  Chapter,
  Place,
  BasicInfo,
  Preferences,
  Stats,
} from "./firebase-types";

// Collection references
const usersCollection = collection(db, "users");

// Helper: get chapters subcollection reference
function getChaptersCollection(userId: string): CollectionReference {
  return collection(db, `users/${userId}/chapters`);
}

// ============ USER OPERATIONS ============

/**
 * Create a new user document in Firestore
 */
export async function createUser(
  userId: string,
  data: {
    basic_info: BasicInfo;
    preferences: Preferences;
  }
): Promise<void> {
  const userDoc: UserDoc = {
    basic_info: data.basic_info,
    preferences: data.preferences,
    stats: {
      xp: 0,
      tier: "Wanderer",
      chapters_created: 0,
      places_visited: 0,
    },
  };

  await setDoc(doc(usersCollection, userId), userDoc);
}

/**
 * Get user document from Firestore
 */
export async function getUser(userId: string): Promise<UserDoc | null> {
  const userDocRef = doc(usersCollection, userId);
  const userSnapshot = await getDoc(userDocRef);

  if (!userSnapshot.exists()) {
    return null;
  }

  return userSnapshot.data() as UserDoc;
}

/**
 * Update user basic info
 */
export async function updateUserBasicInfo(
  userId: string,
  basicInfo: Partial<BasicInfo>
): Promise<void> {
  const userDocRef = doc(usersCollection, userId);
  await updateDoc(userDocRef, {
    basic_info: basicInfo,
  });
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(
  userId: string,
  preferences: Partial<Preferences>
): Promise<void> {
  const userDocRef = doc(usersCollection, userId);
  await updateDoc(userDocRef, {
    preferences: preferences,
  });
}

/**
 * Update user stats
 */
export async function updateUserStats(
  userId: string,
  stats: Partial<Stats>
): Promise<void> {
  const userDocRef = doc(usersCollection, userId);
  await updateDoc(userDocRef, {
    stats: stats,
  });
}

/**
 * Delete user document
 */
export async function deleteUser(userId: string): Promise<void> {
  const userDocRef = doc(usersCollection, userId);
  await deleteDoc(userDocRef);
}

// ============ CHAPTER OPERATIONS ============

/**
 * Create a new chapter for a user
 */
export async function createChapter(
  userId: string,
  chapterData: {
    city: string;
    country: string;
    description?: string;
    ai_suggested_places?: Place[];
  }
): Promise<Chapter> {
  const chaptersCol = getChaptersCollection(userId);
  const newChapterRef = doc(chaptersCol);

  const chapterDoc: ChapterDoc = {
    city: chapterData.city,
    country: chapterData.country,
    description: chapterData.description || "",
    ai_suggested_places: chapterData.ai_suggested_places || [],
  };

  await setDoc(newChapterRef, chapterDoc);

  // Update user stats
  const userDoc = await getUser(userId);
  if (userDoc) {
    await updateUserStats(userId, {
      chapters_created: userDoc.stats.chapters_created + 1,
    });
  }

  return {
    id: newChapterRef.id,
    ...chapterDoc,
  };
}

/**
 * Get all chapters for a user
 */
export async function getUserChapters(userId: string): Promise<Chapter[]> {
  const chaptersCol = getChaptersCollection(userId);
  const snapshot = await getDocs(chaptersCol);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as ChapterDoc),
  }));
}

/**
 * Get a specific chapter
 */
export async function getChapter(
  userId: string,
  chapterId: string
): Promise<Chapter | null> {
  const chapterDocRef = doc(getChaptersCollection(userId), chapterId);
  const snapshot = await getDoc(chapterDocRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...(snapshot.data() as ChapterDoc),
  };
}

/**
 * Update chapter details
 */
export async function updateChapter(
  userId: string,
  chapterId: string,
  updates: Partial<ChapterDoc>
): Promise<void> {
  const chapterDocRef = doc(getChaptersCollection(userId), chapterId);
  await updateDoc(chapterDocRef, updates);
}

/**
 * Delete a chapter
 */
export async function deleteChapter(
  userId: string,
  chapterId: string
): Promise<void> {
  const chapterDocRef = doc(getChaptersCollection(userId), chapterId);
  await deleteDoc(chapterDocRef);

  // Update user stats
  const userDoc = await getUser(userId);
  if (userDoc) {
    await updateUserStats(userId, {
      chapters_created: Math.max(0, userDoc.stats.chapters_created - 1),
    });
  }
}

// ============ PLACE OPERATIONS ============

/**
 * Toggle place status (done/pending)
 */
export async function togglePlaceStatus(
  userId: string,
  chapterId: string,
  placeId: string
): Promise<void> {
  const chapter = await getChapter(userId, chapterId);
  if (!chapter) throw new Error("Chapter not found");

  const updatedPlaces = chapter.ai_suggested_places.map((place) => {
    if (place.place_id !== placeId) return place;

    const newStatus: "done" | "pending" = place.status === "done" ? "pending" : "done";
    return {
      ...place,
      status: newStatus,
      visited_on: newStatus === "done" ? Timestamp.now() : null,
    };
  });

  await updateChapter(userId, chapterId, {
    ai_suggested_places: updatedPlaces,
  });

  // Update user stats
  const allChapters = await getUserChapters(userId);
  const completedPlaces = allChapters
    .flatMap((c) => c.ai_suggested_places)
    .filter((p) => p.status === "done").length;

  const xp = completedPlaces * 50;
  const tier = tierFromXp(xp);

  await updateUserStats(userId, {
    xp,
    tier,
    places_visited: completedPlaces,
  });
}

/**
 * Add a place to a chapter
 */
export async function addPlaceToChapter(
  userId: string,
  chapterId: string,
  place: Place
): Promise<void> {
  const chapter = await getChapter(userId, chapterId);
  if (!chapter) throw new Error("Chapter not found");

  const updatedPlaces = [...chapter.ai_suggested_places, place];
  await updateChapter(userId, chapterId, {
    ai_suggested_places: updatedPlaces,
  });
}

/**
 * Remove a place from a chapter
 */
export async function removePlaceFromChapter(
  userId: string,
  chapterId: string,
  placeId: string
): Promise<void> {
  const chapter = await getChapter(userId, chapterId);
  if (!chapter) throw new Error("Chapter not found");

  const updatedPlaces = chapter.ai_suggested_places.filter(
    (p) => p.place_id !== placeId
  );

  await updateChapter(userId, chapterId, {
    ai_suggested_places: updatedPlaces,
  });
}

// ============ UTILITY FUNCTIONS ============

/**
 * Calculate tier from XP
 */
export function tierFromXp(xp: number): string {
  if (xp >= 10000) return "Sarthi Elite";
  if (xp >= 6000) return "World Explorer";
  if (xp >= 3000) return "Pathfinder";
  if (xp >= 1000) return "Trailblazer";
  return "Wanderer";
}

/**
 * Get user with all chapters (complete user data)
 */
export async function getUserWithChapters(
  userId: string
): Promise<(UserDoc & { uid: string; chapters: Chapter[] }) | null> {
  const userDoc = await getUser(userId);
  if (!userDoc) return null;

  const chapters = await getUserChapters(userId);

  return {
    uid: userId,
    ...userDoc,
    chapters,
  };
}
