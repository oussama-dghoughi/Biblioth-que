import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import bookService from '../../services/bookService';
import theme from '../../styles/theme';
import Input from '../../components/Input';
import Checkbox from '../../components/Checkbox';
import Button from '../../components/Button';

const AddEditBookScreen = ({ navigation, route }) => {
  const book = route?.params?.book;
  const isEdit = !!book;

  // Helper pour s'assurer que lu est toujours un boolean
  const normalizeLu = (value) => {
    return value === true || value === 'true' || value === 1 || value === '1';
  };

  const [nom, setNom] = useState(book?.nom || '');
  const [auteur, setAuteur] = useState(book?.auteur || '');
  const [editeur, setEditeur] = useState(book?.editeur || '');
  const [annee, setAnnee] = useState(book?.annee ? String(book.annee) : '');
  const [lu, setLu] = useState(normalizeLu(book?.lu));
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
});

export default AddEditBookScreen;

