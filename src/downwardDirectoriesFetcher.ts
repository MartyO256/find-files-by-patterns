import { Matcher } from "./matcher";

/**
 * A downward directories fetcher is a function which returns an iterable over
 * the set of existing directories' path, from a path down a given amount of
 * levels, that match a given set of tests.
 * @since 0.6.0
 */
export interface DownwardDirectoriesFetcher {
  /**
   * Fetches an iterable over the path to the directories which are located
   * downwards from the current working directory included. Each of the
   * directories' path must pass a given sequence of tests in order to be
   * returned by the iterable. The iterable will throw an error if any of the
   * tests throws an error for any of the fetched paths. The directories are
   * traversed and returned in lexicographical order by depth using
   * breadth-first traversal.
   * @param tests The sequence of tests a directory's path must pass in order to
   * be among the iterated downward directory paths. If no tests are specified,
   * then all the downward paths will be iterator results.
   * @returns An iterable over the set of downward directory paths that match
   * the given tests.
   */
  (...tests: Array<Matcher<string>>): Iterable<string>;

  /**
   * Fetches an iterable over the path to the directories which are located
   * downwards from the given directory included. Each of the directories' path
   * must pass a given sequence of tests in order to be returned by the
   * iterable. The iterable will throw an error if any of the tests throws an
   * error for any of the fetched paths. The directories are traversed and
   * returned in lexicographical order by depth using breadth-first traversal.
   * @param from The directory from which to traverse downwards. If it is not
   * absolute, then it is resolved relative to the current working directory. If
   * a path to an existing file is given, then its directory is considered as
   * the starting point for the traversal.
   * @param tests The sequence of tests a directory's path must pass in order to
   * be among the iterated downwad directory paths. If no tests are specified,
   * then all the downward paths will be iterator results.
   * @returns An iterable over the set of downward directory paths that match
   * the given tests.
   */
  (from: string, ...tests: Array<Matcher<string>>): Iterable<string>;

  /**
   * Fetches an iterable over the path to the directories which are located
   * downwards from the given directory included, down to the given depth of
   * directories. Each of the directories' path must pass a given sequence of
   * tests in order to be returned by the iterable. The iterable will throw an
   * error if any of the tests throws an error for any of the fetched paths. The
   * directories are traversed and returned in lexicographical order by depth
   * using breadth-first traversal.
   * @param from The directory from which to traverse downwards down to the
   * depth of directories to traverse. If it is not absolute, then it is
   * resolved relative to the current working directory. If a path to an
   * existing file is given, then its directory is considered as the starting
   * point for the traversal.
   * @param depth The amount of directories to traverse. The `from` path, or its
   * directory if it is pointing to a file, is the directory at the zeroth
   * depth. The iterable will stop once the directories at the given depth have
   * been iterated over.
   * @param tests The sequence of tests a directory's path must pass in order to
   * be among the iterated downward directory paths. If no tests are specified,
   * then all the downward paths will be iterator results.
   * @throws If the amount of directories to traverse downwards is negative.
   * @returns An iterable over the set of downward directory paths that match
   * the given tests.
   */
  (from: string, depth: number, ...tests: Array<Matcher<string>>): Iterable<
    string
  >;
}
