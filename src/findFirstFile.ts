import { readdir, readdirSync } from "fs";
import { resolve as resolvePath } from "path";

import { FirstFileFinder } from "./firstFileFinder";
import { Matcher, matches } from "./matcher";
import { validateDirectoriesAndTests } from "./validateDirectoriesAndTests";

/**
 * Constructs a first file finder in accordance with the `FirstFileFinder` interface's
 * specifications.
 * @see [[FirstFileFinder]] The specifications of a file finder.
 * @param defaultDirectories The directories in which to search for the file if
 * no directories are specified.
 * @returns A first file finder function.
 */
const makeFindFirstFile = (
  defaultDirectories: string[] = [process.cwd()],
): FirstFileFinder => {
  /**
   * The validated asynchronous first file finder function.
   * @see [[AsynchronousFirstFileFinder]] The specifications of the function.
   */
  const asyncFinder = (directories: Iterable<string>, tests: Matcher[]) =>
    new Promise<string | null>((resolve, reject) => {
      if (tests.length === 0) {
        resolve(null);
      }
      for (let directory of directories) {
        directory = resolvePath(directory);
        readdir(directory, (error, files) => {
          if (error) {
            reject(error);
          } else {
            for (const file of files) {
              const path = resolvePath(directory, file);
              try {
                if (matches(path, tests)) {
                  resolve(path);
                }
              } catch (error) {
                reject(error);
              }
            }
          }
        });
      }
    });

  /**
   * The validated synchronous first file finder function.
   * @see [[SynchronousFirstFileFinder]] The specifications of the function.
   */
  const syncFinder = (
    directories: Iterable<string>,
    tests: Matcher[],
  ): string | null => {
    if (tests.length === 0) {
      return null;
    }
    for (let directory of directories) {
      directory = resolvePath(directory);
      for (const file of readdirSync(directory)) {
        const path = resolvePath(directory, file);
        if (matches(path, tests)) {
          return path;
        }
      }
    }
    return null;
  };

  /**
   * The asynchronous first file finder function.
   * @see [[FirstFileFinder]] The specifications of the function.
   */
  const finder: any = (
    directories: string | Iterable<string>,
    ...tests: Matcher[]
  ): Promise<string | null> => {
    const validatedParameters = validateDirectoriesAndTests(
      directories,
      tests,
      defaultDirectories,
    );
    return asyncFinder(
      validatedParameters.directories,
      validatedParameters.tests,
    );
  };

  /**
   * The synchronous first file finder function.
   * @see [[FirstFileFinder.sync]] The specifications of the function.
   */
  finder.sync = (
    directories: string | Iterable<string>,
    ...tests: Matcher[]
  ): string | null => {
    const validatedParameters = validateDirectoriesAndTests(
      directories,
      tests,
      defaultDirectories,
    );
    return syncFinder(
      validatedParameters.directories,
      validatedParameters.tests,
    );
  };
  return finder as FirstFileFinder;
};

/**
 * A first file finder function.
 * @see [[FirstFileFinder]] The specifications of the function.
 * @since 0.2.0
 */
export const findFirstFile: FirstFileFinder = makeFindFirstFile();
