import { db } from '@/lib/firebase';
import { addDoc, collection, getDocs, limit as limitDocs, orderBy, query, where } from 'firebase/firestore';

export interface Review {
    id: string;
    listing_id: string;
    reviewer_name: string;
    reviewer_avatar: string | null;
    rating: number;
    comment: string;
    created_at: string;
}

export const fetchReviewsForListing = async (
    listingId: string,
    limitNum: number = 50,
    offset: number = 0
): Promise<{ reviews: Review[]; total: number }> => {
    try {
        const q = query(
            collection(db, 'reviews'),
            where('listing_id', '==', listingId),
            orderBy('created_at', 'desc'),
            limitDocs(limitNum)
        );
        const snapshot = await getDocs(q);

        const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
        return { reviews, total: reviews.length };
    } catch (err) {
        console.error('Error fetching reviews:', err);
        return { reviews: [], total: 0 };
    }
};

export const createReview = async (
    review: Omit<Review, 'id' | 'created_at'>,
    clerkUserId: string
): Promise<Review | null> => {
    if (!clerkUserId) {
        console.error('createReview: No authenticated user');
        return null;
    }

    try {
        // Enforce 1 review per user per listing
        const checkQ = query(
            collection(db, 'reviews'),
            where('listing_id', '==', review.listing_id),
            where('clerk_user_id', '==', clerkUserId)
        );
        const existing = await getDocs(checkQ);
        if (!existing.empty) {
            console.error('Duplicate review: user already reviewed this listing');
            return null;
        }

        const payload = {
            ...review,
            clerk_user_id: clerkUserId,
            created_at: new Date().toISOString()
        };

        const docRef = await addDoc(collection(db, 'reviews'), payload);
        return { id: docRef.id, ...payload } as Review;
    } catch (err) {
        console.error('Unexpected error creating review:', err);
        return null;
    }
};

export const fetchAverageRating = async (listingId: string): Promise<{ average: number; count: number }> => {
    try {
        const q = query(collection(db, 'reviews'), where('listing_id', '==', listingId));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return { average: 0, count: 0 };
        }

        let sum = 0;
        snapshot.forEach(doc => {
            sum += Number(doc.data().rating);
        });

        return { average: parseFloat((sum / snapshot.size).toFixed(1)), count: snapshot.size };
    } catch (err) {
        console.error('Error fetching average rating:', err);
        return { average: 0, count: 0 };
    }
};
