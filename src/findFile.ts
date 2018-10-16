import { readdirSync } from "fs";
import { resolve as resolvePath } from "path";

import { FileFinder } from "./fileFinder";
import { Matcher, matches } from "./matcher";
import { validateDirectoriesAndTests } from "./validateDirectoriesAndTests";

/**
 * Constructs a file finder in accordance with the `FileFinder` interface's
 * specifications.
 * @see [[FileFinder]] The specifications of a file finder.
 * @param defaultDirectories The directories in which to search for the file if
 * no directories are specified.
 * @returns A find file function.
 */
const makeFindFile = (
  defaultDirectories: string[] = [process.cwd()],
): FileFinder => {
  /**
   * The validated asynchronous file finder function.
   * @see [[AsynchronousFileFinder]] The specifications of the function.
   */
  const asyncFinder = (directories: Iterable<string>, tests: Matcher[]) => {
    if (tests.length === 0) {
      return new Promise<null>((resolve) => resolve(null));
    }
    return new Promise<string | null>((resolve, reject) => {
      for (let directory of directories) {
        directory = resolvePath(directory);
        try {
          readdirSync(directory).forEach((file) => {
            const path = resolvePath(directory, file);
            if (matches(path, tests)) {
              resolve(path);
            }
          });
        } catch (error) {
          reject(error);
        }
      }
      resolve(null);
    });
  };

  /**
   * The validated synchronous file finder function.
   * @see [[SynchronousFileFinder]] The specifications of the function.
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
   * The asynchronous file finder function.
   * @see [[FileFinder]] The specifications of the function.
   */
  const finder: any = (
    directories: string | Iterable<string> | Matcher,
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
   * The synchronous file finder function.
   * @see [[FileFinder.sync]] The specifications of the function.
   */
  finder.sync = (
    directories: string | Iterable<string> | Matcher,
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
  return finder as FileFinder;
};

/**
 * A file finder function.
 * @see [[FileFinder]] The specifications of the function.
 * @version 0.4.0
 * @since 0.2.0
 */
export const findFile: FileFinder = makeFindFile();
