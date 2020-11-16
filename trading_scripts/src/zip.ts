import dropRight from "lodash.dropright";
import tail from "lodash.tail";
import zip from "lodash.zip";

export function zipAdjacent<T>(ts: T[]): [T | undefined, T | undefined][] {
  return zip(dropRight(ts, 1), tail(ts));
}
