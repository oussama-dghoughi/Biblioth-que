import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import theme from '../styles/theme';

const Checkbox = ({ checked, onPress, label }) => {
  // Normaliser pour s'assurer que checked est toujours un boolean
  const normalizedChecked = checked === true || checked === 'true' || checked === 1 || checked === '1';
  
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={[styles.checkbox, normalizedChecked ? styles.checkboxChecked : null]}>
        {normalizedChecked ? <Text style={styles.checkMark}>✓</Text> : null}
      </View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#6200ee', // theme.colors.primary
    borderRadius: 4, // theme.borderRadius.sm
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#6200ee', // theme.colors.primary
  },
  checkMark: {
    color: '#fff', // theme.colors.text.inverse
    fontWeight: 'bold',
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    color: '#333', // theme.colors.text.primary
  },
});

export default Checkbox;

