
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { Challenge, getChallengeById } from './challengeService';
import { addBadgeToUser, addXPToUser } from './userService';
import { showSuccessNotification, showInfoNotification } from './notificationService';

interface UserChallengeProgress {
  userId: string;
  challengeId: string;
  currentValue: number;
  completed: boolean;
  completedAt?: Date;
}

export const getUserChallengeProgress = async (userId: string, challengeId: string): Promise<UserChallengeProgress | null> => {
  const docRef = doc(db, 'userChallenges', `${userId}_${challengeId}`);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as UserChallengeProgress;
  } else {
    return null;
  }
};

export const initializeUserChallengeProgress = async (userId: string, challenge: Challenge) => {
  const docRef = doc(db, 'userChallenges', `${userId}_${challenge.id}`);
  const newProgress: UserChallengeProgress = {
    userId,
    challengeId: challenge.id,
    currentValue: 0,
    completed: false,
  };
  await setDoc(docRef, newProgress);
  return newProgress;
};

export const updateUserChallengeProgress = async (userId: string, challengeId: string, valueToAdd: number) => {
  const docRef = doc(db, 'userChallenges', `${userId}_${challengeId}`);
  let progress = await getUserChallengeProgress(userId, challengeId);

  if (!progress) {
    const challenge = await getChallengeById(challengeId);
    if (!challenge) return; // Challenge not found
    progress = await initializeUserChallengeProgress(userId, challenge);
  }

  if (progress.completed) return; // Already completed

  await updateDoc(docRef, {
    currentValue: increment(valueToAdd),
  });

  // Re-fetch to check completion status
  const updatedProgress = await getUserChallengeProgress(userId, challengeId);
  const challenge = await getChallengeById(challengeId);

  if (updatedProgress && challenge && updatedProgress.currentValue >= challenge.targetValue && !updatedProgress.completed) {
    await updateDoc(docRef, {
      completed: true,
      completedAt: new Date(),
    });
    // Award XP and badge
    await addXPToUser(userId, challenge.rewardXP);
    showSuccessNotification(`Challenge Completed: ${challenge.name}! You earned ${challenge.rewardXP} XP.`);
    if (challenge.rewardBadge) {
      await addBadgeToUser(userId, challenge.rewardBadge);
      showInfoNotification(`New Badge Unlocked: ${challenge.rewardBadge}!`);
    }
  }
};
