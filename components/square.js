/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from "@emotion/react";
import { scale, colors, fonts } from "../lib/helpers";
import { useEffect, useState } from "react";
import Nametag from "./nametag";

const colorLookup = {
  transparent: {
    high: "transparent",
    low: "transparent",
    dark_high: "transparent",
    dark_low: "transparent",
  },
  grey: {
    high: "black",
    low: colors.lightgrey,
    dark_high: "black",
    dark_low: colors.lightgrey,
  },
  green: {
    high: "#19A450",
    low: "#CAEAD6",
    dark_high: "#1B482D",
    dark_low: "#526058",
  },
  purple: {
    high: "rgb(161, 59, 224)",
    low: "#DDD1E4",
    dark_high: "#332d4a",
    dark_low: "#5c5577",
  },
  blue: {
    high: "rgb(40, 203, 255)",
    low: "#CFE2E8",
    dark_high: "#07374F",
    dark_low: "#3C5560",
  },
  orange: {
    high: "#EA8D21",
    low: "#FAE9D5",
    dark_high: "#59350A",
    dark_low: "#736654",
  },
};

const blockNumber = scale({
  fontWeight: 400,
  fontSize: 8,
  top: "1px !important",
});

const blockLetter = scale({
  fontWeight: 400,
  fontSize: 10,
  top: "1px !important",
  paddingLeft: 25,
});

const setBackgroundColor = (
  darkmode,
  filled,
  relevantHighlightedSquare,
  content,
  isFocused,
  guestHighlight,
  showIncorrect,
  inputData
) => {
  if (isFocused) {
    // Maybe replace with: #ffa600
    return darkmode ? "#5c5cff" : "#7cc9ff";
  }
  if (filled || relevantHighlightedSquare) {
    return darkmode ? "#885c88" : "#f5c46c";
  }
  if (guestHighlight) {
    return darkmode ? guestHighlight.color.dark_low : guestHighlight.color.low;
  }
  if (
    showIncorrect &&
    inputData &&
    content.letter !== inputData.toUpperCase()
  ) {
    return darkmode ? "#555563" : "#ffcfcf";
  }
  return darkmode ? "#555563" : "#f5f5f5";
};

const setBorderColor = (
  darkmode,
  filled,
  relevantHighlightedSquare,
  content,
  isFocused,
  guestHighlight,
  showIncorrect,
  inputData,
  isMobile
) => {
  // z index is bad

  const thickness = isMobile ? 1 : 2;
  if (
    showIncorrect &&
    inputData &&
    content.letter !== inputData.toUpperCase()
  ) {
    return `${thickness}px solid ${colors.error}`;
  }
  if (isFocused) {
    return `${thickness}px solid black`;
  }
  if (filled || relevantHighlightedSquare) {
    return `${thickness}px solid black`;
  }
  if (guestHighlight) {
    return `${thickness}px solid ${
      darkmode ? guestHighlight.color.dark_high : guestHighlight.color.high
    }`;
  }
  return darkmode
    ? `${thickness}px solid ${colors.slate}`
    : `${thickness}px solid black`;
};

const setZIndex = (
  showIncorrect,
  inputData,
  content,
  filledInput,
  highlight,
  guestHighlight
) => {
  // show incorrect results
  if (
    showIncorrect &&
    inputData &&
    content.letter !== inputData.toUpperCase()
  ) {
    return 5;
  }

  if (filledInput === content.position) {
    return 3;
  }

  // local client
  if (highlight) {
    return 3;
  }

  // other clients
  if (guestHighlight) {
    return 2;
  }

  // default
  return 1;
};

const form = scale({
  padding: 0,
  margin: 0,
  height: "100%",
});

const circleClue = scale({
  width: "100%",
  height: "100%",
  border: `1px solid ${colors.slate}`,
  opacity: 1,
  borderRadius: "50%",
  position: "absolute",
  top: 0,
  pointerEvents: "none",
});

