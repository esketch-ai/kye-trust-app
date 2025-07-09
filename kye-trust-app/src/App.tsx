
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import KyeListPage from './pages/KyeListPage';
import KyeDetailPage from './pages/KyeDetailPage';
import CreateKyePage from './pages/CreateKyePage';
import ProfilePage from './pages/ProfilePage';
import ChallengesPage from './pages/ChallengesPage';
import OnboardingPage from './pages/OnboardingPage'; // Import OnboardingPage
import LearnCryptoPage from './pages/LearnCryptoPage'; // Import LearnCryptoPage
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';
import { AppBar, Toolbar, Typography, Button, Box, ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import { signOut } from 'firebase/auth';
import { initializeMockChallenges } from './services/challengeService';
import { ToastContainer } from './services/notificationService';
import { isAdmin } from './services/adminService'; // Import isAdmin
import { MetaMaskProvider } from './contexts/MetaMaskContext'; // Import MetaMaskProvider
import { setupBlockchainEventListeners } from './services/blockchainEventListener'; // Import event listener setup

const App: React.FC = () => {
  const [user, loading] = useAuthState(auth);
  const [isAdminUser, setIsAdminUser] = useState<boolean>(false);

  useEffect(() => {
    initializeMockChallenges();
    setupBlockchainEventListeners(); // Setup blockchain event listeners on app start
  }, []);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        const adminStatus = await isAdmin(user.uid);
        setIsAdminUser(adminStatus);
      } else {
        setIsAdminUser(false);
      }
    };
    checkAdminStatus();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MetaMaskProvider> {/* Wrap Router with MetaMaskProvider */}
        <Router>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Kye-Trust
            </Typography>
            {user ? (
              <Box>
                <Button color="inherit" component={Link} to="/kye">
                  Kyes
                </Button>
                <Button color="inherit" component={Link} to="/challenges">
                  Challenges
                </Button>
                <Button color="inherit" component={Link} to="/profile">
                  Profile
                </Button>
                <Button color="inherit" component={Link} to="/learn-crypto">
                  코인 상식
                </Button>
                {isAdminUser && (
                  <Button color="inherit" component={Link} to="/admin">
                    Admin
                  </Button>
                )}
                <Button color="inherit" onClick={handleLogout}>
                  Logout
                </Button>
              </Box>
            ) : (
              <Box>
                <Button color="inherit" component={Link} to="/login">
                  Login
                </Button>
                <Button color="inherit" component={Link} to="/signup">
                  Sign Up
                </Button>
              </Box>
            )}
          </Toolbar>
        </AppBar>
        <Routes>
          <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/kye" />} />
          <Route path="/signup" element={!user ? <SignUpPage /> : <Navigate to="/kye" />} />
          <Route path="/onboarding" element={user ? <OnboardingPage /> : <Navigate to="/login" />} /> {/* Onboarding Route */}
          <Route path="/kye" element={user ? <KyeListPage /> : <Navigate to="/login" />} />
          <Route path="/kye/all" element={user ? <KyeListPage /> : <Navigate to="/login" />} /> {/* All Kyes Route */}
        <Route path="/dashboard" element={<Navigate to="/kye" />} /> {/* Add dashboard route */}
        <Route path="/kye/:id" element={user ? <KyeDetailPage /> : <Navigate to="/login" />} />
        <Route path="/create-kye" element={user ? <CreateKyePage /> : <Navigate to="/login" />} />
        <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="/my-wallet" element={<Navigate to="/profile" />} /> {/* Add my-wallet route */}
        <Route path="/challenges" element={user ? <ChallengesPage /> : <Navigate to="/login" />} />
          <Route path="/admin" element={user && isAdminUser ? <div>Admin Page (Under Construction)</div> : <Navigate to="/login" />} /> {/* Admin Route */}
          <Route path="/about" element={<div>Kye-Trust 소개 페이지 (준비 중)</div>} />
          <Route path="/learn-crypto" element={<LearnCryptoPage />} /> {/* New LearnCryptoPage Route */}
          <Route path="/" element={<Navigate to="/kye" />} />
        </Routes>
        <ToastContainer />
        </Router>
      </MetaMaskProvider>
    </ThemeProvider>
  );
};

export default App;
