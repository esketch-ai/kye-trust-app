
import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { Button, TextField, Container, Typography, Box, CircularProgress, Checkbox, FormControlLabel, FormGroup, FormHelperText } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { showErrorNotification, showSuccessNotification } from '../services/notificationService';

const SignUpPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [agreedToCreditCheck, setAgreedToCreditCheck] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToCreditCheck) {
        showErrorNotification('신용정보 제공에 동의해야 회원가입을 진행할 수 있습니다.');
        return;
    }
    setLoading(true);
    try {
      // TODO: Implement phone verification logic
      await createUserWithEmailAndPassword(auth, email, password);
      showSuccessNotification('회원가입이 완료되었습니다! 환영합니다.');
      navigate('/onboarding'); // Navigate to Onboarding page after successful signup
    } catch (err: any) {
      showErrorNotification('회원가입에 실패했습니다: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          회원가입
        </Typography>
        <Box component="form" onSubmit={handleSignUp} sx={{ mt: 1 }}>
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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="phone"
            label="휴대폰 번호"
            type="tel"
            id="phone"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={loading}
            // TODO: Add phone verification button/logic
          />

          <FormGroup sx={{ mt: 2 }}>
            <FormControlLabel 
              control={<Checkbox checked={agreedToCreditCheck} onChange={(e) => setAgreedToCreditCheck(e.target.checked)} name="agreedToCreditCheck" />} 
              label="신용정보 제공 동의"
            />
            <FormHelperText sx={{ ml: 3.8 }}>
              안전한 곗돈 참여를 위해 고객님의 신용정보가 필요해요! AI 기반 신뢰도 평가를 위해 외부 신용등급 제공에 동의합니다.
            </FormHelperText>
          </FormGroup>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading || !agreedToCreditCheck}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : '동의하고 회원가입'}
          </Button>
          <Typography variant="body2" align="right">
            <Link to="/login" style={{ textDecoration: 'none' }}>
              {"이미 계정이 있으신가요? 로그인"}
            </Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default SignUpPage;
