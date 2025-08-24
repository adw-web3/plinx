"use client";
import React from "react";
import * as _Builtin from "./_Builtin";
import * as _utils from "./utils";
import _styles from "./NiebieskaKarta.module.css";
import { useBalance, useAccount } from "@starknet-react/core";

export function NiebieskaKarta({ as: _Component = _Builtin.Block }) {
  const { address } = useAccount();
  const { data } = useBalance({ address });

  if (!address) {
    return null;
  }

  return (
    <_Component className={_utils.cx(_styles, "div-block")} tag="div">
      <_Builtin.Block className={_utils.cx(_styles, "balance")} tag="div">
        {data ? `Balance: ${data.formatted} ${data.symbol}` : "Loading..."}
      </_Builtin.Block>
    </_Component>
  );
}
