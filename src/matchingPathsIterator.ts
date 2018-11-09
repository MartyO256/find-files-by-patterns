import { Matcher, matches } from "./matcher";

/**
 * Constructs a checked iterator over a set of existing paths that returns only
 * those that pass the given immutable sequence of tests. If no tests are
 * provided, then all the paths are iterated over.
 * @param paths The set of existing paths to be iterated over, provided each of
 * them passes the tests.
 * @param tests The immutable sequence of tests a path must pass in order to be
 * among the paths iterated over.
 */
export const matchingPathsIterator = (
  paths: string[],
  tests: Array<Matcher<string>>,
): Iterable<string> => {
  if (tests.length > 0) {
    return {
      [Symbol.iterator]: (): Iterator<string> => {
        return {
          next: (): IteratorResult<string> => {
            let path: string | undefined;
            do {
              path = paths.pop();
            } while (path && !matches(path, tests));
            return {
              done: !path,
              value: path as any,
            };
          },
        };
      },
    };
  } else {
    return {
      [Symbol.iterator]: (): Iterator<string> => {
        return {
          next: (): IteratorResult<string> => {
            const path: string | undefined = paths.pop();
            return {
              done: !path,
              value: path as any,
            };
          },
        };
      },
    };
  }
};
