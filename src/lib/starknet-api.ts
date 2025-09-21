import { RpcProvider, Contract, validateAndParseAddress, hash, num } from "starknet";
import { formatTokenValue } from "./bsc-api";

export interface StarknetTransaction {
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

export interface StarknetTokenTransfer {
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

export interface StarknetApiResponse {
  status: string;
  message: string;
  result: StarknetTransaction[];
}

export interface StarknetTokenTransferResponse {
  status: string;
  message: string;
  result: StarknetTokenTransfer[];
}

export interface StarknetRecipientAnalysis {
  address: string;
  totalReceived: string;
  currentBalance: string;
  transferCount: number;
  lastTransferTime: string;
}

export interface StarknetTokenBalanceResponse {
  status: string;
  message: string;
  result: string;
}

export interface StarknetEvent {
  from_address: string;
  keys: string[];
  data: string[];
  block_hash: string;
  block_number: number;
  transaction_hash: string;
}

export interface StarknetEventsResponse {
  events: StarknetEvent[];
  continuation_token?: string;
}

// Free Starknet RPC endpoints (no API key required)
// Source: https://www.comparenodes.com/library/public-endpoints/starknet/
const FREE_STARKNET_RPC_ENDPOINTS = [
  "https://starknet-mainnet.public.blastapi.io",          // Blast API
  "https://starknet-rpc.publicnode.com",                  // Allnodes
  "https://1rpc.io/starknet",                             // 1RPC
  "https://starknet.drpc.org",                            // dRPC
  "https://rpc.starknet.lava.build",                      // Lava
  "https://endpoints.omniatech.io/v1/starknet/mainnet/public", // OMNIA
  "https://starknet.api.onfinality.io/public",            // OnFinality
  "https://starknet-mainnet.reddio.com/rpc/v0_7"         // Reddio
];

// Starknet RPC configuration
const STARKNET_RPC_URL = process.env.NEXT_PUBLIC_STARKNET_RPC_URL || FREE_STARKNET_RPC_ENDPOINTS[0];

// ERC-20 Token ABI for Starknet (simplified)
const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    inputs: [{ name: "account", type: "felt" }],
    outputs: [{ name: "balance", type: "Uint256" }],
    stateMutability: "view"
  },
  {
    name: "symbol",
    type: "function",
    inputs: [],
    outputs: [{ name: "symbol", type: "felt252" }],
    stateMutability: "view"
  },
  {
    name: "name",
    type: "function",
    inputs: [],
    outputs: [{ name: "name", type: "felt252" }],
    stateMutability: "view"
  },
  {
    name: "decimals",
    type: "function",
    inputs: [],
    outputs: [{ name: "decimals", type: "u8" }],
    stateMutability: "view"
  },
  {
    name: "Transfer",
    type: "event",
    keys: [],
    data: [
      { name: "from", type: "felt" },
      { name: "to", type: "felt" },
      { name: "value", type: "Uint256" }
    ]
  }
];

// Initialize Starknet provider
let starknetProvider: RpcProvider | null = null;

function getStarknetProvider(): RpcProvider {
  if (!starknetProvider) {
    starknetProvider = new RpcProvider({
      nodeUrl: STARKNET_RPC_URL
    });
  }
  return starknetProvider;
}

// Helper function to calculate Transfer event hash
function getTransferEventHash(): string {
  return num.toHex(hash.starknetKeccak('Transfer'));
}

// Helper function to parse Transfer event data
function parseTransferEvent(event: StarknetEvent): {
  from: string;
  to: string;
  value: string;
  blockNumber: number;
  transactionHash: string;
} | null {
  try {
    // Transfer event structure can vary:
    // Format 1 (indexed): keys[0] = hash, keys[1] = from, keys[2] = to, data[0,1] = value
    // Format 2 (non-indexed): keys[0] = hash, data[0] = from, data[1] = to, data[2,3] = value

    let from: string;
    let to: string;
    let valueLow: bigint;
    let valueHigh: bigint;

    if (event.keys.length >= 3) {
      // Indexed format: from and to are in keys
      from = event.keys[1];
      to = event.keys[2];
      valueLow = BigInt(event.data[0] || '0');
      valueHigh = BigInt(event.data[1] || '0');
    } else if (event.keys.length === 1 && event.data.length >= 4) {
      // Non-indexed format: from and to are in data
      from = event.data[0];
      to = event.data[1];
      valueLow = BigInt(event.data[2] || '0');
      valueHigh = BigInt(event.data[3] || '0');
    } else {
      console.warn('Transfer event has unexpected format:', {
        keys: event.keys.length,
        data: event.data.length,
        event
      });
      return null;
    }

    // Parse u256 value from (low, high)
    const value = (valueHigh << BigInt(128)) + valueLow;

    return {
      from,
      to,
      value: value.toString(),
      blockNumber: event.block_number,
      transactionHash: event.transaction_hash
    };
  } catch (error) {
    console.error('Error parsing Transfer event:', error, event);
    return null;
  }
}

