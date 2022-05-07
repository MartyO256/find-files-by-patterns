import {
  conjunction,
  conjunctionSync,
  Filter,
  filter,
  FilterSync,
  filterSync,
} from "./filter.js";
import {
  allElements,
  allElementsSync,
  firstElement,
  firstElementSync,
  onlyElement,
  onlyElementSync,
} from "./iterable.js";
import { readdir, readdirs, readdirsSync, readdirSync } from "./readdirs.js";

/**
 * Handles the function overload of asynchronous file finders. Converts a string
 * first argument into an iterable over strings. Unshifts a function first
 * argument into the array of filters. Sets the directories to the current
 * working directory if it is undefined.
 * @param directories The first argument of the function.
 * @param tests The array of tests to perform in the file finder function.
 * @returns The validated arguments for the file finder function call.
 */
const handleFunctionOverload = (
  directories:
    | undefined
    | string
    | Iterable<string>
    | AsyncIterable<string>
    | Filter<string>
    | FilterSync<string>,
  tests: Array<Filter<string> | FilterSync<string>>,
): [
  Iterable<string> | AsyncIterable<string>,
  Array<Filter<string> | FilterSync<string>>,
] => {
  if (typeof directories === "string") {
    directories = [directories];
  } else if (typeof directories === "function") {
    tests.unshift(directories);
    directories = ["."];
  } else if (!directories) {
    directories = ["."];
  }
  return [directories, tests];
};

/**
 * Handles the function overload of synchronous file finders. Converts a string
 * first argument into an iterable over strings. Unshifts a function first
 * argument into the array of filters. Sets the directories to the current
 * working directory if it is undefined.
 * @param directories The first argument of the function.
 * @param tests The array of tests to perform in the file finder function.
 * @returns The validated arguments for the file finder function call.
 */
const handleFunctionOverloadSync = (
  directories: string | Iterable<string> | FilterSync<string>,
  tests: Array<FilterSync<string>>,
): [Iterable<string>, Array<FilterSync<string>>] => {
  if (typeof directories === "string") {
    directories = [directories];
  } else if (typeof directories === "function") {
    tests.unshift(directories);
    directories = ["."];
  } else if (!directories) {
    directories = ["."];
  }
  return [directories, tests];
};

/**
 * Reads the current working directory and performs the given tests on all of
 * its soft and hard-linked files in order to find the first file or
 * directory's path in it that passes all of the tests.
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
 * ```plaintext
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
 * ```plaintext
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
 * ```plaintext
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
export async function findFile(
  ...tests: Array<Filter<string> | FilterSync<string>>
): Promise<string | null>;

/**
 * Reads the given directories and performs the given tests on all of their
 * soft and hard-linked files in order to find the first file or directory's
 * path in its directory that passes all of the tests.
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
 * ```plaintext
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
 * ```plaintext
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
 * ```plaintext
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
 * ```plaintext
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
 * ```plaintext
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
 * ```plaintext
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
export async function findFile(
  directories: string | AsyncIterable<string> | Iterable<string>,
  ...tests: Array<Filter<string> | FilterSync<string>>
): Promise<string | null>;

/**
 * Reads the given directories and performs the given tests on all of their soft
 * and hard-linked files in order to find the first file or directory's path in
 * its directory that passes all of the tests.
 */
export async function findFile(
  directories?:
    | string
    | AsyncIterable<string>
    | Iterable<string>
    | Filter<string>
    | FilterSync<string>,
  ...filters: Array<Filter<string> | FilterSync<string>>
): Promise<string | null> {
  [directories, filters] = handleFunctionOverload(directories, filters);
  return filters.length > 0
    ? firstElement(filter(readdirs(directories), conjunction(filters)))
    : null;
}

/**
 * Reads the current working directory and performs the given tests on all of
 * its soft and hard-linked files in order to find the first file or
 * directory's path in it that passes all of the tests.
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
 * ```plaintext
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
 * ```plaintext
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
export function findFileSync(
  ...tests: Array<FilterSync<string>>
): string | null;

/**
 * Reads the given directories and performs the given tests on all of their
 * soft and hard-linked files in order to find the first file or directory's
 * path in its directory that passes all of the tests.
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
 * ```plaintext
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
 * ```plaintext
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
 * ```plaintext
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
 * ```plaintext
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
 * ```plaintext
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
 * ```plaintext
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
export function findFileSync(
  directories: string | Iterable<string>,
  ...tests: Array<FilterSync<string>>
): string | null;

/**
 * Reads the given directories and performs the given tests on all of their soft
 * and hard-linked files in order to find the first file or directory's path in
 * its directory that passes all of the tests.
 */
