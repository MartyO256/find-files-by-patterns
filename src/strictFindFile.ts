import { readdirSync } from "fs";
import { resolve as resolvePath } from "path";

import { Matcher, matchingFiles } from "./matcher";
import { StrictFileFinder } from "./strictFileFinder";
import { validateDirectoriesAndTests } from "./validateDirectoriesAndTests";

/**
 * Constructs a strict file finder in accordance with the `StrictFileFinder`
 * interface's specifications.
 * @see [[StrictFileFinder]] The specifications of a strict file finder.
 * @param defaultDirectories The directories in which to search for the file if
 * no directories are specified.
 * @returns A strict find file function.
 */
const makeStrictFindFile = (
  defaultDirectories: string[] = [process.cwd()],
): StrictFileFinder => {
  /**
   * Constructs an error for files or directories' path that are conflicting.
   * @param files The files or directories' path that are conflicting.
   * @returns The error to throw.
   */
  const conflictingFilesError = (files: string[]) =>
    new Error(
      `The following paths are in conflict as they match all the tests in the same directory:\n${files.join(
        "\n",
      )}`,
    );

  /**
   * The validated asynchronous strict file finder function.
   * @see [[AsynchronousStrictFileFinder]] The specifications of the function.
   */
  const asyncFinder = (directories: Iterable<string>, tests: Matcher[]) => {
    if (tests.length === 0) {
      return new Promise<null>((resolve) => resolve(null));
    }
    return new Promise<string | null>((resolve, reject) => {
      for (let directory of directories) {
        directory = resolvePath(directory);
        try {
          const matches = matchingFiles(
            directory,
            readdirSync(directory),
            tests,
          );
          if (matches.length >= 1) {
            if (matches.length === 1) {
              resolve(matches[0]);
            } else {
              reject(conflictingFilesError(matches));
            }
          }
        } catch (error) {
          reject(error);
        }
      }
      resolve(null);
    });
  };
  /**
   * The validated synchronous strict file finder function.
   * @see [[SynchronousStrictFileFinder]] The specifications of the function.
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
      const files = matchingFiles(directory, readdirSync(directory), tests);
      if (files.length >= 1) {
        if (files.length === 1) {
          return files[0];
        } else {
          throw conflictingFilesError(files);
        }
      }
    }
    return null;
  };

  /**
   * The asynchronous strict file finder function.
   * @see [[StrictFileFinder]] The specifications of the function.
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
   * The synchronous strict file finder function.
   * @see [[StrictFileFinder.sync]] The specifications of the function.
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
  return finder as StrictFileFinder;
};

/**
 * A strict file finder function.
 * @see [[StrictFileFinder]] The specifications of the function.
 * @version 0.4.0
 * @since 0.1.0
 */
export const strictFindFile: StrictFileFinder = makeStrictFindFile();
