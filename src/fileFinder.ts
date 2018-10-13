import { Matcher } from "./matcher";

/**
 * Synchronously reads the given directories and performs the given tests on all
 * of their soft and hard-linked files in order to find the first and only file
 * or directory's path in its directory that passes all of the tests.
 * @since 0.1.0
 */
export interface SynchronousFileFinder extends Function {
  /**
   * Synchronously reads the current working directory and performs the given
   * tests on all of its soft and hard-linked files in order to find the first
   * and only file or directory's path in it that passes all of the tests.
   * @param tests The sequence of tests a file or directory's path must pass in
   * order to be considered the desired path to be found. If a path does not
   * match any of the tests, then it is ignored. If two or more paths satisfy
   * all of the tests, then an error is thrown, since only a single path is
   * desired. If no tests are specified, then the function will arbitrarily
   * return `null`.
   * @throws If there exists more than one path that passes all the given tests
   * in the current working directory.
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
   * @example Consider the following file structure:
   *
   * ```txt
   * /home/user/project/data
   * ├── data.json
   * └── data.yaml
   * ```
   *
   * If the current working directory is `/home/user/project` and the test
   * performed on each file of the directory is for a file whose root name is
   * `data`, then the function will throw an error, since both
   * `/home/user/project/data/data.json` and `/home/user/project/data/data.yaml`
   * pass the test and are in the same directory.
   * @returns Either the path to the file or directory that is the first and the
   * only one found in the current working directory such that it passes all the
   * tests, or `null` if there is no such path in the current working directory.
   */
  (...tests: Matcher[]): string | null;

  /**
   * Synchronously reads the given directories and performs the given tests on
   * all of their soft and hard-linked files in order to find the first and only
   * file or directory's path in its directory that passes all of the tests.
   * @param directories The directories' path in which to search for a single
   * file's path that passes all the tests. If any of these directories is not
   * absolute, then it is resolved relative to the current working directory.
   * @param tests The sequence of tests a file or directory's path must pass in
   * order to be considered the desired path to be found. If a path does not
   * match any of the tests, then it is ignored. If two or more paths satisfy
   * all of the tests, then an error is thrown, since only a single path is
   * desired. If no tests are specified, then the function will arbitrarily
   * return `null`.
   * @throws If any of the given directories' path cannot be resolved to a
   * directory.
   * @throws If there exists more than one path that passes all the given tests
   * in the same directory.
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
   * function will throw an error, since both
   * `/home/user/project/data/data.json` and `/home/user/project/data/data.yaml`
   * pass the test and are in the same directory.
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
   * @returns Either the path to the file or directory that is the first and the
   * only one found in the directories such that it passes all the tests, or
   * `null` if there is no such path in any of the directories.
   */
  (directories: string | Iterable<string>, ...tests: Matcher[]): string | null;
}

/**
 * Asynchronously reads the given directories and performs the given tests on
 * all of their soft and hard-linked files in order to find the first and only
 * file or directory's path in its directory that passes all of the tests.
 * @since 0.1.0
 */
export interface AsynchronousFileFinder extends Function {
  /**
   * Asynchronously reads the current working directory and performs the given
   * tests on all of its soft and hard-linked files in order to find the first
   * and only file or directory's path in it that passes all of the tests.
   * @param tests The sequence of tests a file or directory's path must pass in
   * order to be considered the desired file to be found. If a path does not
   * match any of the tests, then it is ignored. If two or more paths satisfy
   * all of the tests, then the promise is rejected, since only a single path is
   * desired. If no tests are specified, then the promise will arbitrarily
   * resolve to `null`.
   * @rejects If there exists more than one path that passes all the given tests
   * in the same directory.
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
   * then the promise will be rejected, since both
   * `/home/user/project/data/data.json` and `/home/user/project/data/data.yaml`
   * pass the test and are in the same directory.
   * @returns A promise for either the path to the file or directory that is the
   * first and the only one found in the current working directory such that it
   * passes all the tests, or `null` if there is no such path in the current
   * working directory.
   */
  (...tests: Matcher[]): Promise<string | null>;

  /**
   * Asynchronously reads the given directories and performs the given tests on
   * all of their soft and hard-linked files in order to find the first and only
   * file or directory's path in its directory that passes all of the tests.
   * @param directories The directories' path in which to search for a single
   * file or directory's path that passes all the tests. If any of these
   * directories is not absolute, then it is resolved relative to the current
   * working directory.
   * @param tests The sequence of tests a file or directory's path must pass in
   * order to be considered the desired path to be found. If a path does not
   * match any of the tests, then it is ignored. If two or more paths satisfy
   * all of the tests, then the promise is rejected, since only a single path is
   * desired. If no tests are specified, then the promise will arbitrarily
   * resolve to `null`.
   * @rejects If any of the given directories' path cannot be resolved to a
   * directory.
   * @rejects If there exists more than one path that passes all the given tests
   * in the same directory.
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
   * promise will be rejected, since both `/home/user/project/data/data.json`
   * and `/home/user/project/data/data.yaml` pass the test and are in the same
   * directory.
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
   * first and the only one found in the directories such that it passes all the
   * tests, or `null` if there is no such file in any of the directories.
   */
  (directories: string | Iterable<string>, ...tests: Matcher[]): Promise<
    string | null
  >;
}

/**
 * A file finder is a function that finds one and only one file or directory's
 * path in a directory from a given sequence of directories such that the file
 * or directory's path passes a given sequence of tests.
 * @since 0.1.0
 */
export interface FileFinder extends AsynchronousFileFinder {
  sync: SynchronousFileFinder;
}
