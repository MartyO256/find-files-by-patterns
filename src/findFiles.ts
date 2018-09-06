import { readdir, readdirSync } from "fs";
import { resolve as resolvePath } from "path";

import { FilesFinder } from "./filesFinder";
import { Matcher, matchingFiles } from "./matcher";
import { validateDirectoriesAndTests } from "./validateDirectoriesAndTests";

/**
 * Constructs a files finder in accordance with the `FileFinder` interface's
 * specifications.
 * @see [[FilesFinder]] The specifications of a files finder.
 * @param defaultDirectories The directories in which to search for the files if
 * no directories are specified.
 * @returns A files finder function.
 */
const makeFindFiles = (
  defaultDirectories: string[] = [process.cwd()],
): FilesFinder => {
  /**
   * The validated asynchronous files finder function.
   * @see [[AsynchronousFilesFinder]] The specifications of the function.
   */
  const asyncFinder = (directories: Iterable<string>, tests: Matcher[]) =>
    new Promise<Set<string>>((resolve, reject) => {
      const expandedDirectories: string[] = [...directories];
      if (tests.length === 0 || expandedDirectories.length === 0) {
        resolve(new Set<string>());
      } else {
        expandedDirectories
          .map((directory) => resolvePath(directory))
          .map(
            (directory) =>
              new Promise<string[]>((resolve) => {
                readdir(directory, (error, files) => {
                  if (error) {
                    reject(error);
                  } else {
                    try {
                      resolve(matchingFiles(directory, files, tests).sort());
                    } catch (error) {
                      reject(error);
                    }
                  }
                });
              }),
          )
          .reduce(
            (previous, current) =>
              new Promise<string[]>((resolve) =>
                Promise.all([previous, current]).then((files) =>
                  resolve(files[0].concat(files[1])),
                ),
              ),
          )
          .then((files) => resolve(new Set<string>(files)));
      }
    });

  /**
   * The validated synchronous files finder function.
   * @see [[SynchronousFilesFinder]] The specifications of the function.
   */
  const syncFinder = (directories: Iterable<string>, tests: Matcher[]) => {
    const expandedDirectories = [...directories];
    if (tests.length === 0 || expandedDirectories.length === 0) {
      return new Set<string>();
    } else {
      return new Set<string>(
        expandedDirectories
          .map((directory) => resolvePath(directory))
          .map((directory) =>
            matchingFiles(directory, readdirSync(directory), tests).sort(),
          )
          .reduce((previousFiles, currentFiles) =>
            previousFiles.concat(currentFiles),
          ),
      );
    }
  };

  /**
   * The asynchronous files finder function.
   * @see [[FilesFinder]] The specifications of the function.
   */
  const finder: any = (
    directories: Iterable<string>,
    ...tests: Matcher[]
  ): Promise<Set<string>> => {
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
   * The synchronous files finder function.
   * @see [[FilesFinder.sync]] The specifications of the function.
   */
  finder.sync = (
    directories: Iterable<string>,
    ...tests: Matcher[]
  ): Set<string> => {
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
  return finder as FilesFinder;
};

export const findFiles: FilesFinder = makeFindFiles();
