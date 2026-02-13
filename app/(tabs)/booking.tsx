
import { useBookings } from '@/context/BookingsContext';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function BookingScreen() {
    const router = useRouter();
    const { theme, isDarkMode } = useTheme();
    const { bookings, cancelBooking } = useBookings();

    const upcomingTrips = bookings.filter(b => b.status === 'Upcoming');
    const pastTrips = bookings.filter(b => b.status !== 'Upcoming');

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
            <StatusBar style={isDarkMode ? "light" : "dark"} />
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Trips</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {upcomingTrips.length === 0 ? (
                    <View style={styles.emptyState}>
                        <View style={[styles.emptyIconContainer, { backgroundColor: theme.card }]}>
                            <Ionicons name="airplane-outline" size={32} color={theme.icon} />
                        </View>
                        <Text style={[styles.emptyTitle, { color: theme.text }]}>No trips booked... yet!</Text>
                        <Text style={[styles.emptySubtitle, { color: theme.subText }]}>Time to dust off your bags and start planning your next adventure.</Text>
                        <TouchableOpacity
                            style={[styles.startSearchingButton, { borderColor: theme.text }]}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                                router.push('/(tabs)/explore');
                            }}
                        >
                            <Text style={[styles.startSearchingText, { color: theme.text }]}>Start searching</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Upcoming reservations</Text>
                        {upcomingTrips.map(trip => (
                            <TouchableOpacity
                                key={trip.id}
                                style={[styles.upcomingCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                                activeOpacity={0.9}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                                    router.push({ pathname: '/listing/[id]', params: { ...trip } });
                                }}
                            >
                                <Image source={{ uri: trip.image }} style={styles.upcomingImage} />
                                <View style={styles.upcomingContent}>
                                    <View style={styles.upcomingRow}>
                                        <Text style={[styles.upcomingLocation, { color: theme.text }]}>{trip.location}</Text>
                                        <View style={styles.badge}>
                                            <Text style={styles.badgeText}>Confirmed</Text>
                                        </View>
                                    </View>
                                    <Text style={[styles.upcomingTitle, { color: theme.text }]}>{trip.title}</Text>
                                    <Text style={[styles.upcomingDate, { color: theme.subText }]}>{trip.date}</Text>

                                    <View style={[styles.divider, { backgroundColor: theme.border }]} />

                                    <View style={styles.upcomingActions}>
                                        <TouchableOpacity
                                            style={styles.actionBtn}
                                            onPress={() => router.push({ pathname: '/listing/[id]', params: { ...trip } })}
                                        >
                                            <Text style={[styles.actionBtnText, { color: theme.text }]}>Show details</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.actionBtn}
                                            onPress={() => {
                                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                                Alert.alert(
                                                    "Cancel Reservation",
                                                    "Are you sure you want to cancel this trip?",
                                                    [
                                                        { text: "No", style: "cancel" },
                                                        { text: "Yes, Cancel", style: 'destructive', onPress: () => cancelBooking(trip.id) }
                                                    ]
                                                );
                                            }}
                                        >
                                            <Text style={[styles.actionBtnText, { color: '#FF385C' }]}>Cancel</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {pastTrips.length > 0 && (
                    <View style={[styles.section, { marginTop: 32 }]}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Where you've been</Text>
                        {pastTrips.map(trip => (
                            <TouchableOpacity
                                key={trip.id}
                                style={[styles.pastCard, { backgroundColor: theme.inputBg }]}
                                onPress={() => router.push({ pathname: '/listing/[id]', params: { ...trip } })}
                            >
                                <Image source={{ uri: trip.image }} style={styles.pastImage} />
                                <View style={styles.pastContent}>
                                    <Text style={[styles.pastLocation, { color: theme.text }]}>{trip.location}</Text>
                                    <Text style={[styles.pastTitle, { color: theme.subText }]}>{trip.title}</Text>
                                    <Text style={[styles.pastDate, { color: theme.subText }]}>{trip.date}</Text>
                                </View>
                                <View style={styles.pastStatus}>
                                    <Text style={[styles.pastStatusText, trip.status === 'Cancelled' && { color: '#FF5A5F' }]}>
                                        {trip.status}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
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
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 24,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    scrollContent: {
        padding: 24,
    },
    section: {
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    // Upcoming Card
    upcomingCard: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 24,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    upcomingImage: {
        width: '100%',
        height: 180,
    },
    upcomingContent: {
        padding: 20,
    },
    upcomingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    upcomingLocation: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    badge: {
        backgroundColor: '#FFF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#000',
    },
    upcomingTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    upcomingDate: {
        fontSize: 14,
    },
    divider: {
        height: 1,
        marginVertical: 16,
    },
    upcomingActions: {
        flexDirection: 'row',
        gap: 20,
    },
    actionBtn: {

    },
    actionBtnText: {
        fontSize: 14,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    // Past Card
    pastCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        borderRadius: 12,
        padding: 12,
    },
    pastImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 16,
    },
    pastContent: {
        flex: 1,
    },
    pastLocation: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    pastTitle: {
        fontSize: 12,
        marginVertical: 2,
    },
    pastDate: {
        fontSize: 12,
    },
    pastStatus: {
        marginLeft: 8,
    },
    pastStatusText: {
        fontSize: 12,
        color: '#AAA',
    },
    // Empty State
    emptyState: {
        marginTop: 40,
        alignItems: 'flex-start',
    },
    emptyIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    emptySubtitle: {
        fontSize: 16,
        marginBottom: 32,
        lineHeight: 24,
    },
    startSearchingButton: {
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 8,
        borderWidth: 1,
    },
    startSearchingText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
