# Kye-Trust 개발 문서: Gemini CLI 기반 효율적인 웹앱 개발 가이드

## 1. 개발 개요 및 목표

- **프로젝트명**: Kye-Trust (신뢰 기반 AI 지능형 공동 자금 운용 웹앱 서비스)
    
- **개발 목표**: 일반 사용자가 암호화폐에 대한 이해 없이도 쉽고 편리하며, 안전하게 곗돈(Kye-Trust 챌린지)에 참여하고, 목돈 마련 목표를 달성할 수 있는 서비스 구현. 블록체인과 AI 기술은 백그라운드에서 완벽하게 작동하되, 사용자 경험은 하스스톤 카드 컨셉의 게이밍 UI/UX로 직관적이고 즐겁게 제공.
    
- **주요 기술 스택**: React, Google Cloud Platform (GCP), Firebase (Firestore, Functions, Auth, Storage), 블록체인 (Klaytn/Ethereum 기반 스마트 컨트랙트), AI Platform (Vertex AI), Web3.js/Ethers.js.
    
- **개발 도구**: Gemini CLI, VS Code, Git.
    

---

## 2. Gemini CLI 활용 전략

Gemini CLI는 개발 생산성을 높이는 강력한 도구이지만, 효과적인 활용을 위해 명확한 가이드라인이 필요합니다.

- **역할**: Gemini CLI는 **코드 생성, 아키텍처 스니펫 제안, 특정 로직 구현 아이디어 제공, 디버깅 보조, 테스트 코드 작성 지원** 등의 역할을 수행합니다. 전체 시스템 설계나 복잡한 비즈니스 로직의 총체적인 구현은 개발팀의 책임입니다.
    
- **프롬프트 작성 원칙**:
    
    - **명확성**: 요구사항을 구체적이고 명확하게 설명합니다. 추상적인 표현 대신 '무엇을', '어떻게'를 상세히 기술합니다.
        
    - **컨텍스트 제공**: 관련 코드 스니펫, 데이터 스키마, 기존 아키텍처 등 Gemini가 참고할 수 있는 컨텍스트를 충분히 제공합니다.
        
    - **단계별 요청**: 한 번에 거대한 코드를 요청하기보다, 작은 기능 단위로 나누어 단계적으로 요청하고 검증합니다.
        
    - **예시 포함**: 원하는 결과물의 형태나 스타일이 있다면 예시를 함께 제시합니다.
        
    - **오류 메시지 활용**: 오류 발생 시, 오류 메시지를 정확하게 복사하여 Gemini에 제공하고 해결책을 모색합니다.
        
- **코드 검증 및 통합**:
    
    - Gemini CLI가 생성한 코드는 반드시 **개발자가 직접 검토하고 이해**해야 합니다.
        
    - 생성된 코드는 **테스트 케이스를 작성하여 기능 및 안정성을 검증**합니다.
        
    - 기존 코드베이스와의 **통합 과정에서 발생할 수 있는 충돌**을 해결하고, 전체 시스템의 일관성을 유지합니다.
        
- **버전 관리**: Gemini CLI를 통해 생성된 코드도 Git을 통한 철저한 버전 관리에 포함시킵니다. 어떤 프롬프트로 어떤 코드를 생성했는지 주석이나 커밋 메시지에 간략히 남기는 것을 권장합니다.
    

---

## 3. 개발 환경 설정

1. **Git Repository Clone**:
    
    Bash
    
    ```
    git clone [Kye-Trust-repository-URL]
    cd Kye-Trust
    ```
    
2. **Node.js 및 npm/Yarn 설치**: 안정적인 버전 (예: LTS 20.x) 사용.
    
3. **Firebase CLI 설치 및 로그인**:
    
    Bash
    
    ```
    npm install -g firebase-tools
    firebase login
    firebase project:list # Kye-Trust GCP 프로젝트 확인
    ```
    
4. **Google Cloud SDK 설치 및 인증**:
    
    Bash
    
    ```
    gcloud init
    gcloud auth application-default login # AI Platform 등 GCP 서비스 접근용
    ```
    
