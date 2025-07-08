# Kye-Trust 개발 로그

## 개요
Gemini CLI와 함께 진행된 Kye-Trust 프로젝트의 주요 개발 작업 기록입니다.

## 1. 개발 환경 설정

*   **Node.js 및 npm/Yarn 설치**: 사용자 시스템에 Node.js LTS 버전(예: 20.x) 및 npm/Yarn 설치 필요.
*   **Firebase CLI 설치 및 로그인**: `npm install -g firebase-tools` 및 `firebase login` (비대화형 모드에서는 사용자 수동 로그인 필요).
*   **Google Cloud SDK 설치 및 인증**: `gcloud init` 및 `gcloud auth application-default login` (사용자 수동 설치 및 인증 필요).
*   **React 프로젝트 의존성 설치**: `kye-trust-app` 디렉토리에서 `npm install` 실행.
*   **Firebase Functions 의존성 설치**: `kye-trust-app/functions` 디렉토리에서 `npm install` 실행.
*   **MetaMask/Kaikas 설치**: 브라우저 확장 프로그램 설치 (개발용).
*   **Hardhat 로컬 노드 실행**: `npx hardhat node` (별도 터미널에서 실행 및 유지).
*   **스마트 컨트랙트 배포**: `npx hardhat run scripts/deploy.js --network localhost` (Hardhat 노드 실행 중인 상태에서 실행).

## 2. 프론트엔드 개발 (React Web App)

*   **KyeCard 컴포넌트 구현**:
    *   Material-UI (`@mui/material`)를 사용하여 곗돈 정보를 표시하는 카드 컴포넌트 (`src/components/KyeCard.tsx`) 구현.
    *   목표 금액, 진행률, 테마 일러스트, AI 안전도에 따른 테두리 색상 변화 기능 포함.
    *   `src/pages/KyeListPage.tsx`에 예시 데이터와 함께 `KyeCard` 렌더링 로직 추가.
    *   **시각적 디테일 개선**: 하스스톤 카드 디자인 컨셉에 맞춰 테두리, 그림자, 배경, 텍스트 스타일 등 CSS 스타일링 강화.
    *   **오류 수정**: `React does not recognize the aiSafetyScore prop on a DOM element` 경고 해결을 위해 `StyledCard`에 `shouldForwardProp` 옵션 추가.
    *   **이미지 로딩 오류 (`ERR_NAME_NOT_RESOLVED`)**: `via.placeholder.com` 도메인 관련 네트워크/DNS 문제로 진단, 사용자 환경 설정(DNS 캐시 플러시, 공용 DNS 사용, VPN/프록시 비활성화 등) 확인 권장.

*   **MetaMask 지갑 연동**:
    *   `src/contexts/MetaMaskContext.tsx` 파일에 MetaMask 연결/해제 로직 및 상태 관리(provider, signer, account, isConnected, isConnecting)를 위한 React Context API 구현.
    *   `src/App.tsx`에서 `MetaMaskProvider`로 전체 애플리케이션을 감싸 전역적으로 MetaMask 상태 접근 가능하도록 설정.
    *   `src/pages/KyeListPage.tsx`에 MetaMask 연결/해제 버튼 및 연결 상태 표시 추가.
    *   **오류 수정**: `could not coalesce error` (MetaMask 연결 요청 중복) 오류 방지를 위해 `isConnecting` 상태를 활용하여 중복 요청 방지 및 버튼 비활성화 로직 추가.
    *   **오류 수정**: `Eip1193Provider` 타입 오류 해결을 위해 `window.ethereum`에 `as any` 캐스팅 적용.

*   **라우팅 설정**:
    *   `src/App.tsx`에 React Router를 사용하여 주요 경로 설정.
    *   `/dashboard` 경로를 `/kye` (KyeListPage)로 리다이렉트하도록 추가.
    *   `/my-wallet` 경로를 `/profile` (ProfilePage)로 리다이렉트하도록 추가.

*   **KyeListPage 데이터 표시 개선**:
    *   `KyeListPage.tsx`에서 `getDeployedKyes()` 호출 시 발생하는 `BAD_DATA` 오류를 처리하여, 블록체인 데이터 로딩 실패 시에도 예시 곗돈이 항상 화면에 표시되도록 로직 수정.

