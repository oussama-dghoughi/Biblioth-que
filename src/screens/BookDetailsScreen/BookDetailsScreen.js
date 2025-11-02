import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  TextInput,
  Modal,
  Platform,
  Image,
} from 'react-native';
import bookService from '../../services/bookService';
import openLibraryService from '../../services/openLibraryService';
import theme from '../../styles/theme';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import Rating from '../../components/Rating';

const BookDetailsScreen = ({ navigation, route }) => {
  const { book: initialBook } = route.params;
  const scrollViewRef = useRef(null);
  
  // Helper pour s'assurer que lu et favorite sont toujours des booleans
  const normalizeBook = (book) => {
    if (!book) return book;
    return {
      ...book,
      lu: book.lu === true || book.lu === 'true' || book.lu === 1 || book.lu === '1',
      favorite: book.favorite === true || book.favorite === 'true' || book.favorite === 1 || book.favorite === '1',
    };
  };

  const [book, setBook] = useState(normalizeBook(initialBook));
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [editionsCount, setEditionsCount] = useState(null);
  const [loadingEditions, setLoadingEditions] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: book.nom,
    });
    loadNotes();
    loadEditionsCount();
    // Forcer le scroll en haut lors du chargement
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, 100);

    // Ajouter un listener pour forcer le scroll quand l'écran est focus
    const unsubscribe = navigation.addListener('focus', () => {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: false });
      }, 100);
    });

    return unsubscribe;
  }, [book.nom, navigation]);

  const loadNotes = async () => {
    try {
      setLoadingNotes(true);
      const notesData = await bookService.getNotesByBookId(book.id);
      setNotes(notesData || []);
    } catch (error) {
      console.error('Erreur lors du chargement des notes:', error);
    } finally {
      setLoadingNotes(false);
    }
  };

  const loadEditionsCount = async () => {
    try {
      setLoadingEditions(true);
      const count = await openLibraryService.getEditionsCount(book.nom);
      setEditionsCount(count);
    } catch (error) {
      console.error('Erreur lors du chargement du nombre d\'éditions:', error);
    } finally {
      setLoadingEditions(false);
    }
  };

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

  const toggleFavorite = async () => {
    setLoading(true);
    try {
      const updatedBook = await bookService.toggleFavorite(book);
      setBook(updatedBook);
      Alert.alert(
        'Succès',
        updatedBook.favorite ? 'Livre ajouté aux favoris' : 'Livre retiré des favoris'
      );
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      Alert.alert('Erreur', 'Impossible de modifier les favoris');
    } finally {
      setLoading(false);
    }
  };

  const handleRatingPress = async (newRating) => {
    setLoading(true);
    try {
      const updatedBook = await bookService.updateBook(book.id, { ...book, rating: newRating });
      setBook(updatedBook);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      Alert.alert('Erreur', 'Impossible de modifier la note');
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

  const handleAddNote = async () => {
    if (!noteContent.trim()) {
      Alert.alert('Erreur', 'La note ne peut pas être vide');
      return;
    }

    try {
      await bookService.addNoteToBook(book.id, noteContent);
      Alert.alert('Succès', 'Note ajoutée avec succès');
      setShowAddNoteModal(false);
      setNoteContent('');
      loadNotes();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la note:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter la note');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <ScrollView 
        ref={scrollViewRef} 
        style={Platform.OS === 'web' ? { height: 500, overflow: 'scroll' } : styles.container}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <StatusBadge isRead={book.lu} />
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={toggleFavorite}
              disabled={loading}
            >
              <Text style={styles.favoriteIcon}>{book.favorite ? '❤️' : '🤍'}</Text>
            </TouchableOpacity>
          </View>

          {/* Image de couverture */}
          {book.cover ? (
            <View style={styles.coverSection}>
              <Image source={{ uri: book.cover }} style={styles.coverImage} />
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.label}>Titre</Text>
            <Text style={styles.value}>{book.nom}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Auteur</Text>
            <Text style={styles.value}>{book.auteur}</Text>
          </View>

          {book.editeur ? (
            <View style={styles.section}>
              <Text style={styles.label}>Éditeur</Text>
              <Text style={styles.value}>{book.editeur}</Text>
            </View>
          ) : null}

          {book.annee ? (
            <View style={styles.section}>
              <Text style={styles.label}>Année de publication</Text>
              <Text style={styles.value}>{book.annee}</Text>
            </View>
          ) : null}

          {book.rating > 0 ? (
            <View style={styles.section}>
              <Text style={styles.label}>Note</Text>
              <Rating
                rating={book.rating}
                onRatingPress={handleRatingPress}
                disabled={false}
              />
            </View>
          ) : null}

          {/* Section OpenLibrary */}
          {editionsCount !== null && editionsCount > 0 ? (
            <View style={styles.section}>
              <Text style={styles.label}>OpenLibrary</Text>
              <Text style={styles.value}>Nombre d'éditions référencées : {editionsCount}</Text>
            </View>
          ) : null}

          {/* Section Notes */}
          <View style={styles.notesSection}>
            <View style={styles.notesHeader}>
              <Text style={styles.notesTitle}>Notes</Text>
              <TouchableOpacity
                style={styles.addNoteButton}
                onPress={() => setShowAddNoteModal(true)}
              >
                <Text style={styles.addNoteButtonText}>+ Ajouter</Text>
              </TouchableOpacity>
            </View>

            {loadingNotes ? (
              <Text style={styles.emptyText}>Chargement des notes...</Text>
            ) : notes.length === 0 ? (
              <Text style={styles.emptyText}>Aucune note</Text>
            ) : (
              notes.map((note, index) => (
                <View key={index} style={styles.noteItem}>
                  <Text style={styles.noteContent}>{note.content}</Text>
                  <Text style={styles.noteDate}>{formatDate(note.createdAt)}</Text>
                </View>
              ))
            )}
          </View>

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
          </View>
        </View>
      </ScrollView>

      {/* Modal pour ajouter une note */}
      <Modal
        visible={showAddNoteModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddNoteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ajouter une note</Text>
            <TextInput
              style={styles.noteTextInput}
              multiline
              numberOfLines={6}
              placeholder="Écrivez votre note ici..."
              value={noteContent}
              onChangeText={setNoteContent}
              textAlignVertical="top"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowAddNoteModal(false);
                  setNoteContent('');
                }}
              >
                <Text style={styles.modalButtonTextCancel}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSubmit]}
                onPress={handleAddNote}
              >
                <Text style={styles.modalButtonTextSubmit}>Ajouter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  favoriteButton: {
    padding: 5,
  },
  favoriteIcon: {
    fontSize: 30,
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
  notesSection: {
    marginTop: 30,
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  notesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  addNoteButton: {
    backgroundColor: '#6200ee',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addNoteButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  noteItem: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  noteContent: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  noteDate: {
    fontSize: 12,
    color: '#999',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    paddingVertical: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 25,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  noteTextInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    minHeight: 120,
    backgroundColor: '#f9f9f9',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalButtonCancel: {
    backgroundColor: '#f0f0f0',
  },
  modalButtonSubmit: {
    backgroundColor: '#6200ee',
  },
  modalButtonTextCancel: {
    color: '#666',
    fontWeight: '600',
  },
  modalButtonTextSubmit: {
    color: '#fff',
    fontWeight: '600',
  },
  coverSection: {
    marginBottom: 20,
    alignItems: 'center',
  },
  coverImage: {
    width: 150,
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
});

export default BookDetailsScreen;

