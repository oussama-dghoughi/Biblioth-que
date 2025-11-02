import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  BOOKS: '@booklist_app:books',
  SYNC_PENDING: '@booklist_app:sync_pending',
  LAST_SYNC: '@booklist_app:last_sync',
};

export const localStorage = {
  // Sauvegarder la liste des livres
  saveBooks: async (books) => {
    try {
      const jsonValue = JSON.stringify(books);
      await AsyncStorage.setItem(STORAGE_KEYS.BOOKS, jsonValue);
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
      console.log('Books saved to local storage');
    } catch (error) {
      console.error('Error saving books to local storage:', error);
    }
  },

  // Charger la liste des livres
  loadBooks: async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.BOOKS);
      if (jsonValue != null) {
        const books = JSON.parse(jsonValue);
        console.log('Books loaded from local storage');
        return books;
      }
      return null;
    } catch (error) {
      console.error('Error loading books from local storage:', error);
      return null;
    }
  },

  // Vérifier si une synchronisation est en attente
  hasPendingSync: async () => {
    try {
      const pending = await AsyncStorage.getItem(STORAGE_KEYS.SYNC_PENDING);
      return pending === 'true';
    } catch (error) {
      console.error('Error checking pending sync:', error);
      return false;
    }
  },

  // Marquer une synchronisation en attente
  setPendingSync: async (pending) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SYNC_PENDING, pending ? 'true' : 'false');
    } catch (error) {
      console.error('Error setting pending sync:', error);
    }
  },

  // Obtenir la date de la dernière synchronisation
  getLastSync: async () => {
    try {
      const lastSync = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
      return lastSync;
    } catch (error) {
      console.error('Error getting last sync:', error);
      return null;
    }
  },

  // Effacer toutes les données
  clearAll: async () => {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
      console.log('All local storage cleared');
    } catch (error) {
      console.error('Error clearing local storage:', error);
    }
  },
};

export default localStorage;
