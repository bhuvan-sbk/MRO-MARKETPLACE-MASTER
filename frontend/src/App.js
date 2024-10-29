// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';

// Components
import Navbar from './components/common/Navbar';
import Login from './components/auth/Login';
import Register from './components/auth/Register.js';
import HangarList from './components/hangar/HangarList';
import ServiceList from './components/service/ServiceList';
import HangarForm from './components/hangar/HangarForm';
import ServiceForm from './components/service/ServiceForm';
import BookingForm from './components/booking/BookingForm';
import Dashboard from './components/dashboard/Dashboard';
import { AuthProvider } from './contexts/AuthContext';
import ServiceManagement from './components/service/ServiceManagement';
import ServiceDetails from './components/service/ServiceDetails';


 

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

function App() {
  return (
    
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <div className="App">
            <Navbar />
            <main 
              style={{ 
                minHeight: 'calc(100vh - 130px)', 
                padding: '20px',
                backgroundColor: theme.palette.background.default
              }}
            >
              <Routes>
                <Route path="/" element={<HangarList />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/hangars" element={<HangarList />} />
                <Route path="/services" element={<ServiceList />} />
                <Route path="/services" element={<ServiceManagement />} />
                <Route path="/services/:id" element={<ServiceDetails />} />

                <Route path="/hangars/new" element={<HangarForm />} />
                <Route path="/services/new" element={<ServiceForm />} />
                <Route 
                  path="/hangars/:id/book" 
                  element={<BookingForm type="hangar" />} 
                />
                <Route 
                  path="/services/:id/book" 
                  element={<BookingForm type="service" />} 
                />
                <Route path="/dashboard" element={<Dashboard />} />
              </Routes>
            </main>
          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;