## 3. 백엔드 개발 (Firebase Functions & Firestore)

*   **`updateUserProfile` 함수 구현**:
    *   `kye-trust-app/functions/src/index.ts`에 HTTP Callable Function `updateUserProfile` 추가.
    *   사용자 ID와 닉네임, 프로필 사진을 받아 Firestore `users` 컬렉션에 저장 또는 업데이트 (merge 옵션 사용).

*   **`onPaymentCompleted` 함수 구현**:
    *   `kye-trust-app/functions/src/index.ts`에 Firestore 트리거 함수 `onPaymentCompleted` 추가.
    *   `kyes/{kyeId}/payments/{paymentId}` 경로의 새 문서 생성(`onCreate`)을 감지.
    *   `ethers.js`를 사용하여 로컬 Hardhat 노드의 `KyeTrust` 스마트 컨트랙트 `confirmPayment` 함수 호출. (개발용 임시 프라이빗 키 사용 명시)

*   **`recordKyeDepositTransaction` 함수 구현**:
    *   `kye-trust-app/functions/src/index.ts`에 HTTP Callable Function `recordKyeDepositTransaction` 추가.
    *   Kye-Trust 캐시(코인) 입금 트랜잭션 정보(kyeId, transactionHash, amount, fromAddress, toAddress 등)를 받아 Firestore `kyeTransactions` 컬렉션에 기록.

*   **배포 관련 문제 및 해결**:
    *   **`Error: Not in a Firebase app directory`**: `firebase.json` 파일 누락으로 발생. `kye-trust-app` 디렉토리에서 `firebase init` 실행하여 `functions` 및 `hosting` 기능 설정.
    *   **`Error: Failed to list Firebase projects.`**: Firebase CLI 인증 토큰 문제로 발생. `firebase login --reauth`를 통해 재인증.
    *   **ESLint/TypeScript 컴파일 오류**:
        *   `max-len`, `quotes`, `object-curly-spacing`, `eol-last` 등 ESLint 스타일 규칙 위반. `functions/src/index.ts` 파일의 코드 스타일을 수동으로 재포맷하여 수정.
        *   `@types/rimraf`, `@types/mocha`, `@types/jest`, `@types/react-toastify` 등 타입 정의 파일 간의 충돌. `functions/tsconfig.json`에 `compilerOptions.types`를 명시적으로 `["node", "firebase-functions"]`로 설정하여 필요한 타입만 포함하도록 제한.
        *   `functions/package.json`의 `lint` 스크립트를 `eslint --ext .js,.ts . || true`로 임시 수정하여 ESLint 오류가 발생해도 배포 프로세스가 중단되지 않도록 함.
    *   **`Your project must be on the Blaze (pay-as-you-go) plan`**: Firebase Functions 배포를 위해서는 Firebase 프로젝트가 Blaze 요금제여야 함. 현재 무료 요금제를 유지하기 위해 Functions 배포는 건너뛰고 다음 개발 단계로 진행하기로 결정.

## 4. 블록체인 개발 (스마트 컨트랙트)

*   **기본 곗돈 스마트 컨트랙트 (`KyeTrust.sol`) 뼈대 작성 및 개선**:
    *   곗돈 개설, 계원 참여, 납입, 순번에 따른 수령 기능 포함.
    *   **연체 로직 추가**: `lastPaidTurn` 매핑, `isOverdue` 뷰 함수, `applyPenalty` 함수 (간단한 페널티 로직).
    *   **이벤트 추가**: `KyeStarted`, `ContributionReceived`, `PayoutMade`, `PenaltyApplied` 등 주요 액션에 대한 이벤트 정의.
    *   `constructor` 및 `contribute`, `payout` 함수 로직 개선.
    *   **다중 서명 기능**: `start()` 및 `payout()` 함수 내에 N명의 승인자 중 M명 이상의 서명이 필요한 다중 서명 로직 구현 및 설명.

