import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext({
  isDark: false,
  toggleTheme: () => {},
  theme: {
    background: '#FAF7F8',
    card: '#FFFFFF',
    text: '#1E2A40',
    subText: '#6B7280',
    primary: '#8E4A5D',
    secondary: '#1E2A40',
    border: '#E5E7EB',
    inputBg: '#F9FAFB'
  }
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

  const theme = isDark ? {
    background: '#0F172A', // Deep Dark Navy
    card: '#1E293B',       // Slate Dark
    text: '#F8FAFC',       // Off-white text
    subText: '#94A3B8',    // Muted slate
    primary: '#F9A8D4',    // Lighter Pink for dark mode
    secondary: '#384459',
    border: '#334155',
    inputBg: '#1E293B'
  } : {
    background: '#FAF7F8',
    card: '#FFFFFF',
    text: '#1E2A40',
    subText: '#6B7280',
    primary: '#8E4A5D',
    secondary: '#1E2A40',
    border: '#E5E7EB',
    inputBg: '#F9FAFB'
  };

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
