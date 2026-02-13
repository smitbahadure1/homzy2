import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@clerk/clerk-expo';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

const SLIDES = [
    {
        id: '1',
        title: 'Discover your\ndream home',
        subtitle: 'Find the perfect place to stay for your vacation, business trip, or weekend getaway.',
        image: 'https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', // Modern House
    },
    {
        id: '2',
        title: 'Stay comfortably\nanywhere',
        subtitle: 'From cozy cottages to luxury villas, find accommodations that match your style.',
        image: 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', // Interior
    },
    {
        id: '3',
        title: 'Experience local\nliving',
        subtitle: 'Immerse yourself in the local culture and live like a local wherever you go.',
        image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', // Lifestyle/Travel
    },
    {
        id: '4', // Final Action Slide
        title: 'Let’s get\nstarted',
        subtitle: 'Sign in or create an account to start your journey with Homzy.',
        image: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', // Welcoming/Door
    }
];

export default function OnboardingScreen() {

    // ... inside OnboardingScreen
    const { isSignedIn } = useAuth();
    const router = useRouter();
    const { theme, isDarkMode } = useTheme();
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    // Check if first launch
    useEffect(() => {
        const checkFirstLaunch = async () => {
            const hasLaunched = await AsyncStorage.getItem('hasLaunched');
            if (hasLaunched === 'true' && !isSignedIn) {
                router.replace('/(tabs)');
            }
        };
        checkFirstLaunch();
    }, []);

    // If User is already logged in, skip onboarding
    if (isSignedIn) {
        return <Redirect href="/(tabs)" />;
    }

    const handleNext = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        if (currentIndex < SLIDES.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
        } else {
            await AsyncStorage.setItem('hasLaunched', 'true');
            router.replace('/(tabs)');
        }
    };

    const handleSkip = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        flatListRef.current?.scrollToIndex({ index: SLIDES.length - 1 });
    };

    const handleLogin = async () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await AsyncStorage.setItem('hasLaunched', 'true');
        // Push to login screen with param
        router.push({ pathname: '/login', params: { initialMode: 'login' } });
    };

    const handleSignUp = async () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await AsyncStorage.setItem('hasLaunched', 'true');
        // Push to login screen with param
        router.push({ pathname: '/login', params: { initialMode: 'signup' } });
    };


    const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    const renderItem = ({ item, index }: { item: typeof SLIDES[0], index: number }) => (
        <View style={{ width, flex: 1 }}>
            <ImageBackground
                source={{ uri: item.image }}
                style={styles.imageBackground}
                resizeMode="cover"
            >
                <LinearGradient
                    colors={['transparent', isDarkMode ? '#000' : '#FFF']}
                    locations={[0.5, 1]}
                    style={styles.gradient}
                />
            </ImageBackground>

            <View style={[styles.contentContainer, { backgroundColor: theme.bg }]}>
                <View style={[styles.textContainer, { width: width - 48 }]}>
                    <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
                    <Text style={[styles.subtitle, { color: theme.subText }]}>{item.subtitle}</Text>
                </View>

                {/* Show Actions only on the last slide */}
                {index === SLIDES.length - 1 && (
                    <View style={styles.actionBlock}>
                        <TouchableOpacity
                            style={[styles.primaryBtn, { backgroundColor: theme.text }]}
                            onPress={handleLogin}
                        >
                            <Text style={[styles.btnText, { color: theme.bg }]}>Log In</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.secondaryBtn, { borderColor: theme.border }]}
                            onPress={handleSignUp}
                        >
                            <Text style={[styles.secondaryBtnText, { color: theme.text }]}>Sign Up</Text>
                        </TouchableOpacity>

                        <View style={styles.socialRow}>
                            <TouchableOpacity style={[styles.socialBtn, { borderColor: theme.border }]}>
                                <Image source={{ uri: 'https://img.icons8.com/color/48/google-logo.png' }} style={styles.icon} />
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.socialBtn, { borderColor: theme.border }]}>
                                <FontAwesome5 name="apple" size={20} color={theme.text} />
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.socialBtn, { borderColor: theme.border }]}>
                                <FontAwesome5 name="facebook" size={20} color="#1877F2" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            <StatusBar style="light" />

            <FlatList
                ref={flatListRef}
                data={SLIDES}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
                bounces={false}
            />

            {/* Pagination & Navigation Footer */}
            {currentIndex < SLIDES.length - 1 && (
                <View style={[styles.footer, { backgroundColor: theme.bg }]}>
                    {/* Dots */}
                    <View style={styles.pagination}>
                        {SLIDES.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.dot,
                                    { backgroundColor: index === currentIndex ? theme.text : theme.border, width: index === currentIndex ? 24 : 8 }
                                ]}
                            />
                        ))}
                    </View>

                    {/* Nav Buttons */}
                    <View style={styles.navRow}>
                        <TouchableOpacity onPress={handleSkip}>
                            <Text style={[styles.skipText, { color: theme.subText }]}>Skip</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.nextBtn, { backgroundColor: theme.text }]} onPress={handleNext}>
                            <Ionicons name="arrow-forward" size={24} color={theme.bg} />
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    imageBackground: {
        width: width,
        height: height * 0.65, // Takes top 65%
        justifyContent: 'flex-end',
    },
    gradient: {
        width: '100%',
        height: '100%',
    },
    contentContainer: {
        flex: 1,
        marginTop: -50,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingTop: 40,
        alignItems: 'center',
    },
    textContainer: {
        paddingHorizontal: 0,
        marginBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 12,
        lineHeight: 40,
    },
    subtitle: {
        fontSize: 16,
        lineHeight: 24,
    },
    // Footer for Nav
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 24,
        paddingBottom: 40,
        paddingTop: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pagination: {
        flexDirection: 'row',
        gap: 8,
    },
    dot: {
        height: 8,
        borderRadius: 4,
    },
    navRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 24,
    },
    skipText: {
        fontSize: 16,
        fontWeight: '600',
    },
    nextBtn: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Action Block (Final Slide)
    actionBlock: {
        width: width - 48,
        marginTop: 10,
    },
    primaryBtn: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 16,
    },
    btnText: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    secondaryBtn: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        marginBottom: 32,
    },
    secondaryBtnText: {
        fontWeight: '600',
        fontSize: 16,
    },
    socialRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
    },
    socialBtn: {
        width: 56,
        height: 56,
        borderRadius: 28,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        width: 24,
        height: 24,
    },
});
