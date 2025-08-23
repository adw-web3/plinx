"use client";

import { mainnet } from "@starknet-react/chains";
import {
  StarknetConfig,
  publicProvider,
} from "@starknet-react/core";
import {
  useInjectedConnectors,
  ready,
  braavos,
} from "@starknet-react/core";

interface StarknetProviderProps {
  children: React.ReactNode;
}

export function StarknetProvider({ children }: StarknetProviderProps) {
  const { connectors } = useInjectedConnectors({
    recommended: [ready(), braavos()],
    includeRecommended: "onlyIfNoConnectors",
    order: "random",
  });

  return (
    <StarknetConfig
      chains={[mainnet]}
      provider={publicProvider()}
      connectors={connectors}
      autoConnect
    >
      {children}
    </StarknetConfig>
  );
}
