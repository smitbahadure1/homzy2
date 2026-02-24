import { addFavorite, fetchFavoriteListings, fetchUserFavorites, removeFavorite } from '@/services/favoritesService';
import { Property } from '@/services/realEstateService';
import { useUser } from '@clerk/clerk-expo';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
const useCallback = (React as any).useCallback;

type FavoritesContextType = {
    favorites: Property[];
    favoriteIds: string[];
    loading: boolean;
    toggleFavorite: (property: Property) => Promise<void>;
    isFavorite: (id: string) => boolean;
    refreshFavorites: () => Promise<void>;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
    const { user, isSignedIn, isLoaded } = useUser();
    const [favorites, setFavorites] = useState<Property[]>([]);
    const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const clerkUserId = isLoaded && isSignedIn && user ? user.id : null;

    const refreshFavorites = useCallback(async () => {
        if (!isLoaded) return;

        if (!clerkUserId) {
            setFavorites([]);
            setFavoriteIds([]);
            return;
        }
        setLoading(true);
        try {
            const [ids, listings] = await Promise.all([
                fetchUserFavorites(clerkUserId),
                fetchFavoriteListings(clerkUserId),
            ]);
            setFavoriteIds(ids);
            setFavorites(listings);
        } catch (e) {
            console.error('Failed to refresh favorites:', e);
        } finally {
            setLoading(false);
        }
    }, [clerkUserId, isLoaded]);

    useEffect(() => {
        if (isLoaded) {
            refreshFavorites();
        }
    }, [refreshFavorites, isLoaded]);

    const toggleFavorite = async (property: Property) => {
        if (!clerkUserId) {
            // Guest mode: use local state only
            setFavorites(prev => {
                const exists = prev.some(p => p.id === property.id);
                if (exists) {
                    return prev.filter(p => p.id !== property.id);
                } else {
                    return [...prev, property];
                }
            });
            setFavoriteIds(prev => {
                if (prev.includes(property.id)) {
                    return prev.filter(id => id !== property.id);
                } else {
                    return [...prev, property.id];
                }
            });
            return;
        }

        const isCurrentlyFav = favoriteIds.includes(property.id);

        // Capture snapshots for revert
        const prevIdsSnapshot = [...favoriteIds];
        const prevFavoritesSnapshot = [...favorites];

        // Optimistic update
        if (isCurrentlyFav) {
            setFavoriteIds(prev => prev.filter(id => id !== property.id));
            setFavorites(prev => prev.filter(p => p.id !== property.id));
        } else {
            setFavoriteIds(prev => [...prev, property.id]);
            setFavorites(prev => [...prev, property]);
        }

        try {
            // Persist to DB
            const success = isCurrentlyFav
                ? await removeFavorite(clerkUserId, property.id)
                : await addFavorite(clerkUserId, property.id);

            if (!success) {
                throw new Error('Persistence failed');
            }
        } catch (err) {
            console.error('FavoritesContext: Error toggling favorite:', err);
            // Revert to snapshots on failure
            setFavoriteIds(prevIdsSnapshot);
            setFavorites(prevFavoritesSnapshot);
        }
    };

    const isFavorite = (id: string) => favoriteIds.includes(id);

    return (
        <FavoritesContext.Provider value={{ favorites, favoriteIds, loading, toggleFavorite, isFavorite, refreshFavorites }}>
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (!context) throw new Error('useFavorites must be used within a FavoritesProvider');
    return context;
};
