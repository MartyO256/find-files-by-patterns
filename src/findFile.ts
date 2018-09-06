import { readdir, readdirSync } from "fs";
import { resolve as resolvePath } from "path";

import { FileFinder } from "./fileFinder";
import { Matcher, matchingFiles } from "./matcher";
import { validateDirectoriesAndTests } from "./validateDirectoriesAndTests";

/**
 * Constructs a file finder in accordance with the `FileFinder` interface's
 * specifications.
 * @see [[FileFinder]] The specifications of a file finder.
 * @param defaultDirectories The directories in which to search for the file if
 * no directories are specified.
 * @returns A file finder function.
 */
const makeFindFile = (
  defaultDirectories: string[] = [process.cwd()],
): FileFinder => {
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
   * The validated asynchronous file finder function.
   * @see [[AsynchronousFileFinder]] The specifications of the function.
   */
  const asyncFinder = (directories: Iterable<string>, tests: Matcher[]) =>
    new Promise<string | null>((resolve, reject) => {
      if (tests.length === 0) {
        resolve(null);
      } else {
        for (let directory of directories) {
          directory = resolvePath(directory);
          readdir(directory, (error, files) => {
            if (error) {
              reject(error);
            }
            try {
              const matches = matchingFiles(directory, files, tests);
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
          });
        }
      }
    });

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
    } else {
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
    }
    return null;
  };

  /**
   * The asynchronous file finder function.
   * @see [[FileFinder]] The specifications of the function.
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
   * The synchronous file finder function.
   * @see [[FileFinder.sync]] The specifications of the function.
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
  return finder as FileFinder;
};

/**
 * A file finder function.
 * @see [[FileFinder]] The specifications of the function.
 * @since 0.1.0
 */
export const findFile: FileFinder = makeFindFile();
