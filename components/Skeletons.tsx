import { useTheme } from '@/context/ThemeContext';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, useWindowDimensions, View, ViewProps } from 'react-native';

const AnimatedPulse = ({ style, ...props }: { style: any } & ViewProps) => {
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
            ])
        );
        animation.start();
        return () => animation.stop();
    }, []);

    // Remove key from props to avoid passing it to Animated.View if it's there
    const { key, ...cleanProps } = props as any;

    return <Animated.View style={[style, { opacity }]} {...cleanProps} />;
};

export const CardSkeleton = () => {
    const { theme } = useTheme();
    const skeletonColor = theme.border;

    return (
        <View
            style={[styles.card, { backgroundColor: theme.card }]}
            accessible={true}
            accessibilityLabel="Loading content"
            accessibilityRole="progressbar"
            accessibilityState={{ busy: true }}
        >
            <AnimatedPulse style={[styles.cardImage, { backgroundColor: skeletonColor }]} />
            <View style={styles.cardContent}>
                <AnimatedPulse style={[styles.titleLine, { backgroundColor: skeletonColor }]} />
                <AnimatedPulse style={[styles.subtitleLine, { backgroundColor: skeletonColor }]} />
                <View style={styles.row}>
                    <AnimatedPulse style={[styles.specLine, { backgroundColor: skeletonColor }]} />
                    <AnimatedPulse style={[styles.specLine, { backgroundColor: skeletonColor }]} />
                </View>
                <AnimatedPulse style={[styles.buttonLine, { backgroundColor: skeletonColor }]} />
            </View>
        </View>
    );
};

