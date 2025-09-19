"use client";

import { useState } from "react";
import type { MouseEvent } from "react";
import { List, ListItem } from "@/devlink/_Builtin";
import { Cta } from "@/devlink/Cta";
import { NiebieskaKarta } from "@/devlink";

export default function Home() {
  const [walletEntries, setWalletEntries] = useState<string[]>([]);

  const handleConnectClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setWalletEntries((previous) => [
      ...previous,
      `Wallet connection ${previous.length + 1}`,
    ]);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6">
      <Cta ctaText="Connect Wallet" onClick={handleConnectClick} />
      <List
        tag="ul"
        unstyled={false}
        className="w-full max-w-sm space-y-2"
        aria-label="Wallet connections"
      >
        {walletEntries.length === 0 ? (
          <ListItem className="text-gray-500">
            No wallet connections yet.
          </ListItem>
        ) : (
          walletEntries.map((entry, index) => (
            <ListItem key={`${entry}-${index}`}>{entry}</ListItem>
          ))
        )}
      </List>
      <NiebieskaKarta />
    </div>
  );
}
