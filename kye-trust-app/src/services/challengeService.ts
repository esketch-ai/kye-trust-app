
import { collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export interface Challenge {
  id: string;
  name: string;
  description: string;
  rewardXP: number;
  rewardBadge?: string;
  type: 'kyeCompletion' | 'contributionCount'; // Example types
  targetValue: number; // e.g., number of kyes to complete, number of contributions
  isActive: boolean;
}

export const getChallenges = async (): Promise<Challenge[]> => {
  const challengesCol = collection(db, 'challenges');
  const challengeSnapshot = await getDocs(challengesCol);
  const challengeList = challengeSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Challenge[];
  return challengeList;
};

export const getChallengeById = async (id: string): Promise<Challenge | null> => {
  const challengeRef = doc(db, 'challenges', id);
  const docSnap = await getDoc(challengeRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Challenge;
  } else {
    return null;
  }
};

// Function to initialize some mock challenges (for development)
export const initializeMockChallenges = async () => {
  const mockChallenges: Challenge[] = [
    {
      id: 'kye-master-beginner',
      name: 'Kye Master: Beginner',
      description: 'Successfully complete 1 Kye-Trust.',
      rewardXP: 200,
      rewardBadge: 'First Kye Finisher',
      type: 'kyeCompletion',
      targetValue: 1,
      isActive: true,
    },
    {
      id: 'contribution-pro-10',
      name: 'Contribution Pro: 10',
      description: 'Make 10 successful contributions to any Kye-Trusts.',
      rewardXP: 150,
      rewardBadge: 'Consistent Contributor',
      type: 'contributionCount',
      targetValue: 10,
      isActive: true,
    },
    {
      id: 'early-bird-kye',
      name: 'Early Bird Kye',
      description: 'Join a Kye-Trust within the first 24 hours of its creation.',
      rewardXP: 50,
      rewardBadge: 'Early Adopter',
      type: 'kyeCompletion', // This type might need more specific logic later
      targetValue: 1,
      isActive: false, // Example of an inactive challenge
    },
  ];

  for (const challenge of mockChallenges) {
    await setDoc(doc(db, 'challenges', challenge.id), challenge);
  }
  console.log("Mock challenges initialized.");
};
