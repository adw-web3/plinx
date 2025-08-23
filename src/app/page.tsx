"use client";

import { StarknetProvider } from "./components/StarknetProvider";
import WalletBar from "./components/WalletBar";

export default function Home() {
  return (
    <StarknetProvider>
      <div className="flex items-center justify-center min-h-screen">
        <WalletBar />
      </div>
    </StarknetProvider>
  );
}
