import { HomeCardSkeleton } from '@/components/Skeletons';
import { useFavorites } from '@/context/FavoritesContext';
import { useTheme } from '@/context/ThemeContext';
import { Property, searchListings } from '@/services/realEstateService';
import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  ImageSourcePropType,
  ListRenderItem,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
const CATEGORIES = [
  { id: 0, label: 'All', icon: 'grid-outline' },
  { id: 1, label: 'Beach', icon: 'sunny-outline' },
  { id: 2, label: 'Mountain', icon: 'leaf-outline' },
  { id: 3, label: 'City', icon: 'business-outline' },
  { id: 4, label: 'Camping', icon: 'bonfire-outline' },
  { id: 5, label: 'Luxury', icon: 'sparkles-outline' },
];

let Haptics: any = null;
try {
  Haptics = require('expo-haptics');
} catch (e) {
  console.warn('HomeScreen: expo-haptics not found');
}

const { width, height } = Dimensions.get('window');

const useCallback = (React as any).useCallback;

const getImageSource = (img: any) => {
  if (!img) return { uri: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg' };
  if (typeof img === 'number') return img;
  if (typeof img === 'string') {
    if (img.startsWith('http')) return { uri: img };
    const num = parseInt(img, 10);
    if (!isNaN(num) && String(num) === img) return num;
    return { uri: img };
  }
  return img;
};

export default function HomeScreen() {
  const router = useRouter();
  const { theme, isDarkMode } = useTheme();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { user } = useUser();
  const [activeCategory, setActiveCategory] = useState(0);
  const [properties, setProperties] = useState<Property[]>([]);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const activeCatLabel = CATEGORIES.find(c => c.id === activeCategory)?.label;
    if (activeCatLabel === 'All') {
      setProperties(allProperties);
    } else {
      setProperties(allProperties.filter(p => p.category === activeCatLabel));
    }
  }, [activeCategory, allProperties]);

  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (showInitialLoading = true) => {
    if (showInitialLoading) setLoading(true);
    try {
      const results = await searchListings('');
      setAllProperties(results);
    } catch (err) {
      console.error('HomeScreen: Error loading data', err);
    } finally {
      if (showInitialLoading) setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData(false);
    setRefreshing(false);
  };

  const handleNavigate = (item: Property) => {
    if (Haptics && Haptics.impactAsync) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    // Normalize image source to string if it's a local require() number
    let imageUri = item.image;
    if (typeof item.image === 'number') {
      const resolved = Image.resolveAssetSource(item.image as ImageSourcePropType);
      imageUri = resolved?.uri || '';
    }

    router.push({
      pathname: '/listing/[id]',
      params: {
        id: item.id,
        title: item.title,
        location: item.location,
        price: item.price,
        image: imageUri as string,
        rating: String(item.rating),
        beds: String(item.beds),
        baths: String(item.baths),
        sqft: String(item.sqft),
        frequency: item.frequency || 'night'
      }
    });
  };

  const renderPropertyItem: ListRenderItem<Property> = ({ item, index }) => {
    const propertyWidth = width - 40;
    const propertyHeight = propertyWidth * 1.25;

    return (
      <View style={[styles.cardContainer, { width: propertyWidth, height: propertyHeight }]}>
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.card}
          onPress={() => handleNavigate(item)}
        >
          <Image
            source={getImageSource(item.image)}
            style={styles.cardImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.gradient}
          />

          <TouchableOpacity
            style={styles.heartIcon}
            onPress={() => {
              if (Haptics && Haptics.impactAsync) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              toggleFavorite(item);
            }}
          >
            <Ionicons
              name={isFavorite(item.id) ? "heart" : "heart-outline"}
              size={24}
              color={isFavorite(item.id) ? "#FF385C" : "#FFF"}
            />
          </TouchableOpacity>

          <View style={styles.cardInfo}>
            <View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={12} color="#AAA" />
                <Text style={styles.cardLocation}>{item.location}</Text>
              </View>
            </View>

            <View style={styles.cardBottom}>
              <View style={styles.priceRow}>
                <Text style={styles.cardPrice}>{item.price}</Text>
                <Text style={styles.cardPriceFrequency}>/{item.frequency || 'night'}</Text>
              </View>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={styles.cardRating}>{item.rating}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderHeader = () => {
    return (
      <View style={styles.headerContent}>
        <View style={styles.topRow}>
          <View>
            <Text style={[styles.welcomeText, { color: theme.subText }]}>Good Morning</Text>
            <Text style={[styles.userName, { color: theme.text }]}>
              {user?.firstName ? user.firstName : 'Explorer'} 👋
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.notificationBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => router.push('/notifications' as any)}
          >
            <Ionicons name="notifications-outline" size={24} color={theme.text} />
            <View style={styles.dot} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.searchBar, { backgroundColor: theme.card, borderColor: theme.border }]}
          activeOpacity={0.8}
          onPress={() => router.push('/(tabs)/explore')}
        >
          <Ionicons name="search" size={20} color={theme.subText} />
          <Text style={[styles.searchText, { color: theme.subText }]}>Search your destination...</Text>
          <TouchableOpacity style={[styles.filterBtn, { backgroundColor: theme.text }]}>
            <Ionicons name="options-outline" size={20} color={theme.bg} />
          </TouchableOpacity>
        </TouchableOpacity>

        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryBtn,
                  activeCategory === cat.id && styles.activeCategoryBtn,
                  { backgroundColor: activeCategory === cat.id ? theme.text : theme.card, borderColor: theme.border }
                ]}
                onPress={() => {
                  if (Haptics && Haptics.impactAsync) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  setActiveCategory(cat.id);
                }}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={20}
                  color={activeCategory === cat.id ? theme.bg : theme.subText}
                />
                <Text
                  style={[
                    styles.categoryText,
                    activeCategory === cat.id && styles.activeCategoryText,
                    { color: activeCategory === cat.id ? theme.bg : theme.subText }
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      <Animated.FlatList
        data={loading ? [] : properties}
        renderItem={renderPropertyItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.text}
          />
        }
        ListEmptyComponent={
          loading ? (
            <View style={{ paddingHorizontal: 20 }}>
              <HomeCardSkeleton />
              <HomeCardSkeleton />
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={{ color: theme.subText }}>No properties found</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContent: {
    padding: 20,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  welcomeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  notificationBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  dot: {
    position: 'absolute',
    top: 12,
    right: 14,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF385C',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    marginBottom: 25,
  },
  searchText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesContainer: {
    marginBottom: 10,
  },
  categoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    marginRight: 12,
    borderWidth: 1,
  },
  activeCategoryBtn: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  categoryText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  activeCategoryText: {
    fontWeight: 'bold',
  },
  cardContainer: {
    alignSelf: 'center',
    marginBottom: 30,
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  card: {
    width: '100%',
    height: '100%',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },
  heartIcon: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
  },
  cardTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardLocation: {
    color: '#AAA',
    fontSize: 14,
    marginLeft: 4,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  cardPrice: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  cardPriceFrequency: {
    color: '#AAA',
    fontSize: 14,
    marginLeft: 2,
    marginBottom: 3,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  cardRating: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
});
