import { RpcProvider, Contract, validateAndParseAddress, hash, num, constants } from "starknet";
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

// Alchemy Starknet RPC configuration
// The RPC URL is now set via environment variable NEXT_PUBLIC_STARKNET_RPC_URL
// Default fallback to Alchemy if no environment variable is set
const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_STARKNET_API_KEY || "";
const ALCHEMY_STARKNET_RPC_URL = ALCHEMY_API_KEY
  ? `https://starknet-mainnet.g.alchemy.com/starknet/version/rpc/v0_7/${ALCHEMY_API_KEY}`
  : "";

// Starknet RPC configuration - prioritize environment variable
const STARKNET_RPC_URL = process.env.NEXT_PUBLIC_STARKNET_RPC_URL || ALCHEMY_STARKNET_RPC_URL;

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
      nodeUrl: STARKNET_RPC_URL,
      chainId: constants.StarknetChainId.SN_MAIN
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

// STRK token contract address (native token)
const STRK_TOKEN_ADDRESS = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";

// Check if this is the STRK native token
function isSTRKToken(contractAddress: string): boolean {
  try {
    const normalized = validateAndParseAddress(contractAddress);
    const strkNormalized = validateAndParseAddress(STRK_TOKEN_ADDRESS);
    return normalized === strkNormalized;
  } catch {
    return false;
  }
}

