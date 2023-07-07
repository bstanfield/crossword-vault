/** @jsx jsx */

import { jsx } from "@emotion/react";
import { scale, formatTime } from "../lib/helpers";
import { useEffect, useState } from "react";

const timerStyles = () =>
  scale({
    display: "inline-block",
    margin: 0,
    padding: 8,
    backgroundColor: "#333",
    fontSize: 13,
    color: "#f5f5f5",
    borderRadius: 2,
    fontFamily: "JetBrains Mono, monospace",
    marginRight: 12,
  });

export default function Timer({ props }) {
  const { timer, grading } = props;

  return <p css={timerStyles}>{timer ? formatTime(timer) : "--:--:--"}</p>;
}
