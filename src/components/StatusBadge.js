import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import theme from '../styles/theme';

const StatusBadge = ({ isRead }) => {
  // Normaliser pour s'assurer que isRead est toujours un boolean
  const normalizedIsRead = isRead === true || isRead === 'true' || isRead === 1 || isRead === '1';
  
  return (
    <View style={[styles.badge, normalizedIsRead ? styles.readBadge : styles.unreadBadge]}>
      <Text style={styles.badgeText}>
        {normalizedIsRead ? '✓ Lu' : 'Non lu'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10, // réduit de 15
    paddingVertical: 5, // réduit de 8
    borderRadius: 12, // theme.borderRadius.md réduit de 20
    alignSelf: 'flex-start',
  },
  readBadge: {
    backgroundColor: '#4caf50', // theme.colors.success
  },
  unreadBadge: {
    backgroundColor: '#ff9800', // theme.colors.warning
  },
  badgeText: {
    color: '#fff', // theme.colors.text.inverse
    fontWeight: 'bold',
    fontSize: 12, // réduit de 14
  },
});

export default StatusBadge;

