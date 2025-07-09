
import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, CircularProgress, Alert, Paper, Chip, Button } from '@mui/material';
import { getChallenges, Challenge } from '../services/challengeService';
import { useNavigate } from 'react-router-dom';

const ChallengesPage: React.FC = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const fetchedChallenges = await getChallenges();
        setChallenges(fetchedChallenges);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchChallenges();
  }, []);

  const handleParticipate = (challenge: Challenge) => {
    // In a real application, this would navigate to a Kye creation page
    // with pre-filled details based on the challenge, or directly join a Kye.
    // For now, we'll just show a notification and navigate to create-kye page.
    alert(`'${challenge.name}' 챌린지에 참여합니다!`);
    navigate('/create-kye'); // Or navigate to a specific challenge-based Kye creation
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 8 }}>
        <Typography component="h1" variant="h4" gutterBottom>
          Kye-Trust 챌린지
        </Typography>
        {challenges.length === 0 ? (
          <Typography>현재 이용 가능한 챌린지가 없습니다.</Typography>
        ) : (
          challenges.map((challenge) => (
            <Paper key={challenge.id} sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6">{challenge.name}</Typography>
              <Typography variant="body2" color="text.secondary">{challenge.description}</Typography>
              <Box sx={{ mt: 1 }}>
                <Chip label={`보상: ${challenge.rewardXP} XP`} color="primary" size="small" sx={{ mr: 1 }} />
                {challenge.rewardBadge && <Chip label={`뱃지: ${challenge.rewardBadge}`} color="secondary" size="small" />}
              </Box>
              <Typography variant="body2" sx={{ mt: 1 }}>
                상태: {challenge.isActive ? '활성' : '비활성'}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                onClick={() => handleParticipate(challenge)}
                disabled={!challenge.isActive}
              >
                참여하기
              </Button>
            </Paper>
          ))
        )}
      </Box>
    </Container>
  );
};

export default ChallengesPage;
