import { supabase } from '@/lib/supabase';

export interface Property {
    id: string;
    title: string;
    location: string;
    price: string;
    image: string;
    frequency?: string;
    rating?: number;
    beds?: number;
    baths?: number;
    sqft?: number;
    distance?: string;
    dates?: string;
    category?: string;
    description?: string;
    host_name?: string;
    host_image?: string;
    is_superhost?: boolean;
    max_guests?: number;
    amenities?: string[];
}

// Helper to format price to INR
const formatPrice = (price: number) => {
    return `₹ ${price.toLocaleString('en-IN')}`;
};

// Simple deterministic hash from string for stable pseudo-random values
const hashCode = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
};

// Sanitize user input for PostgREST filter expressions
const sanitizeFilterValue = (value: string): string => {
    return value
        .replace(/\\/g, '\\\\')
        .replace(/_/g, '\\_')
        .replace(/[,()%]/g, '');
};

const mapListingToProperty = (item: any): Property => ({
    id: item.id,
    title: item.title,
    location: item.location,
    price: formatPrice(item.price),
    image: item.image_url,
    category: item.category ?? 'Luxury',
    rating: item.rating != null ? Number(item.rating) : 4.5,
    beds: item.beds ?? 2,
    baths: item.baths ?? 1,
    sqft: item.sqft ?? 1000,
    description: item.description ?? '',
    host_name: item.host_name ?? undefined,
    host_image: item.host_image ?? undefined,
    is_superhost: item.is_superhost ?? false,
    max_guests: item.max_guests ?? 4,
    amenities: item.amenities ?? ['wifi', 'parking', 'kitchen', 'ac'],
    distance: `${50 + (hashCode(item.id) % 400)} km away`,
    dates: item.dates ?? undefined,
    frequency: 'night'
});

export const fetchRealEstateData = async (): Promise<Property[]> => {
    try {
        const { data, error } = await supabase
            .from('listings')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching listings:', error);
            throw error;
        }

        if (!data) return [];
        return data.map(mapListingToProperty);
    } catch (err) {
        console.error('Unexpected error:', err);
        return [];
    }
};

export const fetchListingById = async (id: string): Promise<Property | null> => {
    try {
        const { data, error } = await supabase
            .from('listings')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching listing:', error);
            return null;
        }
        return data ? mapListingToProperty(data) : null;
    } catch (err) {
        console.error('Unexpected error:', err);
        return null;
    }
};

export const searchListings = async (query: string, category?: string): Promise<Property[]> => {
    try {
        let queryBuilder = supabase
            .from('listings')
            .select('*');

        if (query) {
            const sanitized = sanitizeFilterValue(query.trim());
            if (sanitized) {
                queryBuilder = queryBuilder.or(`title.ilike.%${sanitized}%,location.ilike.%${sanitized}%`);
            }
        }

        if (category && category !== 'All') {
            queryBuilder = queryBuilder.eq('category', category);
        }

        const { data, error } = await queryBuilder.order('created_at', { ascending: false });

        if (error) {
            console.error('Error searching listings:', error);
            return [];
        }

        return (data || []).map(mapListingToProperty);
    } catch (err) {
        console.error('Unexpected error:', err);
        return [];
    }
};

export const fetchListingsByCategory = async (category: string): Promise<Property[]> => {
    try {
        let queryBuilder = supabase.from('listings').select('*');

        if (category !== 'All') {
            queryBuilder = queryBuilder.eq('category', category);
        }

        const { data, error } = await queryBuilder.order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching by category:', error);
            return [];
        }

        return (data || []).map(mapListingToProperty);
    } catch (err) {
        console.error('Unexpected error:', err);
        return [];
    }
};
