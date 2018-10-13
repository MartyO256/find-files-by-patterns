import { Matcher } from "./matcher";

/**
 * An upward directories fetcher is a function which returns an iterable over
 * the set of existing directories' path, from a path up to another, that match
 * a given set of tests.
 * @since 0.3.0
 */
export interface UpwardDirectoriesFetcher {
  /**
   * Fetches an iterable over the path to the directories which are located
   * upwards from the current working directory included, up to the root
   * directory parsed from it. Each of the directories' path must pass a given
   * sequence of tests in order to be returned by the iterable. The iterable
   * will throw an error if any of the tests throws an error for any of the
   * fetched paths.
   * @param tests The sequence of tests a directory's path must pass in order to
   * be among the iterated upward directory paths. If no tests are specified,
   * then all the upward paths will be iterator results.
   * @example Assuming the current working directory is `/home/user/Documents`,
   * then the upward directories that will be iterated over by the returned
   * iterable will be `/home/user/Documents`, `/home/user`, `/home` and `/` in
   * that order, provided no test excludes any of them.
   * @returns An iterable over the set of upward directory paths that match the
   * given tests.
   */
  (...tests: Matcher[]): Iterable<string>;

  /**
   * Fetches an iterable over the path to the directories which are located
   * upwards from the given directory included, up to the root directory parsed
   * from it. Each of the directories' path must pass a given sequence of tests
   * in order to be returned by the iterable. The iterable will throw an error
   * if any of the tests throws an error for any of the fetched paths.
   * @param from The directory from which to traverse upwards up to the root
   * directory. If it is not absolute, then it is resolved relative to the
   * current working directory. If a path to an existing file is given, then its
   * directory is considered as the starting point for the traversal.
   * @example Assuming the given `from` directory is `/home/user/Documents`,
   * then the upward directories that will be iterated over by the returned
   * iterable will be `/home/user/Documents`, `/home/user`, `/home` and `/` in
   * that order, provided no test excludes any of them.
   * @example If `from` is `home/user/Documents`, a relative path, then it is
   * first resolved, and the iterable over its upward directories will be the
   * same as in the previous example.
   * @example Assuming the given `from` path is
   * `/home/user/Documents/index.html`, then the upward directories that will be
   * iterated over by the returned iterable will start with the given path's
   * directory, hence they will be `/home/user/Documents`, `/home/user`, `/home`
   * and `/` in that order, provided no test excludes any of them.
   * @param tests The sequence of tests a directory's path must pass in order to
   * be among the iterated upward directory paths. If no tests are specified,
   * then all the upward paths will be iterator results.
   * @returns An iterable over the set of upward directory paths that match the
   * given tests.
   */
  (from: string, ...tests: Matcher[]): Iterable<string>;

  /**
   * Fetches an iterable over the path to the directories which are located
   * upwards from the given directory included, up to the given amount of
   * directories to traverse upwards. Each of the directories' path must pass a
   * given sequence of tests in order to be returned by the iterable. The
   * iterable will throw an error if any of the tests throws an error for any of
   * the fetched paths.
   * @param from The directory from which to traverse upwards up to the amount
   * of upward directories to traverse. If it is not absolute, then it is
   * resolved relative to the current working directory. If a path to an
   * existing file is given, then its directory is considered as the starting
   * point for the traversal.
   * @param levels The amount of directories to traverse. The `from` path is
   * used as is with this amount to determine the last directory to traverse,
   * regardless of whether or not the `from` path exists or is a file. The
   * `from` path is the zeroth path traversed. The iterable will stop after
   * iterating over the root directory of the resolved `from` path, should the
   * given amount of directories to traverse exceed the amount of upward
   * directories.
   * @param tests The sequence of tests a directory's path must pass in order to
   * be among the iterated upward directory paths. If no tests are specified,
   * then all the upward paths will be iterator results.
   * @throws If the amount of directories to traverse upwards is negative.
   * @example Assuming the given `from` directory is `/home/user/Documents` and
   * the given `levels` is 0, then the only upward directory that will be
   * iterated over by the returned iterable will be `/home/user/Documents`,
   * provided no test excludes it.
   * @example Assuming the given `from` directory is `/home/user/Documents` and
   * the given `levels` is 2, then the upward directories that will be iterated
   * over by the returned iterable will be `/home/user/Documents`, `/home/user`
   * and `/home` in that order, provided no test excludes any of them.
   * @example Assuming the given `from` path is
   * `/home/user/Documents/index.html` and the given `levels` is 2, then the
   * upward directories that will be iterated over by the returned iterable will
   * start with the given path's directory at level 1, hence they will be
   * `/home/user/Documents` and `/home/user` in that order, provided no test
   * excludes any of them.
   * @returns An iterable over the set of upward directory paths that match the
   * given tests.
   */
  (from: string, levels: number, ...tests: Matcher[]): Iterable<string>;

