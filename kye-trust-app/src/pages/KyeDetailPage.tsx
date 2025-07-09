import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Box, Paper, List, ListItem, ListItemText, Button, CircularProgress, Alert, TextField, Select, MenuItem, FormControl, InputLabel, LinearProgress } from '@mui/material';
import { ethers } from 'ethers';
import kyeTrustAbi from '../contracts/KyeTrust.json';
import { auth } from '../firebase';
import { addXPToUser, getUserProfile, updateTrustScoreOnKyeCompletion } from '../services/userService';
import { updateUserChallengeProgress } from '../services/userChallengeService';
import { sendMessage, subscribeToChat, ChatMessage } from '../services/chatService';
import { exampleKyes, KyeData as ExampleKyeData } from '../data/exampleKyes'; // exampleKyes와 KyeData를 ExampleKyeData로 임포트

interface Participant {
  address: string;
  status: string;
  displayName?: string | null;
  level?: number;
  role?: string; // Added for RBAC
}

interface KyeDetailData {
  id: string;
  name: string;
  goalAmount: number;
  contributionAmount: number;
  currentAmount: number;
  participants: Participant[];
  currentTurn: number;
  duration: number; // Added duration
  kyeState: string;
  isCurrentUserRecipient: boolean;
  hasAllContributed: boolean;
  isCurrentUserOwner: boolean;
  multiSigEnabled: boolean;
  requiredConfirmations: number;
  startConfirmations: number;
  payoutConfirmations: number;
}

const KyeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [kyeDetail, setKyeDetail] = useState<KyeDetailData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [selectedMemberForRole, setSelectedMemberForRole] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('Member');

  const isAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const fetchKyeDetails = useCallback(async () => {
    try {
      if (!id) {
        setError('Kye ID is missing.');
        setLoading(false);
        return;
      }

      // Check if the ID is an example ID
      const exampleKye = exampleKyes.find(kye => kye.id === id);
      if (exampleKye) {
        // Convert ExampleKyeData to KyeDetailData structure
        const participants: Participant[] = [
          { address: '0xExampleUser1', status: 'Paid', displayName: '예시 사용자1', level: 5, role: 'Member' },
          { address: '0xExampleUser2', status: 'Waiting', displayName: '예시 사용자2', level: 3, role: 'Member' },
        ];

        setKyeDetail({
          id: exampleKye.id,
          name: exampleKye.name,
          goalAmount: exampleKye.goalAmount,
          contributionAmount: exampleKye.goalAmount / 10, // 예시 값
          currentAmount: exampleKye.currentAmount,
          participants: participants,
          currentTurn: Math.ceil(exampleKye.currentAmount / (exampleKye.goalAmount / 10)), // 예시 값
          duration: 10, // 예시 값
          kyeState: exampleKye.progress === 100 ? 'Closed' : 'Active',
          isCurrentUserRecipient: false,
          hasAllContributed: true,
          isCurrentUserOwner: true,
          multiSigEnabled: false,
          requiredConfirmations: 0,
          startConfirmations: 0,
          payoutConfirmations: 0,
        });
        setLoading(false);
        return;
      }

      // If not an example ID, proceed with blockchain fetch if it's a valid address
      if (!isAddress(id)) {
        setError('Invalid Kye ID format. Please provide a valid blockchain address or an example ID.');
        setLoading(false);
        return;
      }

      if (!window.ethereum) {
        setError('MetaMask is not installed.');
        setLoading(false);
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const currentUserAddress = await signer.getAddress();

      const kyeContract = new ethers.Contract(
        id,
        kyeTrustAbi.abi,
        provider
      );

      const name = await kyeContract.name();
      const goalAmount = parseFloat(ethers.formatEther(await kyeContract.goalAmount()));
      const contributionAmount = parseFloat(ethers.formatEther(await kyeContract.contributionAmount()));
      const currentAmount = parseFloat(ethers.formatEther(await kyeContract.pot()));
      const membersAddresses: string[] = await kyeContract.members();
      const currentTurn = Number(await kyeContract.currentTurn());
      const duration = Number(await kyeContract.duration()); // Fetch duration
      const kyeState = await kyeContract.getState();
      const hasAllContributed = await kyeContract.hasAllContributedForCurrentTurn();
      const ownerAddress = await kyeContract.owner();
      const multiSigEnabled = await kyeContract.multiSigEnabled();
      const requiredConfirmations = Number(await kyeContract.requiredConfirmations());

      const ACTION_START_KYE = ethers.keccak256(ethers.toUtf8Bytes("START_KYE"));
      const ACTION_PAYOUT_KYE = ethers.keccak256(ethers.toUtf8Bytes("PAYOUT_KYE"));
      const [startConfirmationsCount] = await kyeContract.getConfirmationStatus(ACTION_START_KYE);
      const [payoutConfirmationsCount] = await kyeContract.getConfirmationStatus(ACTION_PAYOUT_KYE);

      const isCurrentUserRecipient = membersAddresses[currentTurn - 1]?.toLowerCase() === currentUserAddress.toLowerCase();
      const isCurrentUserOwner = ownerAddress.toLowerCase() === currentUserAddress.toLowerCase();

      const participants: Participant[] = [];
      for (let i = 0; i < membersAddresses.length; i++) {
        const memberAddress = membersAddresses[i];
        let displayName: string | null = null;
        let level: number | undefined;
        let role: string = 'None';

        try {
          const userProfile = await getUserProfile({ uid: memberAddress } as any);
          if (userProfile) {
            displayName = userProfile.displayName;
            level = userProfile.level;
          }
          const memberRole = await kyeContract.getRole(memberAddress);
          role = ['None', 'Member', 'Treasurer', 'Admin'][memberRole];
        } catch (profileError) {
          console.warn(`Could not fetch profile or role for ${memberAddress}:`, profileError);
        }

        const hasPaid = await kyeContract.hasPaid(currentTurn, memberAddress);
        let status = hasPaid ? 'Paid' : 'Waiting';
        if (i + 1 === currentTurn) {
          status = 'Current Turn';
        }
        participants.push({ address: memberAddress, status, displayName, level, role });
      }

      setKyeDetail({
        id,
        name,
        goalAmount,
        contributionAmount,
        currentAmount,
        participants,
        currentTurn,
        duration, // Assign duration
        kyeState,
        isCurrentUserRecipient,
        hasAllContributed,
        isCurrentUserOwner,
        multiSigEnabled,
        requiredConfirmations,
        startConfirmations: Number(startConfirmationsCount),
        payoutConfirmations: Number(payoutConfirmationsCount),
      });
    } catch (err: any) {
      console.error("Error fetching Kye details:", err);
      setError(err.reason || err.message || 'Failed to fetch Kye details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchKyeDetails();
  }, [fetchKyeDetails]);

  // Chat related useEffect
  useEffect(() => {
    if (id) {
      const unsubscribe = subscribeToChat(id, (fetchedMessages) => {
        setMessages(fetchedMessages);
      });
      return () => unsubscribe();
    }
  }, [id]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !auth.currentUser || !kyeDetail) return;

    try {
      const userProfile = await getUserProfile(auth.currentUser); // Get current user's display name
      const userName = userProfile?.displayName || auth.currentUser.email || 'Anonymous';

      await sendMessage(kyeDetail.id, auth.currentUser.uid, userName, newMessage);
      setNewMessage('');
    } catch (err: any) {
      console.error("Error sending message:", err);
      setError(err.message);
    }
  };

  const handleContribute = async () => {
    setTxStatus(null);
    setError(null);
    try {
      if (!window.ethereum || !id) {
        setError('MetaMask is not installed or Kye ID is missing.');
        return;
      }

      if (!auth.currentUser) {
        setError('You must be logged in to contribute.');
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const kyeContract = new ethers.Contract(
        id,
        kyeTrustAbi.abi,
        signer
      );

      if (!kyeDetail) {
        setError("Kye details not loaded.");
        return;
      }

      const contributionValue = ethers.parseEther(kyeDetail.contributionAmount.toString());

      const tx = await kyeContract.contribute({
        value: contributionValue,
      });
      setTxStatus(`Sending contribution... Transaction hash: ${tx.hash}`);
      await tx.wait();
      setTxStatus('Contribution successful!');

      await addXPToUser(auth.currentUser.uid, 20);
      await updateUserChallengeProgress(auth.currentUser.uid, 'contribution-pro-10', 1);

      setLoading(true);
      await fetchKyeDetails();

    } catch (err: any) {
      console.error("Error contributing:", err);
      setError(err.reason || err.message || 'Failed to make contribution.');
      setTxStatus(null);
    }
  };

  const handlePayout = async () => {
    setTxStatus(null);
    setError(null);
    try {
      if (!window.ethereum || !id) {
        setError('MetaMask is not installed or Kye ID is missing.');
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const kyeContract = new ethers.Contract(
        id,
        kyeTrustAbi.abi,
        signer
      );

      if (!kyeDetail) {
        setError("Kye details not loaded.");
        return;
      }

      const tx = await kyeContract.payout();
      setTxStatus(`Sending payout transaction... Transaction hash: ${tx.hash}`);
      await tx.wait();
      setTxStatus('Payout successful!');

      const updatedKyeState = await kyeContract.getState();
      if (updatedKyeState === 'Closed' && kyeDetail.participants) {
        for (const participant of kyeDetail.participants) {
          await addXPToUser(participant.address, 100);
          await updateTrustScoreOnKyeCompletion(participant.address, true);
          await updateUserChallengeProgress(participant.address, 'kye-master-beginner', 1);
        }
      }

      setLoading(true);
      await fetchKyeDetails();

    } catch (err: any) {
      console.error("Error during payout:", err);
      setError(err.reason || err.message || 'Failed to process payout.');
      setTxStatus(null);
    }
  };

  const handleStartKye = async () => {
    setTxStatus(null);
    setError(null);
    try {
      if (!window.ethereum || !id) {
        setError('MetaMask is not installed or Kye ID is missing.');
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const kyeContract = new ethers.Contract(
        id,
        kyeTrustAbi.abi,
        signer
      );

      if (!kyeDetail) {
        setError("Kye details not loaded.");
        return;
      }

      const tx = await kyeContract.start();
      setTxStatus(`Starting Kye... Transaction hash: ${tx.hash}`);
      await tx.wait();
      setTxStatus('Kye started successfully!');
      setLoading(true);
      await fetchKyeDetails();

    } catch (err: any) {
      console.error("Error starting Kye:", err);
      setError(err.reason || err.message || 'Failed to start Kye.');
      setTxStatus(null);
    }
  };

  const handleConfirmAction = async (actionType: 'start' | 'payout') => {
    setTxStatus(null);
    setError(null);
    try {
      if (!window.ethereum || !id) {
        setError('MetaMask is not installed or Kye ID is missing.');
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const kyeContract = new ethers.Contract(
        id,
        kyeTrustAbi.abi,
        signer
      );

      if (!kyeDetail) {
        setError("Kye details not loaded.");
        return;
      }

      let tx;
      if (actionType === 'start') {
        tx = await kyeContract.start();
        setTxStatus(`Confirming Kye start... Transaction hash: ${tx.hash}`);
      } else if (actionType === 'payout') {
        tx = await kyeContract.payout();
        setTxStatus(`Confirming Kye payout... Transaction hash: ${tx.hash}`);
      }

      if (tx) {
        await tx.wait();
        setTxStatus(`${actionType === 'start' ? 'Start' : 'Payout'} confirmed successfully!`);
        setLoading(true);
        await fetchKyeDetails();
      }

    } catch (err: any) {
      console.error(`Error confirming ${actionType}:`, err);
      setError(err.reason || err.message || `Failed to confirm ${actionType}.`);
      setTxStatus(null);
    }
  };

  const handleAssignRole = async () => {
    if (!selectedMemberForRole || !selectedRole || !kyeDetail || !auth.currentUser) return;

    setTxStatus(null);
    setError(null);
    try {
      if (!window.ethereum || !id) {
        setError('MetaMask is not installed or Kye ID is missing.');
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const kyeContract = new ethers.Contract(
        id,
        kyeTrustAbi.abi,
        signer
      );

      // Convert string role to enum value
      const roleEnum = ['None', 'Member', 'Treasurer', 'Admin'].indexOf(selectedRole);
      if (roleEnum === -1) {
        setError("Invalid role selected.");
        return;
      }

      const tx = await kyeContract.assignRole(selectedMemberForRole, roleEnum);
      setTxStatus(`Assigning role... Transaction hash: ${tx.hash}`);
      await tx.wait();
      setTxStatus('Role assigned successfully!');
      setLoading(true);
      await fetchKyeDetails();

    } catch (err: any) {
      console.error("Error assigning role:", err);
      setError(err.reason || err.message || 'Failed to assign role.');
      setTxStatus(null);
    }
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

  if (!kyeDetail) {
    return (
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Typography>No Kye details found.</Typography>
      </Container>
    );
  }

  const isCurrentUserMember = kyeDetail.participants.some(p => p.address.toLowerCase() === auth.currentUser?.uid.toLowerCase());
  const currentUserRole = kyeDetail.participants.find(p => p.address.toLowerCase() === auth.currentUser?.uid.toLowerCase())?.role || 'None';

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mt: 8 }}>
        <Typography component="h1" variant="h4" gutterBottom>
          {kyeDetail.name} (ID: {kyeDetail.id.substring(0, 6)}...{kyeDetail.id.substring(kyeDetail.id.length - 4)})
          <Button
            variant="outlined"
            size="small"
            sx={{ ml: 2 }}
            onClick={() => window.open(`https://sepolia.etherscan.io/address/${kyeDetail.id}`, '_blank')}
          >
            블록체인 기록 조회
          </Button>
        </Typography>

        {/* 목표 달성 여정 시각화 */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>목표 달성 여정</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="body1" sx={{ mr: 1 }}>현재 납입 회차: {kyeDetail.currentTurn} / {kyeDetail.duration}</Typography>
            <LinearProgress
              variant="determinate"
              value={(kyeDetail.currentTurn / kyeDetail.duration) * 100}
              sx={{ flexGrow: 1, height: 10, borderRadius: 5 }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            다음 체크포인트까지 남은 거리: {kyeDetail.duration - kyeDetail.currentTurn} 회차
          </Typography>
          <Typography variant="body2" color="text.secondary">
            목표 달성 시 '성공 뱃지'와 '트로피'를 획득할 수 있습니다!
          </Typography>
        </Paper>

        {/* 나의 납입 정보 */}
        {auth.currentUser && kyeDetail.participants.some(p => p.address.toLowerCase() === auth.currentUser?.uid.toLowerCase()) && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>나의 납입 정보</Typography>
            <Typography variant="body1">
              다음 납입일: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()} (예시)
            </Typography>
            <Typography variant="body1">
              납입 금액: {kyeDetail.contributionAmount} ETH
            </Typography>
            <Typography variant="body1">
              현재까지 납입한 총액: {(kyeDetail.currentTurn - 1) * kyeDetail.contributionAmount} ETH (예시)
            </Typography>
          </Paper>
        )}

        {/* AI 위험 알림 */}
        <Paper sx={{ p: 3, mb: 3, bgcolor: 'warning.light' }}>
          <Typography variant="h6" gutterBottom>AI 위험 알림</Typography>
          <Typography variant="body2" color="text.secondary">
            해당 곗돈 그룹 내에 잠재적 위험(예: 특정 참여자의 납입 패턴 변화) 감지 시, 여기에 경고 메시지가 표시됩니다. (준비 중)
          </Typography>
          {/* Example of a potential alert */}
          {/* <Alert severity="warning" sx={{ mt: 1 }}>
            <Typography variant="body2">주의: '홍길동'님의 납입 패턴에 변화가 감지되었습니다. 상세 내용을 확인하세요.</Typography>
          </Alert> */}
        </Paper>

        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6">목표 금액: {kyeDetail.goalAmount} ETH</Typography>
          <Typography variant="h6">월 납입액: {kyeDetail.contributionAmount} ETH</Typography>
          <Typography variant="h6">현재 적립액: {kyeDetail.currentAmount} ETH</Typography>
          <Typography variant="h6">현재 회차: {kyeDetail.currentTurn}</Typography>
          <Typography variant="h6">상태: {kyeDetail.kyeState}</Typography>
          {kyeDetail.multiSigEnabled && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2">다중 서명 활성화: {kyeDetail.requiredConfirmations}명 필요</Typography>
              {kyeDetail.kyeState === 'Created' && (
                <Typography variant="body2">시작 확인: {kyeDetail.startConfirmations} / {kyeDetail.requiredConfirmations}</Typography>
              )}
              {kyeDetail.kyeState === 'Active' && (
                <Typography variant="body2">지급 확인: {kyeDetail.payoutConfirmations} / {kyeDetail.requiredConfirmations}</Typography>
              )}
            </Box>
          )}
        </Paper>

        <Typography component="h2" variant="h5" gutterBottom>
          납입 현황판
        </Typography>
        <List>
          {kyeDetail.participants.map((p, index) => (
            <ListItem key={p.address} divider>
              <ListItemText
                primary={p.displayName ? `${p.displayName} (레벨: ${p.level || 1})` : `${p.address.substring(0, 6)}...${p.address.substring(p.address.length - 4)}`}
                secondary={`상태: ${p.status} | 역할: ${p.role} ${index + 1 === kyeDetail.currentTurn ? '(이번 회차 수령인)' : ''}`}
              />
            </ListItem>
          ))}
        </List>

        {/* Role Assignment Section */}
        {kyeDetail.isCurrentUserOwner && kyeDetail.kyeState === 'Created' && (
          <Box sx={{ mt: 3, p: 2, border: '1px solid #ccc', borderRadius: '4px' }}>
            <Typography variant="h6" gutterBottom>역할 할당</Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>멤버 선택</InputLabel>
              <Select
                value={selectedMemberForRole}
                label="멤버 선택"
                onChange={(e) => setSelectedMemberForRole(e.target.value as string)}
              >
                {kyeDetail.participants.map((p) => (
                  <MenuItem key={p.address} value={p.address}>
                    {p.displayName || p.address.substring(0, 6) + '...' + p.address.substring(p.address.length - 4)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>역할 선택</InputLabel>
              <Select
                value={selectedRole}
                label="역할 선택"
                onChange={(e) => setSelectedRole(e.target.value as string)}
              >
                <MenuItem value="Member">계원</MenuItem>
                <MenuItem value="Treasurer">총무</MenuItem>
                <MenuItem value="Admin">관리자</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" onClick={handleAssignRole} disabled={!selectedMemberForRole || !selectedRole}>
              역할 할당
            </Button>
          </Box>
        )}

        {txStatus && <Alert severity="info" sx={{ mt: 2 }}>{txStatus}</Alert>}
        <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {/* Start Kye Button */}
          {kyeDetail.kyeState === 'Created' && kyeDetail.isCurrentUserOwner && !kyeDetail.multiSigEnabled && (
            <Button variant="contained" color="success" onClick={handleStartKye}>
              곗돈 시작
            </Button>
          )}
          {kyeDetail.kyeState === 'Created' && kyeDetail.multiSigEnabled && kyeDetail.isCurrentUserOwner && (
            <Button variant="contained" color="success" onClick={() => handleConfirmAction('start')} disabled={kyeDetail.startConfirmations >= kyeDetail.requiredConfirmations}>
              시작 확인 ({kyeDetail.startConfirmations}/{kyeDetail.requiredConfirmations})
            </Button>
          )}

          {/* Contribute Button */}
          {kyeDetail.kyeState === 'Active' && (
            <Button variant="contained" color="primary" onClick={handleContribute}>
              월 납입하기
            </Button>
          )}

          {/* Payout Button */}
          {kyeDetail.kyeState === 'Active' && kyeDetail.isCurrentUserRecipient && kyeDetail.hasAllContributed && kyeDetail.currentAmount > 0 && !kyeDetail.multiSigEnabled && (
            <Button variant="contained" color="secondary" onClick={handlePayout}>
              곗돈 수령
            </Button>
          )}
          {kyeDetail.kyeState === 'Active' && kyeDetail.isCurrentUserRecipient && kyeDetail.hasAllContributed && kyeDetail.currentAmount > 0 && kyeDetail.multiSigEnabled && kyeDetail.isCurrentUserOwner && (
            <Button variant="contained" color="secondary" onClick={() => handleConfirmAction('payout')} disabled={kyeDetail.payoutConfirmations >= kyeDetail.requiredConfirmations}>
              수령 확인 ({kyeDetail.payoutConfirmations}/{kyeDetail.requiredConfirmations})
            </Button>
          )}
        </Box>

        {/* Chat Section */}
        <Box sx={{ mt: 4 }}>
          <Typography component="h2" variant="h5" gutterBottom>
            곗돈 그룹 채팅
          </Typography>
          <Paper sx={{ p: 2, height: 300, overflow: 'auto', mb: 2 }}>
            {messages.map((msg, index) => (
              <Box key={index} sx={{ mb: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {msg.userName} ({new Date(msg.timestamp?.toDate()).toLocaleString()}):
                </Typography>
                <Typography variant="body2">{msg.message}</Typography>
              </Box>
            ))}
          </Paper>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="메시지를 입력하세요..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
            sx={{ mb: 1 }}
          />
          <Button variant="contained" onClick={handleSendMessage} disabled={!newMessage.trim()}>
            메시지 전송
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default KyeDetailPage;