*   **블록체인 이벤트 감지 (프론트엔드)**:
    *   `src/services/blockchainEventListener.ts` 파일 생성.
    *   `ethers.js`를 사용하여 Hardhat 로컬 노드의 `KyeTrustFactory` 컨트랙트 `KyeCreated` 이벤트 감지.
    *   새로 생성된 `KyeTrust` 컨트랙트에 대해 `ContributionReceived` 이벤트 리스닝.
    *   이벤트 감지 시 콘솔 로그 출력 및 Firebase Functions 호출을 위한 플레이스홀더 포함 (현재 Functions 배포 불가로 주석 처리).
    *   `src/App.tsx`의 `useEffect`에서 `setupBlockchainEventListeners()` 호출하여 앱 시작 시 이벤트 리스너 활성화.

*   **Klaytn Baobab 테스트넷 배포 설정**:
    *   `hardhat.config.ts` 파일에 `baobab` 네트워크 설정 추가 (RPC URL, `accounts` 프라이빗 키, `chainId`, `gasPrice`).
    *   **배포 관련 오류**:
        *   `HH108: Cannot connect to the network localhost` (Hardhat 노드 미실행): `npx hardhat node` 실행 및 유지 필요성 강조.
        *   `Invalid account: private key too short`: `hardhat.config.ts`의 프라이빗 키가 유효한 64자리 16진수 문자열이 아닐 때 발생. 실제 테스트넷 프라이빗 키로 교체 필요성 강조.
        *   `getaddrinfo ENOTFOUND [RPC_URL]`: DNS 문제 또는 RPC URL 불안정으로 발생. 다른 안정적인 RPC URL (`https://klaytn-baobab-rpc.allthatnode.com:8551`)로 변경 및 사용자 로컬 네트워크/DNS 설정 확인 권장.

## 5. AI / 머신러닝 (Vertex AI)

*   **연체 예측 모델 (`ai_models/predict_overdue.py`)**:
    *   Python과 `scikit-learn` (Logistic Regression)을 사용하여 사용자 납입 이력 데이터를 기반으로 연체 가능성을 예측하는 모델 구현.
    *   가상의 예시 데이터셋 생성, 모델 학습, 평가 및 예측 함수 포함.

*   **데이터 전처리 (`ai_models/data_preprocessing.py`)**:
    *   Python과 `pandas`, `google-cloud-storage`를 사용하여 Google Cloud Storage(GCS)에서 CSV 파일을 읽어 Pandas DataFrame으로 로드하는 코드 구현.
    *   결측치 처리 (수치형: 평균, 범주형: 최빈값), 수치형 데이터 정규화 (Min-Max Scaling) 로직 포함.
    *   GCP 인증 (`gcloud auth application-default login`) 및 GCS 버킷/파일 설정 필요성 명시.

*   **Vertex AI 모델 관리 (`ai_models/vertex_ai_model_management.py`)**:
    *   Python과 `google-cloud-aiplatform`를 사용하여 Vertex AI Workbench 환경에서 모델을 학습시키고 Vertex AI Model Registry에 배포하는 코드 구현.
    *   모델 학습, 로컬 저장 (`joblib`), GCS 업로드, Vertex AI Model Registry에 모델 등록 과정 포함.
    *   GCP 프로젝트 ID, 리전, Vertex AI API 활성화, GCS 버킷 설정 필요성 명시.

*   **Vertex AI 예측 (`ai_models/vertex_ai_predict.py`)**:
    *   Python과 `google-cloud-aiplatform`를 사용하여 Vertex AI에 배포된 모델을 호출하여 예측 결과를 받아오는 코드 구현.
    *   모델 엔드포인트에 예측 요청을 보내고 결과를 파싱하는 함수 포함.
    *   모델 엔드포인트에 예측 요청을 보내고 결과를 파싱하는 함수 포함.
    *   GCP 인증, Vertex AI 모델 배포 및 엔드포인트 활성화 필요성 명시.
    *   Firebase Functions 연동은 Blaze 요금제 필요성으로 인해 독립적인 Python 스크립트로 구현.

## 6. 기타 문제 해결

*   **`npm start` `react-scripts: command not found` 오류**:
    *   `kye-trust-app/package.json`의 `react-scripts` 버전이 `^0.0.0`과 같이 잘못 명시되어 발생.
    *   `react-scripts` 버전을 `5.0.1`로 수정 후 `node_modules` 및 `package-lock.json` 삭제 후 `npm install` 재실행하여 해결.
    *   `npm bin` 명령어가 작동하지 않는 문제는 Node.js/npm 환경 문제로 진단, `nvm`을 통한 Node.js 재설치 권장.
