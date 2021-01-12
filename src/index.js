import "./styles.css";
import React from "react";
import ReactDOM from "react-dom";
import { useMachine } from "@xstate/react";
import { inspect } from "@xstate/inspect";
import { useEffect, useRef } from "react";
import { of } from "rxjs";

import tetrodb from "./tetrodb.json";
import { boardMachine } from "./machine";
import { upPress$, leftPress$, spacePress$, rightPress$ } from "./observables";

inspect({
  url: "https://statecharts.io/inspect",
  iframe: false
});

function getTetro() {
  var types = ["S", "Z", "I", "L", "J", "O", "T"];

  var index = Math.floor(Math.random() * 6);
  var tetro = types[index];

  return tetrodb[tetro];
}

function App() {
  const [currentState, send] = useMachine(boardMachine, { devTools: true });
  const appRef = useRef(null);

  useEffect(() => {
    of(getTetro()).subscribe((tetro) => send("INIT", { tetro }));
  }, [send]);

  useEffect(() => {
    const subs = [
      spacePress$.subscribe(() => send("DROP")),
      upPress$.subscribe(() => send("START_ROTATING")),
      rightPress$.subscribe(() => send("MOVE_RIGHT")),
      leftPress$.subscribe(() => send("MOVE_LEFT"))
    ];

    return () => subs.forEach((sub) => sub.unsubscribe());
  }, [send, currentState]);

  return (
    <div
      ref={appRef}
      className="App"
      style={{
        width: "350px",
        height: "700px",
        maxWidth: 800,
        display: "grid",
        background: "#1E1E24",
        borderRadius: 8,
        gridTemplateColumns: "repeat(10, 1fr)",
        gridAutoRows: "1fr",
        gridGap: 4,
        margin: "auto",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
    >
      {currentState.context.updated.map((line, i) =>
        line.map((item, j) =>
          item ? (
            <div
              key={j}
              style={{
                background: item.color
              }}
            ></div>
          ) : (
            <div
              key={j}
              style={{
                background: "#131416"
              }}
            ></div>
          )
        )
      )}
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
