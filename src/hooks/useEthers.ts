import { useState, useEffect, useCallback } from 'react';
import { ethers, BrowserProvider, JsonRpcProvider, Contract, Wallet, Signer } from 'ethers';
import VotingArtifact from '../contracts/Voting.json';
import contractAddress from '../contracts/contract-address.json';

// --- Network Configuration ---
const NETWORKS = {
  hardhat: {
    chainId: 1337,
    hexId: '0x539',
    name: 'Hardhat Localhost',
    rpcUrl: 'http://127.0.0.1:8545',
  },
  sepolia: {
    chainId: 11155111,
    hexId: '0xaa36a7',
    name: 'Sepolia',
    rpcUrl: '',
  },
  goerli: {
    chainId: 5,
    hexId: '0x5',
    name: 'Goerli',
    rpcUrl: '',
  },
} as const;

export const useEthers = () => {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [network, setNetwork] = useState<keyof typeof NETWORKS>('hardhat');

  const resetState = useCallback(() => {
    setProvider(null);
    setContract(null);
    setAccount(null);
    setError(null);
  }, []);

  const createProvider = () => new ethers.BrowserProvider(window.ethereum!);

  const createRpcProvider = (url: string) => new JsonRpcProvider(url);

  const createContract = async (signer: ethers.Signer) => {
    return new ethers.Contract(contractAddress.Voting, VotingArtifact.abi, signer);
  };

  const initializeDapp = useCallback(async (signer: Signer, prov?: BrowserProvider | JsonRpcProvider) => {
    try {
      setError(null);
      if (prov) {
        setProvider(prov instanceof BrowserProvider ? prov : null);
      }
      const newContract = await createContract(signer);
      setContract(newContract);
      setAccount(await signer.getAddress());
    } catch (err) {
      console.error('Error initializing DApp:', err);
      setError('Failed to initialize the DApp. Is the contract deployed correctly?');
    }
  }, []);

  const switchNetwork = async (target: keyof typeof NETWORKS) => {
    try {
      await window.ethereum?.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: NETWORKS[target].hexId }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum?.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: NETWORKS[target].hexId,
                chainName: NETWORKS[target].name,
                rpcUrls: [NETWORKS[target].rpcUrl || ''],
                nativeCurrency: {
                  name: 'Ethereum',
                  symbol: 'ETH',
                  decimals: 18,
                },
              },
            ],
          });
        } catch (addError) {
          console.error("Failed to add network", addError);
          throw new Error("Failed to add the network to your wallet.");
        }
      } else {
        console.error("Failed to switch network", switchError);
        throw new Error("Failed to switch network. Please do it manually in your wallet.");
      }
    }
  };

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      return setError('MetaMask is not installed. Please install it to use this dApp.');
    }

    try {
      const prov = createProvider();
      const currentNetwork = await prov.getNetwork();
      if (currentNetwork.chainId !== BigInt(NETWORKS[network].chainId)) {
        await switchNetwork(network);
      }

      const finalProvider = createProvider();
      await finalProvider.send('eth_requestAccounts', []);
      const signer = await finalProvider.getSigner();
      await initializeDapp(signer, finalProvider);
    } catch (err: any) {
      console.error('Error connecting wallet:', err);
      setError('Failed to connect wallet. User denied account access or an error occurred.');
    }
  }, [initializeDapp]);

  useEffect(() => {
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        connectWallet();
      } else {
        resetState();
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    if (window.ethereum) {
      (window.ethereum as any).on("accountsChanged", handleAccountsChanged);
      (window.ethereum as any).on("chainChanged", handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        (window.ethereum as any).removeListener("accountsChanged", handleAccountsChanged);
        (window.ethereum as any).removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [connectWallet, resetState]);

  const connectWithPrivateKey = useCallback(async (rpcUrl: string, pk: string) => {
    try {
      const rpcProvider = createRpcProvider(rpcUrl);
      const wallet = new Wallet(pk, rpcProvider);
      await initializeDapp(wallet, rpcProvider);
    } catch (err: any) {
      console.error('Error connecting with private key:', err);
      setError('Failed to connect with private key');
    }
  }, [initializeDapp]);

  return { provider, contract, account, error, network, setNetwork, connectWallet, connectWithPrivateKey, setError };
};
