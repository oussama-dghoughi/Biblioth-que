import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import BookListScreen from '../screens/BookListScreen';
import AddEditBookScreen from '../screens/AddEditBookScreen';
import BookDetailsScreen from '../screens/BookDetailsScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="BookList"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#6200ee', // theme.colors.primary
          },
          headerTintColor: '#fff', // theme.colors.white
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="BookList"
          component={BookListScreen}
          options={{ title: 'Ma Bibliothèque' }}
        />
        <Stack.Screen name="AddEditBook" component={AddEditBookScreen} />
        <Stack.Screen name="BookDetails" component={BookDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

