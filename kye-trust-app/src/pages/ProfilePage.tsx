
import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, CircularProgress, Alert, TextField, Button, Chip, LinearProgress, Avatar, List, ListItem, ListItemText } from '@mui/material';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { getUserProfile, updateUserProfile, UserProfile } from '../services/userService';
import { getChallenges, Challenge } from '../services/challengeService';
import { getUserChallengeProgress } from '../services/userChallengeService';
import { useMetaMask } from '../contexts/MetaMaskContext'; // Import useMetaMask
import { getRecentActivities, Activity } from '../services/activityService'; // Import getRecentActivities and Activity
import { ethers } from 'ethers'; // Import ethers

interface UserChallengeDisplay {
  challenge: Challenge;
  currentValue: number;
  completed: boolean;
}

const ProfilePage: React.FC = () => {
  const [user, loadingAuth] = useAuthState(auth);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [displayName, setDisplayName] = useState<string>('');
  const [profilePic, setProfilePic] = useState<string>('');
  const [userChallenges, setUserChallenges] = useState<UserChallengeDisplay[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]); // New state for recent activities
  const [ethBalance, setEthBalance] = useState<string | null>(null); // New state for ETH balance

  const { account, provider } = useMetaMask(); // Get account and provider from MetaMask context

  useEffect(() => {
    const fetchProfileAndChallenges = async () => {
      if (user) {
        try {
          const userProfile = await getUserProfile(user);
          setProfile(userProfile);
          setDisplayName(userProfile?.displayName || '');
          setProfilePic(userProfile?.profilePic || '');

          const allChallenges = await getChallenges();
          const activeChallenges = allChallenges.filter(c => c.isActive);

          const challengesWithProgress: UserChallengeDisplay[] = [];
          for (const challenge of activeChallenges) {
            const progress = await getUserChallengeProgress(user.uid, challenge.id);
            challengesWithProgress.push({
              challenge,
              currentValue: progress?.currentValue || 0,
              completed: progress?.completed || false,
            });
          }
          setUserChallenges(challengesWithProgress);

          // Fetch recent activities
          const activities = await getRecentActivities(5); // Fetch last 5 activities
          setRecentActivities(activities);

        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoadingProfile(false);
        }
      } else if (!loadingAuth) {
        setLoadingProfile(false);
      }
    };
    fetchProfileAndChallenges();
  }, [user, loadingAuth]);

  useEffect(() => {
    const fetchEthBalance = async () => {
      if (account && provider) {
        try {
          const balance = await provider.getBalance(account);
          setEthBalance(ethers.formatEther(balance)); // Format balance to ETH string
        } catch (err) {
          console.error("Error fetching ETH balance:", err);
          setEthBalance("잔액 불러오기 실패");
        }
      } else {
        setEthBalance(null);
      }
    };
    fetchEthBalance();
  }, [account, provider]); // Depend on account and provider

  const handleSaveProfile = async () => {
    if (user && profile) {
      try {
        await updateUserProfile(user.uid, { displayName, profilePic });
        setProfile({ ...profile, displayName, profilePic });
        setIsEditing(false);
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  if (loadingAuth || loadingProfile) {
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

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Typography>프로필을 보려면 로그인해주세요.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 8 }}>
        <Typography component="h1" variant="h4" gutterBottom>
          내 프로필
        </Typography>
        <Paper sx={{ p: 3, mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar alt="프로필 사진" src={profile?.profilePic || undefined} sx={{ width: 100, height: 100, mb: 2 }} />
          {isEditing ? (
            <TextField
              label="표시 이름"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              fullWidth
              margin="normal"
              sx={{ mb: 1 }}
            />
          ) : (
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>{profile?.displayName || '이름 미설정'}</Typography>
          )}
          {isEditing ? (
            <TextField
              label="프로필 사진 URL"
              value={profilePic}
              onChange={(e) => setProfilePic(e.target.value)}
              fullWidth
              margin="normal"
              sx={{ mb: 2 }}
            />
          ) : (
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>{profile?.email}</Typography>
          )}

          <Box sx={{ width: '100%', mt: 2 }}>
            {profile && (
              <>
                <Typography variant="h6" gutterBottom>레벨: <Typography component="span" variant="h5" color="primary">LV.{profile.level}</Typography></Typography>
                <LinearProgress variant="determinate" value={(profile.xp / profile.xpToNextLevel) * 100} sx={{ height: 10, borderRadius: 5 }} />
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 0.5 }}>
                  {profile.xp} / {profile.xpToNextLevel} XP
                </Typography>
              </>
            )}
          </Box>
          <Box sx={{ width: '100%', mt: 2 }}>
            <Typography variant="h6" gutterBottom>신뢰 점수: <Typography component="span" variant="h5" color="secondary">{profile?.trustScore}%</Typography></Typography>
            <LinearProgress variant="determinate" value={profile?.trustScore} sx={{ height: 10, borderRadius: 5 }} />
          </Box>
          <Box sx={{ width: '100%', mt: 3 }}>
            <Typography variant="h6" gutterBottom>뱃지:</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {profile?.badges && profile.badges.length > 0 ? (
                profile.badges.map((badge: string) => (
                  <Chip key={badge} label={badge} color="info" variant="outlined" />
                ))
              ) : (
                <Typography variant="body2">아직 획득한 뱃지가 없습니다. 챌린지를 완료하여 뱃지를 획득하세요!</Typography>
              )}
            </Box>
          </Box>

          <Box sx={{ width: '100%', mt: 3 }}>
            <Typography variant="h6" gutterBottom>챌린지 진행 상황:</Typography>
            {userChallenges.length === 0 ? (
              <Typography variant="body2">진행 중인 챌린지가 없습니다.</Typography>
            ) : (
              userChallenges.map((uc) => (
                <Box key={uc.challenge.id} sx={{ mb: 1 }}>
                  <Typography variant="body2">{uc.challenge.name}: {uc.currentValue} / {uc.challenge.targetValue}</Typography>
                  <LinearProgress
                    variant="determinate"
                    value={(uc.currentValue / uc.challenge.targetValue) * 100}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  {uc.completed && <Typography variant="caption" color="success.main">완료!</Typography>}
                </Box>
              ))
            )}
          </Box>

          {/* 나의 지갑 (간소화된 보기) */}
          <Box sx={{ width: '100%', mt: 3 }}>
            <Typography variant="h6" gutterBottom>나의 지갑</Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                연결된 MetaMask 지갑 주소: {account ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}` : '지갑 미연결'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                현재 ETH 잔액: {ethBalance !== null ? `${ethBalance} ETH` : '불러오는 중...'}
              </Typography>
              <Button variant="outlined" size="small" sx={{ mt: 2 }} onClick={() => window.open('https://metamask.io/', '_blank')}>
                MetaMask에서 지갑 보기
              </Button>
            </Paper>
          </Box>

          {/* 나의 곗돈 활동 내역 */}
          <Box sx={{ width: '100%', mt: 3 }}>
            <Typography variant="h6" gutterBottom>나의 곗돈 활동 내역</Typography>
            {recentActivities.length === 0 ? (
              <Typography variant="body2" color="text.secondary">아직 활동 내역이 없습니다.</Typography>
            ) : (
              <List dense>
                {recentActivities.map((activity) => (
                  <ListItem key={activity.id} divider>
                    <ListItemText
                      primary={
                        <Typography variant="body1" fontWeight="bold">
                          {activity.type === 'kye_created' && `새로운 곗돈 생성: ${activity.message.replace(/.*: /, '')}`}
                          {activity.type === 'kye_contributed' && `곗돈 납입: ${activity.message.replace(/.*: /, '')}`}
                          {activity.type === 'kye_payout' && `곗돈 수령: ${activity.message.replace(/.*: /, '')}`}
                          {activity.type === 'challenge_completed' && `챌린지 완료: ${activity.message.replace(/.*: /, '')}`}
                          {activity.type === 'role_assigned' && `역할 할당: ${activity.message.replace(/.*: /, '')}`}
                          {!activity.type && activity.message}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {new Date(activity.timestamp?.toDate()).toLocaleString()}
                          {activity.kyeId && ` | 곗돈 ID: ${activity.kyeId.substring(0, 6)}...`}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>

          <Box sx={{ mt: 3, width: '100%' }}>
            {isEditing ? (
              <Button variant="contained" onClick={handleSaveProfile} fullWidth>
                저장
              </Button>
            ) : (
              <Button variant="outlined" onClick={() => setIsEditing(true)} fullWidth>
                프로필 편집
              </Button>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ProfilePage;
