import * as React from "react";
import * as Types from "./types";

declare function Cta(props: {
  as?: React.ElementType;
  /** This is text in the cta button.*/
  ctaText?: React.ReactNode;
  [key: string]: any;
}): React.JSX.Element;
