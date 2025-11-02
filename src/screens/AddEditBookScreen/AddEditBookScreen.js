import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import bookService from '../../services/bookService';
import theme from '../../styles/theme';
import Input from '../../components/Input';
import Checkbox from '../../components/Checkbox';
import Button from '../../components/Button';
import Rating from '../../components/Rating';

const AddEditBookScreen = ({ navigation, route }) => {
  const book = route?.params?.book;
  const isEdit = !!book;

  // Helper pour s'assurer que lu et favorite sont toujours des booleans
  const normalizeLu = (value) => {
    return value === true || value === 'true' || value === 1 || value === '1';
  };

  const [nom, setNom] = useState(book?.nom || '');
  const [auteur, setAuteur] = useState(book?.auteur || '');
  const [editeur, setEditeur] = useState(book?.editeur || '');
  const [annee, setAnnee] = useState(book?.annee ? String(book.annee) : '');
  const [lu, setLu] = useState(normalizeLu(book?.lu));
  const [favorite, setFavorite] = useState(normalizeLu(book?.favorite));
  const [rating, setRating] = useState(book?.rating || 0);
  const [cover, setCover] = useState(book?.cover || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: isEdit ? 'Modifier le livre' : 'Nouveau livre',
    });
  }, [isEdit, navigation]);

  const validateForm = () => {
    if (!nom.trim() || !auteur.trim()) {
      Alert.alert('Erreur', 'Le nom et l\'auteur sont obligatoires');
      return false;
    }

    if (annee && (isNaN(annee) || annee.length !== 4)) {
      Alert.alert('Erreur', 'L\'année doit être au format YYYY (ex: 2024)');
      return false;
    }

    return true;
  };

  const pickImage = async () => {
    try {
      // Demander la permission d'accéder aux photos
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission requise', 'Vous devez autoriser l\'accès à la galerie photo');
        return;
      }

      // Ouvrir le sélecteur d'image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setCover(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erreur lors de la sélection de l\'image:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner l\'image');
    }
  };

  const removeImage = () => {
    setCover(null);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const bookData = {
        nom: nom.trim(),
        auteur: auteur.trim(),
        editeur: editeur.trim(),
        annee: annee ? parseInt(annee) : null,
        lu: lu,
        favorite: favorite,
        rating: rating,
        cover: cover,
      };

      if (isEdit) {
        await bookService.updateBook(book.id, bookData);
        Alert.alert('Succès', 'Livre modifié avec succès');
      } else {
        await bookService.createBook(bookData);
        Alert.alert('Succès', 'Livre ajouté avec succès');
      }

      navigation.goBack();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      Alert.alert(
        'Erreur',
        isEdit ? 'Impossible de modifier le livre' : 'Impossible d\'ajouter le livre'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Section Image de couverture */}
      <View style={styles.coverSection}>
        <Text style={styles.coverLabel}>Image de couverture</Text>
        {cover ? (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: cover }} style={styles.imagePreview} />
            <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
              <Text style={styles.removeImageText}>Supprimer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
            <Text style={styles.imagePickerText}>+ Choisir une image</Text>
          </TouchableOpacity>
        )}
      </View>

      <Input
        label="Nom du livre"
        value={nom}
        onChangeText={setNom}
        placeholder="Ex: Le Petit Prince"
        required
      />

      <Input
        label="Auteur"
        value={auteur}
        onChangeText={setAuteur}
        placeholder="Ex: Antoine de Saint-Exupéry"
        required
      />

      <Input
        label="Éditeur"
        value={editeur}
        onChangeText={setEditeur}
        placeholder="Ex: Gallimard"
      />

      <Input
        label="Année de publication"
        value={annee}
        onChangeText={setAnnee}
        placeholder="Ex: 1943"
        keyboardType="numeric"
        maxLength={4}
      />

      <Checkbox
        checked={lu}
        onPress={() => setLu(!lu)}
        label="Marquer comme lu"
      />

      <Checkbox
        checked={favorite}
        onPress={() => setFavorite(!favorite)}
        label="Ajouter aux favoris"
      />

      <View style={styles.ratingContainer}>
        <Text style={styles.ratingLabel}>Note</Text>
        <Rating
          rating={rating}
          onRatingPress={setRating}
          disabled={false}
        />
      </View>

      <Button
        title={loading ? 'Enregistrement...' : isEdit ? 'Modifier' : 'Ajouter'}
        onPress={handleSubmit}
        disabled={loading}
        style={styles.submitButton}
      />

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.cancelButtonText}>Annuler</Text>
      </TouchableOpacity>
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
  submitButton: {
    marginTop: 20, // theme.spacing.lg
    marginBottom: 10, // theme.spacing.sm
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#6200ee', // theme.colors.primary
    padding: 18,
    borderRadius: 8, // theme.borderRadius.md
    alignItems: 'center',
    marginBottom: 10, // theme.spacing.sm
  },
  cancelButtonText: {
    color: '#6200ee', // theme.colors.primary
    fontSize: 16,
    fontWeight: '600',
  },
  ratingContainer: {
    marginBottom: 20, // theme.spacing.lg
    backgroundColor: '#fff', // theme.colors.white
    padding: 20, // theme.spacing.lg
    borderRadius: 10, // theme.borderRadius.lg
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666', // theme.colors.text.secondary
    marginBottom: 10, // theme.spacing.sm
  },
  coverSection: {
    marginBottom: 20, // theme.spacing.lg
    backgroundColor: '#fff', // theme.colors.white
    padding: 20, // theme.spacing.lg
    borderRadius: 10, // theme.borderRadius.lg
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  coverLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666', // theme.colors.text.secondary
    marginBottom: 10, // theme.spacing.sm
  },
  imagePreviewContainer: {
    alignItems: 'center',
  },
  imagePreview: {
    width: 150,
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
    resizeMode: 'cover',
  },
  removeImageButton: {
    backgroundColor: '#f44336', // theme.colors.danger
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  removeImageText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  imagePickerButton: {
    backgroundColor: '#6200ee', // theme.colors.primary
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#6200ee',
    borderStyle: 'dashed',
  },
  imagePickerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddEditBookScreen;

