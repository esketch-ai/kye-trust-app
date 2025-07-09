
import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, CircularProgress, Alert, Grid, Paper, Avatar, LinearProgress, Button, List, ListItem, ListItemText } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import KyeCard from '../components/KyeCard';
import { useMetaMask } from '../contexts/MetaMaskContext'; // useMetaMask 훅 임포트
import { showErrorNotification } from '../services/notificationService'; // showErrorNotification 임포트
import { ethers } from 'ethers';
import kyeTrustFactoryAbi from '../contracts/KyeTrustFactory.json';
import contractAddress from '../contracts/contract-address.json';
import { exampleKyes, KyeData } from '../data/exampleKyes';
import { auth } from '../firebase';
import { getUserProfile } from '../services/userService';
import { getChallenges, Challenge } from '../services/challengeService'; // Import getChallenges and Challenge
import { getRecentActivities, Activity } from '../services/activityService'; // Import getRecentActivities and Activity

interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  level: number;
  levelName?: string;
  xp: number;
  xpToNextLevel: number;
  badges: string[];
  trustScore: number;
  profilePic: string | null;
}

const KyeListPage: React.FC = () => {
  const { provider, isConnected, account, connectWallet, disconnectWallet, isConnecting, chainId, switchNetwork } = useMetaMask(); // chainId, switchNetwork 추가
  const [kyes, setKyes] = useState<KyeData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [recommendedChallenges, setRecommendedChallenges] = useState<Challenge[]>([]); // New state for recommended challenges
  const [activityFeed, setActivityFeed] = useState<Activity[]>([]); // New state for activity feed
  const location = useLocation(); // useLocation 훅 사용
  const showAllKyes = location.pathname === '/kye/all'; // 현재 경로가 /kye/all인지 확인

  useEffect(() => {
    console.log("KyeListPage: MetaMask isConnected", isConnected);
    console.log("KyeListPage: MetaMask provider", provider);
    console.log("KyeListPage: Error state", error);
    console.log("KyeListPage: Current Chain ID", chainId);

    // If connected but on wrong chain, try to switch
    if (isConnected && chainId !== 1337 && chainId !== null) {
      showErrorNotification(`잘못된 네트워크에 연결되었습니다. Chain ID ${chainId}에서 Chain ID 1337로 전환을 시도합니다.`);
      switchNetwork(1337);
    }

  }, [isConnected, provider, error, chainId, switchNetwork]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (auth.currentUser) {
        try {
          const profile = await getUserProfile(auth.currentUser);
          setUserProfile(profile);
        } catch (err) {
          console.error("Error fetching user profile:", err);
          setError("Failed to load user profile.");
        }
      }
    };

    fetchUserProfile();
  }, [auth.currentUser]);

  useEffect(() => {
    const getDeployedKyes = async () => {
      // Only attempt to fetch deployed Kyes if connected and on the correct chain
      if (!isConnected || !provider || chainId !== 1337) {
        console.log("KyeListPage: Not connected to MetaMask, provider not available, or wrong chain. Showing example data.");
        setKyes(exampleKyes);
        setLoading(false);
        return;
      }

      try {
        const factoryContract = new ethers.Contract(
          contractAddress.KyeTrustFactory,
          kyeTrustFactoryAbi.abi,
          provider
        );

        const deployedKyesAddresses: string[] = await factoryContract.getDeployedKyes();
        const fetchedKyes: KyeData[] = [];

        for (const kyeAddress of deployedKyesAddresses) {
          fetchedKyes.push({
            id: kyeAddress,
            name: `Deployed Kye ${kyeAddress.substring(0, 6)}...`,
            goalAmount: 1000000,
            currentAmount: 500000,
            progress: 50,
            themeImage: 'https://via.placeholder.com/300x180?text=Deployed+Kye',
            aiSafetyScore: 70,
            description: '블록체인에서 가져온 곗돈입니다.',
          });
        }
        setKyes([...exampleKyes, ...fetchedKyes]);

      } catch (err: any) {
        console.error("Error fetching deployed Kyes:", err);
        setError(err.reason || err.message || 'Failed to fetch deployed Kyes. Showing example data.');
        setKyes(exampleKyes);
      } finally {
        setLoading(false);
      }
    };

    getDeployedKyes();
  }, [isConnected, provider, chainId]);

  useEffect(() => {
    const fetchRecommendedChallenges = async () => {
      try {
        const challenges = await getChallenges();
        // For now, just take the first 3 challenges as recommended
        setRecommendedChallenges(challenges.slice(0, 3));
      } catch (err) {
        console.error("Error fetching recommended challenges:", err);
      }
    };

    const fetchActivityFeed = async () => {
      try {
        const activities = await getRecentActivities(5); // Fetch last 5 activities
        setActivityFeed(activities);
      } catch (err) {
        console.error("Error fetching activity feed:", err);
      }
    };

    fetchRecommendedChallenges();
    fetchActivityFeed();
  }, []);

  if (loading || !userProfile) {
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* 나의 신뢰 레벨 */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
            <Typography variant="h6" gutterBottom>나의 신뢰 레벨</Typography>
            <Avatar alt="Profile Picture" src={userProfile.profilePic || undefined} sx={{ width: 80, height: 80, mb: 2 }} />
            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
              LV.{userProfile.level} {userProfile.levelName || '계원'}
            </Typography>
            <Box sx={{ width: '100%', mb: 1 }}>
              <LinearProgress variant="determinate" value={(userProfile.xp / userProfile.xpToNextLevel) * 100} sx={{ height: 8, borderRadius: 5 }} />
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 0.5 }}>
                {userProfile.xp} / {userProfile.xpToNextLevel} XP
              </Typography>
            </Box>
            <Button component={Link} to="/profile" variant="outlined" size="small">상세 신용 리포트</Button>
          </Paper>
        </Grid>

        {/* 퀵 메뉴 */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Typography variant="h6" gutterBottom>퀵 메뉴</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Button component={Link} to="/create-kye" variant="contained" fullWidth sx={{ height: '100%' }}>
                  곗돈 개설하기
                </Button>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Button component={Link} to="/challenges" variant="contained" fullWidth sx={{ height: '100%' }}>
                  곗돈 참여하기
                </Button>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Button component={Link} to="/profile" variant="contained" fullWidth sx={{ height: '100%' }}>
                  나의 계좌
                </Button>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Button component={Link} to="/about" variant="contained" fullWidth sx={{ height: '100%' }}>
                  고객센터
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* MetaMask 연결 버튼 */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
            {isConnected ? (
              <>
                <Typography variant="body1">연결된 지갑: {account?.substring(0, 6)}...{account?.substring(account.length - 4)}</Typography>
                <Button variant="outlined" onClick={disconnectWallet}>지갑 연결 해제</Button>
              </>
            ) : (
              <Button variant="contained" onClick={connectWallet} disabled={isConnecting}>MetaMask 지갑 연결</Button>
            )}
          </Paper>
        </Grid>

        {/* 진행 중인 곗돈 */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">진행 중인 곗돈</Typography>
              <Button component={Link} to="/kye/all" variant="text" size="small">모두 보기</Button>
            </Box>
            <Grid container spacing={2}>
              {kyes.length === 0 ? (
                <Grid item xs={12}>
                  <Typography variant="body1" color="text.secondary">참여 중인 곗돈이 없습니다. 새로운 곗돈을 시작하거나 참여해보세요!</Typography>
                </Grid>
              ) : (
                (showAllKyes ? kyes : kyes.slice(0, 3)).map((kye) => ( // showAllKyes에 따라 모든 곗돈 또는 상위 3개만 표시
                  <Grid item xs={12} sm={6} md={4} key={kye.id}>
                    <KyeCard kye={kye} />
                  </Grid>
                ))
              )}
            </Grid>
          </Paper>
        </Grid>

        {/* 추천 곗돈 / 챌린지 */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>추천 곗돈 / 챌린지</Typography>
            {recommendedChallenges.length === 0 ? (
              <Typography variant="body2" color="text.secondary">추천 곗돈 또는 챌린지가 없습니다.</Typography>
            ) : (
              <List>
                {recommendedChallenges.map((challenge) => (
                  <ListItem key={challenge.id} divider>
                    <ListItemText
                      primary={<Typography variant="body1" fontWeight="bold">{challenge.name}</Typography>}
                      secondary={challenge.description}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* 알림/활동 피드 */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>알림 / 활동 피드</Typography>
            {activityFeed.length === 0 ? (
              <Typography variant="body2" color="text.secondary">아직 새로운 알림이나 활동이 없습니다.</Typography>
            ) : (
              <List>
                {activityFeed.map((activity) => (
                  <ListItem key={activity.id} divider>
                    <ListItemText
                      primary={<Typography variant="body1" fontWeight="bold">{activity.message}</Typography>}
                      secondary={new Date(activity.timestamp?.toDate()).toLocaleString()}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

      </Grid>
    </Container>
  );
};

export default KyeListPage;
