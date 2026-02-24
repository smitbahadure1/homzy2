import { FavoriteRowSkeleton } from '@/components/Skeletons';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Dimensions, FlatList, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
const Haptics = require('expo-haptics');

import { useFavorites } from '@/context/FavoritesContext';

const { width } = Dimensions.get('window');

export default function FavoriteScreen() {
    const router = useRouter();
    const { theme, isDarkMode } = useTheme();
    const { favorites, loading, refreshFavorites, toggleFavorite } = useFavorites();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const onRefresh = async () => {
        setIsRefreshing(true);
        await refreshFavorites();
        setIsRefreshing(false);
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.favoriteItem, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => {
                if (Haptics && Haptics.impactAsync) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                router.push({
                    pathname: '/listing/[id]',
                    params: {
                        id: item.id,
                        title: item.title,
                        location: item.location,
                        price: item.price,
                        image: item.image,
                        rating: String(item.rating),
                        beds: String(item.beds),
                        baths: String(item.baths),
                        sqft: String(item.sqft),
                        frequency: item.frequency || 'night'
                    }
                });
            }}
        >
            <Image source={typeof item.image === 'string' ? { uri: item.image } : item.image} style={styles.itemImage} />
            <View style={styles.itemInfo}>
                <View style={styles.itemHeader}>
                    <Text style={[styles.itemTitle, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
                    <TouchableOpacity
                        onPress={() => {
                            if (Haptics && Haptics.impactAsync) {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            }
                            toggleFavorite(item);
                        }}
                        style={styles.heartButton}
                    >
                        <Ionicons name="heart" size={20} color="#FF385C" />
                    </TouchableOpacity>
                </View>
                <Text style={[styles.itemLocation, { color: theme.subText }]} numberOfLines={1}>{item.location}</Text>
                <View style={styles.itemFooter}>
                    <View style={styles.priceRow}>
                        <Text style={[styles.itemPrice, { color: theme.text }]}>{item.price}</Text>
                        <Text style={[styles.itemFrequency, { color: theme.subText }]}>/{item.frequency || 'night'}</Text>
                    </View>
                    <View style={styles.ratingRow}>
                        <Ionicons name="star" size={12} color="#FFD700" />
                        <Text style={[styles.ratingText, { color: theme.text }]}>{item.rating}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    if (loading && !isRefreshing) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
                <StatusBar style={isDarkMode ? "light" : "dark"} />
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Favorites</Text>
                </View>
                <ScrollView contentContainerStyle={styles.listContent}>
                    {[1, 2, 3, 4, 5].map(i => <FavoriteRowSkeleton key={i} />)}
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
            <StatusBar style={isDarkMode ? "light" : "dark"} />
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Favorites</Text>
            </View>

            <FlatList
                data={favorites}
                renderItem={renderItem}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={onRefresh}
                        tintColor={theme.text}
                        colors={[theme.text]}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="heart-outline" size={64} color={theme.subText} />
                        <Text style={[styles.emptyTitle, { color: theme.text }]}>No favorites yet</Text>
                        <Text style={[styles.emptySubtitle, { color: theme.subText }]}>
                            Tap the heart icon on any property to save it here.
                        </Text>
                        <TouchableOpacity
                            style={[styles.exploreButton, { backgroundColor: theme.text }]}
                            onPress={() => router.push('/(tabs)/explore')}
                        >
                            <Text style={[styles.exploreButtonText, { color: theme.bg }]}>Explore Properties</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    favoriteItem: {
        flexDirection: 'row',
        borderRadius: 16,
        marginBottom: 16,
        padding: 12,
        borderWidth: 1,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    itemImage: {
        width: 100,
        height: 100,
        borderRadius: 12,
    },
    itemInfo: {
        flex: 1,
        marginLeft: 15,
        justifyContent: 'space-between',
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
        marginRight: 10,
    },
    heartButton: {
        padding: 4,
    },
    itemLocation: {
        fontSize: 14,
        marginTop: 2,
    },
    itemFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    itemPrice: {
        fontSize: 15,
        fontWeight: 'bold',
    },
    itemFrequency: {
        fontSize: 12,
        marginLeft: 2,
        marginBottom: 1,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.05)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 3,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 100,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
    },
    emptySubtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 10,
        paddingHorizontal: 40,
    },
    exploreButton: {
        marginTop: 30,
        paddingHorizontal: 25,
        paddingVertical: 12,
        borderRadius: 25,
    },
    exploreButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
