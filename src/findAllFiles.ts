import { readdirSync } from "fs";
import { join, resolve as resolvePath } from "path";

import { AllFilesFinder } from "./allFilesFinder";
import { concatenatedIterable } from "./concatenatedIterable";
import { filteredIterable } from "./filteredIterable";
import { mappedIterable } from "./mappedIterable";
import { Matcher } from "./matcher";
import { validateDirectoriesAndTests } from "./validateDirectoriesAndTests";

/**
 * The validated asynchronous files finder function.
 * @see [[AsynchronousFilesFinder]] The specifications of the function.
 */
const asyncFinder = (
  directories: Iterable<string>,
  tests: Array<Matcher<string>>,
) => {
  if (tests.length === 0) {
    return new Promise<Set<string>>((resolve) => resolve(new Set<string>()));
  }
  return new Promise<Set<string>>((resolve, reject) => {
    resolve(
      new Set<string>(
        filteredIterable<string>(
          mappedIterable<string, string>(
            concatenatedIterable(directories),
            (directory) => {
              const resolvedDirectory = resolvePath(directory);
              try {
                return readdirSync(resolvedDirectory)
                  .sort()
                  .map((file) => join(resolvedDirectory, file));
              } catch (error) {
                reject(error);
              }
            },
          ),
          tests,
        ),
      ),
    );
  });
};

/**
 * The validated synchronous files finder function.
 * @see [[SynchronousFilesFinder]] The specifications of the function.
 */
const syncFinder = (
  directories: Iterable<string>,
  tests: Array<Matcher<string>>,
) => {
  if (tests.length === 0) {
    return new Set<string>();
  }
  return new Set<string>(
    filteredIterable<string>(
      mappedIterable<string, string>(
        concatenatedIterable(directories),
        (directory) => {
          const resolvedDirectory = resolvePath(directory);
          return readdirSync(resolvedDirectory)
            .sort()
            .map((file) => join(resolvedDirectory, file));
        },
      ),
      tests,
    ),
  );
};

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
   * The asynchronous files finder function.
   * @see [[FilesFinder]] The specifications of the function.
   */
  const finder: any = (
    directories: Iterable<string> | Matcher<string>,
    ...tests: Array<Matcher<string>>
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
    directories: Iterable<string> | Matcher<string>,
    ...tests: Array<Matcher<string>>
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
 * @version 0.6.0
 * @since 0.1.0
 */
export const findAllFiles: AllFilesFinder = makeFindAllFiles();
