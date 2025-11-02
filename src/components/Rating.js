import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const Rating = ({ rating = 0, onRatingPress, disabled = false, size = 24 }) => {
  const handlePress = (value) => {
    if (!disabled && onRatingPress) {
      onRatingPress(value);
    }
  };

  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => handlePress(star)}
          disabled={disabled}
          style={styles.starButton}
        >
          <Text style={[styles.star, { fontSize: size }]}>{star <= rating ? '⭐' : '☆'}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starButton: {
    padding: 2,
  },
  star: {
    fontSize: 24,
  },
});

export default Rating;

