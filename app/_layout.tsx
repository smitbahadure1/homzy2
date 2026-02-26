import 'react-native-reanimated';
import 'react-native-url-polyfill/auto';

import { FavoritesProvider } from '@/context/FavoritesContext';
import { ThemeProvider as AppThemeProvider, useTheme } from '@/context/ThemeContext';
import { tokenCache } from '@/lib/auth';
import { saveUserToDB } from '@/services/userService';
import { ClerkProvider, useUser } from '@clerk/clerk-expo';
import { Inter_400Regular, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
export const unstable_settings = {
  anchor: '(tabs)',
};

function RootContent() {
  const { isDarkMode } = useTheme();
  const { user, isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      saveUserToDB({
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        image_url: user.imageUrl || ''
      });
    }
  }, [isLoaded, isSignedIn, user]);

  return (
    <NavThemeProvider value={isDarkMode ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="login" />
        <Stack.Screen name="admin" />
        <Stack.Screen name="listing/[id]" options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
    </NavThemeProvider>
  );
}

const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

import { BookingsProvider } from '@/context/BookingsContext';

export default function RootLayout() {
  if (!clerkPublishableKey) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ textAlign: 'center' }}>
          Configuration Error: Missing Clerk Publishable Key.
          Please check your environment variables or .env file.
        </Text>
      </View>
    );
  }

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
  });

  if (!fontsLoaded) return null;

  return (
    <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}>
      <AppThemeProvider>
        <FavoritesProvider>
          <BookingsProvider>
            <RootContent />
          </BookingsProvider>
        </FavoritesProvider>
      </AppThemeProvider>
    </ClerkProvider>
  );
}
