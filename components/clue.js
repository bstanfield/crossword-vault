/** @jsx jsx */

import { jsx } from "@emotion/react";
import { scale } from "../lib/helpers";
import { useEffect, useState } from "react";

const clueStyle = (darkmode, highlight) =>
  scale({
    color: darkmode ? "#f5f5f5" : "#333333",
    backgroundColor: highlight
      ? darkmode
        ? "#5c5cff"
        : "rgba(255, 165, 0, 0.35)"
      : "",
    padding: "5px 10px",
    border: highlight
      ? darkmode
        ? "2px solid #5c5cff"
        : "2px solid rgba(255, 165, 0, 1)"
      : "2px solid transparent",
    borderRadius: 4,
    cursor: "pointer",
    transition: "all 0.2s ease",
    transitionProperty: "background-color, border",
    fontSize: [14, 14, 14, "inherit"],
    "&:hover": {
      backgroundColor: darkmode
        ? highlight
          ? "#5c5cff"
          : "#2a2a6b"
        : `rgba(255, 165, 0, ${highlight ? 0.35 : 0.15})`,
    },
  });

function Clue({ props }) {
  const {
    darkmode,
    index,
    clue,
    relevantClue,
    direction,
    lockout,
    movementDirection,
    setNewFocus,
    setLockout,
    setMovementDirection,
    setHoveredClue,
    setCurrentClueText,
  } = props;
  const [highlight, setHighlight] = useState(false);

  useEffect(() => {
    if (relevantClue) {
      if (direction === movementDirection) {
        // Checks to see if clue direction matches user direction
        setCurrentClueText(clue);
        setHighlight(true);
      } else {
        setHighlight(false);
      }
    } else {
      setHighlight(false);
    }

    // TODO: If focus isn't on current clue, then remove focus
    // setFocus(false)
  }, [relevantClue, movementDirection]);

  return (
    <li
      css={clueStyle(darkmode, highlight)}
      onClick={() => {
        setNewFocus(index);
        setMovementDirection(direction);
      }}
      // onMouseLeave={() => setHoveredClue(false)}
      // onMouseEnter={() => hoverClue()}
      id={`${index}-${direction}`}
    >
      <strong>{clue.split(".")[0]}.</strong>{" "}
      <span
        dangerouslySetInnerHTML={{
          __html: clue.substring(clue.indexOf(".") + 1),
        }}
      />
    </li>
  );
}

const areEqual = (prevProps, nextProps) => {
  const previous = prevProps.props;
  const next = nextProps.props;

  // Re-renders clues if darkmode is selected or deselected
  if (previous.darkmode !== next.darkmode) {
    return false;
  }

  // Re-renders clue if a new set of squares is selected
  if (previous.relevantClue === next.relevantClue) {
    return true;
  }

  return false;
};

export default React.memo(Clue, areEqual);
