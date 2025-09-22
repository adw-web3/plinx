import { RecipientAnalysis, getDayvidendeRecipients } from "./bsc-api";
import { StarknetRecipientAnalysis, getStarknetTokenTransfers } from "./starknet-api";
import { Blockchain } from "@/components/BlockchainSelector";

export type UnifiedRecipientAnalysis = RecipientAnalysis | StarknetRecipientAnalysis;

export interface BlockchainApiResult {
  recipients: UnifiedRecipientAnalysis[];
  totalTransfers: number;
  tokenSymbol: string;
  isDemo: boolean;
  error?: string;
}

export async function getTokenRecipients(
  blockchain: Blockchain,
  walletAddress: string,
  contractAddress: string,
  onProgress?: (step: number, totalSteps: number, message: string) => void,
  onPartialResults?: (partialRecipients: UnifiedRecipientAnalysis[], totalTransfers: number, tokenSymbol: string) => void
): Promise<BlockchainApiResult> {
  switch (blockchain.id) {
    case "bsc":
      return await getDayvidendeRecipients(walletAddress, contractAddress, onProgress, onPartialResults);

    case "starknet":
      return await getStarknetTokenTransfers(walletAddress, contractAddress, onProgress);

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
    case "starknet":
      return "0x0124aeb495b947201f5faC96fD1138E326AD86195B98df6DEc9009158A533B49"; // LORDS token
    default:
      return "";
  }
}