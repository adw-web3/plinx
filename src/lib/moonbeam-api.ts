import { RecipientAnalysis, TokenTransfer, TokenBalanceResponse, Transaction, BSCApiResponse } from "./bsc-api";

const ETHERSCAN_V2_API_BASE = "https://api.etherscan.io/v2/api";
const MOONBEAM_CHAIN_ID = "1284";

// Mock data for demo purposes
function getMockMoonbeamRecipients(): RecipientAnalysis[] {
  return [
    {
      address: "0x1234567890123456789012345678901234567890",
      totalReceived: "1000000000000000000000", // 1000 WGLMR
      currentBalance: "500000000000000000000", // 500 WGLMR
      transferCount: 5,
      lastTransferTime: "1735142400" // Jan 1, 2025
    },
    {
      address: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
      totalReceived: "750000000000000000000", // 750 WGLMR
      currentBalance: "0", // 0 WGLMR (sold all)
      transferCount: 3,
      lastTransferTime: "1735056000" // Dec 31, 2024
    },
    {
      address: "0x9876543210987654321098765432109876543210",
      totalReceived: "250000000000000000000", // 250 WGLMR
      currentBalance: "250000000000000000000", // 250 WGLMR (holding)
      transferCount: 1,
      lastTransferTime: "1734969600" // Dec 30, 2024
    }
  ];
}

