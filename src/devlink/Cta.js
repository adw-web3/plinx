"use client";
import React, { useState } from "react";
import * as _Builtin from "./_Builtin";
import * as _utils from "./utils";
import _styles from "./Cta.module.css";
import { useConnect, useAccount } from "@starknet-react/core";

export function Cta({ as: _Component = _Builtin.Block, ctaText = "Hello world" }) {
  const { connect, connectors } = useConnect();
  const { address } = useAccount();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleConnect = (connector) => {
    connect({ connector });
    setIsModalOpen(false);
  };

  if (address) {
    return null;
  }

  return (
    <>
      <_Component
        className={_utils.cx(_styles, "cta")}
        tag="div"
        onClick={() => setIsModalOpen(true)}
      >
        <_Builtin.Block className={_utils.cx(_styles, "text-block")} tag="div">
          {ctaText}
        </_Builtin.Block>
      </_Component>
      {isModalOpen && (
        <div className={_utils.cx(_styles, "modal-overlay")}>
          <div className={_utils.cx(_styles, "modal")}>
            <h2>Connect Wallet</h2>
            {connectors.map((connector) => (
              <button
                key={connector.id}
                onClick={() => handleConnect(connector)}
                className={_utils.cx(_styles, "connector-button")}
              >
                Connect {connector.name}
              </button>
            ))}
            <button
              onClick={() => setIsModalOpen(false)}
              className={_utils.cx(_styles, "close-button")}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