export function findFileSync(
  directories?: string | Iterable<string> | FilterSync<string>,
  ...filters: Array<FilterSync<string>>
): string | null {
  [directories, filters] = handleFunctionOverloadSync(directories, filters);
  return filters.length > 0
    ? firstElementSync(
        filterSync(readdirsSync(directories), conjunctionSync(filters)),
      )
    : null;
}

/**
 * Reads the current working directory and performs the given tests on all of
 * its soft and hard-linked files in order to find the first and only file or
 * directory's path in it that passes all of the tests.
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
 * ```plaintext
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
 * ```plaintext
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
 * ```plaintext
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
export async function findOnlyFile(
  ...tests: Array<Filter<string> | FilterSync<string>>
): Promise<string | null>;

/**
 * Reads the given directories and performs the given tests on all of their
 * soft and hard-linked files in order to find the first and only file or
 * directory's path in its directory that passes all of the tests.
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
 * ```plaintext
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
 * ```plaintext
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
 * ```plaintext
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
 * ```plaintext
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
 * ```plaintext
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
 * ```plaintext
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
export async function findOnlyFile(
  directories: string | AsyncIterable<string> | Iterable<string>,
  ...tests: Array<Filter<string> | FilterSync<string>>
): Promise<string | null>;

/**
 * Reads the given directories and performs the given tests on all of their soft
 * and hard-linked files in order to find the first and only file or directory's
 * path in its directory that passes all of the tests.
 */
export async function findOnlyFile(
  directories?:
    | string
    | AsyncIterable<string>
    | Iterable<string>
    | Filter<string>
    | FilterSync<string>,
  ...filters: Array<Filter<string> | FilterSync<string>>
): Promise<string | null> {
  [directories, filters] = handleFunctionOverload(directories, filters);
  if (filters.length > 0) {
    for await (const directory of directories) {
      const match = await onlyElement(
        filter(readdir(directory), conjunction(filters)),
      );
      if (match) {
        return match;
      }
    }
  }
  return null;
}

/**
 * Reads the current working directory and performs the given tests on all of
 * its soft and hard-linked files in order to find the first and only file or
 * directory's path in it that passes all of the tests.
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
 * ```plaintext
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
 * ```plaintext
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
 * ```plaintext
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
export function findOnlyFileSync(
  ...tests: Array<FilterSync<string>>
): string | null;

/**
 * Reads the given directories and performs the given tests on all of their
 * soft and hard-linked files in order to find the first and only file or
 * directory's path in its directory that passes all of the tests.
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
 * ```plaintext
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
 * ```plaintext
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
 * ```plaintext
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
 * ```plaintext
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
 * ```plaintext
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
 * ```plaintext
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
export function findOnlyFileSync(
  directories: string | Iterable<string>,
  ...tests: Array<FilterSync<string>>
): string | null;

/**
 * Reads the given directories and performs the given tests on all of their soft
 * and hard-linked files in order to find the first and only file or directory's
 * path in its directory that passes all of the tests.
 */
export function findOnlyFileSync(
  directories?: string | Iterable<string> | FilterSync<string>,
  ...filters: Array<FilterSync<string>>
): string | null {
  [directories, filters] = handleFunctionOverloadSync(directories, filters);
  if (filters.length > 0) {
    for (const directory of directories) {
      const match = onlyElementSync(
        filterSync(readdirSync(directory), conjunctionSync(filters)),
      );
      if (match) {
        return match;
      }
    }
  }
  return null;
}

/**
 * Reads the current working directory and performs the given tests on all of
 * its soft and hard-linked files in order to find the files or directories
 * whose path passes all of the tests.
 * @param tests The sequence of tests a file or directory's path must pass in
 * order to be considered among the desired paths to be found. If a path does
 * not match any of the tests, then it is ignored. If no tests are specified,
 * then the promise will arbitrarily be resolved to `null`.
 * @rejects If one of the given tests throws an error.
 * @example Consider the following file structure:
 *
 * ```plaintext
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
 * ```plaintext
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
 * @returns The files or directories' path in the current working directory
 * that pass all the tests. These paths are sorted alphanumerically.
 */
