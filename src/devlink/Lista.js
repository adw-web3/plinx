"use client";
import React from "react";
import * as _Builtin from "./_Builtin";
import * as _utils from "./utils";
import _styles from "./Lista.module.css";

export function Lista({ as: _Component = _Builtin.List, itemCopy = "Item 1" }) {
  return (
    <_Component tag="ol" unstyled={false}>
      <_Builtin.ListItem className={_utils.cx(_styles, "list-item")}>
        {itemCopy}
      </_Builtin.ListItem>
      <_Builtin.ListItem className={_utils.cx(_styles, "list-item")}>
        {itemCopy}
      </_Builtin.ListItem>
      <_Builtin.ListItem className={_utils.cx(_styles, "list-item")}>
        {itemCopy}
      </_Builtin.ListItem>
    </_Component>
  );
}
