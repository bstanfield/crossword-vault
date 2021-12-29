/** @jsx jsx */

import { jsx } from "@emotion/react";
import Game from "./game";
import { Fragment, useEffect, useState } from "react";
import socketIOClient from "socket.io-client";
import { fonts, ENDPOINT } from "../lib/helpers";
import smoothscroll from "smoothscroll-polyfill";
import styles from "../lib/boardStyles";
import Header from "../components/header";
import Shortcuts from "../components/shortcuts";
import Popup from "../components/popup";
import Players from "../components/players";
import Metadata from "../components/metadata";
import Button from "../components/button";
import Alert from "../components/alert";
import PuzzleSelector from "../components/puzzleSelector";
import DateSelector from "../components/DateSelector";
import Icon from "../components/icon";

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
  const [darkmode, setDarkmode] = useState(false);
  // Username
  const [name, setName] = useState(false);
  // Username logic
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  const [showSidePanel, setShowSidePanel] = useState(false);

  // Finish screen
  const [complete, setComplete] = useState(false);

  // TODO: Move things that fire on input change to game.js!
  // TODO: Move stuff that *will* change like setGuesses out of here
  // TODO: Only stuff that *should* be here is stuff that hardly changes,
  // and is needed for metadata and other pieces that should not re - render
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
    // Good
    connection.on("timestamp", (time) => {
      setTimestamp(time);
    });

    // Good
    connection.on("completed", (time) => {
      if (time) {
        console.log("setting timestamp");
        setCompletedAtTimestamp(time);
      }
    });

    // Good
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
    // TODO: Why does this fire all the time?
    // Good for now...
    connection.on("scores", (data) => {
      if (completedAtTimestamp) {
        setScores(data);
      }
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

  const handleChange = (i) => {
    if (i.nativeEvent.data) {
      return setInput(input + i.nativeEvent.data);
    } else if (i.nativeEvent.data === null) {
      return setInput(input.slice(0, -1));
    }
  };

  console.log("Rendering room");

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

        {name && complete && (
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
                onClickFn: () => setComplete(false),
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

        <Shortcuts props={{ show: showSidePanel, darkmode }} />
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
            <Players
              props={{ darkmode, setDarkmode, players, socketConnection }}
            />

            <div>
              <p css={styles.logo}>Word Vault</p>
            </div>
          </div>
        </div>
        <div css={styles.appContainer}>
          <main>
            <Metadata props={{ data }} />
            <Game
              props={{
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
              }}
            />

            <div css={{ marginTop: 6 }}>
              <Alert
                props={{
                  guesses,
                  grading,
                  showIncorrect,
                  setShowIncorrect,
                  setComplete,
                }}
              />
              <span
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
              </span>

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
