import { useState, useEffect, useCallback } from "react";
import { ethers, BrowserProvider, Contract } from "ethers";
import VotingArtifact from "../contracts/Voting.json";
import contractAddress from "../contracts/contract-address.json";

// --- Network Configuration ---
const HARDHAT_NETWORK_ID = '1337';
const HARDHAT_NETWORK_HEX_ID = '0x539'; // Hex for 1337

export const useEthers = () => {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resetState = useCallback(() => {
    setProvider(null);
    setContract(null);
    setAccount(null);
    setError(null);
  }, []);

  const initializeDapp = useCallback(async (provider: BrowserProvider) => {
    try {
      setError(null);
      const signer = await provider.getSigner();
      const newContract = new ethers.Contract(
        contractAddress.Voting,
        VotingArtifact.abi,
        signer
      );
      setProvider(provider);
      setContract(newContract);
      setAccount(signer.address);
    } catch (err) {
      console.error("Error initializing DApp:", err);
      setError("Failed to initialize the DApp. Is the contract deployed correctly?");
    }
  }, []);

  const switchNetwork = async () => {
    try {
      await window.ethereum?.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: HARDHAT_NETWORK_HEX_ID }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum?.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: HARDHAT_NETWORK_HEX_ID,
                chainName: 'Hardhat Localhost',
                rpcUrls: ['http://127.0.0.1:8545'],
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
          throw new Error("Failed to add the Hardhat network to MetaMask.");
        }
      } else {
        console.error("Failed to switch network", switchError);
        throw new Error("Failed to switch to the Hardhat network. Please do it manually in MetaMask.");
      }
    }
  };

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      return setError("MetaMask is not installed. Please install it to use this dApp.");
    }

    try {
      const newProvider = new ethers.BrowserProvider(window.ethereum);
      const network = await newProvider.getNetwork();

      if (network.chainId.toString() !== HARDHAT_NETWORK_ID) {
        await switchNetwork();
      }
      
      // Re-initialize provider after potential network switch
      const finalProvider = new ethers.BrowserProvider(window.ethereum);
      await finalProvider.send("eth_requestAccounts", []);
      
      await initializeDapp(finalProvider);

    } catch (err: any) {
      console.error("Error connecting wallet:", err);
      setError("Failed to connect wallet. User denied account access or an error occurred.");
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
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [connectWallet, resetState]);

  return { provider, contract, account, error, connectWallet, setError };
};
