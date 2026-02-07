import { Inter_400Regular, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import 'react-native-url-polyfill/auto';
import { ThemeProvider as AppThemeProvider, useTheme } from './context/ThemeContext';

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

import { FavoritesProvider } from './context/FavoritesContext';

import { tokenCache } from '@/lib/auth';
import { ClerkProvider } from '@clerk/clerk-expo';

const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!clerkPublishableKey) {
  throw new Error(
    'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env',
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
  });

  if (!fontsLoaded) return null;

  return (
    <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}>
      <AppThemeProvider>
        <FavoritesProvider>
          <RootContent />
        </FavoritesProvider>
      </AppThemeProvider>
    </ClerkProvider>
  );
}
