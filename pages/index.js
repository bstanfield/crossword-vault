/** @jsx jsx */

import { useEffect, useState, Fragment } from "react";
import { jsx } from "@emotion/react";
import { scale, fonts, colors, ENDPOINT } from "../lib/helpers";
import Button from "../components/button";
import Header from "../components/header";

const textInput = scale({
  padding: "8px 9px 8px 9px",
  border: `1px solid ${colors.slate}`,
  borderRadius: 2,
  marginRight: 12,
  fontFamily: fonts.monospace,
  "&::placeholder": {
    fontFamily: fonts.monospace,
  },
});

export default function Index() {
  const [key, setKey] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (success) {
      window.location.href = `/${key}`;
    }
  }, [success]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      checkKey(key);
    }
  };

  const checkKey = async (key) => {
    const res = await fetch(`${ENDPOINT}/secret?key=${key.toLowerCase()}`);
    const data = await res.json();
    if (data.error) {
      alert("Invalid key");
      setKey("");
    } else {
      setSuccess(true);
    }
  };

  const handleChange = (i) => {
    if (i.nativeEvent.data) {
      return setKey(key + i.nativeEvent.data);
    } else if (i.nativeEvent.data === null) {
      return setKey(key.slice(0, -1));
    }
  };

  return (
    <Fragment>
      <Header
        props={{
          isLoading: false,
        }}
      />
      <div
        css={{
          textAlign: "center",
          position: "absolute",
          top: "30vh",
          bottom: 0,
          right: 0,
          left: 0,
          margin: "auto",
        }}
      >
        <h1>Enter your key</h1>
        <input
          autoFocus
          onKeyDown={handleKeyDown}
          css={textInput}
          value={key}
          onChange={(i) => handleChange(i)}
          placeholder="Your key"
          type="text"
        ></input>
        <Button
          props={{
            onClickFn: () => checkKey(key),
            darkmode: false,
            text: "Enter",
            icon: { name: "enter-outline", size: 16 },
          }}
        />
      </div>
    </Fragment>
  );
}
