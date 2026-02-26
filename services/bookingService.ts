import { db } from '@/lib/firebase';
import { addDoc, collection, doc, getDocs, orderBy, query, updateDoc, where } from 'firebase/firestore';

export interface Booking {
    id: string;
    clerk_user_id: string;
    listing_id: string | null;
    listing_title: string;
    listing_location: string;
    listing_image: string | null;
    listing_price: number;
    check_in_date: string;
    check_out_date: string;
    nights: number;
    guests: number;
    total_price: number;
    cleaning_fee: number;
    service_fee: number;
    status: 'Upcoming' | 'Completed' | 'Cancelled';
    guest_name: string | null;
    guest_email: string | null;
    guest_phone: string | null;
    message_to_host: string | null;
    payment_method: string;
    created_at: string;
}

export const fetchUserBookings = async (clerkUserId: string): Promise<Booking[]> => {
    try {
        const q = query(
            collection(db, 'bookings'),
            where('clerk_user_id', '==', clerkUserId),
            orderBy('created_at', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
    } catch (err) {
        console.error('Error fetching bookings:', err);
        return [];
    }
};

export const createBooking = async (booking: Omit<Booking, 'id' | 'created_at'>): Promise<Booking | null> => {
    try {
        const payload = {
            ...booking,
            status: 'Upcoming',
            created_at: new Date().toISOString()
        };
        const docRef = await addDoc(collection(db, 'bookings'), payload);
        return {
            id: docRef.id,
            ...payload
        } as Booking;
    } catch (err) {
        console.error('Error creating booking:', err);
        return null;
    }
};

export const cancelBooking = async (bookingId: string, clerkUserId: string): Promise<boolean> => {
    try {
        const docRef = doc(db, 'bookings', bookingId);
        await updateDoc(docRef, {
            status: 'Cancelled',
            updated_at: new Date().toISOString()
        });
        return true;
    } catch (err) {
        console.error('Error cancelling booking:', err);
        return false;
    }
};

export const fetchAllBookings = async (): Promise<Booking[]> => {
    try {
        const q = query(
            collection(db, 'bookings'),
            orderBy('created_at', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
    } catch (err) {
        console.error('Error fetching all bookings:', err);
        return [];
    }
};
