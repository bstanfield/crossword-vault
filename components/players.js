/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from "@emotion/react";
import { scale } from "../lib/helpers";
import Button from "./button";
import Icon from "./icon";
import { Fragment, useState } from "react";

const playersBox = (isCollapsed) =>
  scale({
    display: isCollapsed ? "none" : "block",
    float: "right",
    marginTop: 2,
    fontSize: 20,
    p: {
      marginLeft: 12,
    },
  });

const collapseBox = scale({
  float: "left",
  marginTop: 2,
  marginLeft: -24,
  fontSize: 20,
  p: {
    marginLeft: 12,
  },
});

export default function Players({ props }) {
  const {
    isCollapsed,
    handleIsCollapsed,
    darkmode,
    players,
    setDarkmode,
    socketConnection,
  } = props;

  return (
    <Fragment>
      <div css={collapseBox}>
        <Button
          props={{
            onClickFn: () => handleIsCollapsed(),
            darkmode,
            text: isCollapsed ? "Open" : "Collapse",
            icon: {
              name: "chevron-down",
              size: 14,
            },
          }}
        />
      </div>
      <div css={playersBox(isCollapsed)}>
        <Button
          props={{
            onClickFn: () =>
              socketConnection.send({
                type: "newPuzzle",
                value: { dow: null, daily: true },
              }),
            darkmode,
            text: "Today's Puzzle!",
            icon: {
              name: "star",
              size: 14,
            },
            backgroundColor: "#ffa500",
          }}
        />
        <Button
          props={{
            onClickFn: () => {
              localStorage.setItem("darkmode", !darkmode);
              setDarkmode(!darkmode);
            },
            darkmode,
            text: darkmode ? "Light" : "Dark",
            icon: {
              name: darkmode ? "sunny" : "moon",
              size: 13,
            },
          }}
        />
        <Button
          props={{
            darkmode,
            inactive: true,
            text: players,
            icon: { name: "people", size: 14 },
          }}
        />
      </div>
    </Fragment>
  );
}
