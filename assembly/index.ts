// @ts-ignore
@external("__external", "log")
declare function log(num: i32): void;

export function addNum(x: i32, y: i32): i32 {
  log(x + y);

  return x + y;
}


