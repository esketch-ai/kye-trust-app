
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { Button, TextField, Container, Typography, Box, CircularProgress, Divider } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { showErrorNotification, showSuccessNotification } from '../services/notificationService';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      showSuccessNotification('성공적으로 로그인되었습니다!');
      navigate('/kye'); // Navigate to Kye list page on successful login
    } catch (err: any) {
      showErrorNotification('로그인에 실패했습니다: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (providerName: string) => {
    setLoading(true);
    try {
      if (providerName === 'Google') {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        showSuccessNotification('Google 계정으로 성공적으로 로그인되었습니다!');
        navigate('/kye');
      } else {
        showErrorNotification(`${providerName} 로그인은 현재 준비 중입니다.`);
      }
    } catch (err: any) {
      showErrorNotification(`소셜 로그인 실패: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Kye-Trust
        </Typography>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          "걱정 없이 목돈 모으기, Kye-Trust와 함께!"
        </Typography>
        <Typography variant="subtitle1" sx={{ mb: 3 }}>
          "AI가 지켜주는 든든한 곗돈 생활"
        </Typography>

        <Box component="form" onSubmit={handleLogin} sx={{ width: '100%', mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="이메일 주소"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="비밀번호"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : '로그인'}
          </Button>
          <Typography variant="body2" align="right">
            <Link to="/signup" style={{ textDecoration: 'none' }}>
              {"계정이 없으신가요? 회원가입"}
            </Link>
          </Typography>
        </Box>

        <Divider sx={{ width: '100%', my: 3 }}>또는</Divider>

        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => handleSocialLogin('카카오')}
            // startIcon={<img src={KakaoIcon} alt="kakao" style={{width: 20, height: 20}}/>}
          >
            카카오로 로그인
          </Button>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => handleSocialLogin('네이버')}
            // startIcon={<img src={NaverIcon} alt="naver" style={{width: 20, height: 20}}/>}
          >
            네이버로 로그인
          </Button>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => handleSocialLogin('Google')}
            // startIcon={<img src={GoogleIcon} alt="google" style={{width: 20, height: 20}}/>}
          >
            Google로 로그인
          </Button>
        </Box>
        <Button component={Link} to="/about" sx={{ mt: 4 }}>
            더 알아보기
        </Button>
      </Box>
    </Container>
  );
};

export default LoginPage;
