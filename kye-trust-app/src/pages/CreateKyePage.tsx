
import React, { useState, useEffect } from 'react';
import { Button, TextField, Container, Typography, Box, Alert, Checkbox, FormControlLabel, Stepper, Step, StepLabel, Paper, Grid } from '@mui/material';
import { ethers } from 'ethers';
import contractAddress from '../contracts/contract-address.json';
import kyeTrustFactoryAbi from '../contracts/KyeTrustFactory.json';
import kyeTrustAbi from '../contracts/KyeTrust.json';
import { auth } from '../firebase';
import { addXPToUser, getUserProfile } from '../services/userService';
import { updateUserChallengeProgress } from '../services/userChallengeService';
import { addActivity } from '../services/activityService'; // Import addActivity
import { useMetaMask } from '../contexts/MetaMaskContext'; // Import useMetaMask

const steps = ['챌린지 선택', '곗돈 설정', '최종 확인']; // Updated for re-compilation

const CreateKyePage: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [name, setName] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [contributionAmount, setContributionAmount] = useState('');
  const [duration, setDuration] = useState('');
  const [story, setStory] = useState(''); // New state for story
  const [multiSigEnabled, setMultiSigEnabled] = useState<boolean>(false);
  const [requiredConfirmations, setRequiredConfirmations] = useState<string>('1');
  const [members, setMembers] = useState<string[]>([]); // State to hold members
  const [initialRoles, setInitialRoles] = useState<{ address: string; role: string }[]>([]); // New state for initial roles

  const { signer, account, isConnected, connectWallet, isConnecting } = useMetaMask();

  useEffect(() => {
    if (account) {
      const currentMembers = [account];
      // Add a hardcoded second member for testing multi-sig if not already present
      if (!currentMembers.includes('0x70997970C51812dc3A010C7d01b50e0d17dc79C8')) {
        currentMembers.push('0x70997970C51812dc3A010C7d01b50e0d17dc79C8');
      }
      setMembers(currentMembers);
      // Initialize roles: creator is Admin, others are Member
      setInitialRoles(currentMembers.map(addr => ({
        address: addr,
        role: (addr.toLowerCase() === account.toLowerCase()) ? 'Admin' : 'Member'
      })));
    } else {
      setMembers([]); // If no account, members should be empty
      setInitialRoles([]);
    }
  }, [account]);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleCreateKye = async () => {
    setError(null);
    setSuccess(null);

    if (!isConnected || !signer) {
      setError('MetaMask 지갑이 연결되어 있지 않습니다. 지갑을 연결해주세요.');
      connectWallet(); // Attempt to connect wallet if not connected
      return;
    }

    if (!auth.currentUser) {
      setError('곗돈을 생성하려면 로그인해야 합니다.');
      return;
    }

    try {
      const factoryContract = new ethers.Contract(
        contractAddress.KyeTrustFactory,
        kyeTrustFactoryAbi.abi,
        signer
      );

      const goal = ethers.parseEther(goalAmount);
      const contribution = ethers.parseEther(contributionAmount);

      let finalRequiredConfirmations = parseInt(requiredConfirmations, 10);
      if (multiSigEnabled) {
        // Ensure requiredConfirmations is at least 1 and not more than actual members count
        finalRequiredConfirmations = Math.max(1, finalRequiredConfirmations);
        finalRequiredConfirmations = Math.min(finalRequiredConfirmations, members.length);
      } else {
        finalRequiredConfirmations = 1; // If multi-sig is not enabled, it should always be 1
      }

      console.log("Creating Kye with:");
      console.log("  name:", name);
      console.log("  goalAmount:", goalAmount);
      console.log("  contributionAmount:", contributionAmount);
      console.log("  duration:", parseInt(duration, 10));
      console.log("  members:", members, " (length:", members.length, ")");
      console.log("  multiSigEnabled:", multiSigEnabled);
      console.log("  requiredConfirmations (final):", finalRequiredConfirmations);

      const tx = await factoryContract.createKye(
        name,
        goal,
        contribution,
        parseInt(duration, 10),
        members,
        multiSigEnabled,
        finalRequiredConfirmations
      );

      const receipt = await tx.wait();
      const kyeCreatedEvent = receipt?.logs?.find(
        (log: any) => factoryContract.interface.parseLog(log)?.name === "KyeCreated"
      );
      const newKyeAddress = kyeCreatedEvent?.args?.kyeAddress;

      if (newKyeAddress) {
        // Assign roles after Kye creation
        const newKyeContract = new ethers.Contract(
          newKyeAddress,
          kyeTrustAbi.abi,
          signer
        );
        for (const roleAssignment of initialRoles) {
          const roleEnum = ['None', 'Member', 'Treasurer', 'Admin'].indexOf(roleAssignment.role);
          if (roleEnum !== -1) {
            await newKyeContract.assignRole(roleAssignment.address, roleEnum);
          }
        }
      }

      setSuccess(`곗돈 '${name}'이 성공적으로 생성되었습니다! 트랜잭션 해시: ${tx.hash}`);

      await addXPToUser(auth.currentUser.uid, 50);
      await updateUserChallengeProgress(auth.currentUser.uid, 'kye-master-beginner', 1);

      // Add activity for Kye creation
      const userProfile = await getUserProfile(auth.currentUser);
      const userName = userProfile?.displayName || auth.currentUser.email || 'Anonymous';
      await addActivity({
        userId: auth.currentUser.uid,
        userName: userName,
        type: 'kye_created',
        message: `${userName}님이 새로운 곗돈을 생성했습니다: ${name}`,
      });

    } catch (err: any) {
      setError(err.reason || err.message || '알 수 없는 오류가 발생했습니다.');
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>어떤 목표를 위한 곗돈을 만들어볼까요?</Typography>
            <Grid container spacing={3}>
              {/* Challenge Template 1 */}
              <Grid item xs={12} sm={6} md={4} component="div">
                <Paper elevation={2} sx={{ p: 2, textAlign: 'center', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }} onClick={() => {
                  setName('세계 일주 로드맵');
                  setGoalAmount('10');
                  setContributionAmount('0.5');
                  setDuration('20');
                  setStory('꿈에 그리던 세계 일주를 위한 곗돈입니다. 함께 떠날 동료를 찾아요!');
                  handleNext();
                }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>🌍 세계 일주 로드맵</Typography>
                  <Typography variant="body2" color="text.secondary">추천: 10 ETH / 20개월</Typography>
                  <Typography variant="caption" color="text.disabled">예상 리워드: 여행가 뱃지</Typography>
                </Paper>
              </Grid>
              {/* Challenge Template 2 */}
              <Grid item xs={12} sm={6} md={4} component="div">
                <Paper elevation={2} sx={{ p: 2, textAlign: 'center', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }} onClick={() => {
                  setName('내 집 마련 드림');
                  setGoalAmount('50');
                  setContributionAmount('1');
                  setDuration('50');
                  setStory('내 집 마련의 꿈을 함께 이룰 든든한 계원을 모집합니다!');
                  handleNext();
                }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>🏠 내 집 마련 드림</Typography>
                  <Typography variant="body2" color="text.secondary">추천: 50 ETH / 50개월</Typography>
                  <Typography variant="caption" color="text.disabled">예상 리워드: 집주인 뱃지</Typography>
                </Paper>
              </Grid>
              {/* Challenge Template 3 */}
              <Grid item xs={12} sm={6} md={4} component="div">
                <Paper elevation={2} sx={{ p: 2, textAlign: 'center', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }} onClick={() => {
                  setName('창업 자금 모으기');
                  setGoalAmount('30');
                  setContributionAmount('0.75');
                  setDuration('40');
                  setStory('혁신적인 아이디어로 세상을 바꿀 창업 자금을 함께 모아요!');
                  handleNext();
                }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>💡 창업 자금 모으기</Typography>
                  <Typography variant="body2" color="text.secondary">추천: 30 ETH / 40개월</Typography>
                  <Typography variant="caption" color="text.disabled">예상 리워드: 기업가 뱃지</Typography>
                </Paper>
              </Grid>
              {/* Custom Challenge */}
              <Grid item xs={12}>
                <Button variant="outlined" fullWidth onClick={handleNext} sx={{ mt: 2 }}>
                  나만의 챌린지 만들기
                </Button>
              </Grid>
            </Grid>
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>곗돈 설정</Typography>
            <TextField
              margin="normal"
              required
              fullWidth
              label="곗돈 이름 (목표)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="목표 금액 (ETH)"
              type="number"
              value={goalAmount}
              onChange={(e) => setGoalAmount(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="월 납입액 (ETH)"
              type="number"
              value={contributionAmount}
              onChange={(e) => setContributionAmount(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="총 기간 (개월)"
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
            <TextField
              margin="normal"
              fullWidth
              label="목표 스토리 (선택 사항)"
              multiline
              rows={4}
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder="이 곗돈을 통해 어떤 목표를 달성하고 싶으신가요? 자세히 적어주세요."
            />

            {/* AI 추천 가이드 Placeholder */}
            <Box sx={{ mt: 3, p: 2, border: '1px dashed #e0e0e0', borderRadius: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">AI 추천 가이드 (예: 적정 금액/기간/인원 추천)</Typography>
              <Typography variant="caption" color="text.disabled">이곳에 AI가 분석한 최적의 곗돈 설정 가이드가 표시됩니다.</Typography>
            </Box>

            <FormControlLabel
              control={
                <Checkbox
                  checked={multiSigEnabled}
                  onChange={(e) => setMultiSigEnabled(e.target.checked)}
                  name="multiSigEnabled"
                />
              }
              label="다중 서명 활성화"
            />
            {multiSigEnabled && (
              <TextField
                margin="normal"
                required
                fullWidth
                label="필요한 서명 수"
                type="number"
                value={requiredConfirmations}
                onChange={(e) => setRequiredConfirmations(e.target.value)}
                inputProps={{ min: 1, max: members.length }}
              />
            )}
            {/* Initial Role Assignment (Simple for now) */}
            <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>초기 참여자 역할</Typography>
            {members.map((memberAddress, index) => (
              <Box key={memberAddress} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ mr: 2 }}>
                  {initialRoles.find(r => r.address === memberAddress)?.role || '참여자'}: {memberAddress.substring(0, 6)}...
                </Typography>
              </Box>
            ))}
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>최종 확인</Typography>
            <Typography variant="body1">다음 내용으로 곗돈을 개설하시겠습니까?</Typography>
            <Box sx={{ mt: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
              <Typography variant="subtitle1">**곗돈 이름:** {name}</Typography>
              <Typography variant="subtitle1">**목표 금액:** {goalAmount} ETH</Typography>
              <Typography variant="subtitle1">**월 납입액:** {contributionAmount} ETH</Typography>
              <Typography variant="subtitle1">**총 기간:** {duration} 개월</Typography>
              <Typography variant="subtitle1">**목표 스토리:** {story || '없음'}</Typography>
              <Typography variant="subtitle1">**다중 서명:** {multiSigEnabled ? `활성화 (${requiredConfirmations}명 필요)` : '비활성화'}</Typography>
              <Typography variant="subtitle1">**참여자 수:** {members.length}명</Typography>
            </Box>
            {/* Smart Contract Preview Placeholder */}
            <Box sx={{ mt: 3, p: 2, border: '1px dashed #e0e0e0', borderRadius: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">스마트 컨트랙트 미리보기</Typography>
              <Typography variant="caption" color="text.disabled">설정된 조건에 따라 스마트 컨트랙트의 핵심 조항(간략화된 버전)이 이곳에 표시됩니다.</Typography>
            </Box>
          </Box>
        );
      default:
        return '알 수 없는 단계';
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 8 }}>
        <Typography component="h1" variant="h5" gutterBottom sx={{ mb: 4 }}>
          새로운 곗돈 개설하기
        </Typography>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box>
          {getStepContent(activeStep)}
          <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
            <Button
              color="inherit"
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              이전
            </Button>
            <Box sx={{ flex: '1 1 auto' }} />
            {activeStep === steps.length - 1 ? (
              <Button variant="contained" onClick={handleCreateKye} disabled={!isConnected || isConnecting}>
                {isConnecting ? '지갑 연결 중...' : '곗돈 개설하기'}
              </Button>
            ) : (
              <Button variant="contained" onClick={handleNext}>
                다음
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default CreateKyePage;
