/** @jsx jsx */

import { jsx } from "@emotion/react";
import Game from "../components/game";
import { useEffect, useState } from "react";
import socketIOClient from "socket.io-client";
import { ENDPOINT, calculateScores } from "../lib/helpers";
import smoothscroll from "smoothscroll-polyfill";
import styles from "../lib/boardStyles";
import Header from "../components/header";
import Popup from "../components/popup";
import Metadata from "../components/metadata";
import Button from "../components/button";
import PuzzleSelector from "../components/puzzleSelector";
import DateSelector from "../components/DateSelector";
import Nav from "../components/nav";

export default function Room() {
  const [room, setRoom] = useState(null);
  const [data, setData] = useState(false);
  const [socketConnection, setSocketConnection] = useState(false);
  const [scores, setScores] = useState(null);
  const [clientId, setClientId] = useState(false);
  const [timestamp, setTimestamp] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState(false);
  const [highlightedSquares, setHighlightedSquares] = useState([]);
  const [completedAtTimestamp, setCompletedAtTimestamp] = useState(false);
  const [timer, setTimer] = useState(false);
  const [guestHighlights, setGuestHighlights] = useState(false);
  const [players, setPlayers] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nametagLocations, setNametagLocations] = useState([]);
  const [nametagData, setNametagData] = useState([]);
  const [focus, setFocus] = useState(false);
  const [dateRange, setDateRange] = useState(false);
  const [darkmode, setDarkmode] = useState(false);
  const [hoveredClue, setHoveredClue] = useState(false);
  const [showIncorrect, setShowIncorrect] = useState(false);
  const [initialGuesses, setInitialGuesses] = useState([]);
  const [guestInputChange, setGuestInputChange] = useState([]);

  // Username
  const [name, setName] = useState(false);
  // Username logic
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  const [showSidePanel, setShowSidePanel] = useState(false);

  // Finish screen
  const [showFinishScreen, setShowFinishScreen] = useState(false);

  useEffect(() => {
    const path = window.location.pathname;
    let room = false;
    if (path) {
      room = path.split("/")[1];
      setRoom(room);
    }

    const connection = socketIOClient(ENDPOINT);
    setSocketConnection(connection);

    smoothscroll.polyfill();

    // Good
    connection.on("reject", () => {
      window.location.href = `/`;
    });

    // Good
    connection.on("connect", () => {
      connection.emit("join", room);

      // Attempting to fix tab unfocus issue
      if (name) {
        connection.emit("name", name);
      }
    });

    connection.on("id", (id) => {
      setClientId(id);

      // Attempting to fix tab unfocus issue
      if (name) {
        connection.emit("name", name);
      }
    });

    // Sends board time once on connect
    connection.on("timestamp", (time) => {
      setTimestamp(time);
    });

    // Perhaps this should just be passed as a property of "scores"?
    connection.on("completed", (time) => {
      if (time) {
        setCompletedAtTimestamp(time);
      }
    });

    connection.on("guesses", (data) => {
      setInitialGuesses(data);
    });

    connection.on("board", (board) => {
      setData(board);
    });

    // Alert should do more than just setLoading...
    connection.on("loading", (boolean) => {
      setLoading(boolean);

      // Reset stuff
      setFocus(false);
      setHighlightedSquares([]);
      setHoveredClue(false);
      setSelectedSquare(false);
      setGuestHighlights(false);
      setShowIncorrect(false);
    });

    // Good
    connection.on("inputChange", (data) => {
      setGuestInputChange(data);
    });

    // Good
    connection.on("newPlayer", (data) => {
      setPlayers(data);
    });

    // Sends at end of game to show guest scores
    // Good for now...
    connection.on("scores", (data) => {
      setScores(data);
    });

    // Good
    connection.on("newHighlight", (data) => {
      let filteredHighlights = {};

      // Grab first square of every guest highlight to place nametag
      let nametags = [];
      let nametagLookup = [];
      for (const [key, value] of Object.entries(data)) {
        if (value.room === room) {
          filteredHighlights[key] = value;

          nametags.push(value.squares[0]);
          nametagLookup.push({
            id: value.id,
            location: value.squares[0],
            name: value.name,
            color: value.color,
          });
        }
      }
      setGuestHighlights(filteredHighlights);
      setNametagLocations(nametags);
      setNametagData(nametagLookup);
    });

    return () => connection.disconnect();
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      checkName(input);
    }
  };

  // IMPORTANT TODO: remove guesses from <Square/>
  const checkName = (name) => {
    if (name.length <= 6) {
      setName(input);
      localStorage.setItem("username", input);
      setError(false);
    } else {
      setError(true);
    }
  };

  const handleChange = (i) => {
    if (i.nativeEvent.data) {
      return setInput(input + i.nativeEvent.data);
    } else if (i.nativeEvent.data === null) {
      return setInput(input.slice(0, -1));
    }
  };

  if (!data || loading || !socketConnection) {
    return (
      <div css={[styles.appBackground(darkmode), { height: "100vh" }]}>
        <Header props={{ isLoading: true }} />
        <div css={styles.loadingSpinner}>
          <div css={styles.loadingRing}>
            <div></div>
            <div></div>
          </div>
          {name ? (
            <p>
              Joining puzzle as <b>{name}</b>...
            </p>
          ) : (
            <p>Loading puzzle...</p>
          )}
        </div>
      </div>
    );
  } else {
    return (
      <div css={styles.appBackground(darkmode)}>
        <Header props={{ isLoading: false, room }} />

        {name && showFinishScreen && (
          <Popup>
            <h1>Crossword solved!</h1>
            {scores && (
              <ul css={styles.scores}>
                {calculateScores(timestamp, completedAtTimestamp, scores)}
              </ul>
            )}
            <br />
            <Button
              props={{
                onClickFn: () => setShowFinishScreen(false),
                darkmode: false,
                text: "Back to puzzle",
                icon: { name: "arrow-back-circle", size: 16 },
              }}
            />
          </Popup>
        )}
        {!name && (
          <Popup>
            <h1>Enter a username</h1>
            <p>
              Must be <strong>6 or fewer</strong> letters.
            </p>
            <br />
            <input
              autoFocus
              onKeyDown={handleKeyDown}
              css={styles.textInput}
              value={input}
              onChange={(i) => handleChange(i)}
              placeholder="Username"
              type="text"
            ></input>
            <Button
              props={{
                onClickFn: () => checkName(input),
                darkmode: false,
                text: "Save",
                icon: { name: "checkmark-circle", size: 16 },
              }}
            />
            {error && (
              <p css={{ fontSize: 14, padding: 0, color: "red" }}>
                Too many letters!
              </p>
            )}
          </Popup>
        )}

        {/* Causing issue on-reload in Safari */}
        {/* <Shortcuts props={{ show: showSidePanel, darkmode }} /> */}
        <Nav props={{ darkmode, setDarkmode, players, socketConnection }} />
        <div css={styles.appContainer}>
          <main>
            <Metadata props={{ data }} />
            <Game
              props={{
                completedAtTimestamp,
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
                darkmode,
                setDarkmode,
                name,
                setName,
                showFinishScreen,
                setShowFinishScreen,
                showFinishScreen,
                hoveredClue,
                setHoveredClue,
                showIncorrect,
                setShowIncorrect,
                initialGuesses,
                guestInputChange,
                setGuestInputChange,
              }}
            />

            <div css={{ marginTop: 6 }}>
              {/* <span
                css={{ marginRight: 8 }}
                onClick={() => setShowSidePanel(showSidePanel ? false : true)}
              >
                <Button
                  props={{
                    darkmode,
                    text: "Shortcuts",
                    icon: { name: "flash", size: 14 },
                  }}
                />
              </span> */}

              <span css={{ marginRight: 8 }}>
                <DateSelector
                  props={{
                    darkmode,
                    socketConnection,
                    dateRange,
                    setDateRange,
                  }}
                />
              </span>

              <PuzzleSelector
                props={{
                  darkmode,
                  dateRange,
                  socketConnection,
                }}
              />

              <p
                css={{
                  display: "inline-block",
                  fontSize: 14,
                  paddingLeft: 12,
                  paddingRight: 4,
                }}
              >
                Playing as <strong>{name || "anon"}</strong>
              </p>
              <a
                css={{
                  fontSize: 14,
                  color: darkmode ? "#8e8e8e" : "blue",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
                onClick={() => setName(false)}
              >
                edit
              </a>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
