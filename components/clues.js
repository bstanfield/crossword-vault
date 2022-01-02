/** @jsx jsx */

import { jsx } from "@emotion/react";
import { Fragment } from "react";
import styles from "../lib/boardStyles";
import Clue from "../components/clue";

function Clues({ props }) {
  const {
    data,
    darkmode,
    lockout,
    movementDirection,
    setLockout,
    setNewFocus,
    setMovementDirection,
    setHoveredClue,
    setFocus,
    setCurrentClueText,
    clueIndex,
  } = props;
  return (
    <Fragment>
      <div css={styles.crosswordClues(data.size.rows, data.size.cols)}>
        <h2 css={styles.clueHeader}>Across</h2>
        <ul>
          {data.clues &&
            data.clues.across.map((clue, index) => (
              <Clue
                key={index}
                props={{
                  darkmode,
                  lockout,
                  index,
                  clue,
                  relevantClue:
                    index === clueIndex && movementDirection === "across",
                  movementDirection,
                  direction: "across",
                  setLockout,
                  setNewFocus,
                  setMovementDirection,
                  setHoveredClue,
                  setFocus,
                  setCurrentClueText,
                }}
              />
            ))}
        </ul>
      </div>
      <div css={styles.crosswordClues(data.size.rows, data.size.cols)}>
        <h2 css={styles.clueHeader}>Down</h2>
        <ul>
          {data.clues &&
            data.clues.down.map((clue, index) => (
              <Clue
                key={index}
                props={{
                  darkmode,
                  lockout,
                  index,
                  clue,
                  relevantClue:
                    index === clueIndex && movementDirection === "down",
                  movementDirection,
                  direction: "down",
                  setLockout,
                  setNewFocus,
                  setMovementDirection,
                  setHoveredClue,
                  setFocus,
                  setCurrentClueText,
                }}
              />
            ))}
        </ul>
      </div>
    </Fragment>
  );
}

function areEqual(prevProps, nextProps) {
  const previous = prevProps.props;
  const next = nextProps.props;

  if (previous.movementDirection !== next.movementDirection) {
    return false;
  }

  if (previous.lockout !== next.lockout) {
    return false;
  }

  if (previous.clueIndex !== next.clueIndex) {
    return false;
  }

  return true;

  // Only re-render Nav if players, darkmode, or socketConnection change
}

export default React.memo(Clues, areEqual);
