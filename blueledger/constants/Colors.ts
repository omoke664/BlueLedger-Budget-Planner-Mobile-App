/**
 * BlueLedger Color System - Based on Figma Design
 * Primary color: #00C853 (Green)
 * Dark theme with modern UI colors
 */

const tintColorLight = '#00C853';
const tintColorDark = '#00C853';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#FFFFFF',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    // BlueLedger specific colors
    primary: '#00C853',
    primaryForeground: '#FFFFFF',
    secondary: '#F5F5F5',
    secondaryForeground: '#11181C',
    muted: '#F8F9FA',
    mutedForeground: '#6C757D',
    accent: '#00C853',
    accentForeground: '#FFFFFF',
    destructive: '#FF5252',
    destructiveForeground: '#FFFFFF',
    border: '#E9ECEF',
    input: '#FFFFFF',
    inputBackground: '#F8F9FA',
    card: '#FFFFFF',
    cardForeground: '#11181C',
    popover: '#FFFFFF',
    popoverForeground: '#11181C',
    ring: '#00C853',
  },
  dark: {
    text: '#FFFFFF',
    background: '#0B0C10',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    // BlueLedger specific colors
    primary: '#00C853',
    primaryForeground: '#FFFFFF',
    secondary: '#2A2A2A',
    secondaryForeground: '#DDDDDD',
    muted: '#333333',
    mutedForeground: '#AAAAAA',
    accent: '#00C853',
    accentForeground: '#FFFFFF',
    destructive: '#FF5252',
    destructiveForeground: '#FFFFFF',
    border: 'rgba(255, 255, 255, 0.1)',
    input: '#1A1A1A',
    inputBackground: '#1A1A1A',
    card: '#1A1A1A',
    cardForeground: '#FFFFFF',
    popover: '#1A1A1A',
    popoverForeground: '#FFFFFF',
    ring: '#00C853',
  },
};
