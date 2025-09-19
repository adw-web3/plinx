"use client";
import React from "react";
import * as _Builtin from "./_Builtin";

export function Lista({ as: _Component = _Builtin.List, itemCopy = "Item 1" }) {
  return (
    <_Component tag="ul" unstyled={false}>
      <_Builtin.ListItem>{itemCopy}</_Builtin.ListItem>
      <_Builtin.ListItem>{itemCopy}</_Builtin.ListItem>
      <_Builtin.ListItem>{itemCopy}</_Builtin.ListItem>
    </_Component>
  );
}
