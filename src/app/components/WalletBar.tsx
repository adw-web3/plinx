"use client";

import { useAccount, useConnect, useDisconnect, useBalance } from "@starknet-react/core";
import { useMemo } from "react";

function WalletBar() {
  const { address } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const shortAddress = useMemo(() => {
    if (!address) return "Connect Wallet";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, [address]);

  const { data } = useBalance({ address });

  return (
    <div>
      {address ? (
        <div>
          <p>Connected: {shortAddress}</p>
          <p>Balance: {data?.formatted} {data?.symbol}</p>
          <button onClick={() => disconnect()}>Disconnect</button>
        </div>
      ) : (
        <div>
          {connectors.map((connector) => (
            <button key={connector.id} onClick={() => connect({ connector })}>
              Connect {connector.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default WalletBar;
