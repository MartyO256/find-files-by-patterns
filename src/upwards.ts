import { existsSync, statSync } from "fs";
import { dirname, isAbsolute, parse, resolve } from "path";

import { Matcher } from "./matcher";
import { matchingPathsIterator } from "./matchingPathsIterator";
import { UpwardDirectoriesFetcher } from "./upwardDirectoriesFetcher";

/**
 * Constructs an upward directories fetcher in accordance with the
 * `UpwardDirectoriesFetcher` interface's specifications.
 * @see [[UpwardDirectoriesFetcher]] The specifications of an upward directories
 * fetcher.
 * @param startingDirectory The default starting directory for the traversal.
 * @returns An upward directories fetcher function.
 */
const makeUpwards = (
  startingDirectory: string = process.cwd(),
): UpwardDirectoriesFetcher => {
  const upwards = (
    from: undefined | string | Matcher,
    to: undefined | string | number | Matcher,
    ...tests: Matcher[]
  ): Iterable<string> => {
    if (typeof from === "undefined") {
      from = startingDirectory;
    } else if (typeof from === "function") {
      tests.unshift(from);
      from = startingDirectory;
    } else if (typeof to === "string" && isAbsolute(to)) {
      if (!existsSync(to)) {
        throw new Error(`The \`to\` path does not exist ${from} -> ${to}`);
      }
      // Ensure `to` is a directory
      if (statSync(to).isFile()) {
        to = dirname(to);
      }
      from = resolve(to, from);
    } else {
      from = resolve(from);
    }
    if (typeof to === "undefined") {
      to = parse(from).root;
    } else if (typeof to === "function") {
      tests.unshift(to);
      to = parse(from as string).root;
    } else if (typeof to === "number") {
      if (to < 0) {
        throw new Error(
          `The amount of levels to traverse must be non-negative ${to}`,
        );
      }
      let path = from;
      while (to > 0) {
        path = dirname(path);
        to--;
      }
      to = path;
    } else {
      to = resolve(to);
      // Only scenario where `to` may not have the same root as `from`
      if (parse(from).root !== parse(to).root) {
        throw new Error(
          `The \`to\` and \`from\` paths do not share the same root ${from} -> ${to}`,
        );
      }
    }
    // `to` is fixed, the iteration won't go any further
    if (!from.startsWith(to)) {
      throw new Error(
        `The \`to\` path is not parent to the \`from\` path ${from} -> ${to}`,
      );
    }
    // Ensure `from` exists
    while (!existsSync(from)) {
      from = dirname(from);
    }
    // Ensure `from` is a directory
    if (statSync(from).isFile()) {
      from = dirname(from);
    }
    if (to.length > from.length) {
      return matchingPathsIterator([], tests);
    } else if (to === from) {
      return matchingPathsIterator([from], tests);
    } else {
      const directories: string[] = [];
      do {
        directories.push(from);
        from = dirname(from);
      } while (from !== to);
      directories.push(to);
      return matchingPathsIterator(directories.reverse(), tests);
    }
  };
  return upwards;
};

/**
 * An upward directories fetcher function.
 * @see [[UpwardDirectoriesFetcher]] The specifications of the function.
 * @version 0.3.0
 * @since 0.3.0
 */
export const upwards = makeUpwards();
