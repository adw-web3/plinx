"use client";

import dynamic from 'next/dynamic';

const WalletConnect = dynamic(() => import('./wallet-connect'), {
  ssr: false,
  // Optional: A loading component can be useful here
  // loading: () => <p>Loading...</p>,
});

export default function PageClient() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <WalletConnect />
    </div>
  );
}
