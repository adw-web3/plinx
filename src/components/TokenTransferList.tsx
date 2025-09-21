"use client";

import type { TokenTransfer } from "@/lib/bsc-api";
import { formatTokenValue, formatTimestamp, shortenAddress } from "@/lib/bsc-api";

interface TokenTransferListProps {
  transfers: TokenTransfer[];
  loading: boolean;
  error?: string;
}

export function TokenTransferList({ transfers, loading, error }: TokenTransferListProps) {
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

  if (transfers.length === 0) {
    return (
      <div className="w-full max-w-4xl">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">No outgoing RSD token transfers found for this wallet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Outgoing RSD Token Transfers ({transfers.length})
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {transfers.map((transfer) => (
            <div key={transfer.hash} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      RSD OUT
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      BEP-20
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">To:</span>
                      <span className="text-sm font-mono text-gray-900">
                        {shortenAddress(transfer.to)}
                      </span>
                      <button
                        onClick={() => navigator.clipboard.writeText(transfer.to)}
                        className="text-xs text-cyan-300 hover:text-white transition-colors font-medium"
                        title="Copy address"
                      >
                        Copy
                      </button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Hash:</span>
                      <span className="text-sm font-mono text-gray-900">
                        {shortenAddress(transfer.hash)}
                      </span>
                      <a
                        href={`https://bscscan.com/tx/${transfer.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-cyan-300 hover:text-white transition-colors font-medium"
                      >
                        View on BSCScan
                      </a>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Contract:</span>
                      <span className="text-sm font-mono text-gray-900">
                        {shortenAddress(transfer.contractAddress)}
                      </span>
                      <a
                        href={`https://bscscan.com/token/${transfer.contractAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-cyan-300 hover:text-white transition-colors font-medium"
                      >
                        View Token
                      </a>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Block #{transfer.blockNumber}</span>
                      <span>{formatTimestamp(transfer.timeStamp)}</span>
                    </div>
                  </div>
                </div>

                <div className="ml-4 text-right">
                  <div className="text-lg font-semibold text-gray-900">
                    {formatTokenValue(transfer.value, transfer.tokenDecimal)} {transfer.tokenSymbol}
                  </div>
                  <div className="text-sm text-gray-500">
                    {transfer.tokenName}
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