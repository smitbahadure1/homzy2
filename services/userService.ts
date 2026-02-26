import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';

export interface UserProfile {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    image_url: string;
    isAdmin?: boolean;
    created_at?: string;
}

export const checkIsAdminDb = async (email: string | undefined | null): Promise<boolean> => {
    if (!email) return false;

    try {
        const q = query(collection(db, 'users'), where('email', '==', email));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            return snapshot.docs[0].data().isAdmin === true;
        }
    } catch (e) {
        console.error("Error checking admin status:", e);
    }
    return false;
};

export const saveUserToDB = async (user: UserProfile): Promise<boolean> => {
    try {
        const userRef = doc(db, 'users', user.id);
        const docSnap = await getDoc(userRef);

        if (!docSnap.exists()) {
            // New user, defaults to non-admin. Admin MUST be set manually in DB.
            await setDoc(userRef, {
                ...user,
                isAdmin: false,
                created_at: new Date().toISOString()
            });
            return false;
        } else {
            // Existing user, preserve their DB isAdmin value!
            const firestoreIsAdmin = docSnap.data().isAdmin === true;

            await updateDoc(userRef, {
                ...user,
                isAdmin: firestoreIsAdmin
            });
            return firestoreIsAdmin;
        }
    } catch (err) {
        console.error('Error saving user to DB:', err);
        return false;
    }
};

export const fetchAllUsers = async (): Promise<UserProfile[]> => {
    try {
        const q = query(collection(db, 'users'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => doc.data() as UserProfile);
    } catch (e) {
        console.error('Error fetching all users:', e);
        return [];
    }
};
