/** @jsx jsx */

import { jsx } from "@emotion/react";
import { scale } from "../lib/helpers";

const fancyHeader = scale({
  fontSize: 22,
  margin: 0,
  padding: 0,
  display: "inline-block",
});

const getOrdinal = (i) => {
  var j = i % 10,
    k = i % 100;
  if (j == 1 && k != 11) {
    return i + "st";
  }
  if (j == 2 && k != 12) {
    return i + "nd";
  }
  if (j == 3 && k != 13) {
    return i + "rd";
  }
  return i + "th";
};

const formatDate = (date) => {
  // takes in 5/26/2000 --> May 26, 2000
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const splits = date.split("/");
  const month = months[splits[0] - 1];
  const day = splits[1];
  const year = splits[2];

  const ordinal = getOrdinal(day);

  return `${month} ${ordinal}, ${year}`;
};

export default function Metadata({ props }) {
  const { data, darkmode } = props;
  const url = `https://www.xwordinfo.com/Crossword?date=${data.date}`;

  return (
    <div>
      <h1 css={fancyHeader}>
        {data && data.dow === "Sunday"
          ? data.title
          : `${data.dow}, ${formatDate(data.date)}`}
      </h1>
      <p
        css={scale({
          padding: 0,
          marginLeft: [0, 0, 8, 8],
          marginTop: 6,
          marginBottom: -8,
          display: "inline-block",
        })}
      >
        {data ? "by " + data.author : "Retrieving puzzle details..."}{" "}
        <a
          style={{
            fontSize: 14,
            color: darkmode ? "#8e8e8e" : "blue",
            textDecoration: "underline",
            cursor: "pointer",
          }}
          href={url}
          target="_blank"
        >
          (Details)
        </a>
      </p>
      {data && data.dow === "Sunday" && (
        <p css={{ padding: 0, marginTop: 6, marginBottom: -8 }}>
          {formatDate(data.date)}
        </p>
      )}
    </div>
  );
}
