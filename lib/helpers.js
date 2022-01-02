import { css } from "@emotion/react";
import { Fragment } from "react";
import facepaint from "facepaint";
import Icon from "../components/icon";

// export const ENDPOINT = process.env.NODE_ENV === 'production'
//   ? 'https://multiplayer-crossword-server.herokuapp.com'
//   : 'http://127.0.0.1:4001'

export const ENDPOINT = "https://multiplayer-crossword-server.herokuapp.com";
// export const ENDPOINT = 'https://wordvault-pr-8.herokuapp.com'

export const fonts = {
  serif: "",
  sans: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif",
  monospace: "JetBrains Mono, monospace",
  headline: "Old Standard TT, Serif",
};

export const colors = {
  slate: "#333",
  lightgrey: "#eee",
  mediumgrey: "#d2d2d2",
  offwhite: "#f5f5f5",
  error: "#e61818",
  success: "green",
};

// Media queries and Emotion CSS
export const mq = facepaint([
  "@media(min-width: 520px)",
  "@media(min-width: 750px)",
  "@media(min-width: 1100px)",
  "@media(min-width: 1500px)",
]);

export const scale = (x) => css(mq(x));

export const formatTime = (seconds) => {
  let days = 0;
  let hours = 0;
  let minutes = Math.floor(seconds / 60);
  let remainingSeconds = 0;

  if (seconds < 60) {
    minutes = 0;
    remainingSeconds = seconds;
  } else {
    minutes = Math.floor(seconds / 60);
    remainingSeconds = (seconds % 60) % 60;
  }

  if (minutes > 60) {
    hours = Math.floor(minutes / 60);
    minutes = Math.floor(((minutes % 60) / 100) * 60);
    remainingSeconds = (seconds % 60) % 60;
  }

  if (remainingSeconds === 60) {
    remainingSeconds = 0;
  }

  let leadingSecond = "";
  let leadingMinute = "";
  let leadingHour = "";

  if (Math.round(remainingSeconds) < 10) {
    leadingSecond = 0;
  }
  if (minutes < 10) {
    leadingMinute = 0;
  }
  if (hours < 10) {
    leadingHour = 0;
  }

  if (hours > 24) {
    days = hours / 24;
    return `${Math.floor(days)} day${days > 1 ? "s" : ""} and ${
      hours % 24
    } hour${hours > 1 ? "s" : ""}`;
  }

  return `${
    hours > 0 ? `${leadingHour}${hours} hour(s),` : ""
  } ${leadingMinute}${minutes} minutes, and ${leadingSecond}${Math.round(
    remainingSeconds
  )} seconds`;
};

