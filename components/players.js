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

const collapseBox = (isCollapsed) =>
  scale({
    float: "left",
    marginTop: isCollapsed ? -18 : 2,
    marginLeft: [-16, -16, -34, -34],
    fontSize: 20,
    p: {
      marginLeft: 12,
    },
  });

export default function Players({ props }) {
  const {
    isCollapsed,
    setCollapsed,
    darkmode,
    players,
    setDarkmode,
    socketConnection,
  } = props;

  return (
    <Fragment>
      <div css={collapseBox(isCollapsed)}>
        <Button
          props={{
            onClickFn: () => setCollapsed(!isCollapsed),
            darkmode,
            text: isCollapsed ? "Expand" : "Collapse",
            icon: {
              name: isCollapsed ? "chevron-down" : "chevron-up",
              size: 14,
            },
          }}
        />
      </div>
      <div css={playersBox(isCollapsed)}>
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
            backgroundColor: "transparent !important",
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
