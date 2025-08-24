"use client";

import { useEffect } from "react";
import { NiebieskaKarta } from "@/devlink";
import { Section, Block, Link } from "@/devlink/_Builtin";
import { Cta } from "@/devlink/Cta"; // Import the Navbar component

export default function Home() {
  useEffect(() => {
    async function initProvider() {
      const { Provider, constants } = await import("starknet");
      const provider = new Provider({ nodeUrl: constants.NetworkName.SN_MAIN });
      console.log("Starknet provider", provider);
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
      console.log("Connected wallet", starknet.selectedAddress);
    } catch (error) {
      console.error("Failed to connect wallet", error);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Cta ctaText="Connect Wallet" onClick={connectWallet} />
      <NiebieskaKarta />
    </div>
  );
}

