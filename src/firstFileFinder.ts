import { Matcher } from "./matcher";

/**
 * Synchronously reads the given directories and performs the given tests on all
 * of their soft and hard-linked files in order to find the first file or
 * directory's path in its directory that passes all of the tests.
 * @since 0.2.0
 */
export interface SynchronousFirstFileFinder extends Function {
  /**
   * Synchronously reads the current working directory and performs the given
   * tests on all of its soft and hard-linked files in order to find the first
   * file or directory's path in it that passes all of the tests.
   * @param tests The sequence of tests a file or directory's path must pass in
   * order to be considered the desired file to be found. If a path does not
   * match any of the tests, then it is ignored. If no tests are specified, then
   * the function will arbitrarily return `null`. These tests should be declared
   * such that there can only exist one path that passes them all, otherwise the
   * function may not be deterministic. A test for a path whose base name is
   * equal to a string has that uniqueness.
   * @throws If one of the given tests throws an error.
   * @example Consider the following file structure:
   *
   * ```txt
   * /home/user/project
   * ├── data.csv
   * └── data.yaml
   * ```
   *
   * If the current working directory is `/home/user/project` and the test
   * performed on each file of the directory is for a file of base name
   * `data.json`, then no file will be found matching that test and the function
   * will return `null`.
   * @example Consider the following file structure:
   *
   * ```txt
   * /home/user/project
   * ├── data.json
   * └── data.yaml
   * ```
   *
   * If the current working directory is `/home/user/project` and the test
   * performed on each file of the directory is for a file of base name
   * `data.json`, then the function will return `/home/user/project/data.json`.
   * @returns Either the path to the file or directory that is the first one
   * found in the current working directory such that it passes all the tests,
   * or `null` if there is no such path in the current working directory.
   */
  (...tests: Matcher[]): string | null;

  /**
   * Synchronously reads the given directories and performs the given tests on
   * all of their soft and hard-linked files in order to find the first file or
   * directory's path in its directory that passes all of the tests.
   * @param directories The directories' path in which to search for the first
   * file or directory's path that passes all the tests. If any of these
   * directories is not absolute, then it is resolved relative to the current
   * working directory.
   * @param tests The sequence of tests a file or directory's path must pass in
   * order to be considered the desired path to be found. If a file's path does
   * not match any of the tests, then it is ignored. If no tests are specified,
   * then the function will arbitrarily return `null`. These tests should be
   * declared such that there can only exist one path that passes them all,
   * otherwise the function may not be deterministic. A test for a path whose
   * base name is equal to a string has that uniqueness.
   * @throws If any of the given directories' path cannot be resolved to a
   * directory.
   * @throws If one of the given tests throws an error.
   * @example Consider the following given directories:
   *
   *  - `/home/user/project/files`
   *  - `./files`
   *  - `files`
   *
   * If the current working directory is `/home/user/project`, then all the
   * previous directories refer to the same location and each of them will be
   * resolved to `/home/user/project/files` before any file is tested.
   * @example Consider the following file structure:
   *
   * ```txt
   * /home/user/project/data
   * ├── data.csv
   * └── data.yaml
   * ```
   *
   * If the test performed on each file of the directory
   * `/home/user/project/data` is for a file of base name `data.json`, then no
   * file will be found matching that test and the function will return `null`.
   * @example Consider the following file structure:
   *
   * ```txt
   * /home/user/project
   * ├── data
   * |   ├── data.csv
   * |   └── data.yaml
   * └── files
   *     └── index.html
   * ```
   *
   * If the test performed on each file of the directories
   * `/home/user/project/data` and `/home/user/project/files` is for a file of
   * base name `data.json`, then no file will be found matching that test and
   * the function will return `null`.
   * @example Consider the following file structure:
   *
   * ```txt
   * /home/user/project/data
   * ├── data.json
   * └── data.yaml
   * ```
   *
   * If the test performed on each file of the directory
   * `/home/user/project/data` is for a file of base name `data.json`, then the
   * function will return `/home/user/project/data/data.json`.
   * @example Consider the following file structure:
   *
   * ```txt
   * /home/user/project
   * ├── data
   * |   ├── data.json
   * |   └── data.yaml
   * └── files
   *     └── index.html
   * ```
   *
   * If the test performed on each file of the directories
   * `/home/user/project/data` and `/home/user/project/files` is for a file of
   * base name `data.json`, then the function will return
   * `/home/user/project/data/data.json`.
   * @example Consider the following file structure:
   *
   * ```txt
   * /home/user/project/data
   * ├── data.json
   * └── data.yaml
   * ```
   *
   * If the test performed on each file of the directory
   * `/home/user/project/data` is for a file whose root name is `data`, then the
   * function may return either `/home/user/project/data/data.json` or
   * `/home/user/project/data/data.yaml` since they both pass the test.
   * @example Consider the following file structure:
   *
   * ```txt
   * /home/user/project
   * ├── data
   * |   └── data.json
   * └── files
   *     └── data.json
   * ```
   *
   * If the test performed on each file of the directories
   * `/home/user/project/data` and `/home/user/project/files` is for a file of
   * base name `data.json`, then the function will return
   * `/home/user/project/data/data.json` since it is the first of the two
   * directories to be explored and there is only one file of base name
   * `data.json` in it.
   * @returns Either the path to the file or directory that is the first one
   * found in the directories such that it passes all the tests, or `null` if
   * there is no such path in any of the directories.
   */
  (directories: string | Iterable<string>, ...tests: Matcher[]): string | null;
}