function Square({ props }) {
  const {
    id,
    circle,
    darkmode,
    content,
    hoveredClue,
    movementDirection,
    filledInput,
    showIncorrect,
    isFocused,
    name,
    relevantHighlightedSquare,
    relevantGuess,
    relevantGuestHighlight,
    nametagLocations,
    nametagData,
    clientId,
    uploadGuess,
    guestHighlights,
    setUploadGuess,
    setFocus,
    setMovementDirection,
    setSelectedSquare,
    setFilledInput,
    setBackspace,
    setGuesses,
    setInputChangeToApi,
    guesses,
    relevantGuestNametag,
    squareToFocus,
  } = props;

  const [clickCount, setClickCount] = useState(0);
  const [highlight, setHighlight] = useState(false);
  const [inputData, setInputData] = useState("");
  const [selectionIterator, setSelectionIterator] = useState(0);
  const [guestHighlight, setGuestHighlight] = useState(false);

  const hover = content.number === Number(hoveredClue);

  // If user hovers over corresponding clue...
  useEffect(() => {
    if (hoveredClue && hover) {
      setSelectedSquare(content.position);
    }
  }, [hover]);

  // Good
  useEffect(() => {
    if (clickCount > 1) {
      setMovementDirection(movementDirection === "across" ? "down" : "across");
    }
  }, [clickCount]);

  useEffect(() => {
    if (squareToFocus === content.position) {
      document.getElementById(`input-${content.position}`).focus();
      setFocus(content.position);
      setSelectedSquare(content.position);
    }
  }, [squareToFocus]);

  // Runs every time the user moves!
  // Good
  useEffect(() => {
    if (relevantHighlightedSquare) {
      setHighlight(true);
    } else {
      setHighlight(false);
    }
  }, [relevantHighlightedSquare]);

  // Responds to API responses
  // Good
  useEffect(() => {
    // if guesses have been changed by guest, update square input value
    if (relevantGuess !== inputData) {
      setInputData(relevantGuess);
    }
  }, [relevantGuess]);

  const handleKeyDown = (e) => {
    if (e.key === " ") {
      e.preventDefault();
    }

    if (e.key === "Backspace") {
      // This is a dumb method. Just see if the box is empty. If it is, move back
      if (!inputData) {
        setBackspace(true);
      }
      setInputData("");
      const inputToFill = {
        position: content.position,
        letter: "",
        iterator: 0,
      };

      setInputChangeToApi({ ...inputToFill });
      // TODO: setGuesses shouldn't happen at square level...
      let newGuesses = guesses;
      newGuesses[content.position - 1] = "";
      setGuesses([...newGuesses]);
    }
  };

  const isGuestHighlight = () => {
    if (guestHighlights) {
      // Replace this deletion with a new method outside of Square
      const filteredHighlights = guestHighlights;
      delete filteredHighlights[clientId];
      for (const [id, obj] of Object.entries(filteredHighlights)) {
        const { color, squares } = obj;
        if (squares.includes(content.position)) {
          setGuestHighlight({ id, color: colorLookup[color] });
          return;
        }
      }
      setGuestHighlight(false);
    }
  };

  // Good
  useEffect(() => {
    isGuestHighlight();
  }, [guestHighlights]);

  const squareInput = scale({
    caretColor: "transparent",
    outlineWidth: 0,
    border: "none",
    width: "100%",
    height: "100%",
    padding: 0,
    margin: 0,
    color: darkmode ? colors.offwhite : colors.slate,
    textTransform: "uppercase",
    textAlign: "center",
    fontSize: ["17px", "20px", "25px", "25px"],
    lineHeight: 0,
    paddingTop: 4,
    fontWeight: 500,
    borderRadius: 0,
    webkitBorderRadius: 0,
    fontFamily: fonts.sans,
    backgroundColor: setBackgroundColor(
      darkmode,
      filledInput === content.position,
      relevantHighlightedSquare,
      content,
      isFocused,
      guestHighlight,
      showIncorrect,
      inputData
    ),
    // transition: 'background-color 0.1s ease-in-out',
  });

  const squareBox = scale({
    position: "relative",
    margin: 0,
    padding: 0,
    marginLeft: -2,
    marginBottom: -2,
    borderRadius: 2,
    border: [
      setBorderColor(
        darkmode,
        filledInput === content.position,
        relevantHighlightedSquare,
        content,
        isFocused,
        guestHighlight,
        showIncorrect,
        inputData,
        true
      ),
      setBorderColor(
        darkmode,
        filledInput === content.position,
        relevantHighlightedSquare,
        content,
        isFocused,
        guestHighlight,
        showIncorrect,
        inputData,
        false
      ),
    ],
    zIndex: setZIndex(
      showIncorrect,
      inputData,
      content,
      filledInput,
      highlight,
      guestHighlight
    ),
    color: colors.slate,
    // transition: 'border 0.1s ease-in-out',
    span: {
      color: darkmode ? colors.offwhite : "black",
      position: "absolute",
      top: 2,
      left: 2,
      webkitTouchCallout: "none",
      webkitUserSelect: "none",
      khtmlUserSelect: "none",
      mozUserSelect: "none",
      msUserSelect: "none",
      userSelect: "none",
    },
  });

  return (
    <div id={content.position} css={squareBox}>
      <form css={form} autoComplete="off" onSubmit={(e) => e.preventDefault()}>
        {content.number > 0 && <span css={blockNumber}>{content.number}</span>}
        {/* {content.leter !== "." && (
          <span css={blockLetter}>{content.letter}</span>
        )} */}

        {/* Shows client username above square */}
        <Nametag
          props={{
            isFocused,
            clientId,
            colorLookup,
            name,
            guestHighlight,
            nametagData,
            nametagLocations,
            content,
            darkmode,
          }}
        />

        {/* Skips rendering input for black squares */}
        {content.letter !== "." && (
          <input
            onKeyDown={handleKeyDown}
            autoComplete="off"
            onPaste={(e) => {
              e.preventDefault();
              return false;
            }}
            onDrop={(e) => {
              e.preventDefault();
              return false;
            }}
            onCopy={(e) => {
              e.preventDefault();
              return false;
            }}
            onFocus={(e) => {
              e.preventDefault();
              // Handled in useEffect to avoid unnecessary re-renders
            }}
            onBlur={() => {
              setClickCount(0);
            }}
            onClick={() => {
              setFocus(content.position);
              setSelectedSquare(content.position);
              document.getElementById(`input-${content.position}`).focus();
              setClickCount(clickCount + 1);
            }}
            css={squareInput}
            type="text"
            id={`input-${content.position}`}
            defaultValue={inputData}
            onBeforeInput={(input) => {
              input.preventDefault();
              if (input.nativeEvent.data && input.nativeEvent.data !== "") {
                setInputData(input.nativeEvent.data);
                setSelectionIterator(selectionIterator + 1);

                // TODO: Rename
                const inputToFill = {
                  position: content.position,
                  letter: input.nativeEvent.data.toLowerCase(),
                  iterator: selectionIterator,
                };
                setFilledInput({ ...inputToFill });
                setInputChangeToApi({ ...inputToFill });

                let newGuesses = guesses;
                newGuesses[content.position - 1] = input.nativeEvent.data;
                setGuesses([...newGuesses]);
                // TODO: Remove if array spread operator fixes useEffect
                // picking up changes to state
                setUploadGuess(uploadGuess ? false : true);
              }
            }}
            name={content.letter}
          />
        )}
      </form>
      {circle === 1 && <div css={circleClue}></div>}
    </div>
  );
}

// Maybe use this instead or a variant of it?
function shallowEqual(object1, object2) {
  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);
  if (keys1.length !== keys2.length) {
    return false;
  }
  for (let key of keys1) {
    if (object1[key] !== object2[key]) {
      return false;
    }
  }
  return true;
}

// Used for memoization, which is off
// function areEqual(prevProps, nextProps) {
//   const previous = prevProps.props;
//   const next = nextProps.props;

//   if (next.relevantGuestNametag) {
//     return false;
//   }

//   if (previous.showIncorrect !== next.showIncorrect) {
//     return false;
//   }

//   if (previous.relevantGuestHighlight !== next.relevantGuestHighlight) {
//     return false;
//   }

//   if (previous.darkmode !== next.darkmode) {
//     return false;
//   }

//   if (previous.isFocused !== next.isFocused) {
//     return false;
//   }

//   if (previous.relevantGuess !== next.relevantGuess) {
//     return false;
//   }

//   if (previous.relevantHighlightedSquare === next.relevantHighlightedSquare) {
//     return true;
//   }
//   return false;
// }

export default Square;

// // Turn back on if you want memoization
// export default React.memo(Square, areEqual);