export const HomeCardSkeleton = () => {
    const { theme } = useTheme();
    const { width } = useWindowDimensions();
    const skeletonColor = theme.border;
    const cardWidth = width - 40;
    const cardHeight = cardWidth * 1.25;

    return (
        <View
            style={[styles.homeCard, { width: cardWidth, height: cardHeight, backgroundColor: skeletonColor }]}
            accessible={true}
            accessibilityLabel="Loading property"
            accessibilityRole="progressbar"
            accessibilityState={{ busy: true }}
        >
            <AnimatedPulse style={[StyleSheet.absoluteFillObject, { backgroundColor: skeletonColor }]} />
            <View style={styles.homeCardBottom}>
                <AnimatedPulse style={[styles.homeTitleLine, { backgroundColor: 'rgba(255,255,255,0.15)' }]} />
                <AnimatedPulse style={[styles.homeSubLine, { backgroundColor: 'rgba(255,255,255,0.1)' }]} />
                <AnimatedPulse style={[styles.homeButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
            </View>
        </View>
    );
};

export const ExploreCardSkeleton = () => {
    const { theme } = useTheme();
    const { width } = useWindowDimensions();
    const skeletonColor = theme.border;
    const itemWidth = (width - 50) / 2;

    return (
        <View
            style={[styles.gridItem, { width: itemWidth, backgroundColor: theme.card, borderColor: theme.border }]}
            accessible={true}
            accessibilityLabel="Loading property"
            accessibilityRole="progressbar"
            accessibilityState={{ busy: true }}
        >
            <AnimatedPulse style={[styles.gridImage, { backgroundColor: skeletonColor }]} />
            <View style={styles.gridContent}>
                <AnimatedPulse style={[styles.titleLineSmall, { backgroundColor: skeletonColor }]} />
                <AnimatedPulse style={[styles.subtitleLineSmall, { backgroundColor: skeletonColor }]} />
            </View>
        </View>
    );
};

export const BookingCardSkeleton = () => {
    const { theme } = useTheme();
    const skeletonColor = theme.border;

    return (
        <View
            style={[styles.bookingCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            accessible={true}
            accessibilityLabel="Loading trip"
            accessibilityRole="progressbar"
            accessibilityState={{ busy: true }}
        >
            <AnimatedPulse style={[styles.bookingImage, { backgroundColor: skeletonColor }]} />
            <View style={styles.bookingContent}>
                <AnimatedPulse style={[styles.titleLine, { backgroundColor: skeletonColor }]} />
                <AnimatedPulse style={[styles.subtitleLine, { backgroundColor: skeletonColor }]} />
                <AnimatedPulse style={[styles.smallLine, { backgroundColor: skeletonColor }]} />
            </View>
        </View>
    );
};

export const FavoriteRowSkeleton = () => {
    const { theme } = useTheme();
    const skeletonColor = theme.border;

    return (
        <View
            style={[styles.favRow, { backgroundColor: theme.card }]}
            accessible={true}
            accessibilityLabel="Loading favorite"
            accessibilityRole="progressbar"
            accessibilityState={{ busy: true }}
        >
            <AnimatedPulse style={[styles.favImage, { backgroundColor: skeletonColor }]} />
            <View style={styles.favContent}>
                <AnimatedPulse style={[styles.titleLine, { backgroundColor: skeletonColor }]} />
                <AnimatedPulse style={[styles.subtitleLine, { backgroundColor: skeletonColor }]} />
                <AnimatedPulse style={[styles.smallLine, { backgroundColor: skeletonColor }]} />
            </View>
        </View>
    );
};

export const ProfileSkeleton = () => {
    const { theme } = useTheme();
    const skeletonColor = theme.border;

    return (
        <View
            style={styles.profileSkeleton}
            accessible={true}
            accessibilityLabel="Loading profile"
            accessibilityRole="progressbar"
            accessibilityState={{ busy: true }}
        >
            <View style={styles.profileRow}>
                <AnimatedPulse style={[styles.avatarSkeleton, { backgroundColor: skeletonColor }]} />
                <View style={{ flex: 1, marginLeft: 16 }}>
                    <AnimatedPulse style={[styles.titleLine, { backgroundColor: skeletonColor }]} />
                    <AnimatedPulse style={[styles.subtitleLine, { backgroundColor: skeletonColor, marginTop: 8 }]} />
                </View>
            </View>
            {[1, 2, 3].map(i => (
                <View key={`prof-skel-${i}`}>
                    <AnimatedPulse style={[styles.optionSkeleton, { backgroundColor: skeletonColor }]} />
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    homeCard: {
        borderRadius: 24,
        marginBottom: 24,
        overflow: 'hidden',
        position: 'relative',
    },
    homeCardBottom: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
    },
    homeTitleLine: {
        height: 20,
        width: '70%',
        borderRadius: 4,
        marginBottom: 8,
    },
    homeSubLine: {
        height: 14,
        width: '50%',
        borderRadius: 4,
        marginBottom: 16,
    },
    homeButton: {
        height: 48,
        width: '100%',
        borderRadius: 24,
    },
    card: {
        borderRadius: 20,
        marginBottom: 20,
        overflow: 'hidden',
    },
    cardImage: {
        width: '100%',
        height: 200,
    },
    cardContent: {
        padding: 16,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    titleLine: {
        height: 16,
        width: '75%',
        borderRadius: 4,
        marginBottom: 8,
    },
    titleLineSmall: {
        height: 14,
        width: '65%',
        borderRadius: 4,
        marginBottom: 6,
    },
    subtitleLine: {
        height: 12,
        width: '50%',
        borderRadius: 4,
        marginBottom: 12,
    },
    subtitleLineSmall: {
        height: 10,
        width: '40%',
        borderRadius: 4,
    },
    specLine: {
        height: 14,
        width: 80,
        borderRadius: 4,
    },
    smallLine: {
        height: 10,
        width: '35%',
        borderRadius: 4,
    },
    buttonLine: {
        height: 48,
        width: '100%',
        borderRadius: 24,
    },
    gridItem: {
        height: 220,
        marginBottom: 20,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
    },
    gridImage: {
        width: '100%',
        height: '70%',
    },
    gridContent: {
        padding: 10,
    },
    bookingCard: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 24,
        borderWidth: 1,
    },
    bookingImage: {
        width: '100%',
        height: 180,
    },
    bookingContent: {
        padding: 20,
    },
    favRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        alignItems: 'center',
    },
    favImage: {
        width: 90,
        height: 90,
        borderRadius: 16,
        marginRight: 16,
    },
    favContent: {
        flex: 1,
    },
    profileSkeleton: {
        padding: 20,
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    avatarSkeleton: {
        width: 64,
        height: 64,
        borderRadius: 32,
    },
    optionSkeleton: {
        height: 56,
        borderRadius: 12,
        marginBottom: 12,
    },
});
