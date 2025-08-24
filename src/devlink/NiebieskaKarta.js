"use client";
import React from "react";
import * as _Builtin from "./_Builtin";
import * as _utils from "./utils";
import _styles from "./NiebieskaKarta.module.css";

export function NiebieskaKarta({
  as: _Component = _Builtin.Block,
  niebieskaKartaText = "Informational text.",
}) {
  return (
    <_Component className={_utils.cx(_styles, "div-block")} tag="div">
      <_Builtin.Block className={_utils.cx(_styles, "balance")} tag="div">
        {niebieskaKartaText}
      </_Builtin.Block>
    </_Component>
  );
}
