import { ExploreCardSkeleton } from '@/components/Skeletons';
import { useFavorites } from '@/context/FavoritesContext';
import { useTheme } from '@/context/ThemeContext';
import { fetchRealEstateData, Property, searchListings } from '@/services/realEstateService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
const Haptics = require('expo-haptics');
const useCallback = (React as any).useCallback;

const { width } = Dimensions.get('window');

const DESTINATIONS = [
  { id: 1, name: 'Goa', image: 'https://images.pexels.com/photos/4429334/pexels-photo-4429334.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 2, name: 'Manali', image: 'https://images.pexels.com/photos/1571746/pexels-photo-1571746.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 3, name: 'Ooty', image: 'https://images.pexels.com/photos/2440024/pexels-photo-2440024.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 4, name: 'Simla', image: 'https://images.pexels.com/photos/3283287/pexels-photo-3283287.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 5, name: 'Kerala', image: 'https://images.pexels.com/photos/4577852/pexels-photo-4577852.jpeg?auto=compress&cs=tinysrgb&w=800' },
];

export default function ExploreScreen() {
  const router = useRouter();
  const { theme, isDarkMode } = useTheme();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadData();
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);


  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchRealEstateData();
      setProperties(data);
    } catch (err) {
      console.error('ExploreScreen: Error loading data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!query.trim()) {
      loadData();
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchListings(query);
        setProperties(results);
      } catch (err) {
        console.error('ExploreScreen: Search failed', err);
      } finally {
        setSearching(false);
      }
    }, 500);
  }, []);

  const handleDestinationPress = async (name: string) => {
    if (searching) return;

    if (Haptics?.impactAsync && Haptics?.ImpactFeedbackStyle?.Heavy != null) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    setSearchQuery(name);
    setSearching(true);
    try {
      const results = await searchListings(name);
      setProperties(results);
    } catch (err) {
      console.error('ExploreScreen: Destination search failed', err);
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    setSearchQuery('');
    loadData();
  };

  const renderSkeletons = () => (
    <View style={styles.gridContainer}>
      {[1, 2, 3, 4, 5, 6].map(i => (
        <ExploreCardSkeleton key={i} />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Explore</Text>
          <Text style={[styles.headerSubtitle, { color: theme.subText }]}>Find your next getaway</Text>
        </View>

        {/* Search Input */}
        <View style={[styles.searchContainer, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
          <Ionicons name="search" size={20} color={theme.subText} style={styles.searchIcon} />
          <TextInput
            placeholder="Search destinations..."
            style={[styles.searchInput, { color: theme.text }]}
            placeholderTextColor={theme.subText}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searching && <ActivityIndicator size="small" color={theme.subText} />}
          {searchQuery.length > 0 && !searching && (
            <TouchableOpacity onPress={clearSearch}>
              <Ionicons name="close-circle" size={20} color={theme.subText} />
            </TouchableOpacity>
          )}
        </View>

        {/* Popular Destinations */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Popular Destinations</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.destList}>
            {DESTINATIONS.map((dest) => (
              <TouchableOpacity
                key={dest.id}
                style={styles.destCard}
                onPress={() => handleDestinationPress(dest.name)}
              >
                <Image source={{ uri: dest.image }} style={[styles.destImage, { borderColor: theme.border }]} />
                <Text style={[styles.destName, { color: theme.text }]}>{dest.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Results Count */}
        {!loading && (
          <View style={styles.resultsBar}>
            <Text style={[styles.resultsText, { color: theme.subText }]}>
              {properties.length} {properties.length === 1 ? 'property' : 'properties'} found
              {searchQuery ? ` for "${searchQuery}"` : ''}
            </Text>
          </View>
        )}

        {/* Curated Listings Grid */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {searchQuery ? 'Search Results' : 'Curated for you'}
          </Text>

          {loading ? renderSkeletons() : (
            <View style={styles.gridContainer}>
              {properties.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="search-outline" size={48} color={theme.subText} />
                  <Text style={[styles.emptyTitle, { color: theme.text }]}>No results found</Text>
                  <Text style={[styles.emptySubtext, { color: theme.subText }]}>
                    Try different keywords or browse all destinations
                  </Text>
                </View>
              ) : (
                properties.map((item, index) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.gridItem,
                      index % 3 === 0 ? styles.gridItemFull : styles.gridItemHalf,
                      { backgroundColor: theme.card, borderColor: theme.border }
                    ]}
                    activeOpacity={0.9}
                    onPress={() => {
                      if (Haptics?.impactAsync && Haptics?.ImpactFeedbackStyle?.Heavy != null) {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                      }
                      router.push({ pathname: '/listing/[id]', params: { id: item.id, title: item.title, location: item.location, price: item.price, image: item.image, rating: String(item.rating), beds: String(item.beds), baths: String(item.baths), sqft: String(item.sqft), frequency: item.frequency || 'night' } });
                    }}
                  >
                    <Image
                      source={typeof item.image === 'string' ? { uri: item.image } : item.image}
                      style={styles.gridImage}
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      style={styles.favoriteBtn}
                      onPress={() => {
                        if (Haptics?.impactAsync && Haptics?.ImpactFeedbackStyle?.Heavy != null) {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                        }
                        toggleFavorite(item);
                      }}
                    >
                      <Ionicons name={isFavorite(item.id) ? "heart" : "heart-outline"} size={20} color={isFavorite(item.id) ? "#FF385C" : "#FFF"} />
                    </TouchableOpacity>
                    <View style={styles.itemContent}>
                      <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                      <Text style={styles.itemLocation} numberOfLines={1}>{item.location}</Text>
                      <View style={styles.priceRow}>
                        <Text style={styles.itemPrice}>{item.price}</Text>
                        <Text style={styles.itemPriceSuffix}>/{item.frequency || 'night'}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}
        </View>

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
    marginTop: 10,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 20,
    marginBottom: 30,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  sectionContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 20,
    marginBottom: 16,
  },
  destList: {
    paddingLeft: 20,
  },
  destCard: {
    marginRight: 16,
    alignItems: 'center',
    position: 'relative',
  },
  destImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
  },
  destName: {
    marginTop: 8,
    color: '#CCC',
    fontSize: 14,
    fontWeight: '500',
  },
  resultsBar: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  resultsText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  gridItem: {
    marginBottom: 20,
    overflow: 'hidden',
    borderRadius: 20,
    borderWidth: 1,
  },
  gridItemFull: {
    width: '100%',
    height: 280,
  },
  gridItemHalf: {
    width: (width - 50) / 2,
    height: 220,
  },
  gridImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  favoriteBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 8,
    borderRadius: 20,
  },
  itemContent: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  itemTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  itemLocation: {
    color: '#AAA',
    fontSize: 12,
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  itemPrice: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemPriceSuffix: {
    color: '#CCC',
    fontSize: 12,
    marginLeft: 2,
    marginBottom: 2,
  },
  emptyState: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
  },
});