/**
 * Asynchronously reads the given directories and performs the given tests on
 * all of their soft and hard-linked files in order to find the first file or
 * directory's path in its directory that passes all of the tests.
 * @since 0.2.0
 */
export interface AsynchronousFirstFileFinder extends Function {
  /**
   * Asynchronously reads the current working directory and performs the given
   * tests on all of its soft and hard-linked files in order to find the first
   * file or directory's path in it that passes all of the tests.
   * @param tests The sequence of tests a file or directory's path must pass in
   * order to be considered the desired path to be found. If a path does not
   * match any of the tests, then it is ignored. If no tests are specified, then
   * the promise will arbitrarily resolve to `null`. These tests should be
   * declared such that there can only exist one path that passes them all,
   * otherwise the function may not be deterministic. A test for a path whose
   * base name is equal to a string has that uniqueness.
   * @rejects If one of the given tests throws an error.
   * @example Consider the following file structure:
   *
   * ```txt
   * /home/user/project
   * ├── data.csv
   * └── data.yaml
   * ```
   *
   * If the current working directory is `/home/user/project` and the test
   * performed on each file of the directory is for a file of base name
   * `data.json`, then no file will be found matching that test and the promise
   * will resolve to `null`.
   * @example Consider the following file structure:
   *
   * ```txt
   * /home/user/project
   * ├── data.json
   * └── data.yaml
   * ```
   *
   * If the current working directory is `/home/user/project` and the test
   * performed on each file of the directory is for a file of base name
   * `data.json`, then the promise will resolve to
   * `/home/user/project/data.json`.
   * @example Consider the following file structure:
   *
   * ```txt
   * /home/user/project/data
   * ├── data.json
   * └── data.yaml
   * ```
   *
   * If the current working directory is `/home/user/project` and the test
   * performed on each file of the directory is for a file whose name is `data`,
   * then the promise may resolve to either `/home/user/project/data/data.json`
   * or `/home/user/project/data/data.yaml` since both pass the test and are in
   * the same directory.
   * @returns A promise for either the path to the file or directory that is the
   * first one found in the current working directory such that it passes all
   * the tests, or `null` if there is no such path in the current working
   * directory.
   */
  (...tests: Matcher[]): Promise<string | null>;

