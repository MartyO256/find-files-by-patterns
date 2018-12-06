import { basename, dirname, extname } from "path";
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
          return (segment: string) => segment === test;
        case "function":
          return test;
        default:
          return (segment: string) => test.test(segment);
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
 * @param basenames The sequence of base names on which to test paths.
 * @throws If a test function throws an error as it is being run.
 * @returns A filter which determines whether or not a given path has a base
 * name matching a given full base name, a regular expression or a function.
 */
export const ofBasename = (...tests: SegmentTester[]): FilterSync<string> =>
  ofSegment(tests, basename);

/**
 * Constructs a filter which determines whether or not a given path has a
 * directory name matching a given full directory name, a regular expression or
 * a function. If a path's directory name is equal to any of the given string
 * directory names, or if it matches with any of the regular expressions, or if
 * any of the directory name functions returns `true`, then the filter returns
 * `true`.
 * @param dirnames The sequence of directory names on which to test paths.
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
 * @param extnames The sequence of extension names on which to test paths.
 * @throws If any of the test functions throws an error.
 * @returns A filter which determines whether or not a given path has an
 * extension name matching a given full extension name, a regular expression or
 * a function.
 */
export const ofExtname = (...tests: SegmentTester[]): FilterSync<string> =>
  ofSegment(tests, extname);