export async function findAllFiles(
  ...tests: Array<Filter<string> | FilterSync<string>>
): Promise<string[]>;

/**
 * Reads the given directories and performs the given tests on all of their
 * soft and hard-linked files in order to find the files or directories' path
 * that passes all of the tests.
 * @param directories The directories' path in which to search for files or
 * directories' path that pass all the tests. If any of these directories is
 * not absolute, then it is resolved relative to the current working
 * directory.
 * @param tests The sequence of tests a file or directory's path must pass in
 * order to be considered among the paths found. If a path does not match any
 * of the tests, then it is ignored.
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
 * ```plaintext
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
 * ```plaintext
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
 * @returns A promise for the files or directories' path in the directories
 * that pass all the tests. The paths are returned in order of directory and
 * sorted alphanumerically by base name in each directory.
 */
export async function findAllFiles(
  directories: string | AsyncIterable<string> | Iterable<string>,
  ...tests: Array<Filter<string> | FilterSync<string>>
): Promise<string[]>;

/**
 * Reads the given directories and performs the given tests on all of their soft
 * and hard-linked files in order to find the files or directories whose path
 * passes all of the tests.
 */
export async function findAllFiles(
  directories?:
    | string
    | AsyncIterable<string>
    | Iterable<string>
    | Filter<string>
    | FilterSync<string>,
  ...filters: Array<Filter<string> | FilterSync<string>>
): Promise<string[]> {
  [directories, filters] = handleFunctionOverload(directories, filters);
  return filters.length === 0
    ? []
    : allElements(filter(readdirs(directories), conjunction(filters)));
}

/**
 * Reads the current working directory and performs the given tests on all of
 * its soft and hard-linked files in order to find the files or directories
 * whose path passes all of the tests.
 * @param tests The sequence of tests a file or directory's path must pass in
 * order to be considered among the desired paths to be found. If a path does
 * not match any of the tests, then it is ignored. If no tests are specified,
 * then the function will arbitrarily return `null`.
 * @throws If one of the given tests throws an error.
 * @example Consider the following file structure:
 *
 * ```plaintext
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
 * ```plaintext
 * /home/user/project/data
 * ├── data.json
 * └── data.yaml
 * ```
 *
 * If the current working directory is `/home/user/project` and the test
 * performed on each file of the directory is for a file whose root name is
 * `data`, then the function will return `/home/user/project/data/data.json`
 * and `/home/user/project/data/data.yaml`.
 * @returns The files or directories' path in the current working directory
 * that pass all the tests. These paths are sorted alphanumerically.
 */
export function findAllFilesSync(...tests: Array<FilterSync<string>>): string[];

/**
 * Reads the given directories and performs the given tests on all of their
 * soft and hard-linked files in order to find the files or directories whose
 * path passes all of the tests.
 * @param directories The directories' path in which to search for all the
 * files or directories' path that pass all the tests. If any of these
 * directories is not absolute, then it is resolved relative to the current
 * working directory.
 * @param tests The sequence of tests a file or directory's path must pass in
 * order to be considered among the desired paths to be found. If a path does
 * not match any of the tests, then it is ignored. If no tests are specified,
 * then the function will arbitrarily return `null`.
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
 * ```plaintext
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
 * ```plaintext
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
 * @returns The files or directories' path in the given directories that pass
 * all the tests. The paths are returned in order of directory and sorted
 * alphanumerically by base name in each directory.
 */
export function findAllFilesSync(
  directories: string | Iterable<string>,
  ...tests: Array<FilterSync<string>>
): string[];

/**
 * Reads the given directories and performs the given tests on all of their soft
 * and hard-linked files in order to find the files or directories whose path
 * passes all of the tests.
 */
export function findAllFilesSync(
  directories?: string | Iterable<string> | FilterSync<string>,
  ...filters: Array<FilterSync<string>>
): string[] {
  [directories, filters] = handleFunctionOverloadSync(directories, filters);
  return filters.length === 0
    ? []
    : allElementsSync(
        filterSync(readdirsSync(directories), conjunctionSync(filters)),
      );
}
