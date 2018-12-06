/**
 * A matcher is a function that determines whether or not a given path matches a
 * pattern.
 */
export type Matcher<T> = (value: T) => boolean;

/**
 * Determines whether or not an existing given path to a file or directory
 * matches all the given sequence of tests. If no tests are provided, then the
 * path won't match.
 * @param path The path to test.
 * @param tests The tests to perform on the path.
 * @returns Whether or not the given path passes all the given tests.
 * @deprecated
 */
export const matches = <T>(
  value: T,
  tests: Array<(value: T) => boolean>,
): boolean => {
  for (const test of tests) {
    if (!test(value)) {
      return false;
    }
  }
  return tests.length > 0;
};
