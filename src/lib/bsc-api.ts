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

// Free BSCScan API - you can get a free API key from https://bscscan.com/apis
const BSCSCAN_API_URL = "https://api.etherscan.io/v2/api";

// RSD Token Contract Address on BSC
const RSD_CONTRACT_ADDRESS = "0x61ed1c66239d29cc93c8597c6167159e8f69a823";

export async function getOutgoingTransactions(walletAddress: string): Promise<{
  transactions: Transaction[];
  isDemo: boolean;
  error?: string;
}> {
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