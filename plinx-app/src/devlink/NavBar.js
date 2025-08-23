"use client";
import React from "react";
import * as _Builtin from "./_Builtin";

export function NavBar({ as: _Component = _Builtin.NavbarWrapper }) {
  return (
    <_Component
      tag="div"
      config={{
        animation: "default",
        collapse: "medium",
        docHeight: false,
        duration: 400,
        easing: "ease",
        easing2: "ease",
        noScroll: false,
      }}
    >
      <_Builtin.NavbarContainer tag="div">
        <_Builtin.NavbarBrand
          options={{
            href: "#",
          }}
        />
        <_Builtin.NavbarMenu tag="nav" role="navigation">
          <_Builtin.NavbarLink
            options={{
              href: "#",
            }}
          >
            {"1"}
          </_Builtin.NavbarLink>
          <_Builtin.NavbarLink
            options={{
              href: "#",
            }}
          >
            {"2"}
          </_Builtin.NavbarLink>
          <_Builtin.NavbarLink
            options={{
              href: "#",
            }}
          >
            {"3"}
          </_Builtin.NavbarLink>
        </_Builtin.NavbarMenu>
        <_Builtin.NavbarButton tag="div">
          <_Builtin.Icon
            widget={{
              type: "icon",
              icon: "nav-menu",
            }}
          />
        </_Builtin.NavbarButton>
      </_Builtin.NavbarContainer>
    </_Component>
  );
}
