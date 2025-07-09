import React from 'react';
import { Card, CardContent, Typography, Box, LinearProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom'; // Link import 추가

// KyeData 인터페이스 정의
interface KyeData {
  id: string;
  name: string;
  goalAmount: number;
  currentAmount: number;
  progress: number; // 0-100
  themeImage: string;
  aiSafetyScore: number; // 0-100
  description: string;
}

interface KyeCardProps {
  kye: KyeData;
}

// AI 안전도에 따른 테두리 색상 결정 함수
const getBorderColor = (score: number) => {
  if (score >= 80) return '#4CAF50'; // Green for high safety
  if (score >= 50) return '#FFC107'; // Amber for moderate safety
  return '#F44336'; // Red for low safety
};

const StyledCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'aiSafetyScore',
})<{ aiSafetyScore: number }>(({ aiSafetyScore }) => ({
  maxWidth: 345,
  margin: '16px',
  border: `4px solid ${getBorderColor(aiSafetyScore)}`,
  borderRadius: '16px', // Slightly more rounded corners
  boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.3)', // Stronger shadow for depth
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  background: 'linear-gradient(145deg, #f0f0f0, #e0e0e0)', // Subtle gradient background
  position: 'relative', // For potential future overlay effects
  overflow: 'hidden', // Ensure content stays within rounded borders
  '&:hover': {
    transform: 'translateY(-8px)', // More pronounced lift on hover
    boxShadow: '0px 12px 30px rgba(0, 0, 0, 0.4)',
  },
}));

const KyeCard: React.FC<KyeCardProps> = ({ kye }) => {
  return (
    <Link to={`/kye/${kye.id}`} style={{ textDecoration: 'none' }}> {/* Link 컴포넌트로 감싸기 */}
      <StyledCard aiSafetyScore={kye.aiSafetyScore}>
        <CardContent>
          <Typography
            variant="h5"
            component="div"
            sx={{
              fontFamily: 'Roboto, sans-serif',
              fontWeight: 'bold',
              color: '#333',
              textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
              marginBottom: '8px',
            }}
          >
            {kye.name}
          </Typography>
          <Box sx={{ height: 180, overflow: 'hidden', borderRadius: '10px', mb: 2, border: '1px solid #ddd' }}>
            <img
              src={kye.themeImage}
              alt={kye.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </Box>
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'Roboto, sans-serif',
              color: '#555',
              fontSize: '0.875rem',
              marginBottom: '12px',
            }}
          >
            {kye.description}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Roboto, sans-serif',
              fontWeight: 'bold',
              color: '#222',
              fontSize: '1rem',
              marginBottom: '4px',
            }}
          >
            목표 금액: {kye.goalAmount.toLocaleString()} KRW
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Roboto, sans-serif',
              fontWeight: 'bold',
              color: '#222',
              fontSize: '1rem',
              marginBottom: '8px',
            }}
          >
            현재 금액: {kye.currentAmount.toLocaleString()} KRW
          </Typography>
          <Box sx={{ width: '100%', mb: 1.5 }}>
            <LinearProgress
              variant="determinate"
              value={kye.progress}
              sx={{
                height: 10,
                borderRadius: 5,
                backgroundColor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getBorderColor(kye.aiSafetyScore),
                },
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', textAlign: 'right' }}>
              진행률: {kye.progress}%
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold', color: getBorderColor(kye.aiSafetyScore) }}>
            AI 안전도: {kye.aiSafetyScore}%
          </Typography>
        </CardContent>
      </StyledCard>
    </Link>
  );
};

export default KyeCard;