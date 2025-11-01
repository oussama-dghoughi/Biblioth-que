import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import theme from '../styles/theme';

const Input = ({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  keyboardType = 'default',
  maxLength,
  required = false 
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label} {required ? <Text style={styles.required}>*</Text> : null}
      </Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        maxLength={maxLength}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20, // theme.spacing.lg
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333', // theme.colors.text.primary
    marginBottom: 8,
  },
  required: {
    color: '#f44336', // theme.colors.danger
  },
  input: {
    backgroundColor: '#fff', // theme.colors.white
    padding: 15, // theme.spacing.md
    borderRadius: 8, // theme.borderRadius.md
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
});

export default Input;

