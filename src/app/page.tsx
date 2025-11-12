"use client";

import { useState, useRef } from "react";
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
  const [walletBalance, setWalletBalance] = useState<string>("0");
  const [progress, setProgress] = useState({ currentStep: 0, totalSteps: 0, message: "" });
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleAddressSubmit = async (address: string, contractAddress: string, blockchain: Blockchain) => {
    setLoading(true);
    setError("");
    setCurrentWallet(address);
    setCurrentContract(contractAddress);
    setCurrentBlockchain(blockchain);
    setProgress({ currentStep: 0, totalSteps: 0, message: "" });

    // Clear previous results
    setRecipients([]);
    setTotalTransfers(0);
    setTokenSymbol("");
    setWalletBalance("0");
    setIsDemo(false);

    // Scroll to results section after a brief delay to let the DOM update
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    try {
      const result = await getTokenRecipients(
        blockchain,
        address,
        contractAddress,
        (step, totalSteps, message) => {
          setProgress({ currentStep: step, totalSteps, message });
        },
        (partialRecipients, totalTransfers, tokenSymbol, walletBalance) => {
          // Live update the UI with partial results
          setRecipients(partialRecipients);
          setTotalTransfers(totalTransfers);
          setTokenSymbol(tokenSymbol);
          if (walletBalance !== undefined) {
            setWalletBalance(walletBalance);
          }
        }
      );

      setRecipients(result.recipients);
      setTotalTransfers(result.totalTransfers);
      setTokenSymbol(result.tokenSymbol);
      setWalletBalance(result.walletBalance || "0");
      setIsDemo(result.isDemo);

      if (result.error) {
        setError(result.error);
      }

      // Show completion message
      setProgress({ currentStep: 5, totalSteps: 5, message: "Blockchain data fetched successfully!" });
    } catch {
      setError("Failed to fetch recipient data. Please try again.");
      setRecipients([]);
      setTotalTransfers(0);
      setTokenSymbol("");
      setWalletBalance("0");
      setIsDemo(false);
    } finally {
      setLoading(false);
      // Clear progress after a brief delay to show completion message
      setTimeout(() => {
        setProgress({ currentStep: 0, totalSteps: 0, message: "" });
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#507dc4] py-4">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
            Starknet Startup House Treasure Competition
          </h1>
          <p className="text-white/80 text-base max-w-3xl mx-auto">
            Track who is collecting the most Starknet Startup House Tokens - the winner takes all!
          </p>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <WalletInput
            onAddressSubmit={handleAddressSubmit}
            loading={loading}
            currentWallet={currentWallet}
            currentContract={currentContract}
          />

          {currentWallet && (
            <div ref={resultsRef} className="w-full max-w-6xl space-y-3">
              {isDemo && (
                <div className="bg-yellow-500/20 backdrop-blur-sm border-2 border-yellow-400/50 rounded-xl p-4">
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

          {(loading || recipients.length > 0) && (
            <>
              {/* Progress Bar - shown only while loading */}
              {loading && (
                <div className="w-full max-w-6xl">
                  <LoadingProgress
                    currentStep={progress.currentStep - 1}
                    totalSteps={progress.totalSteps - 1}
                    steps={[
                      `Fetching token transfers from ${currentBlockchain.name}...`,
                      "Processing transaction data...",
                      "Analyzing recipient patterns...",
                      "Finalizing recipient analysis..."
                    ]}
                    isLoading={loading}
                    progressMessage={progress.message}
                  />
                </div>
              )}

              <RecipientAnalysisComponent
                recipients={recipients}
                totalTransfers={totalTransfers}
                tokenSymbol={tokenSymbol}
                walletBalance={walletBalance}
                loading={loading}
                error={error}
                blockchain={currentBlockchain}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
