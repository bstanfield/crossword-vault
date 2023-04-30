/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from "@emotion/react";
import { scale } from "../lib/helpers";
import { useEffect, useState } from "react";
import Icon from "./icon";

const buttonStyles = (inactive, darkmode, backgroundColor) =>
  scale({
    display: "inline-block",
    margin: 0,
    padding: 8,
    backgroundColor: backgroundColor
      ? backgroundColor
      : inactive
      ? "transparent"
      : darkmode
      ? "#333"
      : "#eee",
    fontSize: 13,
    color: darkmode ? "#f5f5f5" : "#333333",
    borderRadius: 2,
    fontFamily: "JetBrains Mono, monospace",
    cursor: inactive ? "inherit" : "pointer",
    border: "1px solid transparent",
    "&:hover": {
      border: inactive
        ? "1px solid transparent"
        : darkmode
        ? "1px solid #eee"
        : "1px solid #333",
    },
  });

export default function Button({ props }) {
  const { text, icon, inactive, darkmode, onClickFn, backgroundColor } = props;
  const [status, setStatus] = useState("incorrect");

  return (
    <p
      onClick={onClickFn}
      css={buttonStyles(inactive, darkmode, backgroundColor)}
    >
      {icon && <Icon props={{ name: icon.name, size: icon.size }} />}
      {text}
    </p>
  );
}
