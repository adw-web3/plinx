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
  onProgress?: (step: number, totalSteps: number, message: string) => void
): Promise<BlockchainApiResult> {
  switch (blockchain.id) {
    case "bsc":
      return await getDayvidendeRecipients(walletAddress, contractAddress, onProgress);

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

export function getDefaultContractAddress(blockchain: Blockchain): string {
  switch (blockchain.id) {
    case "bsc":
      return "0xfF1E54d02B5d0576E7BEfD03602E36d5720D1997"; // DAYVIDENDE
    case "starknet":
      return "0x0124aeb495b947201f5fac96fd1138e326ad86195b98df6dec9009158a533b49"; // LORDS token
    default:
      return "";
  }
}