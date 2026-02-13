
import React, { createContext, ReactNode, useContext, useState } from 'react';

export type Trip = {
    id: string;
    status: string;
    image: string;
    location: string;
    title: string;
    date: string;
    price: number;
    guests: number;
};

type BookingsContextType = {
    bookings: Trip[];
    addBooking: (trip: Trip) => void;
    cancelBooking: (id: string) => void;
};

const BookingsContext = createContext<BookingsContextType | undefined>(undefined);

export const BookingsProvider = ({ children }: { children: ReactNode }) => {
    const [bookings, setBookings] = useState<Trip[]>([]);

    const addBooking = (trip: Trip) => {
        setBookings(prev => [trip, ...prev]);
    };

    const cancelBooking = (id: string) => {
        setBookings(prev => prev.filter(b => b.id !== id));
    };

    return (
        <BookingsContext.Provider value={{ bookings, addBooking, cancelBooking }}>
            {children}
        </BookingsContext.Provider>
    );
};

export const useBookings = () => {
    const context = useContext(BookingsContext);
    if (!context) throw new Error('useBookings must be used within a BookingsProvider');
    return context;
};
