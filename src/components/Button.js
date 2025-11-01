import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import theme from '../styles/theme';

const Button = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  disabled = false,
  style,
  textStyle 
}) => {
  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryButton;
      case 'secondary':
        return styles.secondaryButton;
      case 'danger':
        return styles.dangerButton;
      case 'success':
        return styles.successButton;
      default:
        return styles.primaryButton;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        disabled ? styles.buttonDisabled : null,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.buttonText, textStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 18,
    borderRadius: 8, // theme.borderRadius.md
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: '#6200ee', // theme.colors.primary
  },
  secondaryButton: {
    backgroundColor: '#03dac5', // theme.colors.secondary
  },
  dangerButton: {
    backgroundColor: '#f44336', // theme.colors.danger
  },
  successButton: {
    backgroundColor: '#4caf50', // theme.colors.success
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff', // theme.colors.text.inverse
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Button;