  /**
   * Asynchronously reads the given directories and performs the given tests on
   * all of their soft and hard-linked files in order to find the first file or
   * directory's path in its directory that passes all of the tests.
   * @param directories The directories' path in which to search for a single
   * file or directory's path that passes all the tests. If any of these
   * directories is not absolute, then it is resolved relative to the current
   * working directory.
   * @param tests The sequence of tests a file's path must pass in order to be
   * considered the desired file to be found. If a file's path does not match
   * any of the tests, then it is ignored. If no tests are specified, then the
   * promise will arbitrarily resolve to `null`. These tests should be declared
   * such that there can only exist one path that passes them all, otherwise the
   * function may not be deterministic. A test for a path whose base name is
   * equal to a string has that uniqueness.
   * @rejects If any of the given directories' path cannot be resolved to a
   * directory.
   * @rejects If one of the given tests throws an error.
   * @example Consider the following given directories:
   *
   *  - `/home/user/project/files`
   *  - `./files`
   *  - `files`
   *
   * If the current working directory is `/home/user/project`, then all the
   * previous directories refer to the same location and each of them will be
   * resolved to `/home/user/project/files` before any file is tested.
   * @example Consider the following file structure:
   *
   * ```txt
   * /home/user/project/data
   * ├── data.csv
   * └── data.yaml
   * ```
   *
   * If the test performed on each file of the directory
   * `/home/user/project/data` is for a file of base name `data.json`, then no
   * file will be found matching that test and the promise will resolve to
   * `null`.
   * @example Consider the following file structure:
   *
   * ```txt
   * /home/user/project
   * ├── data
   * |   ├── data.csv
   * |   └── data.yaml
   * └── files
   *     └── index.html
   * ```
   *
   * If the test performed on each file of the directories
   * `/home/user/project/data` and `/home/user/project/files` is for a file of
   * base name `data.json`, then no file will be found matching that test and
   * the promise will resolve to `null`.
   * @example Consider the following file structure:
   *
   * ```txt
   * /home/user/project/data
   * ├── data.json
   * └── data.yaml
   * ```
   *
   * If the test performed on each file of the directory
   * `/home/user/project/data` is for a file of base name `data.json`, then the
   * promise will resolve to `/home/user/project/data/data.json`.
   * @example Consider the following file structure:
   *
   * ```txt
   * /home/user/project
   * ├── data
   * |   ├── data.json
   * |   └── data.yaml
   * └── files
   *     └── index.html
   * ```
   *
   * If the test performed on each file of the directories
   * `/home/user/project/data` and `/home/user/project/files` is for a file of
   * base name `data.json`, then the promise will resolve to
   * `/home/user/project/data/data.json`.
   * @example Consider the following file structure:
   *
   * ```txt
   * /home/user/project/data
   * ├── data.json
   * └── data.yaml
   * ```
   *
   * If the test performed on each file of the directory
   * `/home/user/project/data` is for a file whose name is `data`, then the
   * promise may return either `/home/user/project/data/data.json` or
   * `/home/user/project/data/data.yaml` since both pass the test and are in the
   * same directory.
   * @example Consider the following file structure:
   *
   * ```txt
   * /home/user/project
   * ├── data
   * |   └── data.json
   * └── files
   *     └── data.json
   * ```
   *
   * If the test performed on each file of the directories
   * `/home/user/project/data` and `/home/user/project/files` is for a file of
   * base name `data.json`, then the promise will resolve to
   * `/home/user/project/data/data.json` since it is the first of the two
   * directories to be explored and there is only one file of base name
   * `data.json` in it.
   * @returns A promise for either the path to the file or directory that is the
   * first one found in the directories such that it passes all the tests, or
   * `null` if there is no such path in any of the directories.
   */
  (directories: string | Iterable<string>, ...tests: Matcher[]): Promise<
    string | null
  >;
}

/**
 * A first file finder is a function that finds the first file or directory's
 * path in a directory from a given sequence of directories such that the file
 * or directory's path passes a given sequence of tests.
 * @since 0.2.0
 */
export interface FirstFileFinder extends AsynchronousFirstFileFinder {
  sync: SynchronousFirstFileFinder;
}
