import { extname as pathExtname } from "path";

import { Matcher, orChain, pathPartMatcher } from "./matcher";

/**
 * Constructs a matcher function which determines whether or not a given path
 * has an extension name matching a given full extension name, a regular
 * expression or a function. If a path's extension name is equal to any of the
 * given string extension names, or if it matches with any of the regular
 * expressions, or if any of the extension name functions returns `true`, then
 * the matcher returns `true`.
 * @param extnames The sequence of extension names on which to test paths.
 * @throws If any of the test functions throws an error.
 * @returns A matcher function which determines whether or not a given path has
 * an extension name matching a given full extension name, a regular expression
 * or a function.
 * @see [[extname]] The way the extension name is extracted from each path.
 * @version 0.5.0
 * @since 0.5.0
 */
export const ofExtname = (
  ...extnames: Array<string | RegExp | ((extname: string) => boolean)>
): Matcher => pathPartMatcher(pathExtname, orChain, extnames);
