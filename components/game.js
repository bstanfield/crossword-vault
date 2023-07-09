/** @jsx jsx */

import { jsx } from "@emotion/react";
import { fonts, ENDPOINT, formatTime, createBoard } from "../lib/helpers";
import { Fragment, useEffect, useState, useRef } from "react";
import Board from "../components/board";
import Clues from "../components/clues";
import styles from "../lib/boardStyles";
import Alert from "../components/alert";

export default function Game({ props }) {
  const {
    scores,
    filledAtTimestamp,
    completedAtTimestamp,
    socketConnection,
    data,
    clientId,
    guestHighlights,
    nametagLocations,
    nametagData,
    setFocus,
    name,
    setName,
    darkmode,
    setDarkmode,
    setShowFinishScreen,
    hoveredClue,
    setHoveredClue,
    showIncorrect,
    setShowIncorrect,
    initialGuesses,
    guestInputChange,
    showFinishScreen,
  } = props;

  // For dynamic crossword sizes (15x15, etc.)
  const [width, setWidth] = useState(false);
  const [height, setHeight] = useState(false);
  const [totalSquares, setTotalSquares] = useState(false);

  // Board
  const [board, setBoard] = useState([]);
  const [guesses, setGuesses] = useState([]);
  const [grading, setGrading] = useState(false);
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

  // HACK
  useEffect(() => {
    setGuesses(initialGuesses);
  }, [initialGuesses]);

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
      setWidth(data.size.cols);
      setHeight(data.size.rows);
      setTotalSquares(width * height);
    }
  }, [data]);

  const handleSendToSocket = (data) => {
    // add name to socket messages
    let body = data;
    if (name) {
      body = { ...data, ...{ name } };
    }
    socketConnection.send(body);
  };

  return (
    <Fragment>
      <p
        id="mobile-clue"
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
            width: data.size.cols,
            height: data.size.rows,
          }}
        />

        <Clues
          props={{
            data,
            darkmode,
            lockout,
            movementDirection,
            setLockout,
            setNewFocus,
            setMovementDirection,
            setHoveredClue,
            setFocus,
            clueIndex,
            setCurrentClueText,
          }}
        />
      </div>
      <Alert
        props={{
          scores,
          filledAtTimestamp,
          completedAtTimestamp,
          showFinishScreen,
          data,
          guesses,
          grading,
          showIncorrect,
          setShowIncorrect,
          setShowFinishScreen,
        }}
      />
      {/* <div>
        <p>Scores:</p>
        {scores && (
          <ul>
            <li>
              Incorrects:{" "}
              {scores.incorrects && scores.incorrects.length > 10
                ? scores.incorrects.length
                : scores.incorrects}
            </li>
            <li>
              Claimed guesses:{" "}
              {scores.claimedGuesses && scores.claimedGuesses.length > 10
                ? scores.claimedGuesses.length
                : scores.claimedGuesses.map((guess) => <span>{guess}, </span>)}
            </li>
          </ul>
        )}
      </div> */}
    </Fragment>
  );
}
