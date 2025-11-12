import { RecipientAnalysis, getDayvidendeRecipients } from "./bsc-api";
import { StarknetRecipientAnalysis, getStarknetTokenTransfers } from "./starknet-api";
import { getMoonbeamTokenTransfers } from "./moonbeam-api";
import { Blockchain } from "@/components/BlockchainSelector";

export type UnifiedRecipientAnalysis = RecipientAnalysis | StarknetRecipientAnalysis;

export interface BlockchainApiResult {
  recipients: UnifiedRecipientAnalysis[];
  totalTransfers: number;
  tokenSymbol: string;
  isDemo: boolean;
  walletBalance?: string; // Current token balance of the analyzed wallet
  error?: string;
}

export async function getTokenRecipients(
  blockchain: Blockchain,
  walletAddress: string,
  contractAddress: string,
  onProgress?: (step: number, totalSteps: number, message: string) => void,
  onPartialResults?: (partialRecipients: UnifiedRecipientAnalysis[], totalTransfers: number, tokenSymbol: string, walletBalance?: string) => void
): Promise<BlockchainApiResult> {
  switch (blockchain.id) {
    case "bsc":
      return await getDayvidendeRecipients(walletAddress, contractAddress, onProgress, onPartialResults);

    case "moonbeam":
      return await getMoonbeamTokenTransfers(walletAddress, contractAddress, onProgress, onPartialResults);

    case "starknet":
      return await getStarknetTokenTransfers(walletAddress, contractAddress, onProgress, onPartialResults);

    default:
      return {
        recipients: [],
        totalTransfers: 0,
        tokenSymbol: "TOKEN",
        isDemo: false,
        error: `Blockchain ${blockchain.name} not supported yet`
      };
  }
}

export function getBlockchainExplorerUrl(blockchain: Blockchain, address: string): string {
  switch (blockchain.id) {
    case "bsc":
    case "moonbeam":
      return `${blockchain.explorerUrl}/address/${address}`;
    case "starknet":
      return `${blockchain.explorerUrl}/contract/${address}`;
    default:
      return "#";
  }
}

export function getBlockchainTransactionUrl(blockchain: Blockchain, txHash: string): string {
  switch (blockchain.id) {
    case "bsc":
    case "moonbeam":
      return `${blockchain.explorerUrl}/tx/${txHash}`;
    case "starknet":
      return `${blockchain.explorerUrl}/tx/${txHash}`;
    default:
      return "#";
  }
}

export function getBlockchainTokenUrl(blockchain: Blockchain, contractAddress: string): string {
  switch (blockchain.id) {
    case "bsc":
    case "moonbeam":
      return `${blockchain.explorerUrl}/token/${contractAddress}`;
    case "starknet":
      return `${blockchain.explorerUrl}/contract/${contractAddress}`;
    default:
      return "#";
  }
}

export function getDefaultContractAddress(blockchain: Blockchain): string {
  switch (blockchain.id) {
    case "bsc":
      return "0xfF1E54d02B5d0576E7BEfD03602E36d5720D1997"; // Default token contract
    case "moonbeam":
      return "0x0000000000000000000000000000000000000802"; // Native GLMR precompile
    case "starknet":
      return "0x01B3028E81e0604fD34EB439b610bd9a405c02C90Ae8569e47477B2E3d965b82"; // Custom token contract
    default:
      return "";
  }
}

export function getDefaultWalletAddress(blockchain: Blockchain): string {
  switch (blockchain.id) {
    case "starknet":
      return "0x5a7a86d6113c8860f90f96ea1c8e70a747333feabb40b0584c3936fa6f86717"; // Example Starknet wallet
    default:
      return "";
  }
}