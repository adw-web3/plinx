export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  blockNumber: string;
  timeStamp: string;
  status: string;
}

export interface TokenTransfer {
  hash: string;
  from: string;
  to: string;
  value: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimal: string;
  blockNumber: string;
  timeStamp: string;
  contractAddress: string;
}

export interface BSCApiResponse {
  status: string;
  message: string;
  result: Transaction[];
}

export interface TokenTransferResponse {
  status: string;
  message: string;
  result: TokenTransfer[];
}

export interface RecipientAnalysis {
  address: string;
  totalReceived: string;
  currentBalance: string;
  transferCount: number;
  lastTransferTime: string;
}

export interface TokenBalanceResponse {
  status: string;
  message: string;
  result: string;
}

// Free BSCScan API - you can get a free API key from https://bscscan.com/apis
const BSCSCAN_API_URL = "https://api.etherscan.io/v2/api";

// Token Contract Addresses on BSC
const RSD_CONTRACT_ADDRESS = "0x61ed1c66239d29cc93c8597c6167159e8f69a823";
const DAYVIDENDE_CONTRACT_ADDRESS = "0xfF1E54d02B5d0576E7BEfD03602E36d5720D1997";

export async function getOutgoingTransactions(
  walletAddress: string,
  onProgress?: (step: number, totalSteps: number, message: string) => void
): Promise<{
  transactions: Transaction[];
  isDemo: boolean;
  error?: string;
}> {
  const totalSteps = 3;

  onProgress?.(1, totalSteps, "Validating API credentials...");

  // Check if we have a valid API key from environment
  const apiKey = process.env.NEXT_PUBLIC_BSCSCAN_API_KEY;

  if (!apiKey || apiKey === "YourApiKeyToken") {
    return {
      transactions: getMockTransactions(walletAddress),
      isDemo: true,
      error: "No BSCScan API key configured. Showing demo data."
    };
  }

  try {
    onProgress?.(2, totalSteps, "Fetching transactions from BSCScan...");

    const response = await fetch(
      `${BSCSCAN_API_URL}?chainid=56&module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=99999999&page=1&offset=100&sort=desc&apikey=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: BSCApiResponse = await response.json();

    if (data.status !== "1") {
      if (data.message.includes("No transactions found")) {
        return {
          transactions: [],
          isDemo: false
        };
      }
      throw new Error(data.message || "Failed to fetch transactions");
    }

    onProgress?.(3, totalSteps, "Processing transaction data...");

    // Filter only outgoing transactions (where 'from' equals the wallet address)
    const outgoingTxs = data.result.filter(
      (tx) => tx.from.toLowerCase() === walletAddress.toLowerCase()
    );

    return {
      transactions: outgoingTxs,
      isDemo: false
    };
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return {
      transactions: [],
      isDemo: false,
      error: `Failed to fetch real transaction data: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

export async function getRSDTokenTransfers(walletAddress: string): Promise<{
  transfers: TokenTransfer[];
  isDemo: boolean;
  error?: string;
}> {
  // Check if we have a valid API key from environment
  const apiKey = process.env.NEXT_PUBLIC_BSCSCAN_API_KEY;

  if (!apiKey || apiKey === "YourApiKeyToken") {
    return {
      transfers: getMockRSDTransfers(walletAddress),
      isDemo: true,
      error: "No BSCScan API key configured. Showing demo data."
    };
  }

  try {
    const response = await fetch(
      `${BSCSCAN_API_URL}?chainid=56&module=account&action=tokentx&contractaddress=${RSD_CONTRACT_ADDRESS}&address=${walletAddress}&page=1&offset=100&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: TokenTransferResponse = await response.json();

    if (data.status !== "1") {
      if (data.message.includes("No transactions found")) {
        return {
          transfers: [],
          isDemo: false
        };
      }
      throw new Error(data.message || "Failed to fetch token transfers");
    }

    // Filter only outgoing transfers (where 'from' equals the wallet address)
    const outgoingTransfers = data.result.filter(
      (transfer) => transfer.from.toLowerCase() === walletAddress.toLowerCase()
    );

    return {
      transfers: outgoingTransfers,
      isDemo: false
    };
  } catch (error) {
    console.error("Error fetching RSD token transfers:", error);
    return {
      transfers: [],
      isDemo: false,
      error: `Failed to fetch RSD token transfers: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

export async function getDayvidendeRecipients(
  walletAddress: string,
  onProgress?: (step: number, totalSteps: number, message: string) => void
): Promise<{
  recipients: RecipientAnalysis[];
  isDemo: boolean;
  error?: string;
}> {
  const totalSteps = 5;

  onProgress?.(1, totalSteps, "Validating API credentials...");

  // Check if we have a valid API key from environment
  const apiKey = process.env.NEXT_PUBLIC_BSCSCAN_API_KEY;

  if (!apiKey || apiKey === "YourApiKeyToken") {
    return {
      recipients: getMockDayvidendeRecipients(),
      isDemo: true,
      error: "No BSCScan API key configured. Showing demo data."
    };
  }

  try {
    onProgress?.(2, totalSteps, "Fetching token transfers from BSCScan...");

    // Fetch all Dayvidende token transfers FROM the specified wallet
    const response = await fetch(
      `${BSCSCAN_API_URL}?chainid=56&module=account&action=tokentx&contractaddress=${DAYVIDENDE_CONTRACT_ADDRESS}&address=${walletAddress}&page=1&offset=1000&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    onProgress?.(3, totalSteps, "Processing transaction data...");

    const data: TokenTransferResponse = await response.json();

    if (data.status !== "1") {
      if (data.message.includes("No transactions found")) {
        return {
          recipients: [],
          isDemo: false
        };
      }
      throw new Error(data.message || "Failed to fetch token transfers");
    }

    onProgress?.(4, totalSteps, "Analyzing recipient patterns...");

    // Filter only outgoing transfers (where 'from' equals the wallet address)
    const outgoingTransfers = data.result.filter(
      (transfer) => transfer.from.toLowerCase() === walletAddress.toLowerCase()
    );

    // Group transfers by recipient address
    const recipientMap = new Map<string, {
      totalReceived: bigint;
      transferCount: number;
      lastTransferTime: string;
    }>();

    outgoingTransfers.forEach((transfer) => {
      const recipient = transfer.to.toLowerCase();
      const value = BigInt(transfer.value);
      const existing = recipientMap.get(recipient);

      if (existing) {
        existing.totalReceived += value;
        existing.transferCount += 1;
        if (parseInt(transfer.timeStamp) > parseInt(existing.lastTransferTime)) {
          existing.lastTransferTime = transfer.timeStamp;
        }
      } else {
        recipientMap.set(recipient, {
          totalReceived: value,
          transferCount: 1,
          lastTransferTime: transfer.timeStamp
        });
      }
    });

    // Get current balances for each recipient
    const recipients: RecipientAnalysis[] = [];
    for (const [address, data] of recipientMap) {
      try {
        const balance = await getTokenBalance(address, DAYVIDENDE_CONTRACT_ADDRESS);
        recipients.push({
          address,
          totalReceived: data.totalReceived.toString(),
          currentBalance: balance,
          transferCount: data.transferCount,
          lastTransferTime: data.lastTransferTime
        });
      } catch (error) {
        console.error(`Failed to get balance for ${address}:`, error);
        recipients.push({
          address,
          totalReceived: data.totalReceived.toString(),
          currentBalance: "0",
          transferCount: data.transferCount,
          lastTransferTime: data.lastTransferTime
        });
      }
    }

    onProgress?.(5, totalSteps, "Finalizing recipient analysis...");

    // Sort by total received (descending)
    recipients.sort((a, b) => {
      const aTotal = BigInt(a.totalReceived);
      const bTotal = BigInt(b.totalReceived);
      return aTotal > bTotal ? -1 : aTotal < bTotal ? 1 : 0;
    });

    return {
      recipients,
      isDemo: false
    };
  } catch (error) {
    console.error("Error fetching Dayvidende recipients:", error);
    return {
      recipients: [],
      isDemo: false,
      error: `Failed to fetch Dayvidende recipients: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

async function getTokenBalance(walletAddress: string, contractAddress: string): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_BSCSCAN_API_KEY;

  if (!apiKey || apiKey === "YourApiKeyToken") {
    return "0";
  }

  try {
    const response = await fetch(
      `${BSCSCAN_API_URL}?chainid=56&module=account&action=tokenbalance&contractaddress=${contractAddress}&address=${walletAddress}&tag=latest&apikey=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: TokenBalanceResponse = await response.json();

    if (data.status !== "1") {
      return "0";
    }

    return data.result;
  } catch (error) {
    console.error("Error fetching token balance:", error);
    return "0";
  }
}

// Mock data for demonstration when API is not available
function getMockTransactions(walletAddress: string): Transaction[] {
  return [
    {
      hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      from: walletAddress,
      to: "0x742d35Cc6635C0532925a3b8D000b73B2d9B2E9F",
      value: "1000000000000000000", // 1 BNB in wei
      gas: "21000",
      gasPrice: "5000000000", // 5 Gwei
      blockNumber: "12345678",
      timeStamp: "1640995200", // Jan 1, 2022
      status: "1"
    },
    {
      hash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      from: walletAddress,
      to: "0x8894E0a0c962CB723c1976a4421c95949bE2D4E3",
      value: "500000000000000000", // 0.5 BNB in wei
      gas: "21000",
      gasPrice: "5000000000",
      blockNumber: "12345679",
      timeStamp: "1640995260",
      status: "1"
    },
    {
      hash: "0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456",
      from: walletAddress,
      to: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
      value: "2000000000000000000", // 2 BNB in wei
      gas: "21000",
      gasPrice: "5000000000",
      blockNumber: "12345680",
      timeStamp: "1640995320",
      status: "1"
    }
  ];
}

function getMockRSDTransfers(walletAddress: string): TokenTransfer[] {
  return [
    {
      hash: "0xabc123def456789012345678901234567890123456789012345678901234567890",
      from: walletAddress,
      to: "0x742d35Cc6635C0532925a3b8D000b73B2d9B2E9F",
      value: "500000000000000000000", // 500 RSD
      tokenName: "Reference System for DeFi",
      tokenSymbol: "RSD",
      tokenDecimal: "18",
      blockNumber: "12345681",
      timeStamp: "1640995380",
      contractAddress: RSD_CONTRACT_ADDRESS
    },
    {
      hash: "0xdef456789012345678901234567890123456789012345678901234567890abc123",
      from: walletAddress,
      to: "0x8894E0a0c962CB723c1976a4421c95949bE2D4E3",
      value: "250000000000000000000", // 250 RSD
      tokenName: "Reference System for DeFi",
      tokenSymbol: "RSD",
      tokenDecimal: "18",
      blockNumber: "12345682",
      timeStamp: "1640995440",
      contractAddress: RSD_CONTRACT_ADDRESS
    },
    {
      hash: "0x789012345678901234567890123456789012345678901234567890abc123def456",
      from: walletAddress,
      to: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
      value: "1000000000000000000000", // 1000 RSD
      tokenName: "Reference System for DeFi",
      tokenSymbol: "RSD",
      tokenDecimal: "18",
      blockNumber: "12345683",
      timeStamp: "1640995500",
      contractAddress: RSD_CONTRACT_ADDRESS
    }
  ];
}

function getMockDayvidendeRecipients(): RecipientAnalysis[] {
  return [
    {
      address: "0x742d35Cc6635C0532925a3b8D000b73B2d9B2E9F",
      totalReceived: "1000000000000000000000", // 1000 tokens
      currentBalance: "750000000000000000000", // 750 tokens
      transferCount: 3,
      lastTransferTime: "1640995500"
    },
    {
      address: "0x8894E0a0c962CB723c1976a4421c95949bE2D4E3",
      totalReceived: "500000000000000000000", // 500 tokens
      currentBalance: "500000000000000000000", // 500 tokens
      transferCount: 1,
      lastTransferTime: "1640995400"
    },
    {
      address: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
      totalReceived: "250000000000000000000", // 250 tokens
      currentBalance: "0", // 0 tokens (sold/transferred)
      transferCount: 1,
      lastTransferTime: "1640995300"
    }
  ];
}

export function formatBNBValue(weiValue: string): string {
  const bnbValue = parseFloat(weiValue) / Math.pow(10, 18);
  return bnbValue.toFixed(4);
}

export function formatTimestamp(timestamp: string): string {
  const date = new Date(parseInt(timestamp) * 1000);
  return date.toLocaleString();
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatTokenValue(value: string, decimals: string): string {
  const tokenValue = parseFloat(value) / Math.pow(10, parseInt(decimals));
  return tokenValue.toFixed(4);
}