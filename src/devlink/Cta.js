"use client";
import React from "react";
import * as _Builtin from "./_Builtin";
import * as _utils from "./utils";
import _styles from "./Cta.module.css";

export function Cta({
  as: _Component = _Builtin.Link,
  ctaText = "Hello world",
  onClick,
}) {
  return (
    <_Component
      className={_utils.cx(_styles, "cta")}
      button={true}
      block="inline"
      options={{
        href: "#",
      }}
      onClick={onClick}
    >
      <_Builtin.Block className={_utils.cx(_styles, "text-block")} tag="div">
        {ctaText}
      </_Builtin.Block>
    </_Component>
  );
}
