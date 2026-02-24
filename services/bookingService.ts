import { supabase } from '@/lib/supabase';

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
        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('clerk_user_id', clerkUserId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching bookings:', error);
            return [];
        }

        return data || [];
    } catch (err) {
        console.error('Unexpected error fetching bookings:', err);
        return [];
    }
};

export const createBooking = async (booking: Omit<Booking, 'id' | 'created_at'>): Promise<Booking | null> => {
    try {
        // Always force status to Upcoming for new bookings
        const payload = { ...booking, status: 'Upcoming' };

        const { data, error } = await supabase
            .from('bookings')
            .insert(payload)
            .select()
            .single();

        if (error) {
            console.error('Error creating booking:', error);
            return null;
        }

        return data;
    } catch (err) {
        console.error('Unexpected error creating booking:', err);
        return null;
    }
};

export const cancelBooking = async (bookingId: string, clerkUserId: string): Promise<boolean> => {
    try {
        const { data, error } = await supabase
            .from('bookings')
            .update({ status: 'Cancelled', updated_at: new Date().toISOString() })
            .eq('id', bookingId)
            .eq('clerk_user_id', clerkUserId)
            .select('id');

        if (error) {
            console.error('Error cancelling booking:', error);
            return false;
        }

        return !!(data && data.length > 0);
    } catch (err) {
        console.error('Unexpected error cancelling booking:', err);
        return false;
    }
};
