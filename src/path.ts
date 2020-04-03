import {
  basename,
  dirname,
  extname,
  isAbsolute,
  normalize,
  parse,
  sep,
} from "path";

import { disjunctionSync, FilterSync } from "./filter";

/**
 * A segment tester is a type which can be used to test a substring of a path.
 * If it is a string, then the path segment is tested for equality with it. If
 * it is a regular expression, then the path segment is tested against it. If it
 * is a function, then it is evaluated with the path segment.
 */
export type SegmentTester = string | RegExp | ((segment: string) => boolean);

/**
 * Constructs the disjunctive sequence of segment tester functions. String
 * segment testers are converted to string equality checkers, regular expression
 * testers are called on the segment, and function testers are used as is.
 * @param segmentTests The sequence of segment testers to convert and chain
 * using logical disjunction.
 * @returns The compound filter resulting from the disjunction of all the given
 * tests.
 */
const ofSegmentFilter = (segmentTests: SegmentTester[]): FilterSync<string> =>
  disjunctionSync(
    segmentTests.map((test) => {
      switch (typeof test) {
        case "string":
          return (segment: string): boolean => segment === test;
        case "function":
          return test;
        default:
          return (segment: string): boolean => test.test(segment);
      }
    }),
  );

/**
 * Constructs a filter which determines whether or not a path segment extracted
 * using a given segmenter passes any test of a  given sequence of segment
 * testers.
 * @param segmentTests The tests a segment must pass in order to be filtered in.
 * @param segmenter The segmenter function which extracts the segment to check
 * from a given path.
 * @returns A filter which determines whether or not a path segment extracted
 * using a given segmenter passes any test of a  given sequence of segment
 * testers.
 */
const ofSegment = (
  segmentTests: SegmentTester[],
  segmenter: (path: string) => string,
): FilterSync<string> => {
  const tester = ofSegmentFilter(segmentTests);
  return (path: string): boolean => tester(segmenter(path));
};

/**
 * Constructs a filter which determines whether or not a given path has a base
 * name matching a given full base name, a regular expression or a function. If
 * a path's base name is equal to any of the given string base names, or if it
 * matches with any of the regular expressions, or if any of the base name
 * functions returns `true`, then the filter returns `true`.
 * @param tests The set of tests run on the paths to check.
 * @throws If a test function throws an error as it is being run.
 * @returns A filter which determines whether or not a given path has a base
 * name matching a given full base name, a regular expression or a function.
 */
export const ofBasename = (...tests: SegmentTester[]): FilterSync<string> =>
  ofSegment(tests, basename);

/**
 * Constructs a filter which determines whether or not a given path has a name
 * matching a given full name, a regular expression or a function. The name of a
 * path corresponds to its base name without its extension name. If a path's
 * name is equal to any of the given string names, or if it matches with any of
 * the regular expressions, or if any of the name functions returns `true`, then
 * the filter returns `true`.
 * @param tests The set of tests run on the paths to check.
 * @throws If a test function throws an error as it is being run.
 * @returns A filter which determines whether or not a given path has a base
 * name matching a given full base name, a regular expression or a function.
 */
export const ofName = (...tests: SegmentTester[]): FilterSync<string> =>
  ofSegment(tests, (path: string) => basename(path, extname(path)));

/**
 * Constructs a filter which determines whether or not a given path has a
 * directory name matching a given full directory name, a regular expression or
 * a function. If a path's directory name is equal to any of the given string
 * directory names, or if it matches with any of the regular expressions, or if
 * any of the directory name functions returns `true`, then the filter returns
 * `true`.
 * @param tests The set of tests run on the paths to check.
 * @throws If any of the test functions throws an error.
 * @returns A filter which determines whether or not a given path has a
 * directory name matching a given full directory name, a regular expression or
 * a function.
 */
export const ofDirname = (...tests: SegmentTester[]): FilterSync<string> =>
  ofSegment(tests, dirname);

/**
 * Constructs a filter which determines whether or not a given path has an
 * extension name matching a given full extension name, a regular expression or
 * a function. If a path's extension name is equal to any of the given string
 * extension names, or if it matches with any of the regular expressions, or if
 * any of the extension name functions returns `true`, then the filter returns
 * `true`.
 * @param tests The set of tests run on the paths to check.
 * @throws If any of the test functions throws an error.
 * @returns A filter which determines whether or not a given path has an
 * extension name matching a given full extension name, a regular expression or
 * a function.
 */
export const ofExtname = (...tests: SegmentTester[]): FilterSync<string> =>
  ofSegment(tests, extname);

/**
 * The set of special characters found in paths that a segment cannot solely
 * consist of.
 */
const specialCharacters = [".", sep];

/**
 * The position of the first segment in a given normalized path.
 * @param normalizedPath The normalized path in which to search for the position
 * of the first character in its first segment.
 * @returns `-1` if there is no path segment in the normalized path, or the
 * position of the leftmost character in the first segment.
 */
export const firstSegmentPosition = (normalizedPath: string): number => {
  if (isAbsolute(normalizedPath)) {
    const { root } = parse(normalizedPath);
    return root.length === normalizedPath.length ? -1 : root.length;
  } else {
    let position = 0;
    for (const character of normalizedPath) {
      if (!specialCharacters.includes(character)) {
        const previousSeparatorPosition = normalizedPath.lastIndexOf(
          sep,
          position,
        );
        return previousSeparatorPosition < 0
          ? 0
          : previousSeparatorPosition + 1;
      }
      position++;
    }
    return -1;
  }
};

/**
 * Constructs a generator which yields the segments of a path. These segments
 * are based off the normalized path, which may or may not be absolute. Each
 * yielded segment must have at least one non-special character, meaning that a
 * segment cannot consist solely of dots or segment separators.
 * @param path The path from which to yield the segments.
 * @returns An iterable over the segments of the normalized path.
 */
export function* segments(path: string): Iterable<string> {
  const normalizedPath = normalize(path);
  const firstSegmentPos = firstSegmentPosition(normalizedPath);
  if (firstSegmentPos >= 0) {
    let position = firstSegmentPos;
    do {
      const nextSeparatorPosition = normalizedPath.indexOf(sep, position);
      const segmentEndPosition =
        nextSeparatorPosition <= 0
          ? normalizedPath.length
          : nextSeparatorPosition;
      yield normalizedPath.substring(position, segmentEndPosition);
      position = segmentEndPosition + 1;
    } while (position < normalizedPath.length);
  }
}

/**
 * Constructs a filter which determines whether or not all the path segments of
 * a path pass a sequence of tests. In order for a path to match, there must not
 * be a path segment that fails a test. If no tests are provided, then the
 * filter will return `false` regardless of the path it checks.
 * @param tests The sequence of tests each path segment must pass in order for
 * the path to match.
 * @throws If any of the tests throws an error for any path segment.
 * @returns A filter that determines whether or not all the path segments of a
 * path pass a sequence of tests
 */
export const hasPathSegments = (
  ...tests: SegmentTester[]
): FilterSync<string> => {
  const test = ofSegmentFilter(tests);
  return (path: string): boolean => {
    for (const segment of segments(path)) {
      if (!test(segment)) {
        return false;
      }
    }
    return true;
  };
};
