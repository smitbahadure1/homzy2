import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, orderBy, query, where } from 'firebase/firestore';

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
    try {
        return `₹ ${price.toLocaleString('en-IN')}`;
    } catch {
        return `₹ ${price.toString()}`;
    }
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

const mapListingToProperty = (item: any, id: string): Property => ({
    id: id,
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
    distance: `${50 + (hashCode(id) % 400)} km away`,
    dates: item.dates ?? undefined,
    frequency: 'night'
});

export const fetchRealEstateData = async (): Promise<Property[]> => {
    try {
        const q = query(collection(db, 'listings'), orderBy('created_at', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => mapListingToProperty(doc.data(), doc.id));
    } catch (err) {
        console.error('Error fetching listings:', err);
        return [];
    }
};

export const fetchListingById = async (id: string): Promise<Property | null> => {
    try {
        const docRef = doc(db, 'listings', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return mapListingToProperty(docSnap.data(), docSnap.id);
        }
        return null;
    } catch (err) {
        console.error('Error fetching listing:', err);
        return null;
    }
};

export const searchListings = async (searchQuery: string, category?: string): Promise<Property[]> => {
    try {
        let q;
        if (category && category !== 'All') {
            q = query(collection(db, 'listings'), where('category', '==', category), orderBy('created_at', 'desc'));
        } else {
            q = query(collection(db, 'listings'), orderBy('created_at', 'desc'));
        }

        const querySnapshot = await getDocs(q);
        let results = querySnapshot.docs.map(doc => mapListingToProperty(doc.data(), doc.id));

        if (searchQuery) {
            const lowerQuery = searchQuery.trim().toLowerCase();
            if (lowerQuery) {
                results = results.filter(p =>
                    p.title.toLowerCase().includes(lowerQuery) ||
                    p.location.toLowerCase().includes(lowerQuery)
                );
            }
        }

        return results;
    } catch (err) {
        console.error('Error searching listings:', err);
        return [];
    }
};

export const fetchListingsByCategory = async (category: string): Promise<Property[]> => {
    try {
        let q;
        if (category !== 'All') {
            q = query(collection(db, 'listings'), where('category', '==', category), orderBy('created_at', 'desc'));
        } else {
            q = query(collection(db, 'listings'), orderBy('created_at', 'desc'));
        }
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => mapListingToProperty(doc.data(), doc.id));
    } catch (err) {
        console.error('Error fetching by category:', err);
        return [];
    }
};
