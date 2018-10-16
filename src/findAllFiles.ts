import { readdirSync } from "fs";
import { resolve as resolvePath } from "path";

import { AllFilesFinder } from "./allFilesFinder";
import { Matcher, matchingFiles } from "./matcher";
import { validateDirectoriesAndTests } from "./validateDirectoriesAndTests";

/**
 * Constructs an all files finder in accordance with the `AllFilesFinder`
 * interface's specifications.
 * @see [[AllFilesFinder]] The specifications of an all files finder.
 * @param defaultDirectories The directories in which to search for the files if
 * no directories are specified.
 * @returns A find all files function.
 */
const makeFindAllFiles = (
  defaultDirectories: string[] = [process.cwd()],
): AllFilesFinder => {
  /**
   * The validated asynchronous files finder function.
   * @see [[AsynchronousFilesFinder]] The specifications of the function.
   */
  const asyncFinder = (directories: Iterable<string>, tests: Matcher[]) => {
    const expandedDirectories: string[] = [...directories];
    if (tests.length === 0 || expandedDirectories.length === 0) {
      return new Promise<Set<string>>((resolve) => resolve(new Set<string>()));
    }
    return new Promise<Set<string>>((resolve, reject) => {
      resolve(
        new Set<string>(
          expandedDirectories
            .map((directory) => resolvePath(directory))
            .map((directory) => {
              try {
                return matchingFiles(
                  directory,
                  readdirSync(directory),
                  tests,
                ).sort();
              } catch (error) {
                reject(error);
                return [];
              }
            })
            .reduce((previous, current) => {
              return previous.concat(current);
            }),
        ),
      );
    });
  };

  /**
   * The validated synchronous files finder function.
   * @see [[SynchronousFilesFinder]] The specifications of the function.
   */
  const syncFinder = (directories: Iterable<string>, tests: Matcher[]) => {
    const expandedDirectories = [...directories];
    if (tests.length === 0 || expandedDirectories.length === 0) {
      return new Set<string>();
    }
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
  };

  /**
   * The asynchronous files finder function.
   * @see [[FilesFinder]] The specifications of the function.
   */
  const finder: any = (
    directories: Iterable<string> | Matcher,
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
    directories: Iterable<string> | Matcher,
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
  return finder as AllFilesFinder;
};

/**
 * A files finder function.
 * @see [[AllFilesFinder]] The specifications of the function.
 * @version 0.4.0
 * @since 0.1.0
 */
export const findAllFiles: AllFilesFinder = makeFindAllFiles();
