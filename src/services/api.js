import axios from 'axios';
import { Platform } from 'react-native';

// Configuration de l'API locale

export const API_BASE_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:3000'  // Android Emulator
  : 'http://localhost:3000';  // iOS Simulator

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, 
});

export default apiClient;

