
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useFavorites } from '@/context/FavoritesContext';

const { width } = Dimensions.get('window');

export default function FavoriteScreen() {
    const router = useRouter();
    const { theme, isDarkMode } = useTheme();
    const { favorites } = useFavorites();

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.favRow, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                router.push({ pathname: '/listing/[id]', params: { ...item } });
            }}
        >
            <Image source={{ uri: item.image }} style={styles.rowImage} resizeMode="cover" />

            <View style={styles.rowContent}>
                <View style={styles.titleRow}>
                    <Text style={[styles.rowTitle, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
                    <Ionicons name="heart" size={20} color="#FF3B30" />
                </View>

                <Text style={[styles.rowLocation, { color: theme.subText }]} numberOfLines={1}>{item.location}</Text>

                <View style={styles.rowFooter}>
                    <Text style={[styles.rowPrice, { color: theme.text }]}>{item.price}</Text>
                    <View style={styles.ratingBadge}>
                        <Ionicons name="star" size={10} color="#000" />
                        <Text style={styles.ratingText}>{item.rating}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
            <StatusBar style={isDarkMode ? "light" : "dark"} />

            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Favorites</Text>
                {favorites.length > 0 && (
                    <TouchableOpacity
                        style={[styles.editButton, { backgroundColor: theme.card, borderColor: theme.border }]}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                        }}
                    >
                        <Text style={[styles.editText, { color: theme.text }]}>Edit</Text>
                    </TouchableOpacity>
                )}
            </View>

            {favorites.length > 0 ? (
                <FlatList
                    data={favorites}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContainer}
                    ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: theme.border }]} />}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.emptyState}>
                    <Ionicons name="heart-dislike-outline" size={64} color={theme.subText} />
                    <Text style={[styles.emptyTitle, { color: theme.text }]}>No Favorites Yet</Text>
                    <Text style={[styles.emptySubtitle, { color: theme.subText }]}>Start exploring and save your dream homes!</Text>
                </View>
            )}

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginVertical: 10,
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    listContainer: {
        paddingHorizontal: 20,
    },
    favRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        alignItems: 'center',
    },
    rowImage: {
        width: 90,
        height: 90,
        borderRadius: 16,
        backgroundColor: '#1A1A1A',
        marginRight: 16,
    },
    rowContent: {
        flex: 1,
        // marginLeft: 16, // moved to rowImage marginRight to fix spacing
        height: 90,
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    rowTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
        marginRight: 10,
    },
    rowLocation: {
        fontSize: 14,
    },
    rowFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    rowPrice: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        gap: 4,
    },
    ratingText: {
        color: '#000',
        fontSize: 10,
        fontWeight: 'bold',
    },
    separator: {
        height: 1,
        width: '100%',
        marginVertical: 12, // Added margin for visual separation if used as ItemSeparator
    },
    editButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
    },
    editText: {
        fontSize: 14,
        fontWeight: '600',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
    },
});
