import { assign } from "xstate";
import {
  equals,
  all,
  complement,
  reduceWhile,
  repeat,
  compose,
  inc,
  dec,
  add,
  gt,
  negate,
  not,
  prop
} from "ramda";
import tetrodb from "./tetrodb";
import {
  tetroGenerator,
  getNewSpotValue,
  getTetroFirstCol,
  getTetroFirstRow,
  getTetroLastCol,
  getTetroLastRow,
  getMatrixSlicer,
  isDropped,
  isTouchingTetros
} from "./utils";

var getTetro = tetroGenerator(tetrodb);

export default {
  updateTetroPosition: assign({
    updated: (ctx) =>
      ctx.board.map((row, i) =>
        row.map((col, j) =>
          getNewSpotValue({
            tetro: ctx.tetro[ctx.orientation].map((line) =>
              line.map((x) =>
                x ? { color: ctx.tetro.color, border: ctx.tetro.border } : 0
              )
            ),
            row: i - ctx.row,
            col: j - ctx.col,
            originalValue: col
          })
        )
      )
  }),
  updateBoard: assign({
    board: ({ updated, boardHeight }) => {
      var isRowFull = all(complement(equals(0)));

      var fullRowsDestroyed = updated.filter(complement(isRowFull));
      const length = fullRowsDestroyed.length;

      var emptyRows =
        length < boardHeight
          ? Array(boardHeight - length).fill(Array(10).fill(0))
          : [];

      return [...emptyRows, ...fullRowsDestroyed];
    }
  }),
  dropTetro: assign({
    row: (ctx) => {
      const dropAtRow =
        reduceWhile(
          complement(isDropped(ctx)),
          inc,
          ctx.row,
          repeat(0, ctx.boardHeight - ctx.row)
        ) - 1;

      var lastRow = getTetroLastRow(ctx.tetro[ctx.orientation]);

      const row =
        dropAtRow === 19 ? dropAtRow - lastRow + (lastRow ? 1 : 0) : dropAtRow;

      return row;
    }
  }),
  updateLastDropPosition: assign({
    lastDrop: prop("row")
  }),
  rotate: assign({
    orientation: (ctx) => {
      var orientations = ["up", "right", "down", "left"];

      const index = (orientations.findIndex(equals(ctx.orientation)) + 1) % 4;

      return isDropped({ ...ctx, orientation: orientations[index] }, ctx.row)
        ? ctx.orientation
        : orientations[index];
    }
  }),
  initializeTetroPosition: assign({
    col: ({ tetro, orientation }) => {
      const firstCol = getTetroFirstCol(tetro[orientation]);
      const lastCol = getTetroLastCol(tetro[orientation]);
      const tetroCenter = Math.floor((lastCol - firstCol + 1) / 2);
      const boardCenter = 5;

      return -firstCol + boardCenter - tetroCenter;
    },
    row: compose(
      negate,
      getTetroFirstRow,
      ({ tetro, orientation }) => tetro[orientation]
    )
  }),
  getNewTetro: assign({
    tetro: () => getTetro(),
    orientation: "up"
  }),
  incrementRow: assign({
    row: compose(inc, prop("row"))
  }),
  decrementCol: assign({
    col: ({ board, tetro, col, row, orientation }) => {
      tetro = tetro[orientation];
      var sliceMatrix = getMatrixSlicer(tetro);

      var sliceBoard = sliceMatrix({
        row: add(row),
        col: compose(dec, add(col))
      });
      var sliceTetro = sliceMatrix({});

      const touchesTetros = isTouchingTetros(
        sliceBoard(board),
        sliceTetro(tetro)
      );
      const isTetroInside = compose(gt(col), negate, getTetroFirstCol);

      return isTetroInside(tetro) && not(touchesTetros) ? dec(col) : col;
    }
  }),
  incrementCol: assign({
    col: ({ board, tetro, col, row, orientation }) => {
      tetro = tetro[orientation];
      var sliceMatrix = getMatrixSlicer(tetro);

      var sliceBoard = sliceMatrix({
        row: add(row),
        col: compose(inc, add(col))
      });
      var sliceTetro = sliceMatrix({});

      const touchesTetros = isTouchingTetros(
        sliceBoard(board),
        sliceTetro(tetro)
      );
      const isTetroInside = compose(gt(9), dec, add(col), getTetroLastCol);

      return isTetroInside(tetro) && not(touchesTetros) ? inc(col) : col;
    }
  })
};
