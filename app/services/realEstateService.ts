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
}

import { supabase } from '@/lib/supabase';

// Helper to format price to INR
const formatPrice = (price: number) => {
    return `₹ ${price.toLocaleString('en-IN')}`;
};

export const fetchRealEstateData = async (): Promise<Property[]> => {
    try {
        const { data, error } = await supabase
            .from('listings')
            .select('*');

        if (error) {
            console.error('Error fetching listings:', error);
            throw error;
        }

        if (!data) return [];

        return data.map((item: any) => ({
            id: item.id,
            title: item.title,
            location: item.location,
            price: formatPrice(item.price), // Convert DB integer to formatted string
            image: item.image_url,
            category: item.category || 'Luxury',
            rating: Number(item.rating) || 4.5,
            beds: item.beds || 2,
            baths: item.baths || 1,
            sqft: item.sqft || 1000,
            distance: `${Math.floor(50 + Math.random() * 400)} kilometers away`, // Still random for demo
            dates: 'Nov 12 - 17', // Still hardcoded for demo
            frequency: 'night'
        }));
    } catch (err) {
        console.error('Unexpected error:', err);
        return [];
    }
};
