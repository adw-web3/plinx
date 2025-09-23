"use client";
import React from "react";
import * as _Builtin from "./_Builtin";
import * as _utils from "./utils";
import _styles from "./FooterTubbly.module.css";

export function FooterTubbly({
  as: _Component = _Builtin.Section,
  footerAktualnosciName = "Aktualności",

  footerAktualnosciLink = {
    href: "#",
  },

  footerRegulaminLInk = {
    href: "#",
  },

  footerRegulaminName = "Regulamin",

  footerPolitykaPrywatnosciLink = {
    href: "#",
  },

  footerPolitykaPrywatnosciName = "Polityka Prywatności",

  footerSkrzynkiRegulaminLink = {
    href: "#",
  },

  footerSkrzynkiRegulaminName = "Skrzynki Regulamin",
}) {
  return (
    <_Component
      className={_utils.cx(_styles, "section", "footer")}
      grid={{
        type: "section",
      }}
      tag="section"
    >
      <_Builtin.Block
        className={_utils.cx(_styles, "_1200-wrapper-hor-flex")}
        tag="div"
      >
        <_Builtin.Block
          className={_utils.cx(_styles, "copyright-wrapper")}
          tag="div"
        >
          <_Builtin.Block className={_utils.cx(_styles, "h-flex")} tag="div">
            <_Builtin.Block tag="div">{"TAM Labs Sp z o.o."}</_Builtin.Block>
            <_Builtin.Block tag="div">{"Copyright © 2025"}</_Builtin.Block>
          </_Builtin.Block>
          <_Builtin.Image
            className={_utils.cx(_styles, "footer-logo")}
            loading="lazy"
            width="117"
            height="auto"
            alt=""
            src="https://cdn.prod.website-files.com/6833201ada7d8cb8cd426b7d/683340eadd31e21371d96f26_footer-logo.png"
          />
        </_Builtin.Block>
        <_Builtin.Block
          className={_utils.cx(_styles, "footer-links-wrapper")}
          tag="div"
        >
          <_Builtin.Block className={_utils.cx(_styles, "h-flex")} tag="div">
            <_Builtin.Link
              className={_utils.cx(_styles, "footer-link")}
              button={false}
              block=""
              options={footerRegulaminLInk}
            >
              {footerRegulaminName}
            </_Builtin.Link>
            <_Builtin.Block className={_utils.cx(_styles, "dot")} tag="div" />
            <_Builtin.Link
              className={_utils.cx(_styles, "footer-link")}
              button={false}
              block=""
              options={footerPolitykaPrywatnosciLink}
            >
              {footerPolitykaPrywatnosciName}
            </_Builtin.Link>
            <_Builtin.Block className={_utils.cx(_styles, "dot")} tag="div" />
            <_Builtin.Link
              className={_utils.cx(_styles, "footer-link")}
              button={false}
              block=""
              options={footerSkrzynkiRegulaminLink}
            >
              {footerSkrzynkiRegulaminName}
            </_Builtin.Link>
          </_Builtin.Block>
          <_Builtin.Block className={_utils.cx(_styles, "h-flex")} tag="div">
            <_Builtin.Link
              className={_utils.cx(_styles, "footer-link")}
              button={false}
              block=""
              options={{
                href: "https://x.com/Tubbly_",
                target: "_blank",
              }}
            >
              {"x.com"}
            </_Builtin.Link>
            <_Builtin.Block className={_utils.cx(_styles, "dot")} tag="div" />
            <_Builtin.Link
              className={_utils.cx(_styles, "footer-link")}
              button={false}
              block=""
              options={{
                href: "https://www.instagram.com/tubbly_/",
                target: "_blank",
              }}
            >
              {"Instagram"}
            </_Builtin.Link>
            <_Builtin.Block className={_utils.cx(_styles, "dot")} tag="div" />
            <_Builtin.Link
              className={_utils.cx(_styles, "footer-link")}
              button={false}
              block=""
              options={{
                href: "https://www.facebook.com/Tubbly.io",
                target: "_blank",
              }}
            >
              {"Facebook"}
            </_Builtin.Link>
            <_Builtin.Block className={_utils.cx(_styles, "dot")} tag="div" />
            <_Builtin.Link
              className={_utils.cx(_styles, "footer-link")}
              button={false}
              block=""
              options={{
                href: "https://www.linkedin.com/company/tubbly/",
                target: "_blank",
              }}
            >
              {"LinkedIn"}
            </_Builtin.Link>
          </_Builtin.Block>
          <_Builtin.Block className={_utils.cx(_styles, "h-flex")} tag="div">
            <_Builtin.Link
              className={_utils.cx(_styles, "footer-link")}
              button={false}
              block=""
              options={footerAktualnosciLink}
            >
              {footerAktualnosciName}
            </_Builtin.Link>
            <_Builtin.Block className={_utils.cx(_styles, "dot")} tag="div" />
            <_Builtin.Link
              className={_utils.cx(_styles, "footer-link")}
              button={false}
              block=""
              options={{
                href: "https://dappradar.com/dapp/tubbly?range-ds=30d&range-ha=3m",
                target: "_blank",
              }}
            >
              {"DappRadar"}
            </_Builtin.Link>
            <_Builtin.Block className={_utils.cx(_styles, "dot")} tag="div" />
            <_Builtin.Link
              className={_utils.cx(_styles, "footer-link")}
              button={false}
              block=""
              options={{
                href: "https://www.tubbly.io/plinx-analytics",
                target: "_blank",
              }}
            >
              {"Plinx Analytics"}
            </_Builtin.Link>
          </_Builtin.Block>
        </_Builtin.Block>
      </_Builtin.Block>
    </_Component>
  );
}
