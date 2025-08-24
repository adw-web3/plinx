"use client";

import { NiebieskaKarta } from "@/devlink";
import { Cta } from "@/devlink/Cta";
import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import { useMemo } from "react";

export default function WalletConnect() {
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { address, status } = useAccount();

  const isConnected = useMemo(() => status === "connected", [status]);

  const connectWallet = () => {
    if (isConnected) {
      disconnect();
    } else {
      // In a real app, you might want to present a modal for connector selection.
      // For this example, we'll just use the first available connector.
      if (connectors.length > 0) {
        connect({ connector: connectors[0] });
      } else {
        console.error("No StarkNet connectors found.");
      }
    }
  };

  const truncatedAddress = useMemo(() => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, [address]);

  return (
    <>
      <div onClick={connectWallet} style={{ cursor: 'pointer' }}>
        <Cta
          ctaText={isConnected ? "Disconnect" : "Connect Wallet"}
        />
      </div>
      {isConnected && (
        <NiebieskaKarta
          niebieskaKartaText={`Address: ${truncatedAddress}`}
        />
      )}
    </>
  );
}
