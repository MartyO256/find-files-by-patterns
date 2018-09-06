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
 * Determines whether or not an existing given path to a file or directory
 * matches all the given sequence of tests.
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
