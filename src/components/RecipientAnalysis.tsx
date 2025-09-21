"use client";

import type { UnifiedRecipientAnalysis } from "@/lib/blockchain-api";
import { formatTokenValue, formatTimestamp, shortenAddress } from "@/lib/bsc-api";

interface RecipientAnalysisProps {
  recipients: UnifiedRecipientAnalysis[];
  totalTransfers: number;
  tokenSymbol: string;
  loading: boolean;
  error?: string;
}

export function RecipientAnalysisComponent({ recipients, totalTransfers, tokenSymbol, loading, error }: RecipientAnalysisProps) {
  console.log('RecipientAnalysisComponent received:', {
    recipients: recipients.length,
    totalTransfers,
    tokenSymbol,
    loading,
    error,
    firstRecipient: recipients[0]
  });

  if (loading) {
    return (
      <div className="w-full max-w-6xl">
        <div className="animate-pulse space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl h-32 border-2 border-white/30"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-6xl">
        <div className="bg-red-500/20 backdrop-blur-sm border-2 border-red-400/50 rounded-2xl p-6">
          <p className="text-red-200">{error}</p>
        </div>
      </div>
    );
  }

  if (recipients.length === 0) {
    return (
      <div className="w-full max-w-6xl">
        <div className="bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-2xl p-8 text-center">
          <p className="text-white/70">No token recipients found for this wallet.</p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border-2 border-white/30 p-6">
          <div className="text-sm font-semibold text-white/70">Total Recipients</div>
          <div className="text-3xl font-bold text-white mt-2">{recipients.length}</div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border-2 border-white/30 p-6">
          <div className="text-sm font-semibold text-white/70">Total Distributed</div>
          <div className="text-3xl font-bold text-white mt-2">
            {formatTokenValue(totalTokensDistributed.toString(), "18")} <span className="text-lg text-white/60">{tokenSymbol || "tokens"}</span>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border-2 border-white/30 p-6">
          <div className="text-sm font-semibold text-white/70">Currently Held</div>
          <div className="text-3xl font-bold text-white mt-2">
            {formatTokenValue(totalCurrentlyHeld.toString(), "18")} <span className="text-lg text-white/60">{tokenSymbol || "tokens"}</span>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border-2 border-white/30 p-6">
          <div className="text-sm font-semibold text-white/70">Total Airdrop Spots Claimed</div>
          <div className="text-3xl font-bold text-white mt-2">{totalTransfers}</div>
        </div>
      </div>

      {/* Recipients List */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl border-2 border-white/30 overflow-hidden">
        <div className="px-8 py-6 border-b-2 border-white/30">
          <h2 className="text-2xl font-bold text-white">
            Token Recipients
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">
                  Recipient Address
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">
                  Total Received
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">
                  Current Balance
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">
                  Transfers
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">
                  Last Transfer
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {recipients.map((recipient) => {
                const currentBalance = BigInt(recipient.currentBalance);
                const totalReceived = BigInt(recipient.totalReceived);
                const retentionPercentage = totalReceived > 0
                  ? (Number(currentBalance * BigInt(100) / totalReceived))
                  : 0;

                return (
                  <tr key={recipient.address} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-mono text-white">
                          {shortenAddress(recipient.address)}
                        </span>
                        <button
                          onClick={() => navigator.clipboard.writeText(recipient.address)}
                          className="text-xs text-[#517ec5] hover:text-white transition-colors"
                          title="Copy address"
                        >
                          Copy
                        </button>
                        <a
                          href={`https://bscscan.com/address/${recipient.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#517ec5] hover:text-white transition-colors"
                        >
                          View
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-white">
                        {formatTokenValue(recipient.totalReceived, "18")} <span className="text-white/60">{tokenSymbol || "tokens"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-white">
                        {formatTokenValue(recipient.currentBalance, "18")} <span className="text-white/60">{tokenSymbol || "tokens"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{recipient.transferCount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white/70">
                        {formatTimestamp(recipient.lastTransferTime)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          currentBalance > 0
                            ? "bg-green-500/20 text-green-300 border-2 border-green-400/50"
                            : "bg-gray-500/20 text-gray-300 border-2 border-gray-400/50"
                        }`}>
                          {currentBalance > 0 ? "Holding" : "Sold/Transferred"}
                        </span>
                        {currentBalance > 0 && (
                          <span className="text-xs text-white/60">
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