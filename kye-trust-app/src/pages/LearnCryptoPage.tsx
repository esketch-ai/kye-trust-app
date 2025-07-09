import React from 'react';
import { Container, Typography, Box, Accordion, AccordionSummary, AccordionDetails, Link as MuiLink } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const LearnCryptoPage: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        코인 기본 상식 배우기
      </Typography>
      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
        Kye-Trust와 함께 블록체인과 코인에 대한 궁금증을 해결해 보세요!
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          블록체인과 코인, 이것만 알면 돼요!
        </Typography>

        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" fontWeight="bold">1. 블록체인이란 무엇인가요? 🔗</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              블록체인은 '블록'이라는 작은 정보 덩어리들이 '체인'처럼 연결된 분산형 데이터 저장 기술이에요. 모든 거래 기록이 투명하게 공유되고 위조가 불가능해서 '디지털 공공 장부'라고도 불려요. Kye-Trust의 모든 곗돈 거래는 이 블록체인에 안전하게 기록됩니다.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" fontWeight="bold">2. 암호화폐(코인)란 무엇인가요? 💰</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              암호화폐는 블록체인 기술을 기반으로 만들어진 디지털 화폐예요. 비트코인, 이더리움 등이 대표적이죠. Kye-Trust에서는 이더리움(ETH)을 사용하여 곗돈을 납입하고 수령하게 됩니다. 실제 돈처럼 사용할 수 있지만, 온라인에서만 존재해요.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" fontWeight="bold">3. 지갑(Wallet)은 왜 필요한가요? 👛</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              블록체인 지갑은 여러분의 암호화폐를 보관하고 거래를 할 수 있게 해주는 '디지털 금고'와 같아요. Kye-Trust에서는 MetaMask(메타마스크)라는 지갑을 사용해요. 이 지갑이 있어야 곗돈을 납입하거나 수령할 수 있습니다.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" fontWeight="bold">4. 가스비(Gas Fee)란 무엇인가요? ⛽</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              블록체인에서 거래를 처리하려면 '가스비'라는 수수료를 내야 해요. 마치 자동차가 움직이려면 기름이 필요하듯이, 블록체인 네트워크를 이용하는 대가라고 생각하면 돼요. 이 가스비는 거래량에 따라 변동될 수 있습니다.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" fontWeight="bold">5. 개인 키와 시드 구문은 무엇인가요? 🔑</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              개인 키와 시드 구문(복구 구문)은 여러분의 디지털 금고(지갑)를 열 수 있는 '비밀 열쇠'예요. 이것이 유출되면 지갑의 모든 자산을 잃을 수 있으니, 절대로 다른 사람에게 알려주거나 온라인에 저장해서는 안 됩니다. 안전한 곳에 오프라인으로 보관하세요.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Box>

      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="h6" component="h2" gutterBottom>
          더 궁금한 점이 있으신가요?
        </Typography>
        <Typography variant="body1">
          Kye-Trust 고객센터에 문의하거나, MetaMask 공식 가이드를 참고해 보세요.
        </Typography>
        <MuiLink href="https://metamask.io/faqs/" target="_blank" rel="noopener" sx={{ mt: 2, display: 'block' }}>
          MetaMask 공식 FAQ 바로가기
        </MuiLink>
      </Box>
    </Container>
  );
};

export default LearnCryptoPage;
