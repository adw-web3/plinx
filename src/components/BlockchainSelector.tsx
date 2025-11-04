"use client";

import { useState, useRef, useEffect } from "react";

export interface Blockchain {
  id: string;
  name: string;
  chainId: number | string; // string for very large chain IDs like Starknet
  apiUrl: string;
  explorerUrl: string;
  nativeCurrency: string;
  testnet?: boolean;
}

export const SUPPORTED_BLOCKCHAINS: Blockchain[] = [
  {
    id: "starknet",
    name: "Starknet",
    chainId: "SN_MAIN",
    apiUrl: "https://alpha-mainnet.starknet.io",
    explorerUrl: "https://starkscan.co",
    nativeCurrency: "ETH"
  },
  {
    id: "bsc",
    name: "BNB Smart Chain",
    chainId: 56,
    apiUrl: "https://api.etherscan.io/v2/api",
    explorerUrl: "https://bscscan.com",
    nativeCurrency: "BNB"
  },
  {
    id: "moonbeam",
    name: "Moonbeam",
    chainId: 1284,
    apiUrl: "https://api.etherscan.io/v2/api",
    explorerUrl: "https://moonscan.io",
    nativeCurrency: "GLMR"
  }
];

interface BlockchainSelectorProps {
  selectedBlockchain: Blockchain;
  onBlockchainChange: (blockchain: Blockchain) => void;
  disabled?: boolean;
}

export function BlockchainSelector({
  selectedBlockchain,
  onBlockchainChange,
  disabled = false
}: BlockchainSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-xl px-4 py-3 text-left text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
      >
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-400 to-purple-500"></div>
          <span className="font-medium">{selectedBlockchain.name}</span>
        </div>
        <svg
          className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-sm border-2 border-white/30 rounded-xl shadow-lg z-50">
          {SUPPORTED_BLOCKCHAINS.map((blockchain) => (
            <button
              key={blockchain.id}
              onClick={() => {
                onBlockchainChange(blockchain);
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left text-gray-800 hover:bg-white/20 transition-colors duration-200 first:rounded-t-xl last:rounded-b-xl flex items-center space-x-3"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-400 to-purple-500"></div>
              <div className="flex-1">
                <div className="font-medium">{blockchain.name}</div>
                <div className="text-sm text-gray-600">{blockchain.nativeCurrency}</div>
              </div>
              {blockchain.id === selectedBlockchain.id && (
                <svg className="w-5 h-5 ml-auto text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}