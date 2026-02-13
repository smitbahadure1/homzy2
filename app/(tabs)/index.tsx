import { useFavorites } from '@/context/FavoritesContext';
import { useTheme } from '@/context/ThemeContext';
import { fetchRealEstateData, Property } from '@/services/realEstateService';
import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, Image, Platform, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Calculate card width/height for immersive single column
const cardWidth = width - 40;
const cardHeight = cardWidth * 1.25;

export default function HomeScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { theme, isDarkMode } = useTheme();
  const { isFavorite, toggleFavorite } = useFavorites();
  const lastOffsetY = useRef(0);
  const { user, isSignedIn } = useUser();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const firstName = isSignedIn && user ? (user.firstName || user.fullName?.split(' ')[0] || 'Traveler') : 'Traveler';

  const CATEGORIES = [
    { id: 'All', icon: 'grid-outline', label: 'All' },
    { id: 'Beach', icon: 'water-outline', label: 'Beach' },
    { id: 'Mountain', icon: 'image-outline', label: 'Mountain' },
    { id: 'City', icon: 'business-outline', label: 'City' },
    { id: 'Camping', icon: 'bonfire-outline', label: 'Camping' },
    { id: 'Luxury', icon: 'diamond-outline', label: 'Luxury' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchRealEstateData();
    setProperties(data);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await loadData();
    setRefreshing(false);
  };

  const getFilteredProperties = () => {
    return properties.filter(item => selectedCategory === 'All' || item.category === selectedCategory);
  };

  const onScroll = (e: any) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    const diff = offsetY - lastOffsetY.current;

    if (Math.abs(diff) > 20) {
      if (diff > 0 && offsetY > 50) {
        navigation.getParent()?.setOptions({ tabBarStyle: { display: 'none' } });
      } else if (diff < 0) {
        navigation.getParent()?.setOptions({
          tabBarStyle: {
            backgroundColor: theme.card,
            borderTopWidth: 1,
            borderTopColor: theme.border,
            height: Platform.OS === 'ios' ? 90 : 70,
            paddingTop: 10,
            paddingBottom: Platform.OS === 'ios' ? 25 : 10,
            display: 'flex',
            elevation: 0,
            shadowOpacity: 0,
          }
        });
      }
      lastOffsetY.current = offsetY;
    }
  };

  const renderPropertyItem = ({ item }: { item: Property }) => (
    <TouchableOpacity
      key={item.id}
      activeOpacity={0.9}
      style={[styles.listingCard, { width: cardWidth, height: cardHeight }]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        router.push({ pathname: '/listing/[id]', params: { ...item } });
      }}
    >
      {/* Background Image */}
      <Image
        source={typeof item.image === 'string' ? { uri: item.image } : item.image}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />

      {/* Dark Overlay Gradient */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.9)']}
        style={StyleSheet.absoluteFillObject}
        locations={[0.4, 0.7, 1]}
      />

      {/* Top Section: Price & Favorite */}
      <View style={styles.cardTopRow}>
        <View style={styles.pricePill}>
          <Text style={styles.priceText}>{item.price} Night</Text>
        </View>
        <TouchableOpacity
          style={styles.favoriteBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            toggleFavorite(item);
          }}
        >
          <Ionicons name={isFavorite(item.id) ? "heart" : "heart-outline"} size={18} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Bottom Section: Details */}
      <View style={styles.cardBottomContent}>
        {/* Pagination Dots visual dummy */}
        <View style={{ flexDirection: 'row', gap: 4, marginBottom: 8, alignSelf: 'center' }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFF' }} />
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' }} />
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' }} />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title || "Lakeshore Blvd"}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="star" size={12} color="#F5A623" />
            <Text style={styles.cardRating}>{item.rating} (20)</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Ionicons name="location-outline" size={12} color="#CCC" style={{ marginRight: 4 }} />
          <Text style={styles.cardLocation} numberOfLines={1}>{item.location}</Text>
        </View>

        <View style={styles.specsRow}>
          <View style={styles.specItem}>
            <Ionicons name="bed-outline" size={14} color="#FFF" />
            <Text style={styles.specText}>{item.beds} Bedrooms</Text>
          </View>
          <View style={styles.specItem}>
            <Ionicons name="resize-outline" size={14} color="#FFF" />
            <Text style={styles.specText}>{item.sqft} Sqft</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.reserveBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            router.push({ pathname: '/listing/[id]', params: { ...item } });
          }}
        >
          <Text style={styles.reserveBtnText}>Reserve</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      <View style={[styles.headerContainer, { backgroundColor: theme.bg, borderBottomColor: theme.border }]}>
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <Text style={{ fontSize: 16, color: theme.subText, fontFamily: 'Inter_700Bold' }}>Hello, {firstName}</Text>
          <Text style={{ fontSize: 26, color: theme.text, fontFamily: 'Inter_700Bold' }}>Let's find home</Text>
        </View>
        {/* Categories Tab Bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContainer}
          style={styles.categoryScroll}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryItem,
                selectedCategory === cat.id && styles.categoryItemActive
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                setSelectedCategory(cat.id);
              }}
            >
              <Ionicons
                name={cat.icon as any}
                size={24}
                color={selectedCategory === cat.id ? theme.text : theme.subText}
              />
              <Text style={[
                styles.categoryLabel,
                { color: selectedCategory === cat.id ? theme.text : theme.subText },
                selectedCategory === cat.id && styles.categoryLabelActive
              ]}>
                {cat.label}
              </Text>
              {selectedCategory === cat.id && <View style={[styles.activeIndicator, { backgroundColor: theme.text }]} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={getFilteredProperties()}
        renderItem={renderPropertyItem}
        keyExtractor={item => item.id}
        key={'immersive-single-column'}
        numColumns={1}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 100, paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.text} />
        }
        onScroll={onScroll}
        scrollEventThrottle={16}
        ListFooterComponent={<View style={{ height: 100 }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerContainer: {
    paddingTop: 10,
    paddingBottom: 0,
    borderBottomWidth: 1,
    zIndex: 10,
  },
  categoryScroll: { paddingLeft: 20 },
  categoryContainer: { paddingRight: 20, paddingBottom: 10 },
  categoryItem: { alignItems: 'center', marginRight: 24, paddingBottom: 8, opacity: 0.7 },
  categoryItemActive: { opacity: 1 },
  categoryLabel: { marginTop: 8, fontSize: 12, fontFamily: 'Inter_400Regular' },
  categoryLabelActive: { fontFamily: 'Inter_700Bold' },
  activeIndicator: { position: 'absolute', bottom: 0, width: '100%', height: 2 },

  // New Card Styles
  listingCard: {
    borderRadius: 24, // Very rounded corners per design
    marginBottom: 24,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#333', // fallback
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginTop: 4,
  },
  pricePill: {
    backgroundColor: 'rgba(50, 50, 50, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    // backdropFilter: 'blur(10px)', // works on web, ignored on native
  },
  priceText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  favoriteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(50, 50, 50, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBottomContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  cardTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  cardRating: {
    color: '#FFF',
    fontSize: 14,
  },
  cardLocation: {
    color: '#CCC',
    fontSize: 14,
    flex: 1,
  },
  specsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  specText: {
    color: '#EEE',
    fontSize: 12,
  },
  reserveBtn: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
  },
  reserveBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
});
