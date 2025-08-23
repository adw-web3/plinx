"use client";

import { useState } from "react";
import { connect } from "starknetkit";
import { constants, num } from "starknet";
import { NiebieskaKarta } from "@/devlink";
import { Section, Block, Link } from "@/devlink/_Builtin";
import { Cta } from "@/devlink/Cta"; // Import the Navbar component

export default function Home() {
  const [balance, setBalance] = useState<string | null>(null);

  const handleConnect = async () => {
    try {
      const wallet = await connect();
      if (wallet && wallet.account) {
        const provider = wallet.account.provider;
        const address = wallet.account.address;
        const bal = await provider.getBalance({
          owner: address,
          token: constants.ETH_TOKEN_ADDRESS,
        });
        const formatted = num.toBigInt(bal.balance).toString();
        setBalance(formatted);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Cta ctaText="Connect Wallet" onClick={handleConnect} />
      <NiebieskaKarta balance={balance} />
    </div>
  );
}

