import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = '@booklist_app:theme';

// Thèmes clair et sombre
export const lightTheme = {
  mode: 'light',
  colors: {
    primary: '#6200ee',
    secondary: '#03dac5',
    success: '#4caf50',
    warning: '#ff9800',
    danger: '#f44336',
    background: '#f5f5f5',
    surface: '#fff',
    card: '#fff',
    text: {
      primary: '#333',
      secondary: '#666',
      tertiary: '#999',
      inverse: '#fff',
    },
    border: '#e0e0e0',
  },
};

export const darkTheme = {
  mode: 'dark',
  colors: {
    primary: '#7c4dff',
    secondary: '#03dac5',
    success: '#4caf50',
    warning: '#ff9800',
    danger: '#f44336',
    background: '#121212',
    surface: '#1e1e1e',
    card: '#2d2d2d',
    text: {
      primary: '#fff',
      secondary: '#b3b3b3',
      tertiary: '#888',
      inverse: '#333',
    },
    border: '#3d3d3d',
  },
};

export const ThemeContext = createContext({
  theme: lightTheme,
  toggleTheme: () => {},
  isDark: false,
});

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(lightTheme);

  useEffect(() => {
    // Charger le thème sauvegardé
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'dark') {
        setTheme(darkTheme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = theme.mode === 'light' ? darkTheme : lightTheme;
      setTheme(newTheme);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme.mode);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        isDark: theme.mode === 'dark',
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
