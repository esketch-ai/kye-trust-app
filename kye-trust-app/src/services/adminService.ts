
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const ADMIN_DOC_ID = 'adminUids';

interface AdminConfig {
  uids: string[];
}

export const getAdminUids = async (): Promise<string[]> => {
  const docRef = doc(db, 'config', ADMIN_DOC_ID);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return (docSnap.data() as AdminConfig).uids || [];
  } else {
    // Initialize if not exists
    await setDoc(docRef, { uids: [] });
    return [];
  }
};

export const addAdminUid = async (uid: string) => {
  const currentUids = await getAdminUids();
  if (!currentUids.includes(uid)) {
    await setDoc(doc(db, 'config', ADMIN_DOC_ID), { uids: [...currentUids, uid] });
    console.log(`Added ${uid} to admin UIDs.`);
  }
};

export const removeAdminUid = async (uid: string) => {
  const currentUids = await getAdminUids();
  const newUids = currentUids.filter(adminUid => adminUid !== uid);
  await setDoc(doc(db, 'config', ADMIN_DOC_ID), { uids: newUids });
  console.log(`Removed ${uid} from admin UIDs.`);
};

export const isAdmin = async (uid: string): Promise<boolean> => {
  const adminUids = await getAdminUids();
  return adminUids.includes(uid);
};
