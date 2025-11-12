"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { SUPPORTED_BLOCKCHAINS, type Blockchain } from "./BlockchainSelector";
import { getDefaultContractAddress } from "@/lib/blockchain-api";
import { validateStarknetAddress } from "@/lib/starknet-api";

// STRK native token contract address
const STRK_CONTRACT_ADDRESS = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";

interface WalletInputProps {
  onAddressSubmit: (address: string, contractAddress: string, blockchain: Blockchain) => void;
  loading?: boolean;
  currentWallet?: string;
  currentContract?: string;
}

// Default wallet addresses for easy testing
const getDefaultWalletAddress = (blockchain: Blockchain): string => {
  switch (blockchain.id) {
    case "starknet":
      return "0x42323c9947c5762094c09cccec76cabcfeeaaeda3edfc54d79817e4959dc0fa"; // Starknet Startup House wallet
    case "bsc":
      return "0x9758e930B7d78870b3fC1D1AC4E2159F243b27d3";
    case "moonbeam":
      return "0xd124ffd5aa0431891838344d2fbA5765F5d7D8ab";
    default:
      return "";
  }
};

export function WalletInput({ onAddressSubmit, loading = false, currentWallet = "", currentContract = "" }: WalletInputProps) {
  // Starknet is now the fixed blockchain (first in SUPPORTED_BLOCKCHAINS array)
  const selectedBlockchain = SUPPORTED_BLOCKCHAINS[0];
  const [address, setAddress] = useState(getDefaultWalletAddress(selectedBlockchain));
  const [contractAddress, setContractAddress] = useState(getDefaultContractAddress(selectedBlockchain));
  const [error, setError] = useState("");

  // Check if current contract is STRK native token
  const isSTRKContract = selectedBlockchain.id === "starknet" &&
    contractAddress.toLowerCase() === STRK_CONTRACT_ADDRESS.toLowerCase();

  const validateAddress = (addr: string): boolean => {
    if (selectedBlockchain.id === "starknet") {
      return validateStarknetAddress(addr);
    } else {
      // EVM-compatible addresses (BSC, Ethereum, etc.)
      const evmAddressRegex = /^0x[a-fA-F0-9]{40}$/;
      return evmAddressRegex.test(addr);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!address.trim()) {
      setError("Please enter a wallet address");
      return;
    }

    if (!validateAddress(address.trim())) {
      const addressFormat = selectedBlockchain.id === "starknet"
        ? "valid Starknet address (0x followed by hex characters)"
        : "valid wallet address (0x followed by 40 hex characters)";
      setError(`Please enter a ${addressFormat}`);
      return;
    }

    if (!validateAddress(contractAddress)) {
      const contractFormat = selectedBlockchain.id === "starknet"
        ? "valid Starknet contract address (0x followed by hex characters)"
        : "valid contract address (0x followed by 40 hex characters)";
      setError(`Please enter a ${contractFormat}`);
      return;
    }

    onAddressSubmit(address.trim(), contractAddress, selectedBlockchain);
  };

  // If we're currently analyzing a wallet, show compact info view
  if (currentWallet) {
    return (
      <div className="w-full max-w-6xl">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/30 p-3">
          <div className="flex flex-col gap-1">
            <div className="text-xs text-white/60">Analyzing wallet on {selectedBlockchain.name}:</div>
            <code className="text-xs font-mono text-white/90 break-all">
              {currentWallet}
            </code>
            {currentContract && (
              <div className="text-xs text-white/60">
                Token Contract: <span className="font-mono text-white/90">{currentContract}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Otherwise, show the full form
  return (
    <div className="w-full max-w-2xl">
      <div className="bg-white/10 backdrop-blur-lg rounded-xl border-2 border-white/30 p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="wallet-address"
              className="block text-sm font-semibold text-white mb-2"
            >
              {selectedBlockchain.name} Wallet Address
            </label>
            <input
              id="wallet-address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="0x742d35Cc6635C0532925a3b8D000b73B2d9B2E9F"
              className="w-full px-3 py-3 border-2 border-white/40 rounded-lg focus:ring-2 focus:ring-[#517ec5] focus:border-[#517ec5] font-mono text-sm text-white bg-white/10 backdrop-blur-sm placeholder-white/60 transition-all duration-200"
              disabled={loading}
            />
            {error && (
              <p className="mt-2 text-sm text-red-300 bg-red-500/20 p-2 rounded-lg border-2 border-red-400/50">{error}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="token-contract"
              className="block text-sm font-semibold text-white mb-2 flex items-center gap-2"
            >
              <span>Token Contract Address</span>
              {isSTRKContract && (
                <span className="text-xs bg-blue-500/80 text-white px-2 py-0.5 rounded-full font-normal">
                  Native Token
                </span>
              )}
            </label>
            <input
              id="token-contract"
              type="text"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              placeholder="0xfF1E54d02B5d0576E7BEfD03602E36d5720D1997"
              className="w-full px-3 py-3 border-2 border-white/40 rounded-lg focus:ring-2 focus:ring-[#517ec5] focus:border-[#517ec5] font-mono text-sm text-white bg-white/10 backdrop-blur-sm placeholder-white/60 transition-all duration-200"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#517ec5] border-2 border-[#4f7dc4] text-white py-3 px-5 rounded-lg hover:bg-[#466daa] hover:border-[#406bb5] focus:ring-4 focus:ring-[#517ec5]/50 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-base transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? "Analyzing..." : "Fetch AirDrop data from blockchain"}
          </button>
        </form>
      </div>
    </div>
  );
}