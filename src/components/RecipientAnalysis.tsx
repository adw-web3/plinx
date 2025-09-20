"use client";

import type { RecipientAnalysis } from "@/lib/bsc-api";
import { formatTokenValue, formatTimestamp, shortenAddress } from "@/lib/bsc-api";

interface RecipientAnalysisProps {
  recipients: RecipientAnalysis[];
  totalTransfers: number;
  loading: boolean;
  error?: string;
}

export function RecipientAnalysisComponent({ recipients, totalTransfers, loading, error }: RecipientAnalysisProps) {
  if (loading) {
    return (
      <div className="w-full max-w-6xl">
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
      <div className="w-full max-w-6xl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (recipients.length === 0) {
    return (
      <div className="w-full max-w-6xl">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">No token recipients found for this wallet.</p>
        </div>
      </div>
    );
  }

  const totalTokensDistributed = recipients.reduce((sum, recipient) => {
    return sum + BigInt(recipient.totalReceived);
  }, BigInt(0));

  const totalCurrentlyHeld = recipients.reduce((sum, recipient) => {
    return sum + BigInt(recipient.currentBalance);
  }, BigInt(0));

  return (
    <div className="w-full max-w-6xl space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-500">Total Recipients</div>
          <div className="text-2xl font-bold text-gray-900">{recipients.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-500">Total Distributed</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatTokenValue(totalTokensDistributed.toString(), "18")} tokens
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-500">Currently Held</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatTokenValue(totalCurrentlyHeld.toString(), "18")} tokens
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-500">Total Airdrop Spots Claimed</div>
          <div className="text-2xl font-bold text-gray-900">{totalTransfers}</div>
        </div>
      </div>

      {/* Recipients List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Token Recipients
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recipient Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Received
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transfers
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Transfer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recipients.map((recipient) => {
                const currentBalance = BigInt(recipient.currentBalance);
                const totalReceived = BigInt(recipient.totalReceived);
                const retentionPercentage = totalReceived > 0
                  ? (Number(currentBalance * BigInt(100) / totalReceived))
                  : 0;

                return (
                  <tr key={recipient.address} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-mono text-gray-900">
                          {shortenAddress(recipient.address)}
                        </span>
                        <button
                          onClick={() => navigator.clipboard.writeText(recipient.address)}
                          className="text-xs text-blue-600 hover:text-blue-800"
                          title="Copy address"
                        >
                          Copy
                        </button>
                        <a
                          href={`https://bscscan.com/address/${recipient.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          View
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatTokenValue(recipient.totalReceived, "18")} tokens
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatTokenValue(recipient.currentBalance, "18")} tokens
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{recipient.transferCount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {formatTimestamp(recipient.lastTransferTime)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          currentBalance > 0
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {currentBalance > 0 ? "Holding" : "Sold/Transferred"}
                        </span>
                        {currentBalance > 0 && (
                          <span className="text-xs text-gray-500">
                            {retentionPercentage.toFixed(1)}% retained
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}