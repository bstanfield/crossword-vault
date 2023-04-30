/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from "@emotion/react";
import { scale, colors, fonts } from "../lib/helpers";

export default function PuzzleSelector({ props }) {
  const { room, darkmode, socketConnection, dateRange } = props;

  const selectStyles = (darkmode) =>
    scale({
      display: "inline-block",
      margin: 0,
      padding: 8,
      backgroundColor: darkmode ? colors.slate : colors.lightgrey,
      fontSize: 13,
      color: darkmode ? colors.lightgrey : colors.slate,
      borderRadius: 2,
      fontFamily: fonts.monospace,
      cursor: "pointer",
      border: "1px solid transparent",
      WebkitAppearance: "none",
      MozAppearance: "none",
    });

  return (
    <select
      onChange={(event) => {
        if (event.target.value === "Search") {
          window.location.href = `/search?room=${room}`;
          // Send to /search
        } else {
          socketConnection.send({
            type: "newPuzzle",
            value: {
              dow: event.target.value,
              daily: event.target.value === "Today's" ? true : false,
              dateRange,
            },
          });
        }
      }}
      css={selectStyles(darkmode)}
      name="newPuzzle"
      id="newPuzzle"
      defaultValue="New puzzle ▼"
    >
      <option value="New puzzle ▼" disabled>
        New puzzle ▼
      </option>
      <option value={"Today's"}>Today's</option>
      <option disabled>---------</option>
      <option value="Search">Search</option>
      <option disabled>---------</option>
      <option value="Monday">Monday</option>
      <option value="Tuesday">Tuesday</option>
      <option value="Wednesday">Wednesday</option>
      <option value="Thursday">Thursday</option>
      <option value="Friday">Friday</option>
      <option value="Saturday">Saturday</option>
      <option value="Sunday">Sunday</option>
    </select>
  );
}
