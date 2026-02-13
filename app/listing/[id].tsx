

import { useBookings } from '@/context/BookingsContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import { Animated, Dimensions, Image, Modal, Platform, ScrollView, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const HOSTS = [
    { name: 'Rohan', image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100', years: 5, superhost: true },
    { name: 'Sarah', image: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100', years: 3, superhost: false },
    { name: 'Arjun', image: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100', years: 7, superhost: true },
    { name: 'Priya', image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100', years: 2, superhost: false },
    { name: 'David', image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100', years: 4, superhost: true },
    { name: 'Maya', image: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=100', years: 6, superhost: true },
];

export default function ListingDetailScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const { theme, isDarkMode } = useTheme();
    const { isFavorite, toggleFavorite } = useFavorites();
    const { addBooking } = useBookings();
    const [activeSlide, setActiveSlide] = useState(0);
    const [showAllAmenities, setShowAllAmenities] = useState(false);

    // Price Logic
    const parsePrice = (priceStr: any) => {
        if (!priceStr) return 0;
        const numeric = String(priceStr).replace(/[^0-9]/g, '');
        return parseInt(numeric, 10) || 0;
    };

    const {
        id,
        title = 'Luxury Home',
        price = '₹ 1,50,000',
        location = 'Location',
        image = 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg',
        rating = '4.92',
        beds = '3',
        baths = '2',
        sqft = '2000',
        frequency = '/mo'
    } = params;

    const [nights, setNights] = useState(3);
    const [showCalendar, setShowCalendar] = useState(false);
    const [startDate, setStartDate] = useState<number | null>(null);
    const [endDate, setEndDate] = useState<number | null>(null);

    const priceVal = parsePrice(price);
    const cleaningFee = 2500;
    const serviceFee = 1500;

    const calculatedNights = startDate && endDate ? endDate - startDate : nights;
    const calculatedPrice = priceVal * calculatedNights;
    const totalBookingPrice = calculatedPrice + cleaningFee + serviceFee;

    const handleDateSelect = (day: number) => {
        if (!startDate || (startDate && endDate)) {
            setStartDate(day);
            setEndDate(null);
        } else if (startDate && !endDate) {
            if (day > startDate) {
                setEndDate(day);
                setNights(day - startDate);
                setShowCalendar(false);
            } else {
                setStartDate(day);
            }
        }
    };

    const formatCurrency = (amount: number) => {
        return '₹ ' + amount.toLocaleString('en-IN');
    };

    // Booking Form State
    const [isBookingModalVisible, setBookingModalVisible] = useState(false);
    const [step, setStep] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card');
    const [customAlert, setCustomAlert] = useState({ visible: false, title: '', message: '', type: 'error' });
    const [guestCount, setGuestCount] = useState(1);
    const dateInputRef = useRef<TextInput>(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        message: '',
        date: ''
    });

    const handleDateEdit = () => {
        setShowCalendar(true);
    };



    const handleBooking = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        setStep(1);
        setBookingModalVisible(true);
    };

    const submitBooking = () => {
        if (step === 1) {
            if (!startDate || !endDate) {
                setCustomAlert({ visible: true, title: 'Select Dates', message: 'Please select both a Check-in and Check-out date.', type: 'error' });
                return;
            }
            if (!formData.name || !formData.phone || !formData.email) {
                setCustomAlert({ visible: true, title: 'Missing Info', message: 'Please enter your Name, Phone Number, and Email.', type: 'error' });
                return;
            }
            setStep(2);
        } else {
            const newTrip = {
                id: Date.now().toString(),
                status: 'Upcoming',
                image: mainImage,
                location: String(location),
                title: String(title),
                date: startDate && endDate ? `Oct ${startDate} - Oct ${endDate}` : 'Dates TBD',
                price: calculatedPrice,
                guests: guestCount
            };
            addBooking(newTrip); // Fix type error by assuming newTrip matches Trip type or cast if needed. However context expects Trip.

            setBookingModalVisible(false);
            setTimeout(() => {
                setCustomAlert({ visible: true, title: 'Booking Confirmed!', message: 'You are all set! Have a great trip.', type: 'success' });
            }, 500);
        }
    };

    const mainImage = Array.isArray(image) ? image[0] : image;
    const seed = typeof id === 'string' ? id.length + (title?.length || 0) : 100;
    const host = HOSTS[seed % HOSTS.length];

    const isLiked = isFavorite(String(id));

    const handleShare = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        try {
            await Share.share({
                message: `Check out this amazing place in ${location}: ${title} for ${price}!`,
                title: title as string,
            });
        } catch (error) {
            console.log(error);
        }
    };

    const handleFavorite = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        const propertyObj: any = {
            id: String(id),
            title: String(title),
            location: String(location),
            price: String(price),
            image: mainImage,
            rating: Number(rating),
            frequency: String(frequency),
        };
        toggleFavorite(propertyObj);
    };

    const INTERIOR_IMAGES = [
        'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1571470/pexels-photo-1571470.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/279746/pexels-photo-279746.jpeg?auto=compress&cs=tinysrgb&w=800'
    ];
    const GALLERY_IMAGES = [mainImage, ...INTERIOR_IMAGES.slice(0, 4)];

    const handleScroll = (event: any) => {
        const slide = Math.ceil(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width);
        if (slide !== activeSlide) setActiveSlide(slide);
    };

    const FACILITIES = [
        { icon: 'bed-outline', label: `${beds} Bedrooms` },
        { icon: 'water-outline', label: `${baths} Bathrooms` },
        { icon: 'resize-outline', label: `${sqft} sq ft` },
        { icon: 'wifi-outline', label: 'Fast Wifi' },
        { icon: 'desktop-outline', label: 'Workspace' },
        { icon: 'car-outline', label: 'Free Parking' },
        { icon: 'snow-outline', label: 'Air Conditioning' },
        { icon: 'flame-outline', label: 'Heating' },
        { icon: 'restaurant-outline', label: 'Kitchen' },
        { icon: 'lock-closed-outline', label: 'Smart Lock' },
    ];

    const descriptionTemplates = [
        `Experience the pinnacle of luxury in this stunning ${beds}-bedroom residence located in the prestigious ${location}. Featuring a state-of-the-art kitchen, spacious ${baths} bathrooms, and floor-to-ceiling windows offering panoramic views. Perfectly designed for modern living.`,
        `Welcome to your dream home in ${location}! This beautifully appointed property boasts ${sqft} sqft of elegance, including ${beds} master suites and ${baths} spa-like bathrooms. Enjoy the open-concept living area, perfect for entertaining, and a private garden sanctuary.`,
    ];
    const dynamicDescription = descriptionTemplates[seed % descriptionTemplates.length];

    // Header Animation Logic
    const scrollY = useRef(new Animated.Value(0)).current;
    const diffClamp = Animated.diffClamp(scrollY, 0, 100);
    const headerTranslateY = diffClamp.interpolate({
        inputRange: [0, 100],
        outputRange: [0, -100],
        extrapolate: 'clamp'
    });

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            {/* Keeping Status Bar Light for Image Overlays, or can be dynamic if header becomes solid */}
            <StatusBar style="light" />
            <Stack.Screen options={{ headerShown: false }} />

            {/* Nav Header */}
            <Animated.View style={[styles.navHeader, { paddingTop: insets.top + 10, transform: [{ translateY: headerTranslateY }] }]}>
                <TouchableOpacity style={styles.iconBtn} onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                    router.back();
                }}>
                    <Ionicons name="chevron-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <View style={styles.navRight}>
                    <TouchableOpacity style={styles.iconBtn} onPress={handleFavorite}>
                        <Ionicons name={isLiked ? "heart" : "heart-outline"} size={24} color={isLiked ? "#FF385C" : "#FFF"} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn} onPress={handleShare}>
                        <Ionicons name="share-outline" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </Animated.View>

            <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                scrollEventThrottle={16}
            >
                {/* Image Carousel */}
                <View style={styles.carouselContainer}>
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                    >
                        {GALLERY_IMAGES.map((img, index) => (
                            <Image key={index} source={{ uri: img }} style={styles.carouselImage} resizeMode="cover" />
                        ))}
                    </ScrollView>
                    <View style={styles.imageCounter}>
                        <Text style={styles.counterText}>{activeSlide + 1} / {GALLERY_IMAGES.length}</Text>
                    </View>
                </View>

                <View style={styles.content}>
                    {/* Title Header */}
                    <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
                    <Text style={[styles.location, { color: theme.subText }]}>{location}</Text>

                    <View style={styles.ratingRow}>
                        <Ionicons name="star" size={14} color={theme.text} />
                        <Text style={[styles.ratingText, { color: theme.text }]}>{rating} · </Text>
                        <Text style={[styles.reviewsText, { color: theme.subText }]}>84 reviews</Text>
                    </View>

                    <View style={[styles.divider, { backgroundColor: theme.border }]} />

                    {/* Host Info */}
                    <View style={styles.hostRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.sectionHeader, { color: theme.text }]}>Hosted by {host.name}</Text>
                            <Text style={[styles.hostSub, { color: theme.subText }]}>{host.superhost ? 'Superhost · ' : ''}{host.years} years hosting</Text>
                        </View>
                        <Image
                            source={{ uri: host.image }}
                            style={[styles.hostAvatar, { borderColor: theme.border }]}
                        />
                    </View>

                    <View style={[styles.divider, { backgroundColor: theme.border }]} />

                    {/* Features */}
                    <View style={styles.featuresSection}>
                        {host.superhost && (
                            <View style={styles.featureItem}>
                                <Ionicons name="ribbon-outline" size={24} color={theme.text} />
                                <View style={styles.featureText}>
                                    <Text style={[styles.featureTitle, { color: theme.text }]}>{host.name} is a Superhost</Text>
                                    <Text style={[styles.featureSub, { color: theme.subText }]}>Superhosts are experienced, highly rated hosts.</Text>
                                </View>
                            </View>
                        )}
                        <View style={styles.featureItem}>
                            <Ionicons name="location-outline" size={24} color={theme.text} />
                            <View style={styles.featureText}>
                                <Text style={[styles.featureTitle, { color: theme.text }]}>Great location</Text>
                                <Text style={[styles.featureSub, { color: theme.subText }]}>100% of recent guests gave the location a 5-star rating.</Text>
                            </View>
                        </View>
                    </View>

                    <View style={[styles.divider, { backgroundColor: theme.border }]} />

                    {/* Description */}
                    <Text style={[styles.description, { color: theme.subText }]}>
                        {dynamicDescription}
                    </Text>
                    <TouchableOpacity>
                        <Text style={[styles.showMore, { color: theme.text }]}>Show more</Text>
                    </TouchableOpacity>

                    <View style={[styles.divider, { backgroundColor: theme.border }]} />

                    {/* Amenities */}
                    <Text style={[styles.sectionHeader, { color: theme.text }]}>What this place offers</Text>
                    <View style={styles.amenitiesList}>
                        {FACILITIES.slice(0, showAllAmenities ? FACILITIES.length : 5).map((item, index) => (
                            <View key={index} style={styles.amenityRow}>
                                <Ionicons name={item.icon as any} size={24} color={theme.subText} />
                                <Text style={[styles.amenityText, { color: theme.subText }]}>{item.label}</Text>
                            </View>
                        ))}
                    </View>
                    <TouchableOpacity style={[styles.outlineButton, { borderColor: theme.text }]} onPress={() => setShowAllAmenities(!showAllAmenities)}>
                        <Text style={[styles.outlineButtonText, { color: theme.text }]}>
                            {showAllAmenities ? "Show less" : `Show all ${FACILITIES.length} amenities`}
                        </Text>
                    </TouchableOpacity>

                    <View style={[styles.divider, { backgroundColor: theme.border }]} />

                    {/* Things to Know */}
                    <Text style={[styles.sectionHeader, { color: theme.text }]}>Things to know</Text>

                    <View style={styles.thingsContainer}>
                        {/* House Rules */}
                        <View style={styles.thingItem}>
                            <Text style={[styles.thingTitle, { color: theme.text }]}>House rules</Text>
                            <Text style={[styles.thingText, { color: theme.subText }]}>Check-in: After 2:00 PM</Text>
                            <Text style={[styles.thingText, { color: theme.subText }]}>Checkout: 11:00 AM</Text>
                            <Text style={[styles.thingText, { color: theme.subText }]}>No smoking</Text>
                            <Text style={[styles.thingText, { color: theme.subText }]}>4 guests maximum</Text>
                        </View>

                        {/* Safety */}
                        <View style={[styles.miniDivider, { backgroundColor: theme.border }]} />

                        <View style={styles.thingItem}>
                            <Text style={[styles.thingTitle, { color: theme.text }]}>Safety & property</Text>
                            <Text style={[styles.thingText, { color: theme.subText }]}>Carbon monoxide alarm</Text>
                            <Text style={[styles.thingText, { color: theme.subText }]}>Smoke alarm</Text>
                            <Text style={[styles.thingText, { color: theme.subText }]}>Exterior security cameras</Text>
                        </View>

                        {/* Cancellation */}
                        <View style={[styles.miniDivider, { backgroundColor: theme.border }]} />

                        <View style={styles.thingItem}>
                            <Text style={[styles.thingTitle, { color: theme.text }]}>Cancellation policy</Text>
                            <Text style={[styles.thingText, { color: theme.subText }]}>Free cancellation before Oct 24.</Text>
                            <Text style={[styles.thingText, { color: theme.subText }]}>Review the Host's full cancellation policy for details.</Text>
                        </View>
                    </View>

                </View>
            </Animated.ScrollView>

            {/* Full Screen Booking Modal */}
            <Modal
                animationType="slide"
                visible={isBookingModalVisible}
                onRequestClose={() => setBookingModalVisible(false)}
                presentationStyle="pageSheet"
            >
                <View style={[styles.bookingContainer, { backgroundColor: theme.bg, paddingTop: Platform.OS === 'android' ? insets.top + 20 : 20 }]}>

                    {/* Header */}
                    <View style={[styles.bookingHeader, { borderBottomColor: theme.border }]}>
                        {step === 2 ? (
                            <TouchableOpacity onPress={() => setStep(1)} style={styles.closeBtn}>
                                <Ionicons name="chevron-back" size={24} color={theme.text} />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity onPress={() => setBookingModalVisible(false)} style={styles.closeBtn}>
                                <Ionicons name="close" size={24} color={theme.text} />
                            </TouchableOpacity>
                        )}
                        <Text style={[styles.bookingTitle, { color: theme.text }]}>{step === 1 ? "Request to book" : "Confirm and pay"}</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.bookingScrollContent}>
                        {step === 1 ? (
                            <>
                                {/* Property Snippet */}
                                <View style={styles.propertySnippet}>
                                    <Image source={{ uri: mainImage }} style={styles.snippetImage} />
                                    <View style={styles.snippetInfo}>
                                        <Text style={[styles.snippetTitle, { color: theme.text }]} numberOfLines={1}>{title}</Text>
                                        <Text style={[styles.snippetSub, { color: theme.subText }]}>{location}</Text>
                                        <View style={styles.snippetRating}>
                                            <Ionicons name="star" size={12} color={theme.text} />
                                            <Text style={[styles.snippetRatingText, { color: theme.subText }]}>4.92 (84 reviews)</Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={[styles.bookingDivider, { backgroundColor: theme.border }]} />

                                {/* Your Trip */}
                                <Text style={[styles.sectionHeader, { color: theme.text }]}>Your trip</Text>
                                <View style={styles.tripRow}>
                                    <View>
                                        <Text style={[styles.tripLabel, { color: theme.text }]}>Dates</Text>
                                        <Text style={[styles.tripValue, { color: theme.subText }]}>
                                            {startDate && endDate ? `Oct ${startDate} - Oct ${endDate}` : "Select dates"}
                                        </Text>
                                    </View>
                                    <TouchableOpacity onPress={handleDateEdit}>
                                        <Text style={[styles.editLink, { color: theme.text }]}>Edit</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.tripRow}>
                                    <View>
                                        <Text style={[styles.tripLabel, { color: theme.text }]}>Nights</Text>
                                        <Text style={[styles.tripValue, { color: theme.subText }]}>{calculatedNights} nights</Text>
                                    </View>
                                </View>
                                <View style={styles.tripRow}>
                                    <View>
                                        <Text style={[styles.tripLabel, { color: theme.text }]}>Guests</Text>
                                        <Text style={[styles.tripValue, { color: theme.subText }]}>{guestCount} guest{guestCount > 1 ? 's' : ''}</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                                        <TouchableOpacity
                                            onPress={() => {
                                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                                setGuestCount(Math.max(1, guestCount - 1));
                                            }}
                                            style={[styles.counterBtn, { borderColor: theme.border, backgroundColor: theme.card, opacity: guestCount <= 1 ? 0.5 : 1 }]}
                                            disabled={guestCount <= 1}
                                        >
                                            <Ionicons name="remove" size={18} color={theme.text} />
                                        </TouchableOpacity>

                                        <Text style={[styles.tripValue, { color: theme.text, fontSize: 16, fontWeight: '600', minWidth: 20, textAlign: 'center' }]}>{guestCount}</Text>

                                        <TouchableOpacity
                                            onPress={() => {
                                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                                setGuestCount(Math.min(10, guestCount + 1));
                                            }}
                                            style={[styles.counterBtn, { borderColor: theme.border, backgroundColor: theme.card }]}
                                        >
                                            <Ionicons name="add" size={18} color={theme.text} />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={[styles.bookingDivider, { backgroundColor: theme.border }]} />

                                {/* Price Details */}
                                <Text style={[styles.sectionHeader, { color: theme.text }]}>Price details</Text>
                                <View style={styles.priceDetailRow}>
                                    <Text style={[styles.priceLabel, { color: theme.subText }]}>{price} x {calculatedNights} nights</Text>
                                    <Text style={[styles.priceValue, { color: theme.subText }]}>{formatCurrency(calculatedPrice)}</Text>
                                </View>
                                <View style={styles.priceDetailRow}>
                                    <Text style={[styles.priceLabel, { color: theme.subText }]}>Cleaning fee</Text>
                                    <Text style={[styles.priceValue, { color: theme.subText }]}>{formatCurrency(cleaningFee)}</Text>
                                </View>
                                <View style={styles.priceDetailRow}>
                                    <Text style={[styles.priceLabel, { color: theme.subText }]}>Service fee</Text>
                                    <Text style={[styles.priceValue, { color: theme.subText }]}>{formatCurrency(serviceFee)}</Text>
                                </View>
                                <View style={[styles.bookingDivider, { backgroundColor: theme.border, opacity: 0.5 }]} />
                                <View style={styles.totalRow}>
                                    <Text style={[styles.totalLabel, { color: theme.text }]}>Total (INR)</Text>
                                    <Text style={[styles.totalValue, { color: theme.text }]}>{formatCurrency(totalBookingPrice)}</Text>
                                </View>

                                <View style={[styles.bookingDivider, { backgroundColor: theme.border }]} />

                                {/* User Details Form */}
                                <Text style={[styles.sectionHeader, { color: theme.text }]}>Required for your trip</Text>
                                <Text style={[styles.inputLabel, { color: theme.text }]}>Full Name</Text>
                                <TextInput
                                    style={[styles.modalInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]}
                                    placeholder="Full Name"
                                    placeholderTextColor={theme.subText}
                                    value={formData.name}
                                    onChangeText={(t) => setFormData({ ...formData, name: t })}
                                />

                                <Text style={[styles.inputLabel, { color: theme.text }]}>Phone Number</Text>
                                <TextInput
                                    style={[styles.modalInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]}
                                    placeholder="Phone Number"
                                    placeholderTextColor={theme.subText}
                                    keyboardType="phone-pad"
                                    value={formData.phone}
                                    onChangeText={(t) => setFormData({ ...formData, phone: t })}
                                />

                                <Text style={[styles.inputLabel, { color: theme.text }]}>Email Address</Text>
                                <TextInput
                                    style={[styles.modalInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]}
                                    placeholder="john@example.com"
                                    placeholderTextColor={theme.subText}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={formData.email}
                                    onChangeText={(t) => setFormData({ ...formData, email: t })}
                                />

                                <Text style={[styles.inputLabel, { color: theme.text }]}>Message to host</Text>
                                <TextInput
                                    style={[styles.modalInput, { height: 100, textAlignVertical: 'top', backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]}
                                    placeholder="Say hello to your host..."
                                    placeholderTextColor={theme.subText}
                                    multiline
                                    value={formData.message}
                                    onChangeText={(t) => setFormData({ ...formData, message: t })}
                                />
                                <Text style={styles.subtext}>Your phone number is required for the host to contact you.</Text>
                            </>
                        ) : (
                            <>
                                {/* Step 2: Payment UI */}
                                <View style={styles.propertySnippet}>
                                    <Image source={{ uri: mainImage }} style={styles.snippetImage} />
                                    <View style={styles.snippetInfo}>
                                        <Text style={[styles.snippetTitle, { color: theme.text }]} numberOfLines={1}>{title}</Text>
                                        <Text style={[styles.snippetSub, { color: theme.subText }]}>Total: {formatCurrency(totalBookingPrice)}</Text>
                                    </View>
                                </View>
                                <View style={[styles.bookingDivider, { backgroundColor: theme.border }]} />

                                <Text style={[styles.sectionHeader, { color: theme.text }]}>Pay with</Text>

                                <TouchableOpacity style={[styles.methodRow, { backgroundColor: theme.card, borderColor: theme.border }, paymentMethod === 'card' && { borderColor: theme.text }]} onPress={() => setPaymentMethod('card')}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                        <Ionicons name="card-outline" size={24} color={theme.text} />
                                        <Text style={[styles.tripLabel, { color: theme.text }]}>Credit or Debit Card</Text>
                                    </View>
                                    <Ionicons name={paymentMethod === 'card' ? "radio-button-on" : "radio-button-off"} size={24} color={paymentMethod === 'card' ? theme.text : theme.subText} />
                                </TouchableOpacity>

                                <TouchableOpacity style={[styles.methodRow, { backgroundColor: theme.card, borderColor: theme.border }, paymentMethod === 'upi' && { borderColor: theme.text }]} onPress={() => setPaymentMethod('upi')}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                        <Ionicons name="qr-code-outline" size={24} color={theme.text} />
                                        <Text style={[styles.tripLabel, { color: theme.text }]}>UPI (GPay, PhonePe)</Text>
                                    </View>
                                    <Ionicons name={paymentMethod === 'upi' ? "radio-button-on" : "radio-button-off"} size={24} color={paymentMethod === 'upi' ? theme.text : theme.subText} />
                                </TouchableOpacity>

                                {paymentMethod === 'card' ? (
                                    <>
                                        <Text style={[styles.inputLabel, { color: theme.text }]}>Card Number</Text>
                                        <TextInput style={[styles.modalInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} placeholder="0000 0000 0000 0000" placeholderTextColor={theme.subText} keyboardType="numeric" />

                                        <View style={{ flexDirection: 'row', gap: 12 }}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={[styles.inputLabel, { color: theme.text }]}>Expiration</Text>
                                                <TextInput style={[styles.modalInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} placeholder="MM / YY" placeholderTextColor={theme.subText} />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={[styles.inputLabel, { color: theme.text }]}>CVV</Text>
                                                <TextInput style={[styles.modalInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} placeholder="123" placeholderTextColor={theme.subText} keyboardType="numeric" />
                                            </View>
                                        </View>
                                        <Text style={[styles.inputLabel, { color: theme.text }]}>Zip Code</Text>
                                        <TextInput style={[styles.modalInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} placeholder="12345" placeholderTextColor={theme.subText} keyboardType="numeric" />
                                    </>
                                ) : (
                                    <>
                                        <Text style={[styles.inputLabel, { color: theme.text }]}>UPI ID</Text>
                                        <TextInput style={[styles.modalInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} placeholder="username@upi" placeholderTextColor={theme.subText} autoCapitalize="none" />
                                        <Text style={styles.subtext}>A payment request will be sent to your UPI app.</Text>
                                    </>
                                )}

                                <View style={[styles.bookingDivider, { backgroundColor: theme.border }]} />
                                <View style={styles.totalRow}>
                                    <Text style={[styles.totalLabel, { color: theme.text }]}>Total to pay</Text>
                                    <Text style={[styles.totalValue, { color: theme.text }]}>{formatCurrency(totalBookingPrice)}</Text>
                                </View>
                            </>
                        )}
                    </ScrollView>

                    {/* Sticky Footer */}
                    <View style={[styles.bookingFooter, { backgroundColor: theme.bg, borderTopColor: theme.border }]}>
                        <TouchableOpacity style={[styles.confirmButton, { backgroundColor: theme.text }]} onPress={submitBooking}>
                            <Text style={[styles.confirmButtonText, { color: theme.bg }]}>
                                {step === 1 ? "Continue to Payment" : `Pay ${formatCurrency(totalBookingPrice)}`}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Custom Alert Modal */}
            <Modal visible={customAlert.visible} transparent animationType="fade" onRequestClose={() => setCustomAlert({ ...customAlert, visible: false })}>
                <View style={styles.alertOverlay}>
                    <View style={[styles.alertBox, { backgroundColor: theme.modalBg, borderColor: theme.border }]}>
                        <Ionicons name={customAlert.type === 'success' ? "checkmark-circle" : "alert-circle"} size={48} color={customAlert.type === 'success' ? "#4CAF50" : "#FF385C"} />
                        <Text style={[styles.alertTitle, { color: theme.text }]}>{customAlert.title}</Text>
                        <Text style={[styles.alertMessage, { color: theme.subText }]}>{customAlert.message}</Text>
                        <TouchableOpacity style={[styles.alertButton, { backgroundColor: theme.text }]} onPress={() => {
                            setCustomAlert({ ...customAlert, visible: false });
                            if (customAlert.type === 'success') router.push('/(tabs)/booking');
                        }}>
                            <Text style={[styles.alertButtonText, { color: theme.bg }]}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Custom Calendar Modal */}
            <Modal visible={showCalendar} transparent animationType="fade" onRequestClose={() => setShowCalendar(false)}>
                <View style={styles.calendarModalOverlay}>
                    <View style={[styles.calendarContainer, { backgroundColor: theme.modalBg, borderColor: theme.border }]}>
                        <View style={styles.calendarHeader}>
                            <Text style={[styles.calendarTitle, { color: theme.text }]}>Select Dates</Text>
                            <TouchableOpacity onPress={() => setShowCalendar(false)}>
                                <Ionicons name="close" size={24} color={theme.text} />
                            </TouchableOpacity>
                        </View>
                        <Text style={[styles.monthTitle, { color: theme.subText }]}>October 2024</Text>
                        <View style={styles.calendarGrid}>
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                <Text key={d} style={styles.dayLabel}>{d}</Text>
                            ))}
                            {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
                                const isSelected = day === startDate || day === endDate;
                                const inRange = startDate && endDate && day > startDate && day < endDate;
                                return (
                                    <TouchableOpacity
                                        key={day}
                                        style={[
                                            styles.dayCell,
                                            isSelected ? [styles.daySelected, { backgroundColor: theme.text }] : undefined,
                                            inRange ? [styles.dayInRange, { backgroundColor: theme.border }] : undefined
                                        ]}
                                        onPress={() => handleDateSelect(day)}
                                    >
                                        <Text style={[styles.dayText, { color: theme.text }, isSelected && { color: theme.bg, fontWeight: 'bold' }]}>{day}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <TouchableOpacity style={[styles.confirmDatesBtn, { backgroundColor: theme.text }]} onPress={() => setShowCalendar(false)}>
                            <Text style={[styles.confirmDatesText, { color: theme.bg }]}>Confirm</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Bottom Bar (Outside Modal) */}
            <View style={[styles.footer, { backgroundColor: theme.bg, borderTopColor: theme.border }]}>
                <View style={styles.priceBox}>
                    <Text style={[styles.price, { color: theme.text }]}>{price}</Text>
                    <Text style={[styles.date, { color: theme.text }]}>Oct 24 – 29</Text>
                </View>
                <TouchableOpacity style={[styles.bookBtn, { backgroundColor: theme.text }]} onPress={handleBooking}>
                    <Text style={[styles.bookBtnText, { color: theme.bg }]}>Reserve</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    navHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    navRight: {
        flexDirection: 'row',
        gap: 12,
    },
    iconBtn: {
        width: 40,
        height: 40,
        backgroundColor: 'rgba(50,50,50,0.6)',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333',
    },
    carouselContainer: {
        width: width,
        height: 300,
        position: 'relative',
    },
    carouselImage: {
        width: width,
        height: 300,
    },
    imageCounter: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    counterText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '600',
    },
    content: {
        padding: 24,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    location: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 8,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 4,
    },
    reviewsText: {
        fontSize: 14,
        textDecorationLine: 'underline',
        fontWeight: '600',
    },
    divider: {
        height: 1,
        marginVertical: 24,
    },
    hostRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    sectionHeader: {
        fontSize: 22,
        fontWeight: '600',
        marginBottom: 4,
    },
    hostSub: {
        fontSize: 14,
    },
    hostAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        borderWidth: 1,
    },
    featuresSection: {
        gap: 20,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    featureText: {
        marginLeft: 16,
        flex: 1,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    featureSub: {
        fontSize: 14,
        lineHeight: 20,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 10,
    },
    showMore: {
        fontSize: 16,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },

    // --- Booking Modal Styles ---
    bookingContainer: {
        flex: 1,
    },
    bookingHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
    },
    closeBtn: {
        padding: 4,
    },
    bookingTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    bookingScrollContent: {
        padding: 24,
        paddingBottom: 100,
    },
    propertySnippet: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 8,
    },
    snippetImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
        backgroundColor: '#333',
    },
    snippetInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    snippetTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    snippetSub: {
        fontSize: 14,
        marginBottom: 6,
    },
    snippetRating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    snippetRatingText: {
        fontSize: 12,
    },
    bookingDivider: {
        height: 1,
        marginVertical: 24,
    },
    tripRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    tripLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    tripValue: {
        fontSize: 14,
    },
    editLink: {
        fontSize: 16,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    priceDetailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    priceLabel: {
        fontSize: 16,
    },
    priceValue: {
        fontSize: 16,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 16,
    },
    modalInput: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 14,
        fontSize: 16,
    },
    subtext: {
        fontSize: 12,
        color: '#666',
        marginTop: 8,
    },
    bookingFooter: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopWidth: 1,
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    },
    confirmButton: {
        backgroundColor: '#FF385C',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    confirmButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },

    // --- Missing Main Page Styles ---
    amenitiesList: {
        gap: 16,
        marginBottom: 24,
    },
    amenityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    amenityText: {
        fontSize: 16,
    },
    outlineButton: {
        borderWidth: 1,
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    outlineButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    mapView: {
        height: 200,
        width: '100%',
        backgroundColor: '#111',
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        overflow: 'hidden',
        position: 'relative',
    },
    mapImage: {
        width: '100%',
        height: '100%',
        opacity: 0.7,
    },
    mapPin: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FF385C',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: -16,
        marginTop: -16,
        borderWidth: 2,
        borderColor: '#FFF',
    },
    locationDetail: {
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopWidth: 1,
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: Platform.OS === 'ios' ? 34 : 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    priceBox: {},
    price: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    date: {
        fontSize: 14,
        textDecorationLine: 'underline',
    },
    bookBtn: {
        backgroundColor: '#FF385C',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    bookBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    counterBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#555',
        backgroundColor: '#222',
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Calendar Styles
    calendarModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    calendarContainer: {
        width: width * 0.9,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
    },
    calendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    calendarTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    monthTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
        textAlign: 'center',
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
    },
    dayLabel: {
        width: '14.28%',
        textAlign: 'center',
        color: '#888',
        marginBottom: 8,
        fontSize: 12,
    },
    dayCell: {
        width: '14.28%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
        borderRadius: 20,
    },
    daySelected: {},
    dayInRange: {
        borderRadius: 0,
    },
    dayText: {
        fontSize: 14,
    },
    confirmDatesBtn: {
        backgroundColor: '#FF385C',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    confirmDatesText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    // Alert Styles
    alertOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    alertBox: {
        width: '80%',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
    },
    alertTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    alertMessage: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    alertButton: {
        backgroundColor: '#FF385C',
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderRadius: 8,
    },
    alertButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    // Payment Method Styles
    methodRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderWidth: 1,
        borderRadius: 12,
        marginBottom: 12,
    },
    methodSelected: {
        borderColor: '#FF385C',
    },
    // Things to Know Styles
    thingsContainer: {
        marginBottom: 10,
    },
    thingItem: {
        marginBottom: 16,
    },
    thingTitle: {
        fontSize: 16, // Section headers within Things to know
        fontWeight: '600',
        marginBottom: 8,
    },
    thingText: {
        fontSize: 14,
        lineHeight: 22,
    },
    miniDivider: {
        height: 1,
        marginBottom: 16,
    },
});
