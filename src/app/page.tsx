"use client";

import { useState, useEffect } from "react";
import { Cta } from "@/devlink/Cta";
import { NiebieskaKarta } from "@/devlink/NiebieskaKarta";

export default function Home() {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>("");

  const connectWallet = async () => {
    const sn = (window as any).starknet;
    if (!sn) {
      alert("No Starknet wallet found");
      return;
    }
    await sn.enable();
    const addr = sn.selectedAddress || sn.account?.address;
    setAddress(addr);
  };

  const disconnectWallet = () => {
    setAddress(null);
    setBalance("");
  };

  useEffect(() => {
    async function fetchBalance() {
      if (!address) return;
      try {
        const { Provider } = await import("starknet");
        const provider: any = new Provider({
          sequencer: { network: "mainnet-alpha" },
        });
        const bal = await provider.getBalance(address);
        const value = bal?.balance || bal;
        setBalance(value.toString());
      } catch (err) {
        console.error(err);
        setBalance("0");
      }
    }
    fetchBalance();
  }, [address]);

  const handleClick = address ? disconnectWallet : connectWallet;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <div onClick={handleClick}>
        <Cta ctaText={address ? "Disconnect Wallet" : "Connect Wallet"} />
      </div>
      <NiebieskaKarta
        niebieskaKartaText=
          {address
            ? `Address: ${address} Balance: ${balance || "Loading..."}`
            : "No wallet connected"}
      />
    </div>
  );
}