5. **React 프로젝트 초기 설정**:
    
    Bash
    
    ```
    cd frontend
    npm install # 또는 yarn install
    ```
    
6. **Firebase Functions 초기 설정**:
    
    Bash
    
    ```
    cd functions
    npm install # 또는 yarn install
    ```
    
7. **MetaMask/Kaikas 설치 (개발용)**: 브라우저 확장 프로그램 형태로 설치.
    
8. **스마트 컨트랙트 개발 도구 설치 (선택 사항)**: Hardhat 또는 Truffle.
    

---

## 4. 모듈별 개발 지침 및 Gemini CLI 활용 예시

### 4.1. 프론트엔드 (React Web App)

- **주요 기술**: React, TypeScript, Redux/Zustand, Material-UI/Chakra UI, Web3.js/Ethers.js
    
- **Gemini CLI 활용 예시**:
    
    - "React와 Material-UI를 사용해서 사용자 로그인 폼 컴포넌트를 만들어줘. 이메일과 비밀번호 입력 필드, 로그인 버튼, 그리고 유효성 검사 기능이 포함되어야 해."
        
    - "React에서 Web3.js를 사용해서 MetaMask 지갑 연결 로직을 구현해줘. 연결 상태를 Redux 상태로 관리하고, 연결/해제 버튼을 포함해줘."
        
    - "하스스톤 카드 디자인 컨셉으로, 곗돈 정보를 표시하는 React 컴포넌트를 만들어줘. 목표 금액, 진행률, 테마 일러스트, AI 안전도에 따른 테두리 색상 변화 기능이 포함되어야 해. 예시 데이터 구조도 포함해줘."
        
    - "React Router를 사용해서 '/dashboard', '/create-kye', '/my-wallet' 경로에 대한 라우팅을 설정해줘."
        

### 4.2. 백엔드 (Firebase Functions & Firestore)

- **주요 기술**: Node.js, Firebase Functions, Cloud Firestore
    
- **Gemini CLI 활용 예시**:
    
    - "Firebase Functions에서 Cloud Firestore에 사용자 프로필 데이터를 저장하는 HTTP 트리거 함수를 만들어줘. 사용자 ID와 닉네임을 받아 저장하고, 이미 존재하면 업데이트하도록 해."
        
    - "Firestore에서 곗돈 그룹의 납입 현황을 실시간으로 감지하고, 납입 완료 시 블록체인 스마트 컨트랙트에 `confirmPayment` 함수를 호출하는 Firebase Functions 트리거를 구현해줘."
        
    - "사용자가 보낸 Kye-Trust 캐시(코인) 입금 트랜잭션을 감지하고, 해당 내역을 Firestore에 기록하는 Firebase Functions를 작성해줘. 트랜잭션 해시와 금액을 포함해야 해."
        
    - "Firebase Functions에서 사용자 알림(푸시 알림)을 발송하는 함수를 만들어줘. 특정 사용자 ID와 메시지를 받아 Firebase Cloud Messaging (FCM)을 통해 전송하도록 해."
        

### 4.3. 블록체인 (스마트 컨트랙트)

- **주요 기술**: Solidity, Klaytn/Ethereum (EVM), Web3.js/Ethers.js (연동)
    
- **Gemini CLI 활용 예시**:
    
    - "Solidity로 기본적인 곗돈 스마트 컨트랙트 뼈대를 작성해줘. 곗돈 개설, 계원 참여, 납입, 순번에 따른 수령 기능이 포함되어야 해. 특히 연체 시 페널티 로직도 간단하게 넣어줘."
        
    - "Solidity에서 다중 서명(Multi-Signature) 기능을 구현하는 방법을 알려줘. N명의 승인자 중 M명 이상의 서명이 있어야만 특정 함수가 실행되도록 하는 예시 코드를 보여줘."
        
    - "특정 블록체인 이벤트(예: `PaymentReceived`) 발생 시 이를 감지하여 Firebase Functions로 콜백을 보내는 로직을 Web3.js 또는 Ethers.js를 사용해서 구현해줘."
        
    - "Klaytn 네트워크에 스마트 컨트랙트를 배포하는 Hardhat(또는 Truffle) 설정 파일과 배포 스크립트 예시를 제공해줘."
        

