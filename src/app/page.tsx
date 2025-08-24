"use client";

import { useEffect, useState } from "react";
import { NiebieskaKarta } from "@/devlink/NiebieskaKarta";
import { Cta } from "@/devlink/Cta";

export default function Home() {
  const [provider, setProvider] = useState<any>();
  const [balance, setBalance] = useState<string>("");

  useEffect(() => {
    async function initProvider() {
      const { Provider, constants } = await import("starknet");
      const prov = new Provider({
        nodeUrl: constants.RPC_DEFAULT_NODES.SN_MAIN[0],
      });
      setProvider(prov);
    }
    void initProvider();
  }, []);

  async function connectWallet() {
    const { starknet } = window as unknown as { starknet?: any };
    if (!starknet) {
      console.error("No Starknet wallet extension detected");
      return;
    }
    try {
      await starknet.enable();
      const address = starknet.selectedAddress;
      if (provider) {
        try {
          const { ETH_ADDRESS, uint256 } = await import("starknet");
          const { result } = await provider.callContract({
            contractAddress: ETH_ADDRESS,
            entrypoint: "balanceOf",
            calldata: [address],
          });
          const balanceBn = uint256.uint256ToBN({
            low: result[0],
            high: result[1],
          });
          setBalance(balanceBn.toString());
        } catch (balanceError) {
          console.error("Failed to fetch balance", balanceError);
        }
      }
      console.log("Connected wallet", address);
    } catch (error) {
      console.error("Failed to connect wallet", error);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Cta ctaText="Connect Wallet" onClick={connectWallet} />
      <NiebieskaKarta
        niebieskaKartaText={balance ? `Balance: ${balance}` : undefined}
      />
    </div>
  );
}

