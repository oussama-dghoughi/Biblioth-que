// Thème global de l'application
export const theme = {
  colors: {
    primary: '#6200ee',
    secondary: '#03dac5',
    success: '#4caf50',
    warning: '#ff9800',
    danger: '#f44336',
    background: '#f5f5f5',
    white: '#fff',
    text: {
      primary: '#333',
      secondary: '#666',
      tertiary: '#999',
      inverse: '#fff',
    },
  },
  spacing: {
    xs: 5,
    sm: 10,
    md: 15,
    lg: 20,
    xl: 30,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 10,
    xl: 20,
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
  },
};

export default theme;

