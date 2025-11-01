import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import bookService from '../../services/bookService';
import theme from '../../styles/theme';
import StatusBadge from '../../components/StatusBadge';

const BookListScreen = ({ navigation }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBooks();
    
    const unsubscribe = navigation.addListener('focus', () => {
      loadBooks();
    });
    
    return unsubscribe;
  }, [navigation]);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const data = await bookService.getAllBooks();
      setBooks(data);
    } catch (error) {
      console.error('Erreur lors du chargement des livres:', error);
      Alert.alert('Erreur', 'Impossible de charger les livres');
    } finally {
      setLoading(false);
    }
  };

  const deleteBook = (id) => {
    Alert.alert(
      'Supprimer le livre',
      'Êtes-vous sûr de vouloir supprimer ce livre ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await bookService.deleteBook(id);
              loadBooks();
            } catch (error) {
              console.error('Erreur lors de la suppression:', error);
              Alert.alert('Erreur', 'Impossible de supprimer le livre');
            }
          },
        },
      ]
    );
  };

  const toggleReadStatus = async (book) => {
    try {
      await bookService.toggleReadStatus(book);
      loadBooks();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      Alert.alert('Erreur', 'Impossible de modifier le statut');
    }
  };

  const toggleFavorite = async (book) => {
    try {
      await bookService.toggleFavorite(book);
      loadBooks();
    } catch (error) {
      console.error('Erreur lors de la mise à jour des favoris:', error);
      Alert.alert('Erreur', 'Impossible de modifier les favoris');
    }
  };

  const renderBookItem = ({ item }) => (
    <TouchableOpacity
      key={item.id}
      style={styles.bookItem}
      onPress={() => navigation.navigate('BookDetails', { book: item })}
    >
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle}>{item.nom}</Text>
        <Text style={styles.bookAuthor}>Par {item.auteur}</Text>
        {item.editeur && (
          <Text style={styles.bookPublisher}>{item.editeur}</Text>
        )}
        {item.annee && (
          <Text style={styles.bookYear}>Année: {item.annee}</Text>
        )}
      </View>
      <View style={styles.bookActions}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => toggleFavorite(item)}
        >
          <Text style={styles.iconText}>{item.favorite ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => toggleReadStatus(item)}
        >
          <StatusBadge isRead={item.lu} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate('AddEditBook', { book: item })}
        >
          <Text style={styles.iconText}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => deleteBook(item.id)}
        >
          <Text style={styles.iconText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // Rendu pour web ou mobile
  const renderBooksList = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      );
    }
    
    if (books.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>Aucun livre</Text>
          <Text style={styles.emptySubtext}>Ajoutez votre premier livre !</Text>
        </View>
      );
    }

    // Sur web, utiliser ScrollView pour un meilleur rendu
    if (Platform.OS === 'web') {
      return (
        <ScrollView 
          style={{ height: 500, overflow: 'scroll' }} 
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
        >
          {books.map((item, index) => renderBookItem({ item, index }))}
        </ScrollView>
      );
    }

    // Sur mobile, utiliser FlatList
    return (
      <FlatList
        data={books}
        renderItem={renderBookItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        style={{ flex: 1 }}
      />
    );
  };

  return (
    <View style={[styles.container, Platform.OS === 'web' && { height: '100vh' }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ma Bibliothèque</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddEditBook')}
        >
          <Text style={styles.addButtonText}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>
      {renderBooksList()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5', // theme.colors.background
  },
  header: {
    backgroundColor: '#6200ee', // theme.colors.primary
    padding: 20, // theme.spacing.lg
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff', // theme.colors.text.inverse
  },
  addButton: {
    backgroundColor: '#03dac5', // theme.colors.secondary
    paddingHorizontal: 15, // theme.spacing.md
    paddingVertical: 8,
    borderRadius: 20, // theme.borderRadius.xl
  },
  addButtonText: {
    color: '#fff', // theme.colors.text.inverse
    fontWeight: 'bold',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666', // theme.colors.text.secondary
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666', // theme.colors.text.secondary
    marginBottom: 10, // theme.spacing.sm
  },
  emptySubtext: {
    fontSize: 16,
    color: '#999', // theme.colors.text.tertiary
  },
  list: {
    padding: 8, // theme.spacing.sm réduit
  },
  bookItem: {
    backgroundColor: '#fff', // theme.colors.white
    padding: 10, // theme.spacing.sm (réduit de 15)
    marginBottom: 8, // theme.spacing.sm (réduit de 10)
    borderRadius: 8, // theme.borderRadius.md (réduit de 10)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookInfo: {
    marginBottom: 6, // theme.spacing.sm (réduit de 10)
  },
  bookTitle: {
    fontSize: 16, // réduit de 18
    fontWeight: 'bold',
    color: '#333', // theme.colors.text.primary
    marginBottom: 3, // réduit de 5
  },
  bookAuthor: {
    fontSize: 14, // réduit de 16
    color: '#6200ee', // theme.colors.primary
    marginBottom: 3, // réduit de 5
  },
  bookPublisher: {
    fontSize: 12, // réduit de 14
    color: '#666', // theme.colors.text.secondary
    marginBottom: 2, // réduit de 3
  },
  bookYear: {
    fontSize: 12, // réduit de 14
    color: '#666', // theme.colors.text.secondary
  },
  bookActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  toggleButton: {
    marginRight: 8, // theme.spacing.sm réduit
  },
  iconButton: {
    marginRight: 8, // theme.spacing.sm réduit
  },
  iconText: {
    fontSize: 16, // réduit de 20
  },
});

export default BookListScreen;

