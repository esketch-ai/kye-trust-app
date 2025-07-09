
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#64B5F6', // Light Blue (파스텔톤 블루)
      light: '#95E8FF',
      dark: '#2286C3',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#81C784', // Light Green (파스텔톤 그린)
      light: '#B2FFB6',
      dark: '#519657',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F5F5DC', // Beige (베이지)
      paper: '#ffffff', // White paper background
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
    // Custom colors for a warmer, more trustworthy feel
    info: {
      main: '#FFB74D', // Orange for alerts/info
    },
    success: {
      main: '#4CAF50', // Green for success
    },
    warning: {
      main: '#FFD54F', // Yellow for warnings
    },
    error: {
      main: '#EF5350', // Red for errors
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.8rem',
      fontWeight: 500,
    },
    // Add more typography variants as needed
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Slightly rounded buttons
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined', // Default all text fields to outlined
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)', // Subtle shadow for cards/papers
        },
      },
    },
  },
});

export default theme;
