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
  const [customContract, setCustomContract] = useState("");
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

    const finalContractAddress = contractAddress === "custom" ? customContract : contractAddress;

    if (!validateBSCAddress(finalContractAddress)) {
      setError("Please enter a valid contract address (0x followed by 40 hex characters)");
      return;
    }

    onAddressSubmit(address.trim(), finalContractAddress);
  };

  return (
    <div className="w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="wallet-address"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            BSC Wallet Address
          </label>
          <input
            id="wallet-address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="0x742d35Cc6635C0532925a3b8D000b73B2d9B2E9F"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm text-gray-900 bg-gray-50"
            disabled={loading}
          />
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="token-contract"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Token Contract
          </label>
          <select
            id="token-contract"
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 bg-gray-50"
            disabled={loading}
          >
            <option value="0xfF1E54d02B5d0576E7BEfD03602E36d5720D1997">Dayvidende (DAYV)</option>
            <option value="0x61ed1c66239d29cc93c8597c6167159e8f69a823">Reference System for DeFi (RSD)</option>
            <option value="custom">Custom Contract Address...</option>
          </select>
          {contractAddress === "custom" && (
            <input
              type="text"
              value={customContract}
              placeholder="Enter custom contract address (0x...)"
              className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm text-gray-900 bg-gray-50"
              onChange={(e) => setCustomContract(e.target.value)}
              disabled={loading}
            />
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Loading Transactions..." : "Get Transactions"}
        </button>
      </form>
    </div>
  );
}