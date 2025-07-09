
import React, { useState } from 'react';
import { Container, Typography, Box, Button, LinearProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { showSuccessNotification, showErrorNotification } from '../services/notificationService';
import { useMetaMask } from '../contexts/MetaMaskContext';

const OnboardingPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const { isConnected, connectWallet, isConnecting } = useMetaMask();

  const onboardingSteps = [
    {
      title: '퀘스트 1: Kye-Trust란? (블록체인 기반)',
      description: 'Kye-Trust는 블록체인 기술을 활용하여 곗돈을 투명하고 안전하게 관리합니다. 모든 거래는 기록되며, AI가 신뢰도를 분석하여 안전한 곗돈 생활을 돕습니다.',
      reward: '새싹 뱃지 획득',
      actionText: '다음 퀘스트로',
      action: () => {},
    },
    {
      title: '퀘스트 2: MetaMask 지갑 연결하기',
      description: 'MetaMask는 여러분의 디지털 자산을 보관하고 블록체인 서비스와 연결해주는 지갑입니다. Kye-Trust를 이용하려면 MetaMask 지갑이 필요해요.',
      reward: '지갑 연결 뱃지 획득',
      actionText: isConnected ? '지갑 연결 완료! 다음 퀘스트로' : 'MetaMask 지갑 연결',
      action: connectWallet,
    },
    {
      title: '퀘스트 3: 테스트 ETH 받기 (로컬 환경)',
      description: '로컬 개발 환경에서는 테스트용 ETH를 받아 곗돈 납입 및 수령을 연습할 수 있습니다. MetaMask 지갑에 10000 ETH가 있는지 확인해 보세요.',
      reward: '테스트 자금 뱃지 획득',
      actionText: '테스트 ETH 확인 완료! 다음 퀘스트로',
      action: () => {
        // 사용자에게 MetaMask 지갑에 10000 ETH가 있는지 확인하도록 안내
        showSuccessNotification('MetaMask 지갑을 열어 ETH 잔액을 확인해 주세요!');
      },
    },
    {
      title: '퀘스트 4: 가상 곗돈으로 연습하기',
      description: '실제와 동일한 시뮬레이션 모드를 제공하여 곗돈 개설, 납입, 연체 시뮬레이션을 체험합니다. 이 과정을 통해 Kye-Trust 사용법을 완벽하게 익힐 수 있습니다.',
      reward: '모의 훈련 뱃지 획득 및 소액 포인트 지급',
      actionText: 'Kye-Trust 시작하기',
      action: () => {
        showSuccessNotification('모든 온보딩 퀘스트를 완료했습니다! Kye-Trust를 시작합니다.');
        navigate('/kye'); // Redirect to Kye list page after onboarding
      },
    },
  ];

  const handleNextStep = () => {
    const currentStepData = onboardingSteps[currentStep];

    if (currentStep === 1 && !isConnected) {
      // MetaMask 연결 퀘스트에서 연결이 안 되어 있으면 연결 시도
      currentStepData.action();
      return;
    }

    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      showSuccessNotification(`${currentStepData.reward} 완료!`);
    } else {
      // 마지막 퀘스트 완료 시
      currentStepData.action();
    }
  };

  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Kye-Trust 탐험대
        </Typography>
        <Typography variant="h6" component="h2" gutterBottom sx={{ mb: 4 }}>
          신뢰의 계원 되기 퀘스트
        </Typography>

        <Box sx={{ width: '100%', mb: 4 }}>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 10, borderRadius: 5 }} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {currentStep + 1} / {onboardingSteps.length} 단계 진행 중
          </Typography>
        </Box>

        <Box sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2, width: '100%', maxWidth: 500, mb: 4 }}>
          <Typography variant="h5" component="h3" gutterBottom>
            {onboardingSteps[currentStep].title}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {onboardingSteps[currentStep].description}
          </Typography>
          <Typography variant="body2" color="primary.main" sx={{ fontWeight: 'bold' }}>
            보상: {onboardingSteps[currentStep].reward}
          </Typography>
        </Box>

        <Button
          variant="contained"
          size="large"
          onClick={handleNextStep}
          sx={{ mt: 2 }}
          disabled={currentStep === 1 && isConnecting} // MetaMask 연결 중에는 버튼 비활성화
        >
          {onboardingSteps[currentStep].actionText}
        </Button>
      </Box>
    </Container>
  );
};

export default OnboardingPage;
