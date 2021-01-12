import { interval, fromEvent } from "rxjs";
import { filter, tap, take, map } from "rxjs/operators";

export const interval$ = interval(1000).pipe(
  map(() => "INC_ROW"),
  take(21)
);

const keyDown$ = fromEvent(document.querySelector("body"), "keydown");

export const spacePress$ = keyDown$.pipe(
  filter((e) => e.keyCode === 32),
  tap((e) => e.stopPropagation()),
  tap((e) => e.preventDefault())
);

export const upPress$ = keyDown$.pipe(
  filter((e) => e.keyCode === 38),
  tap((e) => e.stopPropagation()),
  tap((e) => e.preventDefault())
);

export const rightPress$ = keyDown$.pipe(filter((e) => e.keyCode === 39));

export const leftPress$ = keyDown$.pipe(filter((e) => e.keyCode === 37));
