import apiClient from './api';

// Helper pour mapper les données de l'API vers le format de l'app
const mapBookFromAPI = (apiBook) => {
  if (!apiBook) return apiBook;
  return {
    id: apiBook.id,
    nom: apiBook.name,
    auteur: apiBook.author,
    editeur: apiBook.editor,
    annee: apiBook.year,
    lu: apiBook.read === true || apiBook.read === 'true' || apiBook.read === 1,
    // Champs optionnels pour les niveaux supérieurs
    favorite: apiBook.favorite === true || apiBook.favorite === 'true' || apiBook.favorite === 1,
    rating: apiBook.rating || 0,
    cover: apiBook.cover,
    theme: apiBook.theme,
  };
};

// Helper pour mapper les données de l'app vers le format de l'API
const mapBookToAPI = (appBook) => {
  if (!appBook) return appBook;
  return {
    id: appBook.id,
    name: appBook.nom,
    author: appBook.auteur,
    editor: appBook.editeur,
    year: appBook.annee,
    read: appBook.lu,
    // Champs optionnels
    favorite: appBook.favorite,
    rating: appBook.rating,
    cover: appBook.cover,
    theme: appBook.theme,
  };
};

// Helper pour normaliser un tableau de livres
const normalizeBooks = (books) => {
  if (!books || !Array.isArray(books)) return books;
  return books.map(mapBookFromAPI);
};

// Service pour gérer toutes les opérations CRUD sur les livres
export const bookService = {
  // Récupérer tous les livres
  getAllBooks: async () => {
    try {
      const response = await apiClient.get('/books');
      console.log('API Response:', response.data);
      const normalized = normalizeBooks(response.data);
      console.log('Normalized books:', normalized);
      return normalized;
    } catch (error) {
      console.error('Error in getAllBooks:', error);
      throw error;
    }
  },

  // Récupérer un livre par ID
  getBookById: async (id) => {
    const response = await apiClient.get(`/books/${id}`);
    return mapBookFromAPI(response.data);
  },

  // Créer un nouveau livre
  createBook: async (bookData) => {
    const apiData = mapBookToAPI(bookData);
    const response = await apiClient.post('/books', apiData);
    return mapBookFromAPI(response.data);
  },

  // Mettre à jour un livre
  updateBook: async (id, bookData) => {
    const apiData = mapBookToAPI(bookData);
    const response = await apiClient.put(`/books/${id}`, apiData);
    return mapBookFromAPI(response.data);
  },

  // Supprimer un livre
  deleteBook: async (id) => {
    const response = await apiClient.delete(`/books/${id}`);
    return response.data;
  },

  // Toggle le statut lu/non lu
  toggleReadStatus: async (book) => {
    const updatedBook = { ...book, lu: !book.lu };
    const apiData = mapBookToAPI(updatedBook);
    const response = await apiClient.put(`/books/${book.id}`, apiData);
    return mapBookFromAPI(response.data);
  },
};

export default bookService;

