
import { Property } from '@/services/realEstateService';
import React, { createContext, ReactNode, useContext, useState } from 'react';

type FavoritesContextType = {
    favorites: Property[];
    toggleFavorite: (property: Property) => void;
    isFavorite: (id: string) => boolean;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
    const [favorites, setFavorites] = useState<Property[]>([]);

    const toggleFavorite = (property: Property) => {
        setFavorites(prev => {
            const exists = prev.some(p => p.id === property.id);
            if (exists) {
                return prev.filter(p => p.id !== property.id);
            } else {
                return [...prev, property];
            }
        });
    };

    const isFavorite = (id: string) => favorites.some(p => p.id === id);

    return (
        <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (!context) throw new Error('useFavorites must be used within a FavoritesProvider');
    return context;
};
