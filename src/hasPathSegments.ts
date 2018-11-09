import { normalize, sep } from "path";

import { Matcher } from "./matcher";

/**
 * Splits a given path into its path segments without the leading dots and last
 * separator.
 * @param path The path to split.
 * @returns The path segments with the root segment omitted.
 */
const pathSegments = (path: string): string[] => {
  const segments = normalize(path).split(sep);
  while (segments.length >= 0 && segments[0] === ".") {
    segments.shift();
  }
  while (segments.length >= 0 && segments[segments.length - 1].trim() === "") {
    segments.pop();
  }
  return segments;
};

/**
 * Constructs a matcher function which determines whether or not all the path
 * segments of a path pass a sequence of tests. In order for a path to match,
 * there must not be a path segment that fails a test. The path is normalized,
 * split by file segment separator, then shifted and popped as to remove any
 * leading dots and empty segments at the end. If no tests are provided, then
 * the matcher will return `false` regardless of the path it checks.
 * @param tests The sequence of tests each path segment must pass in order for
 * the path to match.
 * @throws If any of the tests throws an error for any path segment.
 * @returns A matcher function that determines whether or not all the path
 * segments of a path pass a sequence of tests
 * @version 0.6.0
 * @since 0.6.0
 */
export const hasPathSegments = (
  ...tests: Array<Matcher<string>>
): Matcher<string> => (path: string): boolean => {
  for (const segment of pathSegments(path)) {
    for (const test of tests) {
      if (!test(segment)) {
        return false;
      }
    }
  }
  return tests.length > 0;
};

/**
 * Constructs a matcher function which determines whether or not all of the path
 * segments of a path fail a sequence of tests. In order for a path to match,
 * there must not be a path segment that passes a test. The path is normalized,
 * split by file segment separator, then shifted and popped as to remove any
 * leading dots and empty segments at the end. If no tests are provided, then
 * the matcher will return `false` regardless of the path it checks.
 * @param tests The sequence of tests each path segment must fail in order for
 * the path to match.
 * @throws If any of the tests throws an error for any path segment.
 * @returns A matcher function that determines whether or not all the path
 * segments of a path fail a sequence of tests
 * @version 0.6.0
 * @since 0.6.0
 */
export const doesNotHaveAnyPathSegment = (
  ...tests: Array<Matcher<string>>
): Matcher<string> => (path: string): boolean => {
  for (const segment of pathSegments(path)) {
    for (const test of tests) {
      if (test(segment)) {
        return false;
      }
    }
  }
  return tests.length > 0;
};
