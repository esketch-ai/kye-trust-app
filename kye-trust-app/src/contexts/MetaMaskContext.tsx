import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { showErrorNotification, showSuccessNotification } from '../services/notificationService';

interface MetaMaskContextType {
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  account: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isConnected: boolean;
  isConnecting: boolean;
  chainId: number | null; // Add chainId state
  switchNetwork: (targetChainId: number) => Promise<boolean>; // Add switchNetwork function
}

const MetaMaskContext = createContext<MetaMaskContextType | undefined>(undefined);

export const useMetaMask = () => {
  const context = useContext(MetaMaskContext);
  if (!context) {
    throw new Error('useMetaMask must be used within a MetaMaskProvider');
  }
  return context;
};

export const MetaMaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [chainId, setChainId] = useState<number | null>(null); // Initialize chainId

  useEffect(() => {
    if (window.ethereum) {
      const ethProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(ethProvider);

      // Get initial chain ID
      ethProvider.getNetwork().then(network => {
        setChainId(Number(network.chainId));
        console.log("MetaMaskContext: Initial Chain ID set to", Number(network.chainId));
      });

      (window.ethereum as any).on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
          ethProvider.getSigner().then(setSigner);
          console.log("MetaMaskContext: Account changed to", accounts[0]);
        } else {
          disconnectWallet();
          console.log("MetaMaskContext: Accounts disconnected");
        }
      });

      (window.ethereum as any).on('chainChanged', (newChainId: string) => {
        setChainId(Number(newChainId));
        console.log("MetaMaskContext: Chain changed to", Number(newChainId));
        // window.location.reload(); // Reloading might be too aggressive, consider state update
      });

      // Check initial connection
      ethProvider.listAccounts().then(accounts => {
        if (accounts.length > 0) {
          setAccount(accounts[0].address);
          setIsConnected(true);
          ethProvider.getSigner().then(setSigner);
          console.log("MetaMaskContext: Initial account connected", accounts[0].address);
        }
      });
    }
  }, []);

  const connectWallet = async () => {
    if (isConnecting) return;
    setIsConnecting(true);
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          const ethProvider = new ethers.BrowserProvider(window.ethereum);
          setProvider(ethProvider);
          setAccount(accounts[0]);
          setIsConnected(true);
          const currentSigner = await ethProvider.getSigner();
          setSigner(currentSigner);
          const network = await ethProvider.getNetwork();
          setChainId(Number(network.chainId));
          showSuccessNotification('MetaMask 지갑이 연결되었습니다!');
          console.log("MetaMaskContext: Wallet connected", accounts[0], "Chain ID:", Number(network.chainId));
        }
      } catch (error: any) {
        showErrorNotification('MetaMask 연결 실패: ' + error.message);
        console.error("MetaMask connection error:", error);
      } finally {
        setIsConnecting(false);
      }
    } else {
      showErrorNotification('MetaMask가 설치되어 있지 않습니다. MetaMask를 설치해주세요.');
      window.open('https://metamask.io/download/', '_blank');
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setSigner(null);
    setIsConnected(false);
    setChainId(null);
    showSuccessNotification('MetaMask 지갑 연결이 해제되었습니다.');
    console.log("MetaMaskContext: Wallet disconnected");
  };

  const switchNetwork = async (targetChainId: number): Promise<boolean> => {
    if (!window.ethereum) {
      showErrorNotification('MetaMask가 설치되어 있지 않습니다.');
      return false;
    }
    try {
      await (window.ethereum as any).request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x' + targetChainId.toString(16) }],
      });
      showSuccessNotification(`네트워크가 Chain ID ${targetChainId}로 전환되었습니다.`);
      console.log("MetaMaskContext: Switched network to Chain ID", targetChainId);
      return true;
    } catch (error: any) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (error.code === 4902) {
        showErrorNotification(
          `Chain ID ${targetChainId}가 MetaMask에 추가되어 있지 않습니다. 수동으로 추가해주세요.`
        );
        // Optionally, you can add logic here to suggest adding the network
        // For Hardhat local network, users usually add it manually.
      } else {
        showErrorNotification(`네트워크 전환 실패: ${error.message}`);
      }
      console.error("Network switch error:", error);
      return false;
    }
  };

  return (
    <MetaMaskContext.Provider value={{ provider, signer, account, connectWallet, disconnectWallet, isConnected, isConnecting, chainId, switchNetwork }}>
      {children}
    </MetaMaskContext.Provider>
  );
};