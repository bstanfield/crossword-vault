/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from "@emotion/react";
import styles from "../lib/boardStyles";
import Players from "../components/players";
import React from "react";

function Nav({ props }) {
  const { darkmode, setDarkmode, players, socketConnection } = props;
  return (
    <div
      css={{
        borderBottom: `1px solid ${
          darkmode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)"
        }`,
        zIndex: 2,
        position: "absolute",
        width: "100%",
        height: "50px",
        top: 12,
        left: 0,
        right: 0,
        margin: "auto",
      }}
    >
      <div css={styles.navContainer}>
        <Players props={{ darkmode, setDarkmode, players, socketConnection }} />

        <div>
          <p css={styles.logo}>Word Vault</p>
        </div>
      </div>
    </div>
  );
}

function areEqual(prevProps, nextProps) {
  const previous = prevProps.props;
  const next = nextProps.props;

  // Only re-render Nav if players, darkmode, or socketConnection change
  if (previous.players !== next.players) {
    return false;
  }

  if (previous.darkmode !== next.darkmode) {
    return false;
  }

  if (previous.socketConnection !== next.socketConnection) {
    return false;
  }

  return true;
}

export default React.memo(Nav, areEqual);
