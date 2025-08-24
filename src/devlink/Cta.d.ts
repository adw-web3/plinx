import * as React from "react";
import * as Types from "./types";

declare function Cta(
  props: {
    as?: React.ElementType;
    /** This is text in the cta button.*/
    ctaText?: React.ReactNode;
  } & React.ComponentPropsWithoutRef<"a">
): React.JSX.Element;
