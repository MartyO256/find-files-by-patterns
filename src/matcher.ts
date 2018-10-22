import { resolve } from "path";

/**
 * A matcher is a function that determines whether or not a given path matches a
 * pattern.
 */
export type Matcher = (path: string) => boolean;

/**
 * Loosely determines whether or not a given parameter is a matcher function.
 * @param object The object to determine whether or not it is a matcher
 * function.
 * @see [[Matcher]] The actual type of a matcher function.
 * @returns Whether or not the given parameter is a matcher function.
 */
export const isMatcher = (object: any): object is Matcher => {
  return typeof object === "function";
};

/**
 * Creates a matcher function which determines whether or not an extracted part
 * from a path matches a chained sequences of tests.
 * @param extractor The function that extracts part of any given path before
 * matching it to the given tests.
 * @param chain The matcher function which chains the given sequence of tests.
 * @param tests The sequences of tests an extracted part of any path must pass
 * in order to be a positive match, depending upon the chaining function that is
 * used.
 * @returns A matcher function that determines whether or not an extracted part
 * of any path matches the chained sequence of tests.
 */
export const pathPartMatcher = (
  extractor: ((path: string) => string),
  chain: ((tests: Matcher[]) => Matcher),
  tests: Array<string | RegExp | ((part: string) => boolean)>,
): Matcher =>
  chain(
    tests.map(
      (test) =>
        typeof test === "string"
          ? (path: string) => test === extractor(path)
          : typeof test === "function"
            ? (path: string) => test(extractor(path))
            : (path: string) => test.test(extractor(path)),
    ),
  );

/**
 * Chains a sequence of tests using logical disjunctions.
 * @param tests The sequences of tests to chain.
 * @returns A matcher function which determines whether or not any of the given
 * tests returns `true` for a given path.
 */
export const orChain = (tests: Matcher[]): Matcher => {
  return (path: string): boolean => {
    for (const test of tests) {
      if (test(path)) {
        return true;
      }
    }
    return false;
  };
};

/**
 * Determines whether or not an existing given path to a file or directory
 * matches all the given sequence of tests. If no tests are provided, then the
 * path won't match.
 * @param path The path to test.
 * @param tests The tests to perform on the path.
 * @returns Whether or not the given path passes all the given tests.
 */
export const matches = (path: string, tests: Matcher[]): boolean => {
  for (const test of tests) {
    if (!test(path)) {
      return false;
    }
  }
  return tests.length > 0;
};

/**
 * Retrieves the set of files or directories' path among the given file names
 * resolved from the given directory, such that the paths pass all the given
 * tests.
 * @param directory The directory in which the given files are located.
 * @param files The name of the files in the given directory.
 * @param tests The sequence of tests a path has to pass in order to be
 * considered among the matching paths.
 * @returns The set of paths that match the tests.
 */
export const matchingFiles = (
  directory: string,
  files: string[],
  tests: Matcher[],
): string[] =>
  files
    .map((file) => resolve(directory, file))
    .filter((path) => matches(path, tests));
