/** @jsx jsx */

import { useEffect, useState, Fragment } from "react";
import { jsx } from "@emotion/react";
import { scale, fonts, colors, ENDPOINT } from "../lib/helpers";
import Button from "../components/button";
import { useRouter } from 'next/router'

const textInput = scale({
  padding: "8px 9px 8px 9px",
  border: `1px solid ${colors.slate}`,
  borderRadius: 2,
  marginRight: 12,
  fontFamily: fonts.monospace,
  "&::placeholder": {
    fontFamily: fonts.monospace,
    },
  width: 280,
});

const resultBox = scale({
  textAlign: 'left',
  padding: '16px 8px 16px 16px',
  border: '1px solid #333',
  borderBottom: '2px solid #333',
  borderRadius: 4,
  h2: {
    fontSize: 18,
    margin: 0,
    marginBottom: 6,
  },
  cursor: 'pointer',
  p: {
    margin: 0,
    marginBottom: 4,
    ':last-of-type': {
      fontStyle: 'italic',
      marginTop: 12,
    }
  },
  ':first-of-type': {
    marginTop: 64,
  },
  marginBottom: 16,
  ':hover': {
    borderBottom: '4px solid #333',
    marginBottom: 14,
  }
})

export default function Search() {
  const [string, setString] = useState("");
  const [results, setResults] = useState([]);
  const [roomOrigin, setRoomOrigin] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (router.query.room) {
      setRoomOrigin(router.query.room);
    }
  }, [router])


  const handleChange = (e) => {
    setString(e.target.value);
  };
    
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      searchPuzzles(string);
    }
  };
    
  const searchPuzzles = async (string) => {
    if (string.length < 3) {
      alert('Search query must be more than 3 characters long.');
      return;
    }
    const res = await fetch(`${ENDPOINT}/search?string=${string}`);
    const data = await res.json();
    if (data.error) {
      alert("Invalid string");
      setString("");
    }
    if (data.puzzles) {
      setResults(data.puzzles);
    }
  };

  return (
    <Fragment>
      <div
        css={{
          textAlign: "center",
          margin: "auto",
          marginTop: 84,
          marginBottom: 84,
          width: 600,
          maxWidth: '90%',
        }}
      >
        <h1>Search for a puzzle</h1>
        <input
          autoFocus
          onKeyDown={handleKeyDown}
          css={textInput}
          onChange={(e) => handleChange(e)}
          placeholder="Type something"
          type="text"
        ></input>
              
        <Button
          props={{
            onClickFn: () => searchPuzzles(string),
            darkmode: false,
            text: "Search",
            icon: { name: "search-outline", size: 16 },
          }}
        />

        <p>{results.length} results found (showing newest to oldest).</p>
        {results.reverse().map(result => (
          <div css={resultBox}>
            <a href={`/${roomOrigin}?puzzle=${result.date}`}>
              <h2
                dangerouslySetInnerHTML={{
                  __html: result.title
                }}
              />
              <p
                dangerouslySetInnerHTML={{
                  __html: `Published ${result.date}`
                }}
              />
              <p
                dangerouslySetInnerHTML={{
                  __html: `by ${result.author}`
                }}
              />
              <br />
              <p
                dangerouslySetInnerHTML={{
                  __html: `Difficulty: ${result.dow}`
                }}
              />
              <p
                dangerouslySetInnerHTML={{
                  __html: `“${result.match.replace(string.toLowerCase(), `<span style="background-color: #ffa500a8; border-radius: 2px;">${string.toLowerCase()}</span>`)}”`
                }}
            />
            </a>
          </div>
        ))}
      </div>
    </Fragment>
  );
}
