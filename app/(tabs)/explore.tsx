
import { fetchRealEstateData, Property } from '@/app/services/realEstateService';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFavorites } from '../context/FavoritesContext';
import { useTheme } from '../context/ThemeContext';

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
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchRealEstateData();
    setProperties(data);
    setLoading(false);
  };

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
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Popular Destinations */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Popular Destinations</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.destList}>
            {DESTINATIONS.map((dest) => (
              <TouchableOpacity
                key={dest.id}
                style={styles.destCard}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                  setSearchQuery(dest.name);
                }}
              >
                <Image source={{ uri: dest.image }} style={[styles.destImage, { borderColor: theme.border }]} />
                {/* Removed overlay for cleaner look in light mode */}
                <Text style={[styles.destName, { color: theme.text }]}>{dest.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Curated Listings Grid */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Curated for you</Text>
          <View style={styles.gridContainer}>
            {properties.filter(item =>
              item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.location.toLowerCase().includes(searchQuery.toLowerCase())
            ).map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.gridItem,
                  index % 3 === 0 ? styles.gridItemFull : styles.gridItemHalf,
                  { backgroundColor: theme.card, borderColor: theme.border }
                ]}
                activeOpacity={0.9}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                  router.push({ pathname: '/listing/[id]', params: { ...item } });
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
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
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
                    <Text style={styles.itemPriceSuffix}>/night</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
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
  destOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 40,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  destName: {
    marginTop: 8,
    color: '#CCC',
    fontSize: 14,
    fontWeight: '500',
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
});
