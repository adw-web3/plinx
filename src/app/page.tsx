"use client";

import { useState } from "react";
import { WalletInput } from "@/components/WalletInput";
import { RecipientAnalysisComponent } from "@/components/RecipientAnalysis";
import { LoadingProgress } from "@/components/ProgressBar";
import { getDayvidendeRecipients, type RecipientAnalysis } from "@/lib/bsc-api";

export default function Home() {
  const [recipients, setRecipients] = useState<RecipientAnalysis[]>([]);
  const [totalTransfers, setTotalTransfers] = useState(0);
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentWallet, setCurrentWallet] = useState("");
  const [currentContract, setCurrentContract] = useState("");
  const [isDemo, setIsDemo] = useState(false);
  const [progress, setProgress] = useState({ currentStep: 0, totalSteps: 0, message: "" });

  const handleAddressSubmit = async (address: string, contractAddress: string) => {
    setLoading(true);
    setError("");
    setCurrentWallet(address);
    setCurrentContract(contractAddress);
    setProgress({ currentStep: 0, totalSteps: 0, message: "" });

    try {
      const result = await getDayvidendeRecipients(address, contractAddress, (step, totalSteps, message) => {
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Token Recipients Analyzer
          </h1>
          <p className="text-gray-600">
            Enter a wallet address and select a token contract to analyze all recipients and their current holdings
          </p>
        </div>

        <div className="flex flex-col items-center space-y-8">
          <WalletInput
            onAddressSubmit={handleAddressSubmit}
            loading={loading}
          />

          {currentWallet && (
            <div className="w-full max-w-6xl space-y-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Analyzing wallet:</h3>
                <code className="text-sm font-mono text-gray-900 break-all">
                  {currentWallet}
                </code>
                {currentContract && (
                  <p className="text-xs text-gray-500 mt-2">
                    Token Contract: {currentContract}
                  </p>
                )}
              </div>

              {isDemo && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.485 3.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 3.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">Demo Mode</h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>You&apos;re seeing demo data. To get real recipient analysis:</p>
                        <ol className="list-decimal list-inside mt-2 space-y-1">
                          <li>Get a free API key from <a href="https://bscscan.com/apis" target="_blank" rel="noopener noreferrer" className="underline">BSCScan</a></li>
                          <li>Add <code className="bg-yellow-100 px-1 rounded">NEXT_PUBLIC_BSCSCAN_API_KEY=your_api_key</code> to your .env file</li>
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
              "Fetching token transfers from BSCScan...",
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
