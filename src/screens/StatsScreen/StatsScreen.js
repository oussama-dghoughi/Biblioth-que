import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { MaterialIcons } from '@expo/vector-icons';
import bookService from '../../services/bookService';
import { useContext } from 'react';
import { ThemeContext } from '../../contexts/ThemeContext';

const screenWidth = Dimensions.get('window').width;

const StatsScreen = () => {
  const { theme: currentTheme } = useContext(ThemeContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const books = await bookService.getAllBooks();
      
      // Calculer les statistiques
      const total = books.length;
      const read = books.filter(book => book.lu).length;
      const unread = total - read;
      const favorites = books.filter(book => book.favorite).length;
      const ratings = books.filter(book => book.rating > 0);
      const avgRating = ratings.length > 0
        ? ratings.reduce((sum, book) => sum + book.rating, 0) / ratings.length
        : 0;

      setStats({
        total,
        read,
        unread,
        favorites,
        avgRating: avgRating.toFixed(1),
      });
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
        <Text style={[styles.loadingText, { color: currentTheme.colors.text.primary }]}>
          Chargement des statistiques...
        </Text>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
        <Text style={[styles.errorText, { color: currentTheme.colors.text.primary }]}>
          Impossible de charger les statistiques
        </Text>
      </View>
    );
  }

  // Données pour le graphique en secteurs (read/unread)
  const readUnreadData = [
    {
      name: 'Lus',
      population: stats.read,
      color: '#4caf50',
      legendFontColor: '#333',
      legendFontSize: 14,
    },
    {
      name: 'Non lus',
      population: stats.unread,
      color: '#ff9800',
      legendFontColor: '#333',
      legendFontSize: 14,
    },
  ];

  // Données pour le graphique en secteurs (favorites)
  const favoritesData = [
    {
      name: 'Favoris',
      population: stats.favorites,
      color: '#f44336',
      legendFontColor: '#333',
      legendFontSize: 14,
    },
    {
      name: 'Autres',
      population: stats.total - stats.favorites,
      color: '#9e9e9e',
      legendFontColor: '#333',
      legendFontSize: 14,
    },
  ];

  const chartConfig = {
    backgroundColor: currentTheme.colors.surface,
    backgroundGradientFrom: currentTheme.colors.surface,
    backgroundGradientTo: currentTheme.colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(33, 33, 33, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(33, 33, 33, ${opacity})`,
    style: {
      borderRadius: 16,
    },
  };

  return (
    <ScrollView 
      style={Platform.OS === 'web' ? { height: 500, overflow: 'scroll' } : [styles.container, { backgroundColor: currentTheme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={[styles.header, { backgroundColor: currentTheme.colors.primary }]}>
        <Text style={styles.headerTitle}>Statistiques</Text>
      </View>

      {/* Cartes de statistiques modernes */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: '#6200ee' }]}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="menu-book" size={40} color="#fff" />
          </View>
          <Text style={styles.statCardValue}>{stats.total}</Text>
          <Text style={styles.statCardLabel}>Total</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: '#4caf50' }]}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="check-circle" size={40} color="#fff" />
          </View>
          <Text style={styles.statCardValue}>{stats.read}</Text>
          <Text style={styles.statCardLabel}>Lus</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: '#ff9800' }]}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="radio-button-unchecked" size={40} color="#fff" />
          </View>
          <Text style={styles.statCardValue}>{stats.unread}</Text>
          <Text style={styles.statCardLabel}>Non lus</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: '#f44336' }]}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="favorite" size={40} color="#fff" />
          </View>
          <Text style={styles.statCardValue}>{stats.favorites}</Text>
          <Text style={styles.statCardLabel}>Favoris</Text>
        </View>
      </View>

      <View style={[styles.statCard, styles.statCardWide, { backgroundColor: '#03dac5' }]}>
        <View style={styles.iconContainer}>
          <MaterialIcons name="star" size={40} color="#fff" />
        </View>
        <Text style={styles.statCardValue}>{stats.avgRating}</Text>
        <Text style={styles.statCardLabel}>Note moyenne</Text>
      </View>

      {/* Graphique Lus / Non lus */}
      <View style={[styles.card, { backgroundColor: currentTheme.colors.surface }]}>
        <Text style={[styles.cardTitle, { color: currentTheme.colors.text.primary }]}>
          Répartition Lus / Non lus
        </Text>
        <PieChart
          data={readUnreadData}
          width={screenWidth - 60}
          height={220}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
        />
      </View>

      {/* Graphique Favoris */}
      <View style={[styles.card, { backgroundColor: currentTheme.colors.surface }]}>
        <Text style={[styles.cardTitle, { color: currentTheme.colors.text.primary }]}>
          Répartition Favoris
        </Text>
        <PieChart
          data={favoritesData}
          width={screenWidth - 60}
          height={220}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 15,
  },
  header: {
    backgroundColor: '#6200ee',
    padding: 20,
    paddingTop: 60,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 10,
  },
  statCardWide: {
    marginHorizontal: 5,
    marginBottom: 20,
  },
  iconContainer: {
    marginBottom: 12,
  },
  statCardValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  statCardLabel: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    opacity: 0.9,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 50,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 50,
  },
});

export default StatsScreen;