export const calculateScores = (timestamp, completedAtTimestamp, scores) => {
  // Hotstreak
  let hotStreakScores = {};
  for (const [key, val] of Object.entries(scores.hotStreak)) {
    const highScore = val.reduce((i, x) => {
      if (!i) return x;
      if (x > i) return x;
      return i;
    });
    hotStreakScores[key] = highScore;
  }
  let highScoreHotStreak = { name: "", score: 0 };
  for (const [key, val] of Object.entries(hotStreakScores)) {
    if (val > highScoreHotStreak.score) {
      highScoreHotStreak = { name: key, score: val };
    }
  }

  // Marksman
  let marksmanScores = {};
  for (const [key, val] of Object.entries(scores.highestAccuracy)) {
    const accuracy = val.correct / (val.correct + val.incorrect);
    marksmanScores[key] = accuracy;
  }

  let highscoreAccuracy = { name: "", score: 0 };
  for (const [key, val] of Object.entries(marksmanScores)) {
    if (Math.round(val * 100) > highscoreAccuracy.score) {
      highscoreAccuracy = { name: key, score: Math.round(val * 100) };
    }
  }

  // Tough letters
  let highscoreToughLetters = { name: "", score: 0 };
  for (const [key, val] of Object.entries(scores.toughLetters)) {
    if (val > highscoreToughLetters.score) {
      highscoreToughLetters = { name: key, score: val };
    }
  }

  // Thief
  let highscoreThief = { name: "", score: 0 };
  for (const [key, val] of Object.entries(scores.thief)) {
    if (val > highscoreThief.score) {
      highscoreThief = { name: key, score: val };
    }
  }

  // Benchwarmer
  let lowscoreBenchwarmer = { name: "", score: 0 };
  for (const [key, val] of Object.entries(scores.benchwarmer)) {
    if (lowscoreBenchwarmer.score === 0) {
      lowscoreBenchwarmer = { name: key, score: val };
    } else {
      if (val < lowscoreBenchwarmer.score) {
        lowscoreBenchwarmer = { name: key, score: val };
      }
    }
  }

  // Workhorse
  let highscoreWorkhorse = { name: "", score: 0 };
  if (scores.workhorse) {
    for (const [key, val] of Object.entries(scores.workhorse)) {
      if (highscoreWorkhorse.score === 0) {
        highscoreWorkhorse = { name: key, score: val };
      } else {
        if (val > highscoreWorkhorse.score) {
          highscoreWorkhorse = { name: key, score: val };
        }
      }
    }
  }

  // Editor
  let highscoreEditor = { name: "", score: 0 };
  if (scores.editor) {
    for (const [key, val] of Object.entries(scores.editor)) {
      if (highscoreEditor.score === 0) {
        highscoreEditor = { name: key, score: val };
      } else {
        if (val > highscoreEditor.score) {
          highscoreEditor = { name: key, score: val };
        }
      }
    }
  }

  const minutesHoursOrDaysToComplete = (timestamp, completedAtTimestamp) => {
    // startDate = beginning of crossword
    const startDate = new Date(timestamp);
    const completedAt = new Date(completedAtTimestamp);

    const secondsToComplete =
      (completedAt.getTime() - startDate.getTime()) / 1000;
    return formatTime(secondsToComplete);
  };

  return (
    <Fragment>
      {completedAtTimestamp && (
        <li>
          <Icon
            props={{ color: "orange", name: "stopwatch", size: 18, height: 14 }}
          />
          Completed in:{" "}
          {minutesHoursOrDaysToComplete(timestamp, completedAtTimestamp)}
        </li>
      )}
      <li>
        <Icon props={{ color: "red", name: "flame", size: 16, height: 14 }} />
        <strong>{highScoreHotStreak.name}:</strong> &ldquo;Hotstreak&rdquo; (
        {highScoreHotStreak.score} correct letters in a row)
      </li>
      {highscoreAccuracy.score > 50 && highscoreAccuracy.score < 100 && (
        <li>
          <Icon
            props={{ color: "green", name: "disc", size: 16, height: 14 }}
          />
          <strong>{highscoreAccuracy.name}:</strong> &ldquo;Marksman&rdquo; (
          {highscoreAccuracy.score}% accuracy)
        </li>
      )}
      {highscoreAccuracy.score > 99 && (
        <li>
          <Icon
            props={{
              color: "green",
              name: "shield-checkmark",
              size: 16,
              height: 14,
            }}
          />
          <strong>{highscoreAccuracy.name}:</strong> &ldquo;Perfectionist&rdquo;
          (100% accuracy)
        </li>
      )}

      {highscoreThief.score > 2 && (
        <li>
          <Icon
            props={{ color: "purple", name: "sad", size: 16, height: 14 }}
          />
          <strong>{Object.keys(scores.thief)[0]}:</strong> &ldquo;Thief&rdquo;
          (Answered the last letter of {Object.values(scores.thief)[0]} words)
        </li>
      )}
      {highscoreToughLetters.score >= 4 && (
        <li>
          <Icon
            props={{ color: "navy", name: "school", size: 16, height: 14 }}
          />
          <strong>{highscoreToughLetters.name}:</strong> &ldquo;Tough
          Letters&rdquo; ({highscoreToughLetters.score} X, Y, or Z letters)
        </li>
      )}
      {lowscoreBenchwarmer.score < 35 && lowscoreBenchwarmer.score > 0 && (
        <li>
          <Icon
            props={{ color: "skyblue", name: "snow", size: 16, height: 14 }}
          />
          <strong>{lowscoreBenchwarmer.name}:</strong> &ldquo;Still warming
          up...&rdquo; (Only {lowscoreBenchwarmer.score} correct letters)
        </li>
      )}
      {highscoreWorkhorse.score > 75 && (
        <li>
          <Icon
            props={{ color: "purple", name: "barbell", size: 16, height: 14 }}
          />
          <strong>{highscoreWorkhorse.name}:</strong> &ldquo;Heavy lifter&rdquo;
          ({highscoreWorkhorse.score} correct answers)
        </li>
      )}
      {highscoreEditor.score > 2 && (
        <li>
          <Icon
            props={{ color: "red", name: "medical", size: 18, height: 14 }}
          />
          <strong>{highscoreEditor.name}:</strong> &ldquo;Medic&rdquo; (Fixed{" "}
          {highscoreEditor.score} incorrect guesses)
        </li>
      )}

      {/* <li css={{ marginTop: 6 }}><Icon props={{ color: 'green', name: 'leaf', size: 16, height: 14 }} /><strong css={{ color: 'green' }}>Crossword for Climate</strong><br /><div css={{ marginLeft: 24, marginTop: 4, marginBottom: 8, lineHeight: 1.5 }}>$0.50 contributed to the Wren Climate Fund as a reward for finishing a crossword on Word Vault!</div></li> */}
    </Fragment>
  );
};

const createDownGroupings = (crossword) => {
  const { grid } = crossword;

  const tempWidth = crossword.size.rows;
  const tempHeight = crossword.size.cols;
  const tempTotalSquares = tempWidth * tempHeight;

  let position = 1;
  let grouping = [];
  while (position <= tempTotalSquares) {
    if (grid[position - 1] !== ".") {
      let match = false;
      if (grouping.length === 0) {
        grouping.push([position]);
      } else {
        grouping.map((group, index) => {
          if (group.includes(position - tempWidth)) {
            match = true;
            grouping[index].push(position);
          }
        });
        if (!match) {
          grouping.push([position]);
        }
      }
    }
    position++;
  }
  return grouping;
};

export const createBoard = (
  crossword,
  setDownGroupings,
  setAcrossGroupings,
  setGuesses
) => {
  const { grid, gridnums } = crossword;

  // board ratios (dynamic)
  const width = crossword.size.rows;
  const height = crossword.size.cols;
  const totalSquares = width * height;

  let partial = 0;
  let arr = [];
  let acrossGrouping = [];
  let acrossGroupings = [];
  let rowPosition = 0;
  let guesses = [];

  while (partial < totalSquares) {
    partial++;
    rowPosition++;

    // Reset grouping after each dot OR after <width> squares
    if (grid[partial - 1] === ".") {
      acrossGroupings.push(acrossGrouping);
      acrossGrouping = [];
    } else {
      acrossGrouping.push(partial);
    }
    if (rowPosition === width) {
      acrossGroupings.push(acrossGrouping);
      acrossGrouping = [];
      rowPosition = 0;
    }

    arr.push({
      acrossGrouping,
      number: gridnums[partial - 1],
      letter: grid[partial - 1],
      position: partial,
    });
  }
  const downGroupings = createDownGroupings(crossword);
  setDownGroupings(downGroupings.filter((grouping) => grouping.length > 0));
  setAcrossGroupings(acrossGroupings.filter((grouping) => grouping.length > 0));
  return arr;
};
