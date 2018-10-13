import { basename as pathBasename } from "path";

import { Matcher } from "./matcher";

/**
 * Constructs a matcher function which determines whether or not a given path
 * has a base name matching a given full base name, a regular expression or a
 * function. If a path's base name is equal to any of the given string base
 * names, or if it matches with any of the regular expressions, or if any of the
 * base name functions returns `true`, then the matcher returns `true`.
 * @param basenames The sequence of base names on which to test paths.
 * @throws If a test function throws an error as it is being run.
 * @returns A matcher function which determines whether or not a given path has
 * a base name matching a given full base name, a regular expression or a
 * function.
 * @see [[basename]] The way the base name is extracted from each path.
 * @version 0.3.0
 * @since 0.0.1
 */
export const ofBasename = (
  ...basenames: Array<string | RegExp | ((basename: string) => boolean)>
): Matcher => {
  const tests: Matcher[] = basenames.map(
    (basename) =>
      typeof basename === "string"
        ? (path: string) => basename === pathBasename(path)
        : typeof basename === "function"
          ? basename
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
