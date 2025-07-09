import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db, app } from '../firebase';
import { User as FirebaseUser } from 'firebase/auth';

// Initialize Firebase Functions
const functions = getFunctions(app);
const callUpdateTrustScore = httpsCallable(functions, 'updateTrustScore');

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  level: number;
  levelName?: string; // Added levelName
  xp: number;
  xpToNextLevel: number;
  badges: string[];
  trustScore: number;
  profilePic: string | null;
}

// Helper function to calculate XP needed for the next level
const calculateXpToNextLevel = (level: number): number => {
  // Simple exponential growth for XP needed per level
  return 100 * Math.pow(1.2, level - 1);
};

// Helper function to get level name based on level
const getLevelName = (level: number): string => {
  if (level === 1) return '새싹 계원';
  if (level === 2) return '성장하는 계원';
  if (level === 3) return '든든한 계원';
  if (level === 4) return '베테랑 계원';
  if (level >= 5) return '마스터 계원';
  return '미정';
};

export const getUserProfile = async (user: FirebaseUser): Promise<UserProfile | null> => {
  const userRef = doc(db, 'users', user.uid);
  const docSnap = await getDoc(userRef);

  if (docSnap.exists()) {
    const profileData = docSnap.data() as UserProfile;
    // Ensure new fields exist, provide defaults if not
    if (profileData.xp === undefined) profileData.xp = 0;
    if (profileData.xpToNextLevel === undefined) profileData.xpToNextLevel = calculateXpToNextLevel(profileData.level);
    if (profileData.profilePic === undefined) profileData.profilePic = null; // Default profile picture
    if (profileData.levelName === undefined) profileData.levelName = getLevelName(profileData.level); // Default level name
    return profileData;
  } else {
    const newProfile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || null,
      level: 1,
      levelName: getLevelName(1), // Set initial level name
      xp: 0,
      xpToNextLevel: calculateXpToNextLevel(1),
      badges: [],
      trustScore: 50,
      profilePic: null, // Default profile picture
    };
    await setDoc(userRef, newProfile);
    return newProfile;
  }
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, data);
};

export const addXPToUser = async (uid: string, xpToAdd: number) => {
  const userRef = doc(db, 'users', uid);
  const docSnap = await getDoc(userRef);

  if (docSnap.exists()) {
    let currentProfile = docSnap.data() as UserProfile;
    let newXP = currentProfile.xp + xpToAdd;
    let newLevel = currentProfile.level;
    let newXpToNextLevel = currentProfile.xpToNextLevel;
    let newTrustScore = currentProfile.trustScore;
    let newLevelName = currentProfile.levelName;

    // Level up logic
    while (newXP >= newXpToNextLevel) {
      newXP -= newXpToNextLevel; // Subtract XP for current level
      newLevel++; // Increment level
      newXpToNextLevel = calculateXpToNextLevel(newLevel); // Calculate XP for next level
      newTrustScore = Math.min(100, newTrustScore + 5); // Increase trust score on level up
      newLevelName = getLevelName(newLevel); // Update level name
    }

    // Update trust score based on XP gained (separate from level up bonus)
    newTrustScore = Math.min(100, newTrustScore + Math.floor(xpToAdd / 50));

    await updateUserProfile(uid, {
      xp: newXP,
      level: newLevel,
      xpToNextLevel: newXpToNextLevel,
      trustScore: newTrustScore,
      levelName: newLevelName,
    });
  }
};

export const updateTrustScoreOnKyeCompletion = async (uid: string, success: boolean) => {
  try {
    const result = await callUpdateTrustScore({ uid, success });
    console.log("Trust score update function called successfully:", result.data);
  } catch (error) {
    console.error("Error calling updateTrustScore function:", error);
  }
};

export const addBadgeToUser = async (uid: string, badge: string) => {
  const userRef = doc(db, 'users', uid);
  const docSnap = await getDoc(userRef);

  if (docSnap.exists()) {
    const currentBadges = docSnap.data().badges || [];
    if (!currentBadges.includes(badge)) {
      await updateUserProfile(uid, { badges: [...currentBadges, badge] });
    }
  }
};