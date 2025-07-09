
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export interface ChatMessage {
  id?: string;
  kyeId: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: any; // Firebase Timestamp
}

export const sendMessage = async (kyeId: string, userId: string, userName: string, message: string) => {
  await addDoc(collection(db, 'kyeChats', kyeId, 'messages'), {
    userId,
    userName,
    message,
    timestamp: serverTimestamp(),
  });
};

export const subscribeToChat = (kyeId: string, callback: (messages: ChatMessage[]) => void) => {
  const q = query(collection(db, 'kyeChats', kyeId, 'messages'), orderBy('timestamp'));
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const messages: ChatMessage[] = [];
    querySnapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() } as ChatMessage);
    });
    callback(messages);
  });
  return unsubscribe;
};
