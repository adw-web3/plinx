"use client";

import type { UnifiedRecipientAnalysis } from "@/lib/blockchain-api";
import { getBlockchainExplorerUrl } from "@/lib/blockchain-api";
import { formatTokenValue, formatTimestamp, shortenAddress } from "@/lib/bsc-api";
import type { Blockchain } from "@/components/BlockchainSelector";

interface RecipientAnalysisProps {
  recipients: UnifiedRecipientAnalysis[];
  totalTransfers: number;
  tokenSymbol: string;
  walletBalance: string;
  loading: boolean;
  error?: string;
  blockchain: Blockchain;
}

export function RecipientAnalysisComponent({ recipients, totalTransfers, tokenSymbol, walletBalance, loading, error, blockchain }: RecipientAnalysisProps) {
  console.log('RecipientAnalysisComponent received:', {
    recipients: recipients.length,
    totalTransfers,
    tokenSymbol,
    loading,
    error,
    firstRecipient: recipients[0]
  });

  // Calculate summary stats (will be 0 initially but update as recipients load)
  const totalTokensDistributed = recipients.reduce((sum, recipient) => {
    return sum + BigInt(recipient.totalReceived);
  }, BigInt(0));

  const totalCurrentlyHeld = recipients.reduce((sum, recipient) => {
    return sum + BigInt(recipient.currentBalance);
  }, BigInt(0));

  if (error) {
    return (
      <div className="w-full max-w-6xl">
        <div className="bg-red-500/20 backdrop-blur-sm border-2 border-red-400/50 rounded-2xl p-6">
          <p className="text-red-200">{error}</p>
        </div>
      </div>
    );
  }

  // Show stats and recipients table even when loading (with live updates)
  const showNoResults = !loading && recipients.length === 0;

  // Don't render anything if not loading and no data
  if (showNoResults) {
    return (
      <div className="w-full max-w-6xl">
        <div className="bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-2xl p-8 text-center">
          <p className="text-white/70">No token recipients found for this wallet.</p>
        </div>
      </div>
    );
  }

  // Show stats immediately when loading starts or when we have data
  const shouldShowStats = loading || recipients.length > 0;

  return (
    <div className="w-full max-w-6xl space-y-3">
      {/* AirDrop Tokens Left - Highlighted prominently */}
      {shouldShowStats && (
        <div className="bg-gradient-to-r from-[#517ec5] to-[#6b8dd6] backdrop-blur-sm rounded-2xl border-2 border-white/40 p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-white/90 uppercase tracking-wide mb-2">🎁 AirDrop Tokens Left</div>
              <div className={`text-4xl font-black text-white ${loading ? 'animate-pulse' : ''}`}>
                {formatTokenValue(walletBalance, "18")} <span className="text-xl text-white/80">{tokenSymbol || "tokens"}</span>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-4xl">🪂</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats - Visible during loading and after with live updates */}
      {shouldShowStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border-2 border-white/30 p-4">
          <div className="text-xs font-semibold text-white/70 uppercase tracking-wide">Total Recipients</div>
          <div className={`text-2xl font-bold text-white mt-1 ${loading ? 'animate-pulse' : ''}`}>
            {recipients.length}
            {loading && <span className="text-sm text-white/60 ml-2">analyzing...</span>}
          </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border-2 border-white/30 p-4">
            <div className="text-xs font-semibold text-white/70 uppercase tracking-wide">Total Distributed</div>
          <div className={`text-2xl font-bold text-white mt-1 ${loading ? 'animate-pulse' : ''}`}>
            {formatTokenValue(totalTokensDistributed.toString(), "18")} <span className="text-sm text-white/60">{tokenSymbol || "tokens"}</span>
          </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border-2 border-white/30 p-4">
            <div className="text-xs font-semibold text-white/70 uppercase tracking-wide">Currently Held</div>
          <div className={`text-2xl font-bold text-white mt-1 ${loading ? 'animate-pulse' : ''}`}>
            {formatTokenValue(totalCurrentlyHeld.toString(), "18")} <span className="text-sm text-white/60">{tokenSymbol || "tokens"}</span>
          </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border-2 border-white/30 p-4">
            <div className="text-xs font-semibold text-white/70 uppercase tracking-wide">Airdrop Spots</div>
          <div className={`text-2xl font-bold text-white mt-1 ${loading ? 'animate-pulse' : ''}`}>
            {totalTransfers}
            {loading && <span className="text-sm text-white/60 ml-2">counting...</span>}
          </div>
          </div>
        </div>
      )}

      {/* Recipients List */}
      {(recipients.length > 0 || loading) && (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl border-2 border-white/30 overflow-hidden">
          <div className="px-5 py-3 border-b-2 border-white/30">
            <h2 className="text-lg font-bold text-white">
              Leaderboard
              {loading && (
                <span className="text-sm text-white/60 ml-2 animate-pulse">
                  Loading...
                </span>
              )}
            </h2>
          </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">
                  Recipient Address
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">
                  Total Claimed
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">
                  Current Balance
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">
                  Spots
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">
                  Last Transfer
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {recipients.map((recipient, index) => {
                const rank = index + 1;
                const currentBalance = BigInt(recipient.currentBalance);
                const totalReceived = BigInt(recipient.totalReceived);
                const retentionPercentage = totalReceived > 0
                  ? Math.min(100, Number(currentBalance * BigInt(100) / totalReceived))
                  : 0;

                // Highlight styles for top 3
                const isTop3 = rank <= 3;
                const rankBadgeColor = rank === 1
                  ? "bg-yellow-500/20 text-yellow-300 border-yellow-400/50"
                  : rank === 2
                  ? "bg-gray-400/20 text-gray-300 border-gray-400/50"
                  : rank === 3
                  ? "bg-orange-500/20 text-orange-300 border-orange-400/50"
                  : "bg-white/10 text-white/60 border-white/30";

                const rowHighlight = rank === 1
                  ? "bg-yellow-500/5"
                  : rank === 2
                  ? "bg-gray-400/5"
                  : rank === 3
                  ? "bg-orange-500/5"
                  : "";

                return (
                  <tr key={recipient.address} className={`hover:bg-white/5 transition-colors ${rowHighlight}`}>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="flex items-center justify-center">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold border ${rankBadgeColor}`}>
                          {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : rank}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-mono text-white">
                          {shortenAddress(recipient.address)}
                        </span>
                        <button
                          onClick={() => navigator.clipboard.writeText(recipient.address)}
                          className="text-xs text-cyan-300 hover:text-white transition-colors"
                          title="Copy address"
                        >
                          Copy
                        </button>
                        <a
                          href={getBlockchainExplorerUrl(blockchain, recipient.address)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-cyan-300 hover:text-white transition-colors"
                        >
                          View
                        </a>
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="text-sm font-semibold text-white">
                        {formatTokenValue(recipient.totalReceived, "18")} <span className="text-white/60 text-xs">{tokenSymbol || "tokens"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="text-sm font-semibold text-white">
                        {formatTokenValue(recipient.currentBalance, "18")} <span className="text-white/60 text-xs">{tokenSymbol || "tokens"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="text-sm text-white">{recipient.transferCount}</div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {recipient.lastTransferTime === "0" ? (
                        <div className="flex items-center space-x-1">
                          <div className="h-1.5 w-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                          <span className="text-xs text-white/50 italic">Loading...</span>
                        </div>
                      ) : (
                        <div className="text-sm text-white/70">
                          {formatTimestamp(recipient.lastTransferTime)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {recipient.currentBalance === "0" && recipient.lastTransferTime === "0" ? (
                        <div className="flex items-center space-x-1">
                          <div className="h-1.5 w-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                          <span className="text-xs text-white/50 italic">Checking...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                            currentBalance > 0
                              ? "bg-green-500/20 text-green-300 border border-green-400/50"
                              : "bg-gray-500/20 text-gray-300 border border-gray-400/50"
                          }`}>
                            {currentBalance > 0 ? "Holding" : "Sold"}
                          </span>
                          {currentBalance > 0 && (
                            <span className="text-xs text-white/60">
                              {retentionPercentage.toFixed(1)}%
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        </div>
      )}
    </div>
  );
}