  /**
   * Fetches an iterable over the path to the directories which are located
   * upwards from a given directory included, up to another directory. Each of
   * the directories' path must pass a given sequence of tests in order to be
   * returned by the iterable. The iterable will throw an error if any of the
   * tests throws an error for any of the fetched paths.
   * @param from The directory from which to traverse upwards up to the final
   * directory to traverse. If it is not absolute, then it is resolved relative
   * to the given `to` path, or the current working directory if both the `from`
   * and `to` paths are not absolute. If a path to an existing file is given,
   * then its directory is considered as the starting point for the traversal.
   * @param to Either the directory up to which the directories are traversed,
   * or the amount of directories to traverse. If it is not absolute, then it is
   * resolved relative to the current working directory, and so will the `from`
   * path if it is not absolute. If a path to an existing file is given, then
   * its directory is considered as the ending point for the traversal.
   * @param tests The sequence of tests a directory's path must pass in order to
   * be among the iterated upward directory paths. If no tests are specified,
   * then all the upward paths will be iterator results.
   * @throws If the path from which traverse directory paths is not relative to
   * the path up to which the traversal takes place.
   * @throws If the two given paths do not share the same root.
   * @throws If the path up to which the traversal takes place does not exist.
   * @example If `from` is `/home/user` and `to` is `/home/user/Documents`, then
   * an error is thrown.
   * @example If `from` is `/home/user/Documents` and `to` is `/home`, then the
   * upward directories that will be iterated over by the returned iterable will
   * be `/home/user/Documents`, `/home/user` and `/home` in that order, provided
   * no test excludes any of them.
   * @example If `from` and `to` are both `/home/user/Documents/index.html`,
   * then the only upward directory that will be iterated over by the returned
   * iterable will be `/home/user/Documents`, provided no test excludes it.
   * @example If `from` is `Documents` and `to` is `/home/user`, then the `from`
   * path is resolved relative to the `to` path and the upward directories that
   * will be iterated over by the returned iterable will be
   * `/home/user/Documents` and `/home/user` in that order, provided no test
   * excludes any of them.
   * @example If `from` is `Documents` and `to` is `home/user`, then the `to`
   * path is resolved, then the `from` path is resolved relative to the `to`
   * path so that the upward directories that will be iterated over by the
   * returned iterable will be `/home/user/Documents` and `/home/user` in that
   * order, provided no test excludes any of them.
   * @example If `from` is `/home/user/Documents/unexistant/also-unexistant` and
   * `to` is `/home/user/Documents/unexistant`, then provided that neither exist
   * on the file system and that `to` is a parent path of `from`, then no paths
   * are iterated over by the returned iterable since none of them would exist
   * either.
   * @returns An iterable over the set of upward directory paths that match the
   * given tests.
   */
  // tslint:disable:unified-signatures
  (from: string, to: string, ...tests: Matcher[]): Iterable<string>;
}
