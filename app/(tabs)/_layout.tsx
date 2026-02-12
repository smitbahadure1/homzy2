
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

export default function TabLayout() {
  const { theme, isDarkMode } = useTheme();

  const renderTabIcon = (focused: boolean, activeIcon: keyof typeof Ionicons.glyphMap, inactiveIcon: keyof typeof Ionicons.glyphMap) => {
    return (
      <View style={[
        styles.iconContainer,
        focused && { backgroundColor: isDarkMode ? '#333' : '#F0F0F0' }
      ]}>
        <Ionicons
          name={focused ? activeIcon : inactiveIcon}
          size={24}
          color={focused ? (isDarkMode ? '#FFF' : '#000') : (isDarkMode ? '#888' : '#999')}
        />
      </View>
    );
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopWidth: 1,
          borderTopColor: theme.border,
          height: Platform.OS === 'ios' ? 90 : 70,
          paddingTop: 10,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarItemStyle: {
          // Centering logic handled by default layout
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => renderTabIcon(focused, "home", "home-outline"),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ focused }) => renderTabIcon(focused, "search", "search-outline"),
        }}
      />
      <Tabs.Screen
        name="booking"
        options={{
          title: 'Trips',
          tabBarIcon: ({ focused }) => renderTabIcon(focused, "briefcase", "briefcase-outline"),
        }}
      />
      <Tabs.Screen
        name="favorite"
        options={{
          title: 'Saved',
          tabBarIcon: ({ focused }) => renderTabIcon(focused, "bookmark", "bookmark-outline"),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => renderTabIcon(focused, "person", "person-outline"),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
