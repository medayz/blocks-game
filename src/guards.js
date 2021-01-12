import { getTetroLastRow, isDropped } from "./utils";

export default {
  didHitBottom: ({ row, tetro, orientation, boardHeight }) => {
    row = row + getTetroLastRow(tetro[orientation]) - 1;
    return row > boardHeight - 1;
  },
  isNewTetroDrop: ({ lastDrop, row }) => lastDrop !== row,
  isDropped: ({ row, ...ctx }) => isDropped(ctx, row),
  isBoardFull: ({ row, ...ctx }) => {
    return row === 0 && isDropped(ctx, row);
  }
};
