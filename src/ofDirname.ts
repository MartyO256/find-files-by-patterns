import { dirname as pathDirname } from "path";

import { Matcher, orChain, pathPartMatcher } from "./matcher";

/**
 * Constructs a matcher function which determines whether or not a given path
 * has a directory name matching a given full directory name, a regular
 * expression or a function. If a path's directory name is equal to any of the
 * given string directory names, or if it matches with any of the regular
 * expressions, or if any of the directory name functions returns `true`, then
 * the matcher returns `true`.
 * @param dirnames The sequence of directory names on which to test paths.
 * @throws If any of the test functions throws an error.
 * @returns A matcher function which determines whether or not a given path has
 * a directory name matching a given full directory name, a regular expression
 * or a function.
 * @see [[dirname]] The way the directory name is extracted from each path.
 * @version 0.5.0
 * @since 0.5.0
 */
export const ofDirname = (
  ...dirnames: Array<string | RegExp | ((dirname: string) => boolean)>
): Matcher => pathPartMatcher(pathDirname, orChain, dirnames);
