import { Matcher, matches } from "./matcher";

/**
 * Constructs a checked iterator over a set of existing paths that returns only
 * those that pass the given tests. If no tests are provided, then all the paths
 * are iterated over. This iterator supports concurrent modifications to the
 * sequence of tests.
 * @param paths The set of existing paths to be iterated over, provided each of
 * them passes the tests.
 * @param tests The sequence of tests a path must pass in order to be among the
 * paths iterated over.
 */
export const matchingPathsIterator = (
  paths: string[],
  tests: Matcher[],
): Iterable<string> => {
  /**
   * Determines whether or not there are tests to run on the paths. This check
   * is performed on each path as to ensure an adequate behaviour of the
   * iterator should the set of tests be emptied during the iteration.
   * @returns Whether or not there are tests to run on the paths.
   */
  const hasTests = (): boolean => {
    return tests.length > 0;
  };

  /**
   * Determines whether or not a given path should be skipped by the iterator. A
   * path is skipped if it does not matches the iterator tests. Those tests are
   * ignored if the path is undefined, as the last path to be iterated has to be
   * undefined. If there are no tests, then no paths are skipped during the
   * iteration.
   * @param path The path to skip or not.
   * @returns Whether or not to skip the given path.
   */
  const shouldSkip = (path: undefined | string): boolean => {
    if (!hasTests() || !path) {
      return false;
    }
    return !matches(path, tests);
  };

  return {
    [Symbol.iterator]: (): Iterator<string> => {
      return {
        next: (): IteratorResult<string> => {
          let path: string | undefined;
          do {
            path = paths.pop();
          } while (shouldSkip(path));
          return {
            done: !path,
            value: path as any,
          };
        },
      };
    },
  };
};
