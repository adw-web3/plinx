"use client";
import React from "react";
import * as _Builtin from "./_Builtin";
import * as _utils from "./utils";
import _styles from "./NavbarTubbly.module.css";

export function NavbarTubbly({
  as: _Component = _Builtin.NavbarWrapper,

  navlinkPartners = {
    href: "#",
  },

  navlinkBlockchain = {
    href: "#",
  },

  navlinkDownload = {
    href: "#",
  },

  navlinkLogoHome = {
    href: "#",
  },
}) {
  return (
    <_Component
      className={_utils.cx(_styles, "navbar")}
      tag="div"
      config={{
        animation: "default",
        collapse: "medium",
        docHeight: false,
        duration: 400,
        easing: "ease-in-out",
        easing2: "ease",
        noScroll: false,
      }}
    >
      <_Builtin.NavbarContainer
        className={_utils.cx(_styles, "nav-container")}
        tag="div"
      >
        <_Builtin.NavbarBrand
          className={_utils.cx(_styles, "brand")}
          options={navlinkLogoHome}
        >
          <_Builtin.Image
            loading="lazy"
            width="60"
            height="auto"
            alt=""
            src="https://cdn.prod.website-files.com/6833201ada7d8cb8cd426b7d/683324bee0bc0c286a1be730_Logo.png"
          />
        </_Builtin.NavbarBrand>
        <_Builtin.NavbarMenu
          className={_utils.cx(_styles, "nav-menu")}
          tag="nav"
          role="navigation"
        >
          <_Builtin.NavbarLink
            className={_utils.cx(_styles, "nav-link")}
            options={navlinkPartners}
          >
            {"Partnerzy"}
          </_Builtin.NavbarLink>
          <_Builtin.NavbarLink
            className={_utils.cx(_styles, "nav-link")}
            options={navlinkBlockchain}
          >
            {"Blockchain"}
          </_Builtin.NavbarLink>
          <_Builtin.Link
            className={_utils.cx(_styles, "cta")}
            button={true}
            block=""
            options={navlinkDownload}
          >
            {"Pobierz Tubbly"}
          </_Builtin.Link>
        </_Builtin.NavbarMenu>
        <_Builtin.NavbarButton
          className={_utils.cx(_styles, "menu-button")}
          tag="div"
        >
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
