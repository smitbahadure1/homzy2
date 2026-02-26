import { db } from '@/lib/firebase';
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';

export const fetchUserFavorites = async (clerkUserId: string): Promise<string[]> => {
    try {
        const q = query(collection(db, 'favorites'), where('clerk_user_id', '==', clerkUserId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => d.data().listing_id);
    } catch (err) {
        console.error('Error fetching favorites:', err);
        return [];
    }
};

export const addFavorite = async (clerkUserId: string, listingId: string): Promise<boolean> => {
    try {
        const docId = `${clerkUserId}_${listingId}`;
        await setDoc(doc(db, 'favorites', docId), {
            clerk_user_id: clerkUserId,
            listing_id: listingId,
            created_at: new Date().toISOString()
        });
        return true;
    } catch (err) {
        console.error('Error adding favorite:', err);
        return false;
    }
};

export const removeFavorite = async (clerkUserId: string, listingId: string): Promise<boolean> => {
    try {
        const docId = `${clerkUserId}_${listingId}`;
        await deleteDoc(doc(db, 'favorites', docId));
        return true;
    } catch (err) {
        console.error('Error removing favorite:', err);
        return false;
    }
};

export const fetchFavoriteListings = async (clerkUserId: string) => {
    try {
        const q = query(collection(db, 'favorites'), where('clerk_user_id', '==', clerkUserId));
        const snapshot = await getDocs(q);

        const listingIds = snapshot.docs.map(d => d.data().listing_id);
        if (listingIds.length === 0) return [];

        const listings = [];
        for (const id of listingIds) {
            const docSnap = await getDoc(doc(db, 'listings', id));
            if (docSnap.exists()) {
                const item = docSnap.data();
                const priceNum = item.price != null && String(item.price).trim() !== '' && !isNaN(Number(item.price)) ? Number(item.price) : null;

                listings.push({
                    id: docSnap.id,
                    title: item.title,
                    location: item.location,
                    price: priceNum !== null ? `₹ ${priceNum.toLocaleString('en-IN')}` : 'N/A',
                    image: item.image_url,
                    category: item.category ?? undefined,
                    rating: item.rating != null ? Number(item.rating) : undefined,
                    beds: item.beds ?? undefined,
                    baths: item.baths ?? undefined,
                    sqft: item.sqft ?? undefined,
                    frequency: item.frequency ?? 'night'
                });
            }
        }

        return listings;
    } catch (err) {
        console.error('Error fetching favorite listings:', err);
        return [];
    }
};
