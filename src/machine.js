import { createMachine, assign, send } from "xstate";
import { interval$ } from "./observables";
import actions from "./actions";
import guards from "./guards";

export const boardMachine = createMachine({
  id: "board",
  initial: "idle",
  context: {
    board: Array(20).fill(Array(10).fill(0)),
    updated: Array(20).fill(Array(10).fill(0)),
    ms: 500,
    boardHeight: 20,
    row: 0,
    col: 0,
    lastDrop: null,
    tetro: null,
    orientation: "up"
  },
  states: {
    idle: {
      on: {
        INIT: {
          target: "started",
          actions: assign({
            tetro: (ctx, ev) => ev.tetro,
            col: 3,
            row: 0
          })
        }
      }
    },
    started: {
      id: "tetromino",
      initial: "falling",
      states: {
        falling: {
          entry: send("UPDATE"),
          invoke: {
            src: ({ ms }) => interval$
          },
          on: {
            START_ROTATING: {
              target: "rotating",
              actions: send("ROTATE")
            },
            DROP: {
              target: "locked",
              actions: send("START_DROP"),
              cond: guards.isNewTetroDrop
            },
            INC_ROW: {
              actions: [actions.incrementRow, send("UPDATE")]
            },
            MOVE_LEFT: {
              actions: [actions.decrementCol, send("UPDATE")]
            },
            MOVE_RIGHT: {
              actions: [actions.incrementCol, send("UPDATE")]
            }
          }
        },
        dropped: {
          on: {
            NEW_TETRO: {
              target: "falling",
              actions: [actions.getNewTetro, actions.initializeTetroPosition]
            }
          }
        },
        rotating: {
          on: {
            ROTATE: {
              actions: actions.rotate
            }
          },
          after: {
            100: "falling"
          }
        },
        locked: {
          on: {
            START_DROP: {
              actions: [
                actions.dropTetro,
                actions.updateLastDropPosition,
                send("UPDATE")
              ],
              target: "falling"
            }
          }
        }
      },
      on: {
        UPDATE: [
          {
            target: "end",
            cond: guards.isBoardFull
          },
          {
            target: ".dropped",
            actions: [send("NEW_TETRO"), actions.updateBoard],
            cond: guards.didHitBottom
          },
          {
            target: ".dropped",
            actions: [send("NEW_TETRO"), actions.updateBoard],
            cond: guards.isDropped
          },
          {
            actions: actions.updateTetroPosition
          }
        ]
      }
    },
    end: {
      type: "final"
    }
  }
});
