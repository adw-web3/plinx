"use client";
import { StarknetConfig, publicProvider } from "@starknet-react/core";
import { sepolia, mainnet } from "@starknet-react/chains";
import { braavos, ready } from "@starknet-react/core";

interface StarknetProviderProps {
    children: React.ReactNode;
}

export function StarknetProvider({ children }: StarknetProviderProps) {
    const connectors = [
        ready(),
        braavos(),
    ];

    return (
        <StarknetConfig
            chains={[mainnet, sepolia]}
            provider={publicProvider()}
            connectors={connectors}
            autoConnect
        >
            {children}
        </StarknetConfig>
    );
}
