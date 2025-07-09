
import { collection, addDoc, query, orderBy, limit, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export interface Activity {
  id?: string;
  userId: string;
  userName: string;
  type: 'kye_created' | 'kye_contributed' | 'kye_payout' | 'challenge_completed' | 'role_assigned';
  message: string;
  timestamp: any; // Firebase Timestamp
  kyeId?: string;
}

export const addActivity = async (activity: Omit<Activity, 'id' | 'timestamp'>) => {
  await addDoc(collection(db, 'activities'), {
    ...activity,
    timestamp: serverTimestamp(),
  });
};

export const getRecentActivities = async (limitCount: number = 10): Promise<Activity[]> => {
  const q = query(collection(db, 'activities'), orderBy('timestamp', 'desc'), limit(limitCount));
  const querySnapshot = await getDocs(q);
  const activities: Activity[] = [];
  querySnapshot.forEach((doc) => {
    activities.push({ id: doc.id, ...doc.data() } as Activity);
  });
  return activities;
};
