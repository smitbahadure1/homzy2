import { BookingCardSkeleton } from '@/components/Skeletons';
import { useBookings } from '@/context/BookingsContext';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Alert, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Haptics = require('expo-haptics');

export default function BookingScreen() {
    const router = useRouter();
    const { theme, isDarkMode } = useTheme();
    const { bookings, loading, refreshBookings, cancelBooking } = useBookings();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const onRefresh = async () => {
        setIsRefreshing(true);
        try {
            await refreshBookings();
        } catch (err) {
            console.error('BookingScreen: Refresh failed', err);
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleCancelBooking = async (id: string, title: string) => {
        Alert.alert(
            "Cancel Booking",
            `Are you sure you want to cancel your booking for ${title}?`,
            [
                { text: "Keep Booking", style: "cancel" },
                {
                    text: "Cancel Booking",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const success = await cancelBooking(id);
                            if (success) {
                                if (Haptics && Haptics.impactAsync) {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                }
                                Alert.alert("Success", "Your booking has been cancelled.");
                            } else {
                                Alert.alert("Error", "Could not cancel booking. Please try again later.");
                            }
                        } catch (err) {
                            Alert.alert("Error", "Something went wrong.");
                        }
                    }
                }
            ]
        );
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'Upcoming':
                return { bg: '#E3F2FD', text: '#1976D2' };
            case 'Completed':
                return { bg: '#E8F5E9', text: '#388E3C' };
            case 'Cancelled':
                return { bg: '#FFEBEE', text: '#D32F2F' };
            default:
                return { bg: theme.border, text: theme.subText };
        }
    };

    if (loading && !isRefreshing) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
                <StatusBar style={isDarkMode ? "light" : "dark"} />
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Bookings</Text>
                </View>
                <ScrollView contentContainerStyle={styles.listContainer}>
                    {[1, 2, 3].map(i => <BookingCardSkeleton key={`skel-${i}`} />)}
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
            <StatusBar style={isDarkMode ? "light" : "dark"} />
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>My Trips</Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={onRefresh}
                        tintColor={theme.text}
                    />
                }
            >
                {bookings.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="airplane-outline" size={80} color={theme.subText} />
                        <Text style={[styles.emptyTitle, { color: theme.text }]}>No trips booked... yet!</Text>
                        <Text style={[styles.emptySubtitle, { color: theme.subText }]}>
                            Time to dust off your bags and start planning your next adventure.
                        </Text>
                        <TouchableOpacity
                            style={[styles.exploreButton, { backgroundColor: theme.text }]}
                            onPress={() => router.push('/(tabs)')}
                        >
                            <Text style={[styles.exploreButtonText, { color: theme.bg }]}>Start Exploring</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    bookings.map((trip) => {
                        const statusStyle = getStatusStyles(trip.status);
                        const imageSource = trip.listing_image ? (typeof trip.listing_image === 'string' ? { uri: trip.listing_image } : trip.listing_image) : { uri: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg' };

                        return (
                            <View
                                key={trip.id}
                                style={[styles.upcomingCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                                {...({} as any)}
                            >
                                <Image source={imageSource} style={styles.cardImage} />
                                <View style={styles.cardContent}>
                                    <View style={styles.cardHeader}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>{trip.listing_title}</Text>
                                            <Text style={[styles.cardLocation, { color: theme.subText }]}>{trip.listing_location}</Text>
                                        </View>
                                        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                                            <Text style={[styles.statusText, { color: statusStyle.text }]}>{trip.status}</Text>
                                        </View>
                                    </View>

                                    <View style={[styles.divider, { backgroundColor: theme.border }]} />

                                    <View style={styles.tripDetails}>
                                        <View style={styles.detailItem}>
                                            <Ionicons name="calendar-outline" size={16} color={theme.subText} />
                                            <Text style={[styles.detailText, { color: theme.text }]}>{trip.check_in_date} - {trip.check_out_date}</Text>
                                        </View>
                                        <View style={styles.detailItem}>
                                            <Ionicons name="people-outline" size={16} color={theme.subText} />
                                            <Text style={[styles.detailText, { color: theme.text }]}>{trip.guests} {trip.guests === 1 ? 'Guest' : 'Guests'}</Text>
                                        </View>
                                    </View>

                                    <View style={[styles.divider, { backgroundColor: theme.border }]} />

                                    <View style={styles.cardFooter}>
                                        <View>
                                            <Text style={[styles.totalLabel, { color: theme.subText }]}>Total Paid</Text>
                                            <Text style={[styles.totalPrice, { color: theme.text }]}>₹ {trip.total_price?.toLocaleString()}</Text>
                                        </View>
                                        <View style={styles.actionButtons}>
                                            {trip.status === 'Upcoming' && (
                                                <TouchableOpacity
                                                    style={[styles.cancelButton, { borderColor: theme.border }]}
                                                    onPress={() => handleCancelBooking(trip.id, trip.listing_title)}
                                                >
                                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                                </TouchableOpacity>
                                            )}
                                            <TouchableOpacity
                                                style={[styles.detailsButton, { backgroundColor: theme.text }]}
                                                onPress={() => {
                                                    if (Haptics && Haptics.impactAsync) {
                                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                                    }
                                                    router.push(`/listing/${trip.listing_id}`);
                                                }}
                                            >
                                                <Text style={[styles.detailsButtonText, { color: theme.bg }]}>View Details</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        );
                    })
                )}
                <View style={{ height: 100 }} />
            </ScrollView>
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
        fontSize: 32,
        fontWeight: 'bold',
    },
    listContainer: {
        paddingHorizontal: 20,
    },
    upcomingCard: {
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 24,
        borderWidth: 1,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    cardImage: {
        width: '100%',
        height: 180,
    },
    cardContent: {
        padding: 20,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    cardLocation: {
        fontSize: 14,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        width: '100%',
        marginVertical: 15,
    },
    tripDetails: {
        flexDirection: 'row',
        gap: 20,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailText: {
        fontSize: 14,
        fontWeight: '500',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    totalLabel: {
        fontSize: 12,
        marginBottom: 2,
    },
    totalPrice: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    cancelButton: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
    },
    cancelButtonText: {
        color: '#FF385C',
        fontSize: 14,
        fontWeight: '600',
    },
    detailsButton: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 10,
    },
    detailsButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginTop: 20,
    },
    emptySubtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 10,
        paddingHorizontal: 40,
        lineHeight: 22,
    },
    exploreButton: {
        marginTop: 30,
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 30,
    },
    exploreButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
