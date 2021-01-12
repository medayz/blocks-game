import {
  curry,
  findIndex,
  findLastIndex,
  any,
  inc,
  compose,
  indexOf,
  lastIndexOf,
  max,
  min,
  map,
  equals,
  reject,
  reduce,
  memoizeWith,
  identity,
  curryN,
  slice
} from "ramda";

export var getMatrixSlicer = memoizeWith(identity, function getMatrixSlicer(
  tetro
) {
  function getBoundaries(tetro) {
    return {
      row: [getTetroFirstRow(tetro), getTetroLastRow(tetro)],
      col: [getTetroFirstCol(tetro), getTetroLastCol(tetro)]
    };
  }
  var getSlicer = curryN(
    2,
    (
      { row: [startRow, endRow], col: [startCol, endCol] },
      { row: rowAdapter = identity, col: colAdapter = identity } = {}
    ) =>
      compose(
        map(slice(colAdapter(startCol), colAdapter(endCol))),
        slice(rowAdapter(startRow), rowAdapter(endRow))
      )
  );
  var matrixSlicer = compose(getSlicer, getBoundaries);

  return matrixSlicer(tetro);
});

export var isTouchingTetros = (board, tetro) =>
  board
    ?.map((row, i) =>
      row?.reduce((acc, col, j) => {
        return acc || (col && tetro[i][j]);
      }, false)
    )
    ?.find((x) => x);

export var isDropped = curry(function isDropped(
  { board, tetro, orientation, col },
  row
) {
  tetro = tetro[orientation];

  const tetroStartRow = getTetroFirstRow(tetro);
  const tetroEndRow = getTetroLastRow(tetro);
  const tetroStartCol = getTetroFirstCol(tetro);
  const tetroEndCol = getTetroLastCol(tetro);

  var slicedBoard = board
    .slice(row + tetroStartRow, row + tetroEndRow)
    ?.map((row) => row.slice(col + tetroStartCol, col + tetroEndCol + 1));

  var slicedTetro = tetro
    .slice(tetroStartRow, tetroEndRow)
    ?.map((row) => row.slice(tetroStartCol, tetroEndCol + 1));

  return Boolean(
    slicedBoard
      ?.map((row, i) =>
        row?.reduce((acc, col, j) => {
          return acc || (col && slicedTetro[i][j]);
        }, false)
      )
      ?.find((x) => x)
  );
});

export var getTetroLastRow = compose(inc, findLastIndex(any(equals(1))));

export var getTetroFirstRow = findIndex(any(equals(1)));

export var getTetroFirstCol = compose(
  reduce(min, +Infinity),
  reject(equals(-1)),
  map(indexOf(1))
);

export var getTetroLastCol = compose(
  inc,
  reduce(max, 0),
  reject(equals(-1)),
  map(lastIndexOf(1))
);

export function getNewSpotValue({ tetro, row, col, originalValue }) {
  return originalValue === 0 &&
    row >= 0 &&
    col >= 0 &&
    row < tetro.length &&
    col < tetro[0].length
    ? tetro[row][col]
    : originalValue;
}

export function tetroGenerator(tetrodb) {
  var types = ["S", "Z", "I", "L", "J", "O", "T"];

  return function getTetro() {
    var index = Math.floor(Math.random() * 7);
    var tetro = types[index];

    return tetrodb[tetro];
  };
}
