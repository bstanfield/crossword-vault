/** @jsx jsx */

import { jsx } from "@emotion/react";
import { colors, fonts, scale } from "../lib/helpers";

const alertStyles = (complete) =>
  scale({
    cursor: "pointer",
    display: "inline-block",
    margin: 0,
    padding: 8,
    marginRight: 6,
    backgroundColor: complete ? colors.success : colors.error,
    fontSize: 13,
    color: colors.offwhite,
    borderRadius: 2,
    fontFamily: fonts.monospace,
    marginTop: 12,
  });

// This should be entirely dictated by the server (scores.incorrects)
export default function Alert({ props }) {
  const {
    scores,
    grading,
    showIncorrect,
    setShowIncorrect,
    setShowFinishScreen,
  } = props;

  if (scores && scores.incorrects && scores.incorrects.length > 0) {
    return (
      <p
        onClick={() =>
          grading.incorrect == 0
            ? setShowFinishScreen(true)
            : setShowIncorrect(!showIncorrect)
        }
        css={alertStyles(grading.incorrect == 0)}
      >
        {grading.incorrect == 0
          ? "Solved! (show stats)"
          : `${scores.incorrects.length} wrong ${
              showIncorrect ? "(hide)" : "(show)"
            }`}{" "}
      </p>
    );
  } else {
    return null;
  }
}
