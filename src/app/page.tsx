"use client";

import { useState } from "react";
import { WalletInput } from "@/components/WalletInput";
import { RecipientAnalysisComponent } from "@/components/RecipientAnalysis";
import { LoadingProgress } from "@/components/ProgressBar";
import { getTokenRecipients, type UnifiedRecipientAnalysis } from "@/lib/blockchain-api";
import { SUPPORTED_BLOCKCHAINS, type Blockchain } from "@/components/BlockchainSelector";

export default function Home() {
  const [recipients, setRecipients] = useState<UnifiedRecipientAnalysis[]>([]);
  const [totalTransfers, setTotalTransfers] = useState(0);
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentWallet, setCurrentWallet] = useState("");
  const [currentContract, setCurrentContract] = useState("");
  const [currentBlockchain, setCurrentBlockchain] = useState<Blockchain>(SUPPORTED_BLOCKCHAINS[0]);
  const [isDemo, setIsDemo] = useState(false);
  const [progress, setProgress] = useState({ currentStep: 0, totalSteps: 0, message: "" });

  const handleAddressSubmit = async (address: string, contractAddress: string, blockchain: Blockchain) => {
    setLoading(true);
    setError("");
    setCurrentWallet(address);
    setCurrentContract(contractAddress);
    setCurrentBlockchain(blockchain);
    setProgress({ currentStep: 0, totalSteps: 0, message: "" });

    try {
      const result = await getTokenRecipients(blockchain, address, contractAddress, (step, totalSteps, message) => {
        setProgress({ currentStep: step, totalSteps, message });
      });

      setRecipients(result.recipients);
      setTotalTransfers(result.totalTransfers);
      setTokenSymbol(result.tokenSymbol);
      setIsDemo(result.isDemo);

      if (result.error) {
        setError(result.error);
      }
    } catch {
      setError("Failed to fetch recipient data. Please try again.");
      setRecipients([]);
      setTotalTransfers(0);
      setTokenSymbol("");
      setIsDemo(false);
    } finally {
      setLoading(false);
      setProgress({ currentStep: 0, totalSteps: 0, message: "" });
    }
  };

  return (
    <div className="min-h-screen bg-[#81a1d3] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Token Recipients Analyzer
          </h1>
          <p className="text-white/80 text-lg max-w-3xl mx-auto">
            Enter a wallet address and select a token contract to analyze all recipients and their current holdings
          </p>
        </div>

        <div className="flex flex-col items-center space-y-8">
          <WalletInput
            onAddressSubmit={handleAddressSubmit}
            loading={loading}
          />

          {currentWallet && (
            <div className="w-full max-w-6xl space-y-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border-2 border-white/30 p-6">
                <h3 className="text-sm font-medium text-white/70 mb-2">Analyzing wallet on {currentBlockchain.name}:</h3>
                <code className="text-sm font-mono text-white break-all bg-black/20 p-3 rounded-lg block">
                  {currentWallet}
                </code>
                {currentContract && (
                  <p className="text-xs text-white/70 mt-3">
                    Token Contract: <span className="font-mono">{currentContract}</span>
                  </p>
                )}
              </div>

              {isDemo && (
                <div className="bg-yellow-500/20 backdrop-blur-sm border-2 border-yellow-400/50 rounded-2xl p-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-yellow-300" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.485 3.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 3.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-yellow-100">Demo Mode</h3>
                      <div className="mt-3 text-yellow-200">
                        <p className="mb-3">You&apos;re seeing demo data. To get real recipient analysis:</p>
                        <ol className="list-decimal list-inside space-y-2">
                          {currentBlockchain.id === "bsc" ? (
                            <>
                              <li>Get a free API key from <a href="https://bscscan.com/apis" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-100 transition-colors">BSCScan</a></li>
                              <li>Add <code className="bg-black/30 px-2 py-1 rounded font-mono text-sm">NEXT_PUBLIC_BSCSCAN_API_KEY=your_api_key</code> to your .env file</li>
                            </>
                          ) : (
                            <>
                              <li>Get access to Starknet API services</li>
                              <li>Add <code className="bg-black/30 px-2 py-1 rounded font-mono text-sm">NEXT_PUBLIC_STARKNET_API_KEY=your_api_key</code> to your .env file</li>
                            </>
                          )}
                          <li>Restart the application</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <LoadingProgress
            currentStep={progress.currentStep}
            totalSteps={progress.totalSteps}
            steps={[
              "Validating API credentials...",
              `Fetching token transfers from ${currentBlockchain.name}...`,
              "Processing transaction data...",
              "Analyzing recipient patterns...",
              "Finalizing recipient analysis..."
            ]}
            isLoading={loading}
          />

          <RecipientAnalysisComponent
            recipients={recipients}
            totalTransfers={totalTransfers}
            tokenSymbol={tokenSymbol}
            loading={loading}
            error={error}
          />
        </div>
      </div>
    </div>
  );
}
