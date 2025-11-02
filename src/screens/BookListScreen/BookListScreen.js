import React, { useState, useEffect, useMemo, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  TextInput,
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import bookService from '../../services/bookService';
import localStorage from '../../services/localStorage';
import { ThemeContext } from '../../contexts/ThemeContext';
import theme from '../../styles/theme';
import StatusBadge from '../../components/StatusBadge';
import Rating from '../../components/Rating';

const BookListScreen = ({ navigation }) => {
  const { theme: currentTheme, toggleTheme } = useContext(ThemeContext);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, read, unread, favorites
  const [sortBy, setSortBy] = useState('titre'); // titre, auteur, theme

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
      // Essayer de charger depuis l'API
      const data = await bookService.getAllBooks();
      setBooks(data);
      // Sauvegarder en local pour le mode offline
      await localStorage.saveBooks(data);
    } catch (error) {
      console.error('Erreur lors du chargement des livres depuis l\'API:', error);
      // Si l'API échoue, charger depuis le stockage local
      const cachedBooks = await localStorage.loadBooks();
      if (cachedBooks) {
        setBooks(cachedBooks);
        console.log('Chargement en mode offline depuis le cache');
      } else {
        Alert.alert('Erreur', 'Impossible de charger les livres');
      }
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

  // Filtrage et tri des livres
  const filteredAndSortedBooks = useMemo(() => {
    let filtered = books;

    // Filtre par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (book) =>
          book.nom.toLowerCase().includes(query) ||
          book.auteur.toLowerCase().includes(query)
      );
    }

    // Filtre par type
    if (filterType === 'read') {
      filtered = filtered.filter((book) => book.lu);
    } else if (filterType === 'unread') {
      filtered = filtered.filter((book) => !book.lu);
    } else if (filterType === 'favorites') {
      filtered = filtered.filter((book) => book.favorite);
    }

    // Tri
    const sorted = [...filtered];
    sorted.sort((a, b) => {
      if (sortBy === 'titre') {
        const nomA = (a.nom || '').toLowerCase();
        const nomB = (b.nom || '').toLowerCase();
        return nomA.localeCompare(nomB, 'fr');
      } else if (sortBy === 'auteur') {
        const auteurA = (a.auteur || '').toLowerCase();
        const auteurB = (b.auteur || '').toLowerCase();
        return auteurA.localeCompare(auteurB, 'fr');
      } else if (sortBy === 'theme') {
        const themeA = a.theme || '';
        const themeB = b.theme || '';
        return themeA.localeCompare(themeB);
      }
      return 0;
    });

    return sorted;
  }, [books, searchQuery, filterType, sortBy]);

  const renderBookItem = ({ item }) => (
    <TouchableOpacity
      key={item.id}
      style={styles.bookItem}
      onPress={() => navigation.navigate('BookDetails', { book: item })}
    >
      {item.cover && (
        <Image source={{ uri: item.cover }} style={styles.bookCover} />
      )}
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle}>{item.nom}</Text>
        <Text style={styles.bookAuthor}>Par {item.auteur}</Text>
        {item.editeur ? (
          <Text style={styles.bookPublisher}>{item.editeur}</Text>
        ) : null}
        {item.annee ? (
          <Text style={styles.bookYear}>Année: {item.annee}</Text>
        ) : null}
        {item.rating > 0 ? (
          <View style={styles.ratingRow}>
            <Rating rating={item.rating} disabled={true} size={16} />
          </View>
        ) : null}
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
    
    if (filteredAndSortedBooks.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>Aucun livre trouvé</Text>
          <Text style={styles.emptySubtext}>
            {books.length === 0 
              ? 'Ajoutez votre premier livre !' 
              : 'Aucun résultat pour votre recherche'}
          </Text>
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
          {filteredAndSortedBooks.map((item, index) => renderBookItem({ item, index }))}
        </ScrollView>
      );
    }

    // Sur mobile, utiliser FlatList
    return (
      <FlatList
        data={filteredAndSortedBooks}
        renderItem={renderBookItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        style={{ flex: 1 }}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.colors.background }, Platform.OS === 'web' && { height: '100vh' }]}>
      <View style={[styles.header, { backgroundColor: currentTheme.colors.primary }]}>
        <Text style={styles.headerTitle}>Ma Bibliothèque</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            style={styles.themeButton}
            onPress={toggleTheme}
          >
            <MaterialIcons name={currentTheme.mode === 'dark' ? 'light-mode' : 'dark-mode'} size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.statsButton}
            onPress={() => navigation.navigate('Stats')}
          >
            <MaterialIcons name="bar-chart" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddEditBook')}
          >
            <Text style={styles.addButtonText}>+ Ajouter</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <MaterialIcons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher par titre ou auteur..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <MaterialIcons name="close" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filtres et tri */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollContainer}>
          <View style={styles.filterChipGroup}>
            <TouchableOpacity
              style={[styles.filterChip, filterType === 'all' && styles.filterChipActive]}
              onPress={() => setFilterType('all')}
            >
              <MaterialIcons name="menu-book" size={16} color={filterType === 'all' ? '#fff' : '#666'} style={styles.chipIcon} />
              <Text style={[styles.filterChipText, filterType === 'all' && styles.filterChipTextActive]}>Tous</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, filterType === 'read' && styles.filterChipActive]}
              onPress={() => setFilterType('read')}
            >
              <MaterialIcons name="check-circle" size={16} color={filterType === 'read' ? '#fff' : '#666'} style={styles.chipIcon} />
              <Text style={[styles.filterChipText, filterType === 'read' && styles.filterChipTextActive]}>Lus</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, filterType === 'unread' && styles.filterChipActive]}
              onPress={() => setFilterType('unread')}
            >
              <MaterialIcons name="radio-button-unchecked" size={16} color={filterType === 'unread' ? '#fff' : '#666'} style={styles.chipIcon} />
              <Text style={[styles.filterChipText, filterType === 'unread' && styles.filterChipTextActive]}>Non lus</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, filterType === 'favorites' && styles.filterChipActive]}
              onPress={() => setFilterType('favorites')}
            >
              <MaterialIcons name="favorite" size={16} color={filterType === 'favorites' ? '#fff' : '#666'} style={styles.chipIcon} />
              <Text style={[styles.filterChipText, filterType === 'favorites' && styles.filterChipTextActive]}>Favoris</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.filterSeparator} />
          
          <View style={styles.filterChipGroup}>
            <TouchableOpacity
              style={[styles.filterChip, sortBy === 'titre' && styles.filterChipActive]}
              onPress={() => setSortBy('titre')}
            >
              <MaterialIcons name="title" size={16} color={sortBy === 'titre' ? '#fff' : '#666'} style={styles.chipIcon} />
              <Text style={[styles.filterChipText, sortBy === 'titre' && styles.filterChipTextActive]}>Titre</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, sortBy === 'auteur' && styles.filterChipActive]}
              onPress={() => setSortBy('auteur')}
            >
              <MaterialIcons name="person" size={16} color={sortBy === 'auteur' ? '#fff' : '#666'} style={styles.chipIcon} />
              <Text style={[styles.filterChipText, sortBy === 'auteur' && styles.filterChipTextActive]}>Auteur</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  themeButton: {
    padding: 8,
    marginRight: 8,
  },
  statsButton: {
    padding: 8,
    marginRight: 8,
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
    flexDirection: 'row',
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
  bookCover: {
    width: 60,
    height: 90,
    borderRadius: 4,
    marginRight: 10,
    resizeMode: 'cover',
  },
  bookInfo: {
    flex: 1,
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
  ratingRow: {
    marginTop: 5,
  },
  searchContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  filtersContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterScrollContainer: {
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  filterChipGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterSeparator: {
    width: 1,
    height: 24,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 8,
  },
  filterChip: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterChipActive: {
    backgroundColor: '#6200ee',
    borderColor: '#6200ee',
    shadowColor: '#6200ee',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  chipIcon: {
    marginRight: 4,
  },
  filterChipText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
});

export default BookListScreen;