export async function getStarknetTokenTransfers(
  walletAddress: string,
  contractAddress: string,
  onProgress?: (step: number, totalSteps: number, message: string) => void
): Promise<{
  recipients: StarknetRecipientAnalysis[];
  totalTransfers: number;
  tokenSymbol: string;
  isDemo: boolean;
  error?: string;
}> {
  const totalSteps = 5;

  onProgress?.(1, totalSteps, "Connecting to Starknet...");

  try {
    // Validate addresses
    validateAndParseAddress(walletAddress);
    validateAndParseAddress(contractAddress);

    // Initialize provider for future use
    getStarknetProvider();

    onProgress?.(2, totalSteps, "Fetching token transfers from Starknet...");

    // Create contract instance (for future use)
    // const contract = new Contract(ERC20_ABI, validatedContract, provider);

    // Get token symbol from the contract
    let tokenSymbol = "TOKEN";
    try {
      const provider = getStarknetProvider();
      const contract = new Contract(ERC20_ABI, validateAndParseAddress(contractAddress), provider);

      console.log(`Attempting to fetch symbol from contract: ${contractAddress}`);
      const symbolResult = await contract.symbol();
      console.log(`Raw symbol result:`, symbolResult, `Type: ${typeof symbolResult}`);

      // Convert felt252 to string - Starknet uses different encoding
      let symbolValue: bigint | null = null;

      if (symbolResult && typeof symbolResult === 'object' && 'symbol' in symbolResult) {
        // Result is an object with symbol property
        symbolValue = symbolResult.symbol as bigint;
        console.log(`Symbol bigint value: ${symbolValue}`);
      } else if (symbolResult && typeof symbolResult === 'bigint') {
        // Direct bigint result
        symbolValue = symbolResult;
      } else if (Array.isArray(symbolResult) && symbolResult.length > 0) {
        // Array result
        symbolValue = symbolResult[0] as bigint;
      }

      if (symbolValue) {
        try {
          // Convert bigint to hex and then to ASCII
          const hexString = symbolValue.toString(16);
          console.log(`Symbol hex string: ${hexString}`);

          // Method: Convert hex to ASCII string
          let decoded = '';
          // Ensure even length by padding if necessary
          const paddedHex = hexString.length % 2 === 0 ? hexString : '0' + hexString;

          for (let i = 0; i < paddedHex.length; i += 2) {
            const byte = parseInt(paddedHex.substr(i, 2), 16);
            if (byte !== 0 && byte >= 32 && byte <= 126) { // Only printable ASCII
              decoded += String.fromCharCode(byte);
            }
          }

          if (decoded.length > 0) {
            tokenSymbol = decoded;
            console.log(`Successfully decoded symbol: ${decoded}`);
          } else {
            // Alternative: decode from right to left (little endian)
            decoded = '';
            for (let i = paddedHex.length - 2; i >= 0; i -= 2) {
              const byte = parseInt(paddedHex.substr(i, 2), 16);
              if (byte !== 0 && byte >= 32 && byte <= 126) {
                decoded = String.fromCharCode(byte) + decoded;
              }
            }
            if (decoded.length > 0) {
              tokenSymbol = decoded;
              console.log(`Successfully decoded symbol (reversed): ${decoded}`);
            }
          }
        } catch (error) {
          console.error('Error decoding symbol:', error);
          tokenSymbol = "LORDS"; // Known symbol for this contract
          console.log(`Using fallback symbol: ${tokenSymbol}`);
        }
      } else if (typeof symbolResult === 'string') {
        tokenSymbol = symbolResult;
      }

      console.log(`Final token symbol: ${tokenSymbol}`);
    } catch (error) {
      console.warn('Could not fetch token symbol:', error);
      // For LORDS token, use known symbol
      if (contractAddress.toLowerCase().includes('124aeb495b947201f5fac96fd1138e326ad86195b98df6dec9009158a533b49')) {
        tokenSymbol = "LORDS";
        console.log('Using known LORDS symbol for this contract');
      } else {
        tokenSymbol = "TOKEN";
      }
    }

    onProgress?.(3, totalSteps, "Processing transaction data...");

    // Fetch transfer events (simplified approach)
    // In a real implementation, you would need to:
    // 1. Query events from the contract
    // 2. Filter for Transfer events where 'from' matches the wallet
    // 3. Process the events to extract recipient data

    // Use real data if enabled (free RPC endpoints don't need API keys)
    const isDemo = process.env.NEXT_PUBLIC_STARKNET_ENABLED !== "enabled";

    if (isDemo) {
      onProgress?.(4, totalSteps, "Using demo data...");
      onProgress?.(5, totalSteps, "Finalizing recipient analysis...");

      return {
        recipients: getMockStarknetRecipients(),
        totalTransfers: 3,
        tokenSymbol,
        isDemo: true,
        error: "No Starknet API key configured. Showing demo data."
      };
    }

    onProgress?.(4, totalSteps, "Fetching Transfer events from Starknet...");

    // Fetch Transfer events from the contract
    try {
      const provider = getStarknetProvider();
      const currentBlock = await provider.getBlock('latest');
      const transferEventHash = getTransferEventHash();

      // Calculate block range (last 10000 blocks or from block 1, whichever is higher)
      const fromBlock = Math.max(1, currentBlock.block_number - 10000);

      console.log(`Fetching Transfer events from block ${fromBlock} to ${currentBlock.block_number}`);

      onProgress?.(4, totalSteps, `Querying events from blocks ${fromBlock} to ${currentBlock.block_number}...`);

      // Fetch Transfer events with pagination support
      let allEvents: StarknetEvent[] = [];
      let continuationToken: string | undefined;
      let pageCount = 0;
      const maxPages = 50; // Increase limit to capture more historical data

      do {
        const eventsResponse = await provider.getEvents({
          address: validateAndParseAddress(contractAddress),
          from_block: { block_number: fromBlock },
          to_block: { block_number: currentBlock.block_number },
          keys: [[transferEventHash]], // Filter for Transfer events only
          chunk_size: 100,
          continuation_token: continuationToken
        });

        allEvents = allEvents.concat(eventsResponse.events);
        continuationToken = eventsResponse.continuation_token;
        pageCount++;

        if (pageCount % 2 === 0) {
          onProgress?.(4, totalSteps, `Fetched ${allEvents.length} events (page ${pageCount})...`);
        }

        // Add small delay to avoid rate limiting
        if (continuationToken) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

      } while (continuationToken && pageCount < maxPages);

      console.log(`Found ${allEvents.length} Transfer events across ${pageCount} pages`);

      // Check if we have the specific transaction we're looking for
      const expectedTxHash = "0x646cf43482f4a6ca4fb0350ef1218b453e191a87c2c7488ba2e30f563e82989";
      const hasExpectedTx = allEvents.some(event => event.transaction_hash === expectedTxHash);
      console.log(`Contains expected transaction ${expectedTxHash}:`, hasExpectedTx);

      onProgress?.(4, totalSteps, `Processing ${allEvents.length} Transfer events...`);

      // Parse events and filter for outgoing transfers from the wallet
      const outgoingTransfers: Array<{
        to: string;
        value: string;
        blockNumber: number;
        transactionHash: string;
      }> = [];

      const normalizedWalletAddress = validateAndParseAddress(walletAddress);
      console.log(`Looking for transfers from normalized address: ${normalizedWalletAddress}`);

      for (const event of allEvents) {
        const parsed = parseTransferEvent(event);
        if (parsed) {
          console.log(`Transfer event: from=${parsed.from}, to=${parsed.to}, value=${parsed.value}`);

          // Try multiple comparison methods for robustness
          const normalizedFromAddress = validateAndParseAddress(parsed.from);
          const isMatch = normalizedFromAddress === normalizedWalletAddress ||
                         normalizedFromAddress.toLowerCase() === normalizedWalletAddress.toLowerCase() ||
                         parsed.from === walletAddress ||
                         parsed.from.toLowerCase() === walletAddress.toLowerCase();

          if (isMatch) {
            console.log(`✅ Found matching outgoing transfer: ${parsed.transactionHash}`);
            outgoingTransfers.push({
              to: parsed.to,
              value: parsed.value,
              blockNumber: parsed.blockNumber,
              transactionHash: parsed.transactionHash
            });
          }
        }
      }

      console.log(`Found ${outgoingTransfers.length} outgoing transfers from ${walletAddress}`);

      onProgress?.(5, totalSteps, "Analyzing recipients and fetching current balances...");

      // Group transfers by recipient and calculate analytics
      const recipientMap = new Map<string, {
        totalReceived: bigint;
        transferCount: number;
        lastBlockNumber: number;
      }>();

      for (const transfer of outgoingTransfers) {
        const recipient = transfer.to;
        const value = BigInt(transfer.value);
        const existing = recipientMap.get(recipient);

        if (existing) {
          existing.totalReceived += value;
          existing.transferCount += 1;
          existing.lastBlockNumber = Math.max(existing.lastBlockNumber, transfer.blockNumber);
        } else {
          recipientMap.set(recipient, {
            totalReceived: value,
            transferCount: 1,
            lastBlockNumber: transfer.blockNumber
          });
        }
      }

      // Get current balances for recipients
      const recipients: StarknetRecipientAnalysis[] = [];

      console.log(`Processing ${recipientMap.size} unique recipients:`);
      for (const [address, data] of recipientMap.entries()) {
        console.log(`Recipient: ${address}, totalReceived: ${data.totalReceived.toString()}, transferCount: ${data.transferCount}`);

        try {
          const currentBalance = await getStarknetTokenBalance(address, contractAddress);
          console.log(`Balance query for ${address}:`);
          console.log(`  - Raw balance: ${currentBalance}`);
          console.log(`  - Formatted balance: ${formatTokenValue(currentBalance, "18")} LORDS`);

          // Get actual timestamp from the block
          let lastTransferTime = data.lastBlockNumber.toString();
          try {
            const blockDetails = await provider.getBlock(data.lastBlockNumber);
            if (blockDetails.timestamp) {
              lastTransferTime = blockDetails.timestamp.toString();
            }
          } catch (blockError) {
            console.warn(`Could not get timestamp for block ${data.lastBlockNumber}, using block number`);
          }

          const recipientData = {
            address,
            totalReceived: data.totalReceived.toString(),
            currentBalance,
            transferCount: data.transferCount,
            lastTransferTime
          };
          console.log(`✅ Created recipient data:`, recipientData);
          recipients.push(recipientData);
        } catch (balanceError) {
          console.error(`Failed to get balance for ${address}:`, balanceError);

          // Get actual timestamp from the block
          let lastTransferTime = data.lastBlockNumber.toString();
          try {
            const blockDetails = await provider.getBlock(data.lastBlockNumber);
            if (blockDetails.timestamp) {
              lastTransferTime = blockDetails.timestamp.toString();
            }
          } catch (blockError) {
            console.warn(`Could not get timestamp for block ${data.lastBlockNumber}, using block number`);
          }

          recipients.push({
            address,
            totalReceived: data.totalReceived.toString(),
            currentBalance: "0",
            transferCount: data.transferCount,
            lastTransferTime
          });
        }
      }

      console.log(`Final recipients array:`, recipients);

      // Sort by total received (descending)
      recipients.sort((a, b) => {
        const aTotal = BigInt(a.totalReceived);
        const bTotal = BigInt(b.totalReceived);
        return aTotal > bTotal ? -1 : aTotal < bTotal ? 1 : 0;
      });

      const result = {
        recipients,
        totalTransfers: outgoingTransfers.length,
        tokenSymbol,
        isDemo: false
      };

      console.log("✅ Returning REAL Starknet data:", result);
      return result;

    } catch (eventError) {
      console.error("Error fetching Transfer events:", eventError);
      console.error("Event error details:", {
        error: eventError,
        message: eventError instanceof Error ? eventError.message : 'Unknown error',
        stack: eventError instanceof Error ? eventError.stack : undefined,
        contractAddress,
        walletAddress
      });

      onProgress?.(5, totalSteps, "Event querying failed - using demo data...");

      return {
        recipients: getMockStarknetRecipients(),
        totalTransfers: 3,
        tokenSymbol,
        isDemo: true,
        error: `Failed to fetch Transfer events: ${eventError instanceof Error ? eventError.message : 'Unknown error'}`
      };
    }

  } catch (error) {
    console.error("Error fetching Starknet recipients:", error);

    // If there's an error with real addresses, fall back to demo
    if (error instanceof Error && error.message.includes("address")) {
      return {
        recipients: getMockStarknetRecipients(),
        totalTransfers: 3,
        tokenSymbol: "STRK",
        isDemo: true,
        error: "Invalid Starknet address format. Showing demo data."
      };
    }

    return {
      recipients: [],
      totalTransfers: 0,
      tokenSymbol: "STRK",
      isDemo: false,
      error: `Failed to fetch Starknet recipients: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

async function getStarknetTokenBalance(walletAddress: string, contractAddress: string): Promise<string> {
  try {
    const validatedWallet = validateAndParseAddress(walletAddress);
    const validatedContract = validateAndParseAddress(contractAddress);

    const provider = getStarknetProvider();
    const contract = new Contract(ERC20_ABI, validatedContract, provider);

    // Call balanceOf function
    const result = await contract.balanceOf(validatedWallet);
    console.log(`Raw balanceOf result for ${walletAddress}:`, result);
    console.log(`Result type:`, typeof result);

    // Convert result to string
    // Handle different Starknet return formats
    if (result && typeof result === 'object' && 'balance' in result) {
      // Handle {balance: bigint} format
      console.log(`Balance object format: ${result.balance.toString()}`);
      return result.balance.toString();
    } else if (result && typeof result === 'object' && 'low' in result && 'high' in result) {
      // Handle Uint256 structure: { low: bigint, high: bigint }
      const balance = BigInt(result.low) + (BigInt(result.high) << BigInt(128));
      console.log(`Uint256 balance calculation: low=${result.low}, high=${result.high}, final=${balance.toString()}`);
      return balance.toString();
    } else if (typeof result === 'bigint') {
      console.log(`Direct bigint balance: ${result.toString()}`);
      return result.toString();
    } else if (Array.isArray(result) && result.length > 0) {
      // Some contracts return array format
      return BigInt(result[0]).toString();
    }

    return "0";
  } catch (error) {
    console.error("Error fetching Starknet token balance:", error);
    return "0";
  }
}

// Export balance function for external use
export async function getStarknetBalance(walletAddress: string, contractAddress: string): Promise<string> {
  return getStarknetTokenBalance(walletAddress, contractAddress);
}

// Mock data for demonstration
function getMockStarknetRecipients(): StarknetRecipientAnalysis[] {
  return [
    {
      address: "0x1234567890abcdef1234567890abcdef12345678901234567890abcdef1234567",
      totalReceived: "5000000000000000000000", // 5000 tokens
      currentBalance: "4500000000000000000000", // 4500 tokens
      transferCount: 2,
      lastTransferTime: "1640995500"
    },
    {
      address: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab",
      totalReceived: "2500000000000000000000", // 2500 tokens
      currentBalance: "2500000000000000000000", // 2500 tokens
      transferCount: 1,
      lastTransferTime: "1640995400"
    },
    {
      address: "0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456",
      totalReceived: "1000000000000000000000", // 1000 tokens
      currentBalance: "800000000000000000000", // 800 tokens
      transferCount: 1,
      lastTransferTime: "1640995300"
    }
  ];
}

export function validateStarknetAddress(address: string): boolean {
  try {
    validateAndParseAddress(address);
    return true;
  } catch {
    return false;
  }
}

export function formatStarknetAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatStarknetTimestamp(timestamp: string): string {
  const date = new Date(parseInt(timestamp) * 1000);
  return date.toLocaleString();
}

export function formatStarknetTokenValue(value: string, decimals: string = "18"): string {
  const tokenValue = parseFloat(value) / Math.pow(10, parseInt(decimals));
  return tokenValue.toFixed(4);
}