### 4.4. AI / 머신러닝 (Vertex AI)

- **주요 기술**: Python, scikit-learn/TensorFlow, Google Cloud AI Platform/Vertex AI
    
- **Gemini CLI 활용 예시**:
    
    - "Python과 scikit-learn을 사용해서 사용자 납입 이력 데이터를 기반으로 연체 가능성을 예측하는 간단한 머신러닝 모델(예: Logistic Regression)을 만들어줘. 데이터셋 예시도 포함해줘."
        
    - "Google Cloud Storage에 있는 CSV 파일을 읽어서 Pandas DataFrame으로 로드하고, 데이터 전처리(결측치 처리, 정규화)하는 Python 코드를 작성해줘."
        
    - "Vertex AI Workbench에서 Jupyter 노트북으로 AI 모델을 학습시키고, 학습된 모델을 Vertex AI Model Registry에 배포하는 Python 코드를 작성하는 방법을 알려줘."
        
    - "Firebase Functions에서 Vertex AI에 배포된 모델을 호출하여 예측 결과를 받아오는 Python(Node.js) 함수를 작성해줘."
        

---

## 5. 협업 및 코드 관리

- **Git Branching Strategy**: `main` 브랜치는 항상 안정적인 운영 버전을 유지합니다. `develop` 브랜치에서 기능 개발이 이루어지며, 각 기능은 `feature/[기능명]` 브랜치에서 개발 후 `develop`으로 Merge Request(Pull Request)를 보냅니다.
    
- **코드 리뷰**: 모든 Merge Request는 최소 1명 이상의 팀원으로부터 코드 리뷰를 받아야 합니다. Gemini CLI로 생성된 코드도 예외 없이 리뷰 대상입니다.
    
- **커밋 메시지**: 명확하고 간결한 커밋 메시지를 작성합니다. (예: `feat: 사용자 로그인 기능 구현`, `fix: 납입 오류 수정`, `docs: 개발 문서 업데이트`)
    
- **이슈 트래킹**: Jira, GitHub Issues 등 이슈 트래킹 도구를 사용하여 모든 기능, 버그, 개선 사항을 관리하고 진행 상황을 공유합니다.
    

---

## 6. 테스트 및 배포

- **단위 테스트 (Unit Test)**: 각 컴포넌트, 함수, 스마트 컨트랙트 기능별로 단위 테스트를 작성하여 개별 로직의 정확성을 검증합니다.
    
- **통합 테스트 (Integration Test)**: 프론트엔드-백엔드-블록체인-AI 간의 연동이 올바르게 작동하는지 통합 테스트를 수행합니다.
    
- **E2E 테스트 (End-to-End Test)**: 사용자 시나리오 기반의 E2E 테스트를 통해 전체 서비스 흐름을 검증합니다.
    
- **보안 테스트**: 스마트 컨트랙트 감사, 취약점 스캐닝, 모의 해킹 등을 통해 보안 취약점을 점검하고 보완합니다.
    
- **배포**: Firebase Hosting을 통해 프론트엔드 웹앱을 배포하고, Firebase Functions는 자동으로 배포됩니다. 스마트 컨트랙트는 검증된 환경에서 신중하게 배포합니다.
    

---

이 개발 문서는 'Kye-Trust' 프로젝트 팀이 Gemini CLI를 효과적으로 활용하여 고품질의 서비스를 개발하기 위한 청사진입니다. 각 팀원은 본 문서를 숙지하고, 상호 협력하여 개발 목표를 달성할 수 있도록 노력해야 합니다.

개발 관련 질문이나 추가적인 도움이 필요하면 언제든지 Gemini CLI를 활용해 주세요!