/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from "@emotion/react";
import { scale } from "../lib/helpers";

const iconStyles = (size) =>
  scale({
    fontSize: size || "inherit",
    marginBottom: -2,
    "ion-icon": {
      marginBottom: -2,
      marginRight: 4,
    },
  });

export default function Icon({ props }) {
  const { color, size, name, height } = props;

  const iconStyles = scale({
    position: "relative",
    width: 23,
    height: height || 10,
    display: "inline-block",
    color: color,
    fontSize: size || "inherit",
    "ion-icon": {
      position: "absolute",
      display: "block",
      top: 0,
      bottom: 0,
      left: -6,
      right: 0,
      margin: "auto",
    },
  });

  return (
    <span css={iconStyles}>
      <ion-icon size="medium" name={name}></ion-icon>
    </span>
  );
}
