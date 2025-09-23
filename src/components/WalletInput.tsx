"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { BlockchainSelector, SUPPORTED_BLOCKCHAINS, type Blockchain } from "./BlockchainSelector";
import { getDefaultContractAddress } from "@/lib/blockchain-api";
import { validateStarknetAddress } from "@/lib/starknet-api";

interface WalletInputProps {
  onAddressSubmit: (address: string, contractAddress: string, blockchain: Blockchain) => void;
  loading?: boolean;
}

// Default wallet addresses for easy testing
const getDefaultWalletAddress = (blockchain: Blockchain): string => {
  switch (blockchain.id) {
    case "bsc":
      return "0x9758e930B7d78870b3fC1D1AC4E2159F243b27d3";
    case "moonbeam":
      return "0xd124ffd5aa0431891838344d2fbA5765F5d7D8ab";
    case "starknet":
      return "0x4e9f2949d40e94880c5c22f29bcb0c6c6c26d8c33b3996d0f11fe41982d1f4e";
    default:
      return "";
  }
};

export function WalletInput({ onAddressSubmit, loading = false }: WalletInputProps) {
  const [selectedBlockchain, setSelectedBlockchain] = useState<Blockchain>(SUPPORTED_BLOCKCHAINS[0]);
  const [address, setAddress] = useState(getDefaultWalletAddress(SUPPORTED_BLOCKCHAINS[0]));
  const [contractAddress, setContractAddress] = useState(getDefaultContractAddress(SUPPORTED_BLOCKCHAINS[0]));
  const [error, setError] = useState("");

  const validateAddress = (addr: string): boolean => {
    if (selectedBlockchain.id === "starknet") {
      return validateStarknetAddress(addr);
    } else {
      // EVM-compatible addresses (BSC, Ethereum, etc.)
      const evmAddressRegex = /^0x[a-fA-F0-9]{40}$/;
      return evmAddressRegex.test(addr);
    }
  };

  const handleBlockchainChange = (blockchain: Blockchain) => {
    setSelectedBlockchain(blockchain);
    setContractAddress(getDefaultContractAddress(blockchain));
    setAddress(getDefaultWalletAddress(blockchain));
    setError("");
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

  return (
    <div className="w-full max-w-2xl">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border-2 border-white/30 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="blockchain-selector"
              className="block text-sm font-semibold text-white mb-3"
            >
              Select Blockchain
            </label>
            <BlockchainSelector
              selectedBlockchain={selectedBlockchain}
              onBlockchainChange={handleBlockchainChange}
              disabled={loading}
            />
          </div>
          <div>
            <label
              htmlFor="wallet-address"
              className="block text-sm font-semibold text-white mb-3"
            >
              {selectedBlockchain.name} Wallet Address
            </label>
            <input
              id="wallet-address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="0x742d35Cc6635C0532925a3b8D000b73B2d9B2E9F"
              className="w-full px-4 py-4 border-2 border-white/40 rounded-xl focus:ring-2 focus:ring-[#517ec5] focus:border-[#517ec5] font-mono text-sm text-white bg-white/10 backdrop-blur-sm placeholder-white/60 transition-all duration-200"
              disabled={loading}
            />
            {error && (
              <p className="mt-3 text-sm text-red-300 bg-red-500/20 p-3 rounded-lg border-2 border-red-400/50">{error}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="token-contract"
              className="block text-sm font-semibold text-white mb-3"
            >
              Token Contract Address
            </label>
            <input
              id="token-contract"
              type="text"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              placeholder="0xfF1E54d02B5d0576E7BEfD03602E36d5720D1997"
              className="w-full px-4 py-4 border-2 border-white/40 rounded-xl focus:ring-2 focus:ring-[#517ec5] focus:border-[#517ec5] font-mono text-sm text-white bg-white/10 backdrop-blur-sm placeholder-white/60 transition-all duration-200"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#517ec5] border-2 border-[#4f7dc4] text-white py-4 px-6 rounded-xl hover:bg-[#466daa] hover:border-[#406bb5] focus:ring-4 focus:ring-[#517ec5]/50 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? "Loading Transactions..." : "Analyse AirDrop"}
          </button>
        </form>
      </div>
    </div>
  );
}