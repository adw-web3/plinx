import { RecipientAnalysis, TokenTransfer, TokenBalanceResponse, Transaction, BSCApiResponse } from "./bsc-api";

const ETHERSCAN_V2_API_BASE = "https://api.etherscan.io/v2/api";
const MOONBEAM_CHAIN_ID = "1284";

// Function to refresh wallet balance during analysis
export async function refreshWalletBalance(
  walletAddress: string,
  contractAddress: string
): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || process.env.NEXT_PUBLIC_BSCSCAN_API_KEY;

  if (!apiKey || apiKey === "YourApiKeyToken") {
    return "0";
  }

  const isNativeGLMR = contractAddress.toLowerCase() === "0x0000000000000000000000000000000000000802";

  try {
    if (isNativeGLMR) {
      const balanceUrl = `${ETHERSCAN_V2_API_BASE}?chainid=${MOONBEAM_CHAIN_ID}&module=account&action=balance&address=${walletAddress}&tag=latest&apikey=${apiKey}`;
      const balanceResponse = await fetch(balanceUrl);
      const balanceData: TokenBalanceResponse = await balanceResponse.json();
      return balanceData.status === "1" ? balanceData.result : "0";
    } else {
      const balanceUrl = `${ETHERSCAN_V2_API_BASE}?chainid=${MOONBEAM_CHAIN_ID}&module=account&action=tokenbalance&contractaddress=${contractAddress}&address=${walletAddress}&apikey=${apiKey}`;
      const balanceResponse = await fetch(balanceUrl);
      const balanceData: TokenBalanceResponse = await balanceResponse.json();
      return balanceData.status === "1" ? balanceData.result : "0";
    }
  } catch (error) {
    console.warn("Failed to refresh wallet balance:", error);
    return "0";
  }
}

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
  onPartialResults?: (partialRecipients: RecipientAnalysis[], totalTransfers: number, tokenSymbol: string, tokenDecimals?: string, walletBalance?: string) => void
): Promise<{
  recipients: RecipientAnalysis[];
  totalTransfers: number;
  tokenSymbol: string;
  tokenDecimals: string;
  walletBalance?: string;
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
        tokenDecimals: "18",
        isDemo: true,
        error: "No Etherscan API key configured. Showing demo data. Get a free API key at https://etherscan.io/apis"
      };
    }

    onProgress?.(2, 5, "Fetching token transfers from Moonbeam...");

    // For native GLMR precompile, we might need to use regular transactions instead
    const isNativeGLMR = contractAddress.toLowerCase() === "0x0000000000000000000000000000000000000802";

    // Fetch all transfers using block range pagination
    // Etherscan has a hard limit of 10,000 total records per query, so we use startblock/endblock
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let allTransfers: any[] = [];
    const pageSize = 10000;
    let endBlock = 99999999; // Start from latest block
    let iteration = 1;
    let hasMoreData = true;

    while (hasMoreData) {
      let transfersUrl: string;
      if (isNativeGLMR) {
        transfersUrl = `${ETHERSCAN_V2_API_BASE}?chainid=${MOONBEAM_CHAIN_ID}&module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=${endBlock}&page=1&offset=${pageSize}&sort=desc&apikey=${apiKey}`;
      } else {
        transfersUrl = `${ETHERSCAN_V2_API_BASE}?chainid=${MOONBEAM_CHAIN_ID}&module=account&action=tokentx&contractaddress=${contractAddress}&address=${walletAddress}&startblock=0&endblock=${endBlock}&page=1&offset=${pageSize}&sort=desc&apikey=${apiKey}`;
      }

      const transfersResponse = await fetch(transfersUrl);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const transfersData: BSCApiResponse | any = await transfersResponse.json();

      if (transfersData.status !== "1") {
        if (iteration === 1) {
          // First request failed - return error
          return {
            recipients: getMockMoonbeamRecipients(),
            totalTransfers: 9,
            tokenSymbol: "WGLMR",
            tokenDecimals: "18",
            isDemo: true,
            error: `API Error: ${transfersData.message}. Showing demo data instead.`
          };
        }
        // Subsequent requests - we've reached the end
        break;
      }

      const batchTransfers = transfersData.result || [];

      if (batchTransfers.length === 0) {
        hasMoreData = false;
        break;
      }

      allTransfers = allTransfers.concat(batchTransfers);
      onProgress?.(2, 5, `Fetching transfers... batch ${iteration} (${allTransfers.length} total)`);

      // If we got less than pageSize, we've fetched all transfers
      if (batchTransfers.length < pageSize) {
        hasMoreData = false;
      } else {
        // Get the lowest block number from this batch to continue from there
        // Results are sorted desc, so last item has the lowest block
        const lastTransfer = batchTransfers[batchTransfers.length - 1];
        const lastBlockNum = parseInt(lastTransfer.blockNumber, 10);

        // Set endBlock to one less than the last block to avoid duplicates
        endBlock = lastBlockNum - 1;

        if (endBlock <= 0) {
          hasMoreData = false;
        } else {
          iteration++;
          // Small delay between requests to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
    }

    let outgoingTransfers: (Transaction | TokenTransfer)[];
    if (isNativeGLMR) {
      // For native GLMR, filter regular transactions where value > 0 (GLMR transfers)
      outgoingTransfers = allTransfers.filter(
        (tx: Transaction) => tx.from.toLowerCase() === walletAddress.toLowerCase() &&
                     tx.value !== "0" &&
                     tx.to !== "0x" // Exclude contract creation
      );
    } else {
      // For token transfers, filter as usual
      outgoingTransfers = allTransfers.filter(
        (tx: TokenTransfer) => tx.from.toLowerCase() === walletAddress.toLowerCase()
      );
    }

    // Get token decimals from first transfer (for ERC-20 tokens)
    const tokenDecimals = isNativeGLMR ? "18" : ((outgoingTransfers[0] as TokenTransfer)?.tokenDecimal || "18");

    // Fetch source wallet's current token balance (tokens left for airdrop)
    let walletBalance = "0";
    try {
      if (isNativeGLMR) {
        const balanceUrl = `${ETHERSCAN_V2_API_BASE}?chainid=${MOONBEAM_CHAIN_ID}&module=account&action=balance&address=${walletAddress}&tag=latest&apikey=${apiKey}`;
        const balanceResponse = await fetch(balanceUrl);
        const balanceData: TokenBalanceResponse = await balanceResponse.json();
        walletBalance = balanceData.status === "1" ? balanceData.result : "0";
      } else {
        const balanceUrl = `${ETHERSCAN_V2_API_BASE}?chainid=${MOONBEAM_CHAIN_ID}&module=account&action=tokenbalance&contractaddress=${contractAddress}&address=${walletAddress}&apikey=${apiKey}`;
        const balanceResponse = await fetch(balanceUrl);
        const balanceData: TokenBalanceResponse = await balanceResponse.json();
        walletBalance = balanceData.status === "1" ? balanceData.result : "0";
      }
    } catch (balanceError) {
      console.warn(`Failed to fetch source wallet balance:`, balanceError);
    }

    if (outgoingTransfers.length === 0) {
      return {
        recipients: [],
        totalTransfers: 0,
        tokenSymbol: isNativeGLMR ? "GLMR" : (allTransfers[0]?.tokenSymbol || "WGLMR"),
        tokenDecimals,
        walletBalance,
        isDemo: false,
        error: `No outgoing ${isNativeGLMR ? 'GLMR' : 'token'} transfers found for this address and contract`
      };
    }

    // Group transfers by recipient
    const recipientMap = new Map<string, {
      totalReceived: bigint;
      transferCount: number;
      lastTransferTime: string;
    }>();

    // Filter for amounts higher than 0.02 GLMR to exclude automated payments (only for native GLMR)
    const minAmountWei = BigInt("20000000000000000"); // 0.02 GLMR in wei
    let filteredTransferCount = 0;
    const totalTransferCount = outgoingTransfers.length;
    const tokenSymbol = isNativeGLMR ? "GLMR" : (outgoingTransfers[0] as TokenTransfer).tokenSymbol;

    // Process transfers and show progress
    for (let i = 0; i < outgoingTransfers.length; i++) {
      const transfer = outgoingTransfers[i];
      const recipient = transfer.to.toLowerCase();
      const value = BigInt(transfer.value);

      // For native GLMR: filter out small automated payments (< 0.02 GLMR)
      // For ERC-20 tokens: include all transfers (no minimum threshold)
      const shouldInclude = isNativeGLMR ? value > minAmountWei : value > BigInt(0);

      if (shouldInclude) {
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

      // Update progress and send partial results every 500 transfers
      if (i % 500 === 0 || i === outgoingTransfers.length - 1) {
        const percent = Math.round((i / totalTransferCount) * 100);
        onProgress?.(3, 5, `Processing transfers... ${percent}% (${recipientMap.size} recipients found)`);

        // Send partial results during aggregation (with currentBalance as "0" - will be updated later)
        if (onPartialResults) {
          const partialRecipients: RecipientAnalysis[] = Array.from(recipientMap.entries())
            .map(([address, data]) => ({
              address,
              totalReceived: data.totalReceived.toString(),
              currentBalance: "0", // Will be fetched later
              transferCount: data.transferCount,
              lastTransferTime: data.lastTransferTime
            }))
            .sort((a, b) => BigInt(b.totalReceived) > BigInt(a.totalReceived) ? 1 : -1);
          onPartialResults(partialRecipients, filteredTransferCount, tokenSymbol, tokenDecimals, walletBalance);
        }
      }
    }

    // Get current balances for recipients (excluding specific problematic addresses)
    const allRecipientAddresses = Array.from(recipientMap.keys());
    const excludedAddresses = ["0x86c66061a0e55d91c8bfa464fe84dc58f8733253"];
    const recipientAddresses = allRecipientAddresses.filter(
      address => !excludedAddresses.includes(address.toLowerCase())
    );

    const recipients: RecipientAnalysis[] = [];

    // Multi-key rate limiting system
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    // Define API keys with their rate limits
    const apiKeyConfigs = [
      { key: process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY, batchSize: 5, delayMs: 1000 },
      { key: process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY_2, batchSize: 4, delayMs: 800 },
      { key: process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY_3, batchSize: 6, delayMs: 1200 },
    ].filter(config => config.key && config.key !== "YourApiKeyToken");

    // Helper function to fetch balance for a single address with a specific key
    const fetchBalanceWithKey = async (address: string, apiKeyToUse: string): Promise<string> => {
      try {
        if (isNativeGLMR) {
          const balanceUrl = `${ETHERSCAN_V2_API_BASE}?chainid=${MOONBEAM_CHAIN_ID}&module=account&action=balance&address=${address}&tag=latest&apikey=${apiKeyToUse}`;
          const balanceResponse = await fetch(balanceUrl);
          const balanceData: TokenBalanceResponse = await balanceResponse.json();
          return balanceData.status === "1" ? balanceData.result : "0";
        } else {
          const balanceUrl = `${ETHERSCAN_V2_API_BASE}?chainid=${MOONBEAM_CHAIN_ID}&module=account&action=tokenbalance&contractaddress=${contractAddress}&address=${address}&apikey=${apiKeyToUse}`;
          const balanceResponse = await fetch(balanceUrl);
          const balanceData: TokenBalanceResponse = await balanceResponse.json();
          return balanceData.status === "1" ? balanceData.result : "0";
        }
      } catch (balanceError) {
        console.warn(`Failed to fetch balance for ${address}, using 0:`, balanceError);
        return "0";
      }
    };

    // Process addresses using all keys in parallel
    // Use atomic index to avoid race conditions with shared queue
    let currentIndex = 0;
    let processedCount = 0;
    const balanceResults = new Map<string, string>();
    const totalAddresses = recipientAddresses.length;

    // Atomic function to get next batch of addresses
    const getNextBatch = (batchSize: number): string[] => {
      const batch: string[] = [];
      const startIndex = currentIndex;
      const endIndex = Math.min(startIndex + batchSize, totalAddresses);
      currentIndex = endIndex; // Atomic update

      for (let i = startIndex; i < endIndex; i++) {
        batch.push(recipientAddresses[i]);
      }
      return batch;
    };

    const processWithKey = async (keyConfig: { key: string; batchSize: number; delayMs: number }) => {
      while (true) {
        // Get next batch atomically
        const batch = getNextBatch(keyConfig.batchSize);

        if (batch.length === 0) break;

        // Fetch all balances in this batch in parallel
        const balancePromises = batch.map(address => fetchBalanceWithKey(address, keyConfig.key));
        const balances = await Promise.all(balancePromises);

        // Store results
        batch.forEach((address, index) => {
          balanceResults.set(address, balances[index]);
          processedCount++;
        });

        // Update progress
        onProgress?.(4, 5, `Fetching balances... ${processedCount}/${totalAddresses} recipients`);

        // Report partial results
        if (onPartialResults) {
          const currentRecipients: RecipientAnalysis[] = [];
          for (const [addr, balance] of balanceResults.entries()) {
            const recipientData = recipientMap.get(addr);
            if (recipientData) {
              currentRecipients.push({
                address: addr,
                totalReceived: recipientData.totalReceived.toString(),
                currentBalance: balance,
                transferCount: recipientData.transferCount,
                lastTransferTime: recipientData.lastTransferTime
              });
            }
          }
          const sortedRecipients = currentRecipients.sort((a, b) =>
            BigInt(b.totalReceived) > BigInt(a.totalReceived) ? 1 : -1
          );
          onPartialResults(sortedRecipients, filteredTransferCount, tokenSymbol, tokenDecimals, walletBalance);
        }

        // Wait before next batch (rate limiting for this key)
        if (currentIndex < totalAddresses) {
          await delay(keyConfig.delayMs);
        }
      }
    };

    // Run all keys in parallel
    await Promise.all(apiKeyConfigs.map(config => processWithKey(config as { key: string; batchSize: number; delayMs: number })));

    // Build final recipients list from results
    for (const address of recipientAddresses) {
      const recipientData = recipientMap.get(address)!;
      recipients.push({
        address,
        totalReceived: recipientData.totalReceived.toString(),
        currentBalance: balanceResults.get(address) || "0",
        transferCount: recipientData.transferCount,
        lastTransferTime: recipientData.lastTransferTime
      });
    }

    onProgress?.(5, 5, "Analysis complete!");

    return {
      recipients: recipients.sort((a, b) => BigInt(b.totalReceived) > BigInt(a.totalReceived) ? 1 : -1),
      totalTransfers: filteredTransferCount,
      tokenSymbol,
      tokenDecimals,
      walletBalance,
      isDemo: false
    };

  } catch (error) {
    console.error("Error fetching Moonbeam data:", error);
    return {
      recipients: getMockMoonbeamRecipients(),
      totalTransfers: 9,
      tokenSymbol: "WGLMR",
      tokenDecimals: "18",
      isDemo: true,
      error: `Error: ${error instanceof Error ? error.message : "Unknown error"}. Showing demo data.`
    };
  }
}