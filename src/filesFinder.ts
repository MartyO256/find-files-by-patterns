import { PathLike } from "fs";

import { Matcher } from "./matcher";

/**
 * Synchronously reads the given directories and performs the given tests on all
 * of their soft and hard-linked files in order to find the files whose path
 * passes all of the tests.
 * @version 0.1.0
 * @author Marc-Antoine Ouimet
 */
export interface SynchronousFilesFinder extends Function {
  /**
   * Synchronously reads the current working directory and performs the given
   * tests on all of its soft and hard-linked files in order to find the files
   * whose path passes all of the tests.
   * @param tests The sequence of tests a file's path must pass in order to be
   * considered among the desired files to be found. If a file's path does not
   * match any of the tests, then it is ignored. If no tests are specified, then
   * the function will arbitrarily return `null`.
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
   * /home/user/project/data
   * ├── data.json
   * └── data.yaml
   * ```
   *
   * If the current working directory is `/home/user/project` and the test
   * performed on each file of the directory is for a file whose root name is
   * `data`, then the function will return `/home/user/project/data/data.json`
   * and `/home/user/project/data/data.yaml`.
   * @returns The set of files' path in the current working directory that pass
   * all the tests. These files' path are sorted alphanumerically.
   */
  (...tests: Matcher[]): Set<string>;

  /**
   * Synchronously reads the given directories and performs the given tests on
   * all of their soft and hard-linked files in order to find the files whose
   * path passes all of the tests.
   * @param directories The directories' path in which to search for all the
   * files' path that pass all the tests.
   * @param tests The sequence of tests a file's path must pass in order to be
   * considered among the desired files to be found. If a file's path does not
   * match any of the tests, then it is ignored. If no tests are specified, then
   * the function will arbitrarily return `null`.
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
   * ├── data.json
   * └── data.yaml
   * ```
   *
   * If the test performed on each file of the directory
   * `/home/user/project/data` is for a file whose root name is `data`, then the
   * function will return both `/home/user/project/data/data.json` and
   * `/home/user/project/data/data.yaml`.
   * @example Consider the following file structure:
   *
   * ```txt
   * /home/user/project
   * ├── data
   * |   ├── data.json
   * |   └── data.yaml
   * └── files
   *     └── data.json
   * ```
   * Let `/home/user/project` be the current working directory. If the test
   * performed on each file in the directories `./data` and `./files` is for a
   * file whose root name is `data`, then the function will return
   * `/home/user/project/data/data.json`, `/home/user/project/data/data.yaml`
   * and `/home/user/project/files/data.json`. The returned files from the
   * `./data` directory are sorted alphanumerically. The matching files from
   * `./data` are returned before those of `./files` since `./data` was given
   * first as a directory to explore.
   * @returns The set of files' path in the given directories that pass all the
   * tests. The files' path are returned in order of directory and sorted
   * alphanumerically by basename in each directory.
   */
  (directories: PathLike | Iterable<PathLike>, ...tests: Matcher[]): Set<
    string
  >;
}

/**
 * Asynchronously reads the given directories and performs the given tests on
 * all of their soft and hard-linked files in order to find the files whose path
 * passes all of the tests.
 * @version 0.1.0
 * @author Marc-Antoine Ouimet
 */
export interface AsynchronousFilesFinder extends Function {
  /**
   * Asynchronously reads the current working directory and performs the given
   * tests on all of its soft and hard-linked files in order to find the files
   * whose path passes all of the tests.
   * @param tests The sequence of tests a file's path must pass in order to be
   * considered among the desired files to be found. If a file's path does not
   * match any of the tests, then it is ignored. If no tests are specified, then
   * the function will arbitrarily return `null`.
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
   * `data.json`, then no file will be found matching that test and the function
   * will resolve to `null`.
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
   * `data`, then the function will resolve to
   * `/home/user/project/data/data.json` and
   * `/home/user/project/data/data.yaml`.
   * @returns The set of files' path in the current working directory that pass
   * all the tests. These files' path are sorted alphanumerically.
   */
  (...tests: Matcher[]): Promise<Set<string>>;

  /**
   * Asynchronously reads the given directories and performs the given tests on
   * all of their soft and hard-linked files in order to find the files' path
   * that passes all of the tests.
   * @param directories The directories' path in which to search for files' path
   * that pass all the tests. If it is undefined, then the search for the file
   * only occurs in the current working directory.
   * @param tests The sequence of tests a file's path must pass in order to be
   * considered among the files found. If a file's path does not match any of
   * the tests, then it is ignored.
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
   * ├── data.json
   * └── data.yaml
   * ```
   *
   * If the test performed on each file of the directory
   * `/home/user/project/data` is for a file whose root name is `data`, then the
   * promise will resolve with both `/home/user/project/data/data.json` and
   * `/home/user/project/data/data.yaml`.
   * @example Consider the following file structure:
   *
   * ```txt
   * /home/user/project
   * ├── data
   * |   ├── data.json
   * |   └── data.yaml
   * └── files
   *     └── data.json
   * ```
   * Let `/home/user/project` be the current working directory. If the test
   * performed on each file in the directories `./data` and `./files` is for a
   * file whose root name is `data`, then the promise will resolve with
   * `/home/user/project/data/data.json`, `/home/user/project/data/data.yaml`
   * and `/home/user/project/files/data.json`. The returned files from the
   * `./data` directory are sorted alphanumerically. The matching files from
   * `./data` are returned before those of `./files` since `./data` was given
   * first as a directory to explore.
   * @returns A promise for an async iterator over the files in the directories
   * that pass all the tests. The files' path are returned in order of directory
   * and sorted alphanumerically by basename in each directory.
   */
  (directories: PathLike | Iterable<PathLike>, ...tests: Matcher[]): Promise<
    Set<string>
  >;
}

/**
 * A files finder is a function that finds zero or more files' path in
 * directories from a given sequence of directories such that each file's path
 * passes a given sequence of tests.
 * @version 0.1.0
 * @author Marc-Antoine Ouimet
 */
export interface FilesFinder extends AsynchronousFilesFinder {
  sync: SynchronousFilesFinder;
}
