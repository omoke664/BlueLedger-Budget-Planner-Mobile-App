import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface ButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({ 
  children, 
  onPress, 
  variant = 'default', 
  size = 'md', 
  disabled = false,
  style,
  textStyle
}: ButtonProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const buttonStyle = [
    styles.button,
    styles[size],
    {
      backgroundColor: variant === 'default' ? colors.primary : 'transparent',
      borderColor: variant === 'outline' ? colors.border : 'transparent',
    },
    variant === 'destructive' && { backgroundColor: colors.destructive },
    disabled && styles.disabled,
    style,
  ];

  const textStyleComputed = [
    styles.text,
    styles[`${size}Text`],
    {
      color: variant === 'default' || variant === 'destructive' 
        ? colors.primaryForeground 
        : colors.primary,
    },
    variant === 'outline' && { color: colors.primary },
    variant === 'ghost' && { color: colors.primary },
    variant === 'destructive' && { color: colors.destructiveForeground },
    disabled && { color: colors.mutedForeground },
    textStyle,
  ];

  return (
    <TouchableOpacity 
      style={buttonStyle} 
      onPress={onPress} 
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={textStyleComputed}>{children}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  sm: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 32,
  },
  md: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 40,
  },
  lg: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    minHeight: 48,
  },
  text: {
    fontWeight: '500',
  },
  smText: {
    fontSize: 12,
  },
  mdText: {
    fontSize: 14,
  },
  lgText: {
    fontSize: 16,
  },
  disabled: {
    opacity: 0.5,
  },
});
