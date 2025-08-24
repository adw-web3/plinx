"use client";

import { useState } from "react";
import { connect } from "starknetkit";
import { ArgentX } from "starknetkit/argentX";
import { Braavos } from "starknetkit/braavos";
import { num } from "starknet";
import { NiebieskaKarta } from "@/devlink";
import { Cta } from "@/devlink/Cta";

export default function Home() {
  const [balance, setBalance] = useState<string | null>(null);
  const ETH_TOKEN_ADDRESS =
    "0x049d36570d4e46f3d4e18853d02acee2de17e7b704275c5910b2f7f5ebfdf70";

  const handleConnect = async () => {
    try {
      interface WalletAccount {
        address: string;
        provider: {
          getBalance: (args: {
            owner: string;
            token: string;
          }) => Promise<{ balance: string }>;
        };
      }
      interface WalletWithAccount {
        account?: WalletAccount;
      }
      const { wallet } = await connect({ connectors: [new ArgentX(), new Braavos()] });
      const account = (wallet as WalletWithAccount)?.account;
      if (account) {
        const bal = await account.provider.getBalance({
          owner: account.address,
          token: ETH_TOKEN_ADDRESS,
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

