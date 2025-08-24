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

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Cta ctaText="Connect Wallet" />
      <NiebieskaKarta />
    </div>
  );
}

