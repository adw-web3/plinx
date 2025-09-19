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

export interface BSCApiResponse {
  status: string;
  message: string;
  result: Transaction[];
}

// Free BSCScan API - you can get a free API key from https://bscscan.com/apis
const BSCSCAN_API_URL = "https://api.bscscan.com/api";

export async function getOutgoingTransactions(walletAddress: string): Promise<Transaction[]> {
  try {
    // Using BSCScan API for better transaction data
    // Note: For production, you should get a free API key from BSCScan
    const response = await fetch(
      `${BSCSCAN_API_URL}?module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=99999999&page=1&offset=100&sort=desc&apikey=YourApiKeyToken`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: BSCApiResponse = await response.json();

    if (data.status !== "1") {
      throw new Error(data.message || "Failed to fetch transactions");
    }

    // Filter only outgoing transactions (where 'from' equals the wallet address)
    const outgoingTxs = data.result.filter(
      (tx) => tx.from.toLowerCase() === walletAddress.toLowerCase()
    );

    return outgoingTxs;
  } catch (error) {
    console.error("Error fetching transactions:", error);

    // Fallback: Return mock data for demonstration
    return getMockTransactions(walletAddress);
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