export async function getMoonbeamTokenTransfers(
  walletAddress: string,
  contractAddress: string,
  onProgress?: (step: number, totalSteps: number, message: string) => void,
  onPartialResults?: (partialRecipients: RecipientAnalysis[], totalTransfers: number, tokenSymbol: string) => void
): Promise<{
  recipients: RecipientAnalysis[];
  totalTransfers: number;
  tokenSymbol: string;
  isDemo: boolean;
  error?: string;
}> {
  try {
    onProgress?.(1, 4, "Validating API credentials...");

    // Check if we have a valid API key from environment (reuse BSC key for multi-chain Etherscan V2)
    const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || process.env.NEXT_PUBLIC_BSCSCAN_API_KEY;

    if (!apiKey || apiKey === "YourApiKeyToken") {
      onProgress?.(4, 4, "No API key found - showing demo data");
      return {
        recipients: getMockMoonbeamRecipients(),
        totalTransfers: 9,
        tokenSymbol: "WGLMR",
        isDemo: true,
        error: "No Etherscan API key configured. Showing demo data. Get a free API key at https://etherscan.io/apis"
      };
    }

    onProgress?.(2, 4, "Fetching token transfers from Moonbeam...");

    // For native GLMR precompile, we might need to use regular transactions instead
    const isNativeGLMR = contractAddress.toLowerCase() === "0x0000000000000000000000000000000000000802";

    let transfersUrl: string;
    if (isNativeGLMR) {
      // For native GLMR, get regular transactions instead of token transactions
      transfersUrl = `${ETHERSCAN_V2_API_BASE}?chainid=${MOONBEAM_CHAIN_ID}&module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`;
    } else {
      // For regular ERC-20 tokens, use token transactions
      transfersUrl = `${ETHERSCAN_V2_API_BASE}?chainid=${MOONBEAM_CHAIN_ID}&module=account&action=tokentx&contractaddress=${contractAddress}&address=${walletAddress}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`;
    }

    const transfersResponse = await fetch(transfersUrl);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transfersData: BSCApiResponse | any = await transfersResponse.json();

    if (transfersData.status !== "1") {
      return {
        recipients: getMockMoonbeamRecipients(),
        totalTransfers: 9,
        tokenSymbol: "WGLMR",
        isDemo: true,
        error: `API Error: ${transfersData.message}. Showing demo data instead.`
      };
    }

    let outgoingTransfers: (Transaction | TokenTransfer)[];
    if (isNativeGLMR) {
      // For native GLMR, filter regular transactions where value > 0 (GLMR transfers)
      outgoingTransfers = transfersData.result.filter(
        (tx: Transaction) => tx.from.toLowerCase() === walletAddress.toLowerCase() &&
                     tx.value !== "0" &&
                     tx.to !== "0x" // Exclude contract creation
      );
    } else {
      // For token transfers, filter as usual
      outgoingTransfers = transfersData.result.filter(
        (tx: TokenTransfer) => tx.from.toLowerCase() === walletAddress.toLowerCase()
      );
    }

    if (outgoingTransfers.length === 0) {
      return {
        recipients: [],
        totalTransfers: 0,
        tokenSymbol: isNativeGLMR ? "GLMR" : (transfersData.result[0]?.tokenSymbol || "WGLMR"),
        isDemo: false,
        error: `No outgoing ${isNativeGLMR ? 'GLMR' : 'token'} transfers found for this address and contract`
      };
    }

    onProgress?.(3, 4, "Analyzing recipients...");

    // Group transfers by recipient
    const recipientMap = new Map<string, {
      totalReceived: bigint;
      transferCount: number;
      lastTransferTime: string;
    }>();

    // Filter for amounts higher than 0.02 GLMR to exclude automated 0.02 GLMR payments
    const minAmountWei = BigInt("20000000000000000"); // 0.02 GLMR in wei
    let filteredTransferCount = 0;
    let totalTransferCount = 0;

    for (const transfer of outgoingTransfers) {
      const recipient = transfer.to.toLowerCase();
      const value = BigInt(transfer.value);
      totalTransferCount++;

      // Only include transfers GREATER than 0.02 GLMR (excludes automated 0.02 GLMR payments)
      if (value > minAmountWei) {
        filteredTransferCount++;
        if (recipientMap.has(recipient)) {
          const existing = recipientMap.get(recipient)!;
          existing.totalReceived += value;
          existing.transferCount += 1;
          if (transfer.timeStamp > existing.lastTransferTime) {
            existing.lastTransferTime = transfer.timeStamp;
          }
        } else {
          recipientMap.set(recipient, {
            totalReceived: value,
            transferCount: 1,
            lastTransferTime: transfer.timeStamp
          });
        }
      }
    }

    console.log(`Filtered ${filteredTransferCount} of ${totalTransferCount} transfers (only amounts > 0.02 GLMR included, excludes automated payments)`);

    onProgress?.(4, 4, "Fetching current balances...");

    // Get current balances for recipients (excluding specific problematic addresses)
    const allRecipientAddresses = Array.from(recipientMap.keys());
    const excludedAddresses = ["0x86c66061a0e55d91c8bfa464fe84dc58f8733253"];
    const recipientAddresses = allRecipientAddresses.filter(
      address => !excludedAddresses.includes(address.toLowerCase())
    );

    if (allRecipientAddresses.length > recipientAddresses.length) {
      console.log(`Excluded ${allRecipientAddresses.length - recipientAddresses.length} problematic addresses from analysis`);
    }

    const recipients: RecipientAnalysis[] = [];

    for (let i = 0; i < recipientAddresses.length; i++) {
      const address = recipientAddresses[i];
      const recipientData = recipientMap.get(address)!;

      try {
        let currentBalance: string = "0";

        // Try balance fetching with error handling
        try {
          if (isNativeGLMR) {
            // For native GLMR, get regular balance
            const balanceUrl = `${ETHERSCAN_V2_API_BASE}?chainid=${MOONBEAM_CHAIN_ID}&module=account&action=balance&address=${address}&tag=latest&apikey=${apiKey}`;
            const balanceResponse = await fetch(balanceUrl);
            const balanceData: TokenBalanceResponse = await balanceResponse.json();
            currentBalance = balanceData.status === "1" ? balanceData.result : "0";
          } else {
            // For token balances, use token balance API
            const balanceUrl = `${ETHERSCAN_V2_API_BASE}?chainid=${MOONBEAM_CHAIN_ID}&module=account&action=tokenbalance&contractaddress=${contractAddress}&address=${address}&apikey=${apiKey}`;
            const balanceResponse = await fetch(balanceUrl);
            const balanceData: TokenBalanceResponse = await balanceResponse.json();
            currentBalance = balanceData.status === "1" ? balanceData.result : "0";
          }
        } catch (balanceError) {
          // If balance fetching fails, keep currentBalance as "0" and continue
          console.warn(`Failed to fetch balance for ${address}, using 0:`, balanceError);
          currentBalance = "0";
        }

        recipients.push({
          address,
          totalReceived: recipientData.totalReceived.toString(),
          currentBalance,
          transferCount: recipientData.transferCount,
          lastTransferTime: recipientData.lastTransferTime
        });

        // Report partial results every 10 recipients
        if (i % 10 === 0 && onPartialResults) {
          const tokenSymbol = isNativeGLMR ? "GLMR" : (outgoingTransfers[0] as TokenTransfer).tokenSymbol;
          onPartialResults(recipients, filteredTransferCount, tokenSymbol);
        }
      } catch (error) {
        console.warn(`Failed to fetch balance for ${address}:`, error);
        recipients.push({
          address,
          totalReceived: recipientData.totalReceived.toString(),
          currentBalance: "0",
          transferCount: recipientData.transferCount,
          lastTransferTime: recipientData.lastTransferTime
        });
      }
    }

    return {
      recipients: recipients.sort((a, b) => BigInt(b.totalReceived) > BigInt(a.totalReceived) ? 1 : -1),
      totalTransfers: filteredTransferCount,
      tokenSymbol: isNativeGLMR ? "GLMR" : (outgoingTransfers[0] as TokenTransfer).tokenSymbol,
      isDemo: false
    };

  } catch (error) {
    console.error("Error fetching Moonbeam data:", error);
    return {
      recipients: getMockMoonbeamRecipients(),
      totalTransfers: 9,
      tokenSymbol: "WGLMR",
      isDemo: true,
      error: `Error: ${error instanceof Error ? error.message : "Unknown error"}. Showing demo data.`
    };
  }
}