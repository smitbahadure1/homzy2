
import { FavoritesProvider } from '@/context/FavoritesContext';
import { ThemeProvider as AppThemeProvider, useTheme } from '@/context/ThemeContext';
import { tokenCache } from '@/lib/auth';
import { ClerkProvider } from '@clerk/clerk-expo';
import { Inter_400Regular, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import 'react-native-reanimated';
import 'react-native-url-polyfill/auto';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootContent() {
  const { isDarkMode } = useTheme();

  return (
    <NavThemeProvider value={isDarkMode ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="listing/[id]" options={{ headerShown: false, presentation: 'modal' }} />
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
