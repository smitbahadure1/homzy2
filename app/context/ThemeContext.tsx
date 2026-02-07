
import React, { createContext, ReactNode, useContext, useState } from 'react';

// Define the shape of our Theme
type Theme = {
    bg: string;
    card: string;
    text: string;
    subText: string;
    border: string;
    icon: string;
    inputBg: string;
    modalBg: string; // Added modalBg
    tabBarBg: string; // Added tabBarBg for nav bar
    tabBarBorder: string;
    tabBarActive: string;
    tabBarInactive: string;
    fontRegular: string;
    fontBold: string;
};

// Define the context value
type ThemeContextType = {
    isDarkMode: boolean;
    toggleTheme: () => void;
    theme: Theme;
};

// Create the context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Provider Component
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [isDarkMode, setIsDarkMode] = useState(false); // Default to Light Mode

    // Define colors based on mode
    const theme: Theme = {
        bg: isDarkMode ? '#000' : '#F2F2F2',
        card: isDarkMode ? '#1A1A1A' : '#FFF',
        text: isDarkMode ? '#FFF' : '#222',
        subText: isDarkMode ? '#888' : '#666',
        border: isDarkMode ? '#222' : '#E0E0E0',
        icon: isDarkMode ? '#FFF' : '#222',
        inputBg: isDarkMode ? '#1A1A1A' : '#F5F5F5',
        modalBg: isDarkMode ? '#111' : '#FFF',
        tabBarBg: isDarkMode ? 'rgba(30,30,30,0.8)' : 'rgba(255,255,255,0.9)',
        tabBarBorder: isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
        tabBarActive: isDarkMode ? '#FFF' : '#000',
        tabBarInactive: isDarkMode ? '#666' : '#999',
        fontRegular: 'Inter_400Regular',
        fontBold: 'Inter_700Bold',
    };

    const toggleTheme = () => {
        setIsDarkMode(prev => !prev);
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
            {children}
        </ThemeContext.Provider>
    );
};

// Custom Hook to use the theme
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
