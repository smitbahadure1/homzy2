import { supabase } from '@/lib/supabase';

export const fetchUserFavorites = async (clerkUserId: string): Promise<string[]> => {
    try {
        const { data, error } = await supabase
            .from('favorites')
            .select('listing_id')
            .eq('clerk_user_id', clerkUserId);

        if (error) {
            console.error('Error fetching favorites:', error);
            return [];
        }

        return (data || []).map(f => f.listing_id);
    } catch (err) {
        console.error('Unexpected error fetching favorites:', err);
        return [];
    }
};

export const addFavorite = async (clerkUserId: string, listingId: string): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('favorites')
            .upsert({ clerk_user_id: clerkUserId, listing_id: listingId }, { onConflict: 'clerk_user_id,listing_id' });

        if (error) {
            console.error('Error adding favorite:', error);
            return false;
        }

        return true;
    } catch (err) {
        console.error('Unexpected error adding favorite:', err);
        return false;
    }
};

export const removeFavorite = async (clerkUserId: string, listingId: string): Promise<boolean> => {
    try {
        const { data, error } = await supabase
            .from('favorites')
            .delete()
            .eq('clerk_user_id', clerkUserId)
            .eq('listing_id', listingId)
            .select('clerk_user_id');

        if (error) {
            console.error('Error removing favorite:', error);
            return false;
        }

        // Return false if no row was actually deleted
        return !!(data && data.length > 0);
    } catch (err) {
        console.error('Unexpected error removing favorite:', err);
        return false;
    }
};

export const fetchFavoriteListings = async (clerkUserId: string) => {
    try {
        const { data, error } = await supabase
            .from('favorites')
            .select('listing_id, listings(*)')
            .eq('clerk_user_id', clerkUserId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching favorite listings:', error);
            return [];
        }

        return (data || [])
            .filter(f => f.listings)
            .map((f: any) => {
                const item = f.listings;
                const priceNum = item.price != null && String(item.price).trim() !== '' && !isNaN(Number(item.price)) ? Number(item.price) : null;
                return {
                    id: item.id,
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
                };
            });
    } catch (err) {
        console.error('Unexpected error:', err);
        return [];
    }
};
