# Kye-Trust

## Trust-based AI-powered Online Joint Fund Operation and Social Community Platform

---

## Introduction

**Kye-Trust** is an innovative web-based platform designed to revolutionize traditional 'Kye' (a rotating savings and credit association) by integrating cutting-edge AI and blockchain technologies. It provides a transparent, secure, and intelligent environment for individuals to collectively manage funds, achieve financial goals, and build a trusted community. Our platform leverages AI for enhanced trust scoring and risk assessment, while blockchain ensures immutable records and fair operations. Kye-Trust aims to foster financial well-being and social connection through a gamified and reliable system.

---

## 소개

**Kye-Trust**는 최첨단 AI 및 블록체인 기술을 통합하여 전통적인 '곗돈' 문화를 혁신하도록 설계된 웹 기반 플랫폼입니다. 개인들이 자금을 공동으로 관리하고, 재정적 목표를 달성하며, 신뢰할 수 있는 커뮤니티를 구축할 수 있는 투명하고 안전하며 지능적인 환경을 제공합니다. 저희 플랫폼은 AI를 활용하여 신뢰 점수 및 위험 평가를 강화하고, 블록체인은 불변의 기록과 공정한 운영을 보장합니다. Kye-Trust는 게임화된 신뢰할 수 있는 시스템을 통해 재정적 안정과 사회적 연결을 촉진하는 것을 목표로 합니다.

---

## Key Features

*   **AI-powered Trust Scoring & Risk Assessment:** Utilizes AI models to analyze payment patterns and predict potential overdue risks, enhancing the reliability of Kye groups.
*   **Blockchain-based Transparent Fund Management:** All fund contributions, payouts, and transactions are recorded on a public blockchain (Hardhat local node for development), ensuring transparency and immutability.
*   **Multi-signature Kye Creation & Payout:** Supports multi-signature requirements for critical actions, adding an extra layer of security and collective decision-making.
*   **Gamified Onboarding & Challenges:** Engages users through a step-by-step onboarding process and various challenges to encourage participation and reward positive financial behavior.
*   **Secure User Profile Management:** Manages user profiles, trust scores, and badges securely through Firebase Authentication and Firestore.
*   **MetaMask Integration:** Seamlessly connects with MetaMask for secure wallet management and blockchain interactions.

---

## 주요 기능

*   **AI 기반 신뢰 점수 및 위험 평가:** AI 모델을 활용하여 납입 패턴을 분석하고 잠재적인 연체 위험을 예측하여 곗돈 그룹의 신뢰도를 높입니다.
*   **블록체인 기반 투명한 자금 관리:** 모든 자금 납입, 지급 및 거래는 공개 블록체인(개발용 Hardhat 로컬 노드)에 기록되어 투명성과 불변성을 보장합니다.
*   **다중 서명 곗돈 개설 및 지급:** 주요 작업에 대한 다중 서명 요구 사항을 지원하여 추가적인 보안 계층과 집단 의사 결정을 제공합니다.
*   **게임화된 온보딩 및 챌린지:** 단계별 온보딩 프로세스와 다양한 챌린지를 통해 사용자 참여를 유도하고 긍정적인 재정 행동에 보상합니다.
*   **안전한 사용자 프로필 관리:** Firebase 인증 및 Firestore를 통해 사용자 프로필, 신뢰 점수 및 뱃지를 안전하게 관리합니다.
*   **MetaMask 통합:** MetaMask와 원활하게 연결되어 안전한 지갑 관리 및 블록체인 상호 작용을 제공합니다.

---

## Technologies Used

*   **Frontend:** React, Material-UI
*   **Backend:** Firebase (Authentication, Firestore, Cloud Functions)
*   **Blockchain:** Hardhat, Ethers.js, Solidity (Smart Contracts)
*   **AI:** Google Cloud Vertex AI (for overdue prediction)

---

## 사용 기술

*   **프론트엔드:** React, Material-UI
*   **백엔드:** Firebase (인증, Firestore, 클라우드 함수)
*   **블록체인:** Hardhat, Ethers.js, Solidity (스마트 컨트랙트)
*   **AI:** Google Cloud Vertex AI (연체 예측용)

---

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Ensure you have the following installed:
*   Node.js (LTS version recommended)
*   npm (Node Package Manager)
*   Git
*   Firebase CLI (`npm install -g firebase-tools`)
*   Google Cloud SDK (for Vertex AI integration, if needed)
*   MetaMask browser extension

### Installation & Running

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/esketch-ai/kye-trust.git
    cd kye-trust
    ```

2.  **Install frontend dependencies:**
    ```bash
    cd kye-trust-app
    npm install
    ```

3.  **Start Hardhat local node:**
    Open a new terminal and run:
    ```bash
    cd kye-trust-app
    npx hardhat node
    ```
    Keep this terminal open.

4.  **Deploy smart contracts:**
    Open another new terminal and run:
    ```bash
    cd kye-trust-app
    npx hardhat run scripts/deploy.js --network localhost
    ```

5.  **Configure MetaMask:**
    *   Add a custom RPC network to MetaMask:
        *   Network Name: `Localhost 8545`
        *   New RPC URL: `http://127.0.0.1:8545`
        *   Chain ID: `1337`
        *   Currency Symbol: `ETH`
    *   Import one of the private keys from the Hardhat node terminal (e.g., `0xac09...`) into MetaMask to get test ETH.

6.  **Start the React development server:**
    ```bash
    cd kye-trust-app
    npm start
    ```
    The application will open in your browser at `http://localhost:3000`.

---

## 시작하기

로컬 환경에서 프로젝트를 설정하고 실행하려면 다음 간단한 단계를 따르세요.

### 사전 준비 사항

다음 소프트웨어가 설치되어 있는지 확인하세요:
*   Node.js (LTS 버전 권장)
*   npm (Node Package Manager)
*   Git
*   Firebase CLI (`npm install -g firebase-tools`)
*   Google Cloud SDK (Vertex AI 통합이 필요한 경우)
*   MetaMask 브라우저 확장 프로그램

### 설치 및 실행

1.  **저장소 복제:**
    ```bash
    git clone https://github.com/esketch-ai/kye-trust.git
    cd kye-trust
    ```

2.  **프론트엔드 의존성 설치:**
    ```bash
    cd kye-trust-app
    npm install
    ```

3.  **Hardhat 로컬 노드 시작:**
    새 터미널을 열고 다음을 실행하세요:
    ```bash
    cd kye-trust-app
    npx hardhat node
    ```
    이 터미널은 계속 열어두세요.

4.  **스마트 컨트랙트 배포:**
    다른 새 터미널을 열고 다음을 실행하세요:
    ```bash
    cd kye-trust-app
    npx hardhat run scripts/deploy.js --network localhost
    ```

5.  **MetaMask 설정:**
    *   MetaMask에 사용자 정의 RPC 네트워크를 추가하세요:
        *   네트워크 이름: `Localhost 8545`
        *   새 RPC URL: `http://127.0.0.1:8545`
        *   체인 ID: `1337`
        *   통화 기호: `ETH`
    *   Hardhat 노드 터미널에서 개인 키 중 하나(예: `0xac09...`)를 MetaMask로 가져와 테스트 ETH를 받으세요.

6.  **React 개발 서버 시작:**
    ```bash
    cd kye-trust-app
    npm start
    ```
    애플리케이션이 브라우저에서 `http://localhost:3000`으로 열립니다.

---

## Contact & Support

For any questions or support, please open an issue in this repository.

---

## 연락처 및 지원

질문이나 지원이 필요한 경우, 이 저장소에 이슈를 열어주세요.
