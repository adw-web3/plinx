"use client";

import { useState } from "react";
import type { FormEvent } from "react";

interface WalletInputProps {
  onAddressSubmit: (address: string, contractAddress: string) => void;
  loading?: boolean;
}

export function WalletInput({ onAddressSubmit, loading = false }: WalletInputProps) {
  const [address, setAddress] = useState("");
  const [contractAddress, setContractAddress] = useState("0xfF1E54d02B5d0576E7BEfD03602E36d5720D1997");
  const [error, setError] = useState("");

  const validateBSCAddress = (addr: string): boolean => {
    // BSC addresses are 42 characters long and start with 0x
    const bscAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    return bscAddressRegex.test(addr);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!address.trim()) {
      setError("Please enter a wallet address");
      return;
    }

    if (!validateBSCAddress(address.trim())) {
      setError("Please enter a valid BSC wallet address (0x followed by 40 hex characters)");
      return;
    }

    if (!validateBSCAddress(contractAddress)) {
      setError("Please enter a valid contract address (0x followed by 40 hex characters)");
      return;
    }

    onAddressSubmit(address.trim(), contractAddress);
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border-2 border-white/30 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="wallet-address"
              className="block text-sm font-semibold text-white mb-3"
            >
              BSC Wallet Address
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
            className="w-full bg-[#94aeda] border-2 border-[#4f7dc4] text-white py-4 px-6 rounded-xl hover:bg-[#85a2e7] hover:border-[#406bb5] focus:ring-4 focus:ring-[#4f7dc4]/50 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? "Loading Transactions..." : "Get Transactions"}
          </button>
        </form>
      </div>
    </div>
  );
}