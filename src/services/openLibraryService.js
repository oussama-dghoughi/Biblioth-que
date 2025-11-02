import axios from 'axios';

const OPEN_LIBRARY_API_URL = 'https://openlibrary.org';

export const openLibraryService = {
  // Rechercher des livres par titre
  searchBooksByTitle: async (title) => {
    try {
      const response = await axios.get(`${OPEN_LIBRARY_API_URL}/search.json`, {
        params: {
          title: title,
          limit: 1, // On ne prend que le premier résultat
        },
        timeout: 5000, // Timeout de 5 secondes
      });

      if (response.data && response.data.numFound) {
        return {
          numFound: response.data.numFound,
          docs: response.data.docs || [],
        };
      }

      return {
        numFound: 0,
        docs: [],
      };
    } catch (error) {
      console.error('Error searching OpenLibrary:', error);
      return null;
    }
  },

  // Obtenir le nombre d'éditions référencées pour un livre
  getEditionsCount: async (title) => {
    try {
      const result = await searchBooksByTitle(title);
      return result ? result.numFound : 0;
    } catch (error) {
      console.error('Error getting editions count:', error);
      return 0;
    }
  },
};

async function searchBooksByTitle(title) {
  try {
    const response = await axios.get(`${OPEN_LIBRARY_API_URL}/search.json`, {
      params: {
        title: title,
        limit: 1,
      },
      timeout: 5000,
    });

    if (response.data && response.data.numFound) {
      return {
        numFound: response.data.numFound,
        docs: response.data.docs || [],
      };
    }

    return {
      numFound: 0,
      docs: [],
    };
  } catch (error) {
    console.error('Error searching OpenLibrary:', error);
    return null;
  }
}

export default openLibraryService;
