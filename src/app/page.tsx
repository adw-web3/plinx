"use client";

import { useState } from "react";
import { WalletInput } from "@/components/WalletInput";
import { TransactionList } from "@/components/TransactionList";
import { getOutgoingTransactions, type Transaction } from "@/lib/bsc-api";

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentWallet, setCurrentWallet] = useState("");

  const handleAddressSubmit = async (address: string) => {
    setLoading(true);
    setError("");
    setCurrentWallet(address);

    try {
      const txs = await getOutgoingTransactions(address);
      setTransactions(txs);
    } catch {
      setError("Failed to fetch transactions. Please try again.");
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            BSC Transaction Tracker
          </h1>
          <p className="text-gray-600">
            Enter a Binance Smart Chain wallet address to view all outgoing transactions
          </p>
        </div>

        <div className="flex flex-col items-center space-y-8">
          <WalletInput
            onAddressSubmit={handleAddressSubmit}
            loading={loading}
          />

          {currentWallet && (
            <div className="w-full max-w-4xl">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Tracking wallet:</h3>
                <code className="text-sm font-mono text-gray-900 break-all">
                  {currentWallet}
                </code>
              </div>
            </div>
          )}

          <TransactionList
            transactions={transactions}
            loading={loading}
            error={error}
          />
        </div>
      </div>
    </div>
  );
}
