import { Booking, cancelBooking as cancelBookingService, createBooking, fetchUserBookings } from '@/services/bookingService';
import { useUser } from '@clerk/clerk-expo';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
const useCallback = (React as any).useCallback;

type BookingsContextType = {
    bookings: Booking[];
    loading: boolean;
    addBooking: (booking: Omit<Booking, 'id' | 'created_at' | 'clerk_user_id'>) => Promise<boolean>;
    cancelBooking: (id: string) => Promise<boolean>;
    refreshBookings: () => Promise<void>;
};

const BookingsContext = createContext<BookingsContextType | undefined>(undefined);

export const BookingsProvider = ({ children }: { children: ReactNode }) => {
    const { user, isSignedIn, isLoaded } = useUser();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(false);

    const clerkUserId = isLoaded && isSignedIn && user ? user.id : null;

    const refreshBookings = useCallback(async () => {
        if (!clerkUserId) {
            setBookings([]);
            return;
        }
        setLoading(true);
        try {
            const data = await fetchUserBookings(clerkUserId);
            setBookings(data);
        } catch (e) {
            console.error('Failed to refresh bookings:', e);
        } finally {
            setLoading(false);
        }
    }, [clerkUserId]);

    useEffect(() => {
        if (isLoaded) {
            refreshBookings();
        }
    }, [refreshBookings, isLoaded]);

    const addBooking = async (booking: Omit<Booking, 'id' | 'created_at' | 'clerk_user_id'>): Promise<boolean> => {
        if (!clerkUserId) return false;

        try {
            const newBooking = await createBooking({
                ...booking,
                clerk_user_id: clerkUserId,
            });

            if (newBooking) {
                setBookings(prev => [newBooking, ...prev]);
                return true;
            }
        } catch (err) {
            console.error('BookingsContext: Error adding booking:', err);
        }
        return false;
    };

    const handleCancelBooking = async (id: string): Promise<boolean> => {
        if (!clerkUserId) return false;

        try {
            const success = await cancelBookingService(id, clerkUserId);
            if (success) {
                setBookings(prev =>
                    prev.map(b => b.id === id ? { ...b, status: 'Cancelled' as const } : b)
                );
                return true;
            }
        } catch (err) {
            console.error('BookingsContext: Error cancelling booking:', err);
        }
        return false;
    };

    return (
        <BookingsContext.Provider value={{ bookings, loading, addBooking, cancelBooking: handleCancelBooking, refreshBookings }}>
            {children}
        </BookingsContext.Provider>
    );
};

export const useBookings = () => {
    const context = useContext(BookingsContext);
    if (!context) throw new Error('useBookings must be used within a BookingsProvider');
    return context;
};