// Get STRK transfers for a specific wallet using Voyager API
async function getSTRKTransfersForWallet(
  walletAddress: string,
  contractAddress: string,
  onProgress?: (step: number, totalSteps: number, message: string) => void,
  onPartialResults?: (partialRecipients: StarknetRecipientAnalysis[], totalTransfers: number, tokenSymbol: string) => void
): Promise<{
  recipients: StarknetRecipientAnalysis[];
  totalTransfers: number;
  tokenSymbol: string;
  isDemo: boolean;
  error?: string;
}> {
  const totalSteps = 5;

  onProgress?.(2, totalSteps, "Fetching STRK transfers from Voyager API...");

  try {
    console.log("Using optimized STRK search: scanning blocks for wallet-specific transfers");

    const provider = getStarknetProvider();

    onProgress?.(3, totalSteps, "Analyzing wallet transaction history...");

    // Normalize the wallet address once at the beginning
    const normalizedWalletAddress = validateAndParseAddress(walletAddress);
    console.log(`Normalized wallet address: ${normalizedWalletAddress}`);

    // Since Voyager/Starkscan APIs might be rate-limited or require auth,
    // let's use a hybrid approach: get recent blocks and filter for our wallet's transactions
    const currentBlock = await provider.getBlock('latest');
    const BLOCKS_TO_SEARCH = 20000; // ~7 days at 2 blocks/min

    console.log(`Current block number: ${currentBlock.block_number}`);
    console.log(`Current block hash: ${currentBlock.block_hash}`);
    console.log(`Searching last ${BLOCKS_TO_SEARCH} blocks for wallet activity`);

    const outgoingTransfers: Array<{
      to: string;
      value: string;
      blockNumber: number;
      transactionHash: string;
    }> = [];

    // Strategy: Get Transfer events from STRK contract and filter by from=wallet
    // But search in smaller chunks and process immediately
    const CHUNK_SIZE = 100; // Very small chunks
    const MAX_CHUNKS = 200; // 200 chunks × 100 blocks = 20,000 blocks

    const transferEventHash = getTransferEventHash();
    const validatedContract = validateAndParseAddress(contractAddress);

    // Track when we last sent partial results
    let lastUpdateTransferCount = 0;
    let lastUpdateTime = Date.now();

    for (let i = 0; i < MAX_CHUNKS; i++) {
      const toBlock = currentBlock.block_number - (i * CHUNK_SIZE);
      const fromBlock = Math.max(1, toBlock - CHUNK_SIZE);

      if (i % 20 === 0) {
        const progress = ((i / MAX_CHUNKS) * 100).toFixed(0);
        console.log(`Progress: ${progress}% (${i * CHUNK_SIZE} blocks searched, ${outgoingTransfers.length} transfers found)`);
        onProgress?.(3, totalSteps, `Scanned ${i * CHUNK_SIZE} blocks, found ${outgoingTransfers.length} transfers...`);
      }

      try {
        // Get events for this block range with pagination
        let continuationToken;
        let pageCount = 0;

        do {
          const eventsResponse = await provider.getEvents({
            address: validatedContract,
            from_block: { block_number: fromBlock },
            to_block: { block_number: toBlock },
            keys: [[transferEventHash]],
            chunk_size: 100,
            continuation_token: continuationToken
          });

          // Process events to find wallet matches
          for (const event of eventsResponse.events) {
            const parsed = parseTransferEvent(event);
            if (parsed) {
              try {
                const normalizedFromAddress = validateAndParseAddress(parsed.from);
                if (normalizedFromAddress === normalizedWalletAddress) {
                  outgoingTransfers.push({
                    to: parsed.to,
                    value: parsed.value,
                    blockNumber: parsed.blockNumber,
                    transactionHash: parsed.transactionHash
                  });
                }
              } catch {
                // Skip invalid addresses
              }
            }
          }

          continuationToken = eventsResponse.continuation_token;
          pageCount++;

          // Rate limiting between pages
          if (continuationToken) {
            await new Promise(resolve => setTimeout(resolve, 50));
          }

        } while (continuationToken && pageCount < 20); // Max 20 pages per chunk to avoid getting stuck

        // Send live updates if we found new transfers and enough time has passed
        const now = Date.now();
        const hasNewTransfers = outgoingTransfers.length > lastUpdateTransferCount;
        const timeSinceLastUpdate = now - lastUpdateTime;

        if (hasNewTransfers && (timeSinceLastUpdate > 500 || outgoingTransfers.length - lastUpdateTransferCount >= 10)) {
          lastUpdateTransferCount = outgoingTransfers.length;
          lastUpdateTime = now;

          // Generate quick recipient summary for live updates
          const quickRecipientMap = new Map<string, { totalReceived: bigint; transferCount: number }>();
          for (const transfer of outgoingTransfers) {
            const existing = quickRecipientMap.get(transfer.to);
            const value = BigInt(transfer.value);
            if (existing) {
              existing.totalReceived += value;
              existing.transferCount += 1;
            } else {
              quickRecipientMap.set(transfer.to, { totalReceived: value, transferCount: 1 });
            }
          }

          // Create partial recipient list (without fetching balances yet)
          const partialRecipients: StarknetRecipientAnalysis[] = Array.from(quickRecipientMap.entries()).map(([address, data]) => ({
            address,
            totalReceived: data.totalReceived.toString(),
            currentBalance: "0", // Will be fetched at the end
            transferCount: data.transferCount,
            lastTransferTime: "0"
          }));

          // Sort by total received
          partialRecipients.sort((a, b) => {
            const aTotal = BigInt(a.totalReceived);
            const bTotal = BigInt(b.totalReceived);
            return aTotal > bTotal ? -1 : aTotal < bTotal ? 1 : 0;
          });

          // Send live update
          onPartialResults?.(partialRecipients, outgoingTransfers.length, "STRK");
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 50));

      } catch (error) {
        console.warn(`Failed to fetch events for blocks ${fromBlock}-${toBlock}:`, error);
        // Continue with next chunk
      }

      if (fromBlock === 1) break;
    }

    console.log(`\n=== STRK Search Complete ===`);
    console.log(`Found ${outgoingTransfers.length} STRK transfers from ${walletAddress}`);

    if (outgoingTransfers.length === 0) {
      return {
        recipients: [],
        totalTransfers: 0,
        tokenSymbol: "STRK",
        isDemo: false,
        error: `No STRK transfers found for this wallet in the last ${BLOCKS_TO_SEARCH} blocks (~7 days).`
      };
    }

    onProgress?.(4, totalSteps, "Analyzing recipients and fetching balances...");

    // Group by recipient
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

    // Get balances with progress updates
    const recipients: StarknetRecipientAnalysis[] = [];
    const totalRecipients = recipientMap.size;
    let processedRecipients = 0;

    console.log(`Fetching balances for ${totalRecipients} recipients...`);

    for (const [address, data] of recipientMap.entries()) {
      processedRecipients++;

      // Update progress during balance fetching
      const progressPercent = ((processedRecipients / totalRecipients) * 100).toFixed(0);
      onProgress?.(4, totalSteps, `Fetching balances: ${processedRecipients}/${totalRecipients} (${progressPercent}%)...`);

      try {
        const currentBalance = await getStarknetTokenBalance(address, contractAddress);

        let lastTransferTime = data.lastBlockNumber.toString();
        try {
          const blockDetails = await provider.getBlock(data.lastBlockNumber);
          if (blockDetails.timestamp) {
            lastTransferTime = blockDetails.timestamp.toString();
          }
        } catch {
          // Use block number
        }

        recipients.push({
          address,
          totalReceived: data.totalReceived.toString(),
          currentBalance,
          transferCount: data.transferCount,
          lastTransferTime
        });
      } catch (balanceError) {
        console.error(`Failed to get balance for ${address}:`, balanceError);
        recipients.push({
          address,
          totalReceived: data.totalReceived.toString(),
          currentBalance: "0",
          transferCount: data.transferCount,
          lastTransferTime: data.lastBlockNumber.toString()
        });
      }
    }

    // Sort by total received
    recipients.sort((a, b) => {
      const aTotal = BigInt(a.totalReceived);
      const bTotal = BigInt(b.totalReceived);
      return aTotal > bTotal ? -1 : aTotal < bTotal ? 1 : 0;
    });

    onProgress?.(5, totalSteps, "Complete!");

    return {
      recipients,
      totalTransfers: outgoingTransfers.length,
      tokenSymbol: "STRK",
      isDemo: false
    };

  } catch (error) {
    console.error("Error fetching STRK transfers:", error);
    return {
      recipients: [],
      totalTransfers: 0,
      tokenSymbol: "STRK",
      isDemo: false,
      error: `Failed to fetch STRK transfers: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

export async function getStarknetTokenTransfers(
  walletAddress: string,
  contractAddress: string,
  onProgress?: (step: number, totalSteps: number, message: string) => void,
  onPartialResults?: (partialRecipients: StarknetRecipientAnalysis[], totalTransfers: number, tokenSymbol: string) => void
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
    const validatedWallet = validateAndParseAddress(walletAddress);
    const validatedContract = validateAndParseAddress(contractAddress);

    console.log(`Processing Starknet wallet: ${walletAddress} (normalized: ${validatedWallet})`);
    console.log(`Processing Starknet contract: ${contractAddress} (normalized: ${validatedContract})`);

    // For STRK token, use the wallet-centric API approach
    if (isSTRKToken(contractAddress)) {
      console.log("Detected STRK token - using wallet-centric query method");
      return await getSTRKTransfersForWallet(validatedWallet, validatedContract, onProgress, onPartialResults);
    }

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

      console.log(`Current block number: ${currentBlock.block_number}`);
      console.log(`Current block hash: ${currentBlock.block_hash}`);

      // Strategy for very active tokens (like STRK):
      // Use a two-phase approach:
      // 1. Quick scan of recent blocks with limited event collection per chunk
      // 2. Process events in real-time to find wallet matches early

      // Starknet produces ~2 blocks/minute = ~2,880 blocks/day
      // We'll search 50,000 blocks (~17 days) to ensure good coverage
      const BLOCKS_PER_CHUNK = 500; // Small chunks for fine-grained progress
      const MAX_BLOCKS_TO_SEARCH = 50000; // ~17 days of history
      const MAX_EVENTS_PER_CHUNK = 1000; // Limit events per chunk to avoid memory issues

      console.log(`Searching last ${MAX_BLOCKS_TO_SEARCH} blocks (~17 days) for Transfer events`);

      onProgress?.(4, totalSteps, `Scanning recent blocks for transfers...`);

      // Store matching transfers as we find them (don't wait until the end)
      const outgoingTransfers: Array<{
        to: string;
        value: string;
        blockNumber: number;
        transactionHash: string;
      }> = [];

      const normalizedWalletAddress = validateAndParseAddress(walletAddress);
      console.log(`Looking for transfers from: ${normalizedWalletAddress}`);

      let searchedBlocks = 0;
      let chunkNumber = 0;
      let totalEvents = 0;

      // Search in reverse chronological order (newest first)
      while (searchedBlocks < MAX_BLOCKS_TO_SEARCH) {
        chunkNumber++;
        const toBlock = currentBlock.block_number - searchedBlocks;
        const fromBlock = Math.max(1, toBlock - BLOCKS_PER_CHUNK);
        searchedBlocks += (toBlock - fromBlock);

        if (chunkNumber % 10 === 0) {
          console.log(`Chunk ${chunkNumber}: Blocks ${fromBlock}-${toBlock} (${searchedBlocks}/${MAX_BLOCKS_TO_SEARCH} searched, ${outgoingTransfers.length} transfers found)`);
          onProgress?.(4, totalSteps, `Scanned ${searchedBlocks.toLocaleString()} blocks, found ${outgoingTransfers.length} transfers...`);
        }

        let continuationToken: string | undefined;
        let pageCount = 0;
        let chunkEvents = 0;

        // Fetch events for this chunk
        do {
          const eventsResponse = await provider.getEvents({
            address: validateAndParseAddress(contractAddress),
            from_block: { block_number: fromBlock },
            to_block: { block_number: toBlock },
            keys: [[transferEventHash]],
            chunk_size: 100,
            continuation_token: continuationToken
          });

          // Process events immediately to find matches
          for (const event of eventsResponse.events) {
            const parsed = parseTransferEvent(event);
            if (parsed) {
              try {
                const normalizedFromAddress = validateAndParseAddress(parsed.from);
                if (normalizedFromAddress === normalizedWalletAddress) {
                  outgoingTransfers.push({
                    to: parsed.to,
                    value: parsed.value,
                    blockNumber: parsed.blockNumber,
                    transactionHash: parsed.transactionHash
                  });

                  // Log first few matches for debugging
                  if (outgoingTransfers.length <= 3) {
                    console.log(`✅ Match #${outgoingTransfers.length}: Block ${parsed.blockNumber}, TX ${parsed.transactionHash.slice(0, 10)}...`);
                  }
                }
              } catch {
                // Skip invalid addresses
              }
            }
          }

          chunkEvents += eventsResponse.events.length;
          totalEvents += eventsResponse.events.length;
          continuationToken = eventsResponse.continuation_token;
          pageCount++;

          // Rate limiting
          if (continuationToken) {
            await new Promise(resolve => setTimeout(resolve, 20));
          }

          // Stop fetching more events for this chunk if we've collected enough
          // This prevents getting stuck on very dense chunks
          if (chunkEvents >= MAX_EVENTS_PER_CHUNK) {
            console.log(`  Chunk ${chunkNumber}: Hit ${MAX_EVENTS_PER_CHUNK} event limit, moving to next chunk`);
            break;
          }

        } while (continuationToken && pageCount < 10);

        // Break if we've reached the beginning of the chain
        if (fromBlock === 1) break;
      }

      console.log(`\n=== Search Complete ===`);
      console.log(`Searched ${searchedBlocks.toLocaleString()} blocks (${(searchedBlocks / 2880 * 24).toFixed(1)} hours)`);
      console.log(`Processed ${totalEvents.toLocaleString()} total Transfer events`);
      console.log(`Found ${outgoingTransfers.length} outgoing transfers from ${walletAddress}`);

      if (outgoingTransfers.length === 0) {
        console.warn(`❌ No outgoing transfers found for wallet ${walletAddress}`);
        console.warn(`This could mean:`);
        console.warn(`  - The wallet has never sent tokens of this type`);
        console.warn(`  - The transfers are outside our block range (last 50,000 blocks)`);
        console.warn(`  - The wallet address or contract address is incorrect`);
        console.warn(`  - The wallet uses a different transfer pattern`);

        return {
          recipients: [],
          totalTransfers: 0,
          tokenSymbol,
          isDemo: false,
          error: `No outgoing transfers found for this wallet. The wallet may be inactive, have no transfers of this token type, or transfers may be outside the searched block range (last 50,000 blocks).`
        };
      }

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

      // Get current balances for recipients with progress tracking
      const recipients: StarknetRecipientAnalysis[] = [];
      const totalRecipients = recipientMap.size;
      let processedRecipients = 0;

      console.log(`Processing ${totalRecipients} unique recipients:`);
      for (const [address, data] of recipientMap.entries()) {
        processedRecipients++;

        // Update progress during balance fetching
        const progressPercent = ((processedRecipients / totalRecipients) * 100).toFixed(0);
        onProgress?.(5, totalSteps, `Fetching balances: ${processedRecipients}/${totalRecipients} (${progressPercent}%)...`);

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
          } catch {
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
          } catch {
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