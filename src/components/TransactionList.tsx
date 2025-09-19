"use client";

import type { Transaction } from "@/lib/bsc-api";
import { formatBNBValue, formatTimestamp, shortenAddress } from "@/lib/bsc-api";

interface TransactionListProps {
  transactions: Transaction[];
  loading: boolean;
  error?: string;
}

export function TransactionList({ transactions, loading, error }: TransactionListProps) {
  if (loading) {
    return (
      <div className="w-full max-w-4xl">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-24"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="w-full max-w-4xl">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">No outgoing transactions found for this wallet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Outgoing Transactions ({transactions.length})
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {transactions.map((tx, index) => (
            <div key={tx.hash} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      OUT
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      tx.status === "1"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {tx.status === "1" ? "Success" : "Failed"}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">To:</span>
                      <span className="text-sm font-mono text-gray-900">
                        {shortenAddress(tx.to)}
                      </span>
                      <button
                        onClick={() => navigator.clipboard.writeText(tx.to)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                        title="Copy address"
                      >
                        Copy
                      </button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Hash:</span>
                      <span className="text-sm font-mono text-gray-900">
                        {shortenAddress(tx.hash)}
                      </span>
                      <a
                        href={`https://bscscan.com/tx/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        View on BSCScan
                      </a>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Block #{tx.blockNumber}</span>
                      <span>{formatTimestamp(tx.timeStamp)}</span>
                    </div>
                  </div>
                </div>

                <div className="ml-4 text-right">
                  <div className="text-lg font-semibold text-gray-900">
                    {formatBNBValue(tx.value)} BNB
                  </div>
                  <div className="text-sm text-gray-500">
                    Gas: {Number(tx.gas).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}