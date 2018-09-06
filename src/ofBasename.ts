import { basename as pathBasename } from "path";

import { Matcher } from "./matcher";

/**
 * Constructs a matcher function which determines whether or not a given path
 * has a base name either matching a given full base name or a regular
 * expression. If a path's base name is equal to any of the given string base
 * names or if it matches with any of the regular expressions, then the matcher
 * returns `true`.
 * @param basenames The sequence of base names on which to test paths.
 * @returns A matcher function which determines whether or not a given path has
 * a base name either matching a given full base name or a regular expression.
 */
export const ofBasename = (...basenames: Array<string | RegExp>): Matcher => {
  const tests: Matcher[] = basenames.map(
    (basename) =>
      typeof basename === "string"
        ? (path: string) => basename === pathBasename(path)
        : (path: string) => basename.test(pathBasename(path)),
  );
  return (path: string): boolean => {
    for (const test of tests) {
      if (test(path)) {
        return true;
      }
    }
    return false;
  };
};
