/** @jsx jsx */

import { jsx } from "@emotion/react";
import { scale } from "../lib/helpers";
import { motion } from "framer-motion";

const sidePanel = (show, darkmode) =>
  scale({
    width: 300,
    height: "100%",
    padding: 18,
    position: "absolute",
    borderLeft: `2px solid ${darkmode ? "transparent" : "#333"}`,
    textAlign: "center",
    backgroundColor: darkmode ? "#333" : "#f5f5f5",
    zIndex: 3,
    top: 0,
    bottom: 0,
    margin: "auto",
    right: 0,
    webkitBoxShadow: show && "-8px 0px 5px -6px rgba(0,0,0,0.20)",
    mozBoxShadow: show && "-8px 0px 5px -6px rgba(0,0,0,0.20)",
    boxShadow: show && "-8px 0px 5px -6px rgba(0,0,0,0.20)",
  });

const shortcut = scale({
  margin: "36px 0",
});

export default function Shortcuts({ props }) {
  const { show, darkmode } = props;

  const key = scale({
    fontWeight: "bold",
    fontFamily: "JetBrains Mono, monospace",
    backgroundColor: darkmode ? "black" : "#333",
    display: "inline-block",
    color: "#f5f5f5",
    padding: 8,
    borderRadius: 4,
    margin: "0 4px",
  });

  const description = scale({
    opacity: darkmode ? 1 : 0.8,
  });

  return (
    <motion.div
      css={sidePanel(show, darkmode)}
      transition={{ ease: "easeInOut", duration: 0.3 }}
      animate={{ x: show ? 0 : 300 }}
      initial={false}
    >
      <div css={shortcut}>
        <p css={key}>spacebar</p>
        <p css={description}>Toggle clue direction</p>
      </div>
      <div css={shortcut}>
        <p css={key}>tab</p>
        <p css={description}>Move to next clue</p>
      </div>
      <div css={shortcut}>
        <p css={key}>shift</p>
        <p css={key}>tab</p>
        <p css={description}>Move to previous clue</p>
      </div>
      <div css={shortcut}>
        <p css={key}>▲</p>
        <p css={key}>▼</p>
        <p css={key}>◀</p>
        <p css={key}>▶</p>
        <p css={description}>Move up, down, left, right</p>
      </div>
    </motion.div>
  );
}
