import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function NotificationsScreen() {
    const router = useRouter();
    const { theme, isDarkMode } = useTheme();
    const insets = useSafeAreaInsets();

    const notifications = [
        { id: 1, title: 'Welcome to Homzy!', message: 'Start exploring amazing properties and find your next getaway.', time: '2 hours ago', icon: 'home' },
        { id: 2, title: 'Booking Confirmed', message: 'Your trip to Goa has been successfully booked.', time: '1 day ago', icon: 'calendar' },
        { id: 3, title: 'New Message', message: 'The host of Blissful Beach Villa sent you a message.', time: '2 days ago', icon: 'chatbubble' },
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
            <StatusBar style={isDarkMode ? "light" : "dark"} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.text }]}>Notifications</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {notifications.map((item) => (
                    <View key={item.id} style={[styles.notificationCard, { backgroundColor: theme.card, borderColor: theme.border }]} {...({} as any)}>
                        <View style={[styles.iconContainer, { backgroundColor: theme.inputBg }]}>
                            <Ionicons name={item.icon as any} size={24} color={theme.text} />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={[styles.notifTitle, { color: theme.text }]}>{item.title}</Text>
                            <Text style={[styles.notifMessage, { color: theme.subText }]}>{item.message}</Text>
                            <Text style={[styles.notifTime, { color: theme.subText }]}>{item.time}</Text>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    content: {
        padding: 20,
    },
    notificationCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
    },
    notifTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    notifMessage: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 8,
    },
    notifTime: {
        fontSize: 12,
        opacity: 0.7,
    },
});
