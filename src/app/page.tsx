"use client";

import { StarknetProvider } from "./components/StarknetProvider";
import { Cta } from "@/devlink";
import { NiebieskaKarta } from "@/devlink";
import { useAccount, useDisconnect } from "@starknet-react/core";
import { useMemo } from "react";

function DisconnectButton() {
  const { address, status } = useAccount();
  const { disconnect } = useDisconnect();

  if (status !== 'connected') {
    return null;
  }

  const shortAddress = useMemo(() => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, [address]);


  return (
    <div style={{ position: 'absolute', top: '20px', right: '20px', color: 'white' }}>
      <span>{shortAddress}</span>
      <button onClick={() => disconnect()} style={{ marginLeft: '10px' }}>
        Disconnect
      </button>
    </div>
  );
}


export default function Home() {
  return (
    <StarknetProvider>
      <div className="flex items-center justify-center min-h-screen">
        <Cta ctaText="Connect Wallet" />
        <NiebieskaKarta />
        <DisconnectButton />
      </div>
    </StarknetProvider>
  );
}
