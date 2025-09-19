"use client";

import { useState } from "react";
import type { MouseEvent, KeyboardEvent } from "react";
import { List, ListItem } from "@/devlink/_Builtin";
import { Cta } from "@/devlink/Cta";
import { NiebieskaKarta } from "@/devlink";

export default function Home() {
  const [walletEntries, setWalletEntries] = useState<string[]>([]);

  const addWalletEntry = () => {
    setWalletEntries((previous) => [
      ...previous,
      `Wallet connection ${previous.length + 1}`,
    ]);
  };

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    addWalletEntry();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      addWalletEntry();
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6">
      <div
        role="button"
        tabIndex={0}
        className="cursor-pointer"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        <Cta ctaText="Connect Wallet" />
      </div>
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
