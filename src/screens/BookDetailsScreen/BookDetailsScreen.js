import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import bookService from '../../services/bookService';
import theme from '../../styles/theme';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';

const BookDetailsScreen = ({ navigation, route }) => {
  const { book: initialBook } = route.params;
  
  // Helper pour s'assurer que lu est toujours un boolean
  const normalizeBook = (book) => {
    if (!book) return book;
    return {
      ...book,
      lu: book.lu === true || book.lu === 'true' || book.lu === 1 || book.lu === '1',
    };
  };

  const [book, setBook] = useState(normalizeBook(initialBook));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: book.nom,
    });
  }, [book.nom, navigation]);

  const toggleReadStatus = async () => {
    setLoading(true);
    try {
      const updatedBook = await bookService.toggleReadStatus(book);
      setBook(updatedBook);
      Alert.alert(
        'Succès',
        updatedBook.lu ? 'Livre marqué comme lu' : 'Livre marqué comme non lu'
      );
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      Alert.alert('Erreur', 'Impossible de modifier le statut');
    } finally {
      setLoading(false);
    }
  };

  const deleteBook = () => {
    Alert.alert(
      'Supprimer le livre',
      'Êtes-vous sûr de vouloir supprimer ce livre ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await bookService.deleteBook(book.id);
              Alert.alert('Succès', 'Livre supprimé');
              navigation.goBack();
            } catch (error) {
              console.error('Erreur lors de la suppression:', error);
              Alert.alert('Erreur', 'Impossible de supprimer le livre');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <StatusBadge isRead={book.lu} />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Titre</Text>
          <Text style={styles.value}>{book.nom}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Auteur</Text>
          <Text style={styles.value}>{book.auteur}</Text>
        </View>

        {book.editeur && (
          <View style={styles.section}>
            <Text style={styles.label}>Éditeur</Text>
            <Text style={styles.value}>{book.editeur}</Text>
          </View>
        )}

        {book.annee && (
          <View style={styles.section}>
            <Text style={styles.label}>Année de publication</Text>
            <Text style={styles.value}>{book.annee}</Text>
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, book.lu ? styles.readButton : styles.unreadButton, loading ? styles.buttonDisabled : null]}
            onPress={toggleReadStatus}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {book.lu ? 'Marquer comme non lu' : 'Marquer comme lu'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.editButton]}
            onPress={() => navigation.navigate('AddEditBook', { book })}
          >
            <Text style={styles.buttonText}>✏️ Modifier</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={deleteBook}
          >
            <Text style={[styles.buttonText, styles.deleteButtonText]}>
              🗑️ Supprimer
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5', // theme.colors.background
  },
  content: {
    padding: 20, // theme.spacing.lg
  },
  header: {
    marginBottom: 30, // theme.spacing.xl
  },
  section: {
    marginBottom: 25,
    backgroundColor: '#fff', // theme.colors.white
    padding: 20, // theme.spacing.lg
    borderRadius: 10, // theme.borderRadius.lg
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666', // theme.colors.text.secondary
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 18,
    color: '#333', // theme.colors.text.primary
    fontWeight: '500',
  },
  actions: {
    marginTop: 30, // theme.spacing.xl
  },
  button: {
    padding: 18,
    borderRadius: 8, // theme.borderRadius.md
    alignItems: 'center',
    marginBottom: 15, // theme.spacing.md
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff', // theme.colors.text.inverse
  },
  readButton: {
    backgroundColor: '#4caf50', // theme.colors.success
  },
  unreadButton: {
    backgroundColor: '#ff9800', // theme.colors.warning
  },
  editButton: {
    backgroundColor: '#03dac5', // theme.colors.secondary
  },
  deleteButton: {
    backgroundColor: '#fff', // theme.colors.white
    borderWidth: 2,
    borderColor: '#f44336', // theme.colors.danger
  },
  deleteButtonText: {
    color: '#f44336', // theme.colors.danger
  },
});

export default BookDetailsScreen;

