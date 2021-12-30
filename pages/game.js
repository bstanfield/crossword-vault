/** @jsx jsx */

import { jsx } from "@emotion/react";
import {
  fonts,
  ENDPOINT,
  formatTime,
  calculateScores,
  createBoard,
} from "../lib/helpers";
import { Fragment, useEffect, useState, useRef } from "react";
import Clue from "../components/clue";
import Board from "../components/board";
import styles from "../lib/boardStyles";

export default function Game({ props }) {
  const {
    socketConnection,
    data,
    room,
    scores,
    setScores,
    clientId,
    timestamp,
    completedAtTimestamp,
    timer,
    guestHighlights,
    players,
    nametagLocations,
    nametagData,
    loading,
    focus,
    setFocus,
    name,
    setName,
    darkmode,
    setDarkmode,
    complete,
    setComplete,
  } = props;
  const { grid, clues } = data;

  // For dynamic crossword sizes (15x15, etc.)
  const [width, setWidth] = useState(false);
  const [height, setHeight] = useState(false);
  const [totalSquares, setTotalSquares] = useState(false);

  // Board
  const [board, setBoard] = useState([]);
  const [guesses, setGuesses] = useState([]);
  const [grading, setGrading] = useState(false);
  const [hoveredClue, setHoveredClue] = useState(false);
  const [guestInputChange, setGuestInputChange] = useState([]);
  const [showIncorrect, setShowIncorrect] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [currentClueText, setCurrentClueText] = useState(false);

  // CONSTRAIN USE TO MOVEMENT
  // Determines which clue to highlight
  const [clueIndex, setClueIndex] = useState(false);
  // Refactor this one later. It allows a clue onClick to highlight the corresponding squares!
  const [newFocus, setNewFocus] = useState(false);
  // Milliseconds for lockout of clue hover
  const [lockout, setLockout] = useState(false);
  const [movementDirection, setMovementDirection] = useState("across");
  const [downGroupings, setDownGroupings] = useState([]);
  const [acrossGroupings, setAcrossGroupings] = useState([]);

  useEffect(() => {
    // If username is in storage, don't ask again
    if (localStorage.getItem("username")) {
      setName(localStorage.getItem("username"));
      setShowPopup(false);
    }
    if (!name) {
      setShowPopup(true);
    }

    // If darkmode is in storage, default to it
    // localstorage boolean gets saved as string :(
    if (
      localStorage.getItem("darkmode") &&
      localStorage.getItem("darkmode").includes("true")
    ) {
      setDarkmode(true);
    }
  }, []);

  // Socket connection stuff
  useEffect(() => {
    if (socketConnection) {
      socketConnection.on("guesses", (data) => {
        console.log("GUESSES");
        setGuesses(data);
      });
    }
  }, [socketConnection]);

  useEffect(() => {
    const { position, letter } = guestInputChange;

    if (guesses[position] !== letter) {
      guesses[position] = letter;
      setGuesses([...guesses]);
    }
  }, [guestInputChange]);

  useEffect(() => {
    if (name && socketConnection) {
      socketConnection.emit("name", name);
      setShowPopup(false);
    }
  }, [name, socketConnection]);

  useEffect(() => {
    if (data) {
      setBoard(
        createBoard(data, setDownGroupings, setAcrossGroupings, setGuesses)
      );
    }

    if (data) {
      setWidth(data.size.rows);
      setHeight(data.size.cols);
      setTotalSquares(width * height);
    }
  }, [data]);

  useEffect(() => {
    let incorrect = 0;
    let correct = 0;
    let blank = 0;
    let black = 0;

    if (guesses.length > 0) {
      guesses.map((guess, index) => {
        if (guess === false) {
          black++;
          return;
        }
        if (guess === "") {
          blank++;
          return;
        }
        if (guess.toUpperCase() === board[index].letter) {
          correct++;
          return;
        }
        incorrect++;
      });
    }
    setGrading({ correct, incorrect, blank, black });
  }, [guesses]);

  // Would display some awesome feel good banner
  useEffect(() => {
    if (guesses) {
      // Success!
      if (grading.correct === 225 - grading.black) {
        return setComplete(true);
      }
      // Incorrect answers
      if (
        grading.correct + grading.incorrect ===
        guesses.length - grading.black
      ) {
        return setComplete(false);
      }
    }
  }, [grading]);

  const handleSendToSocket = (data) => {
    // add name to socket messages
    let body = data;
    if (name) {
      body = { ...data, ...{ name } };
    }
    socketConnection.send(body);
  };

  const checkName = (name) => {
    if (name.length <= 6) {
      setName(input);
      localStorage.setItem("username", input);
      setError(false);
    } else {
      setError(true);
    }
  };

  return (
    <Fragment>
      <p
        css={styles.mobileClueCard(darkmode)}
        dangerouslySetInnerHTML={{ __html: currentClueText }}
      />
      <div css={styles.boardAndCluesContainer(data.size.rows, data.size.cols)}>
        <Board
          props={{
            clientId,
            board,
            hoveredClue,
            showIncorrect,
            name,
            nametagLocations,
            nametagData,
            darkmode,
            data,
            newFocus,
            downGroupings,
            acrossGroupings,
            guestHighlights,
            clueIndex,
            movementDirection,
            setClueIndex,
            setMovementDirection,
            handleSendToSocket,
            guesses,
            setGuesses,
            width: data.size.rows,
            height: data.size.cols,
          }}
        />

        <div css={styles.crosswordClues}>
          <h2 css={styles.clueHeader}>Across</h2>
          <ul>
            {clues &&
              clues.across.map((clue, index) => (
                <Clue
                  key={index}
                  props={{
                    darkmode,
                    lockout,
                    index,
                    clue,
                    clueIndex,
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
        <div css={styles.crosswordClues}>
          <h2 css={styles.clueHeader}>Down</h2>
          <ul>
            {clues &&
              clues.down.map((clue, index) => (
                <Clue
                  key={index}
                  props={{
                    darkmode,
                    lockout,
                    index,
                    clue,
                    clueIndex,
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
      </div>
    </Fragment>
  );
}
