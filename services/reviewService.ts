import { supabase } from '@/lib/supabase';

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
    limit: number = 50,
    offset: number = 0
): Promise<{ reviews: Review[]; total: number }> => {
    if (limit <= 0) return { reviews: [], total: 0 };
    const end = offset + limit - 1;

    try {
        const { data, error, count } = await supabase
            .from('reviews')
            .select('id, listing_id, reviewer_name, reviewer_avatar, rating, comment, created_at', { count: 'exact' })
            .eq('listing_id', listingId)
            .order('created_at', { ascending: false })
            .range(offset, end);

        if (error) {
            console.error('Error fetching reviews:', error);
            return { reviews: [], total: 0 };
        }

        return { reviews: data || [], total: count ?? 0 };
    } catch (err) {
        console.error('Unexpected error fetching reviews:', err);
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
        const { data, error } = await supabase
            .from('reviews')
            .insert({ ...review, clerk_user_id: clerkUserId })
            .select('id, listing_id, reviewer_name, reviewer_avatar, rating, comment, created_at')
            .single();

        if (error) {
            // Handle unique constraint violation (duplicate review)
            if (error.code === '23505') {
                console.error('Duplicate review: user already reviewed this listing');
                return null;
            }
            console.error('Error creating review:', error);
            return null;
        }

        return data;
    } catch (err) {
        console.error('Unexpected error creating review:', err);
        return null;
    }
};

export const fetchAverageRating = async (listingId: string): Promise<{ average: number; count: number }> => {
    try {
        const { data, error } = await supabase
            .from('reviews')
            .select('rating')
            .eq('listing_id', listingId);

        if (error) {
            console.error('Error fetching average rating:', error);
            return { average: 0, count: 0 };
        }

        if (!data || data.length === 0) {
            return { average: 0, count: 0 };
        }

        const sum = data.reduce((acc, r) => acc + Number(r.rating), 0);
        return { average: parseFloat((sum / data.length).toFixed(1)), count: data.length };
    } catch (err) {
        console.error('Unexpected error fetching average rating:', err);
        return { average: 0, count: 0 };
    }
};
