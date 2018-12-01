import { resolve as resolvePath } from "path";

import { files } from "./files";
import { Matcher } from "./matcher";
import { StrictFileFinder } from "./strictFileFinder";
import { validateDirectoriesAndTests } from "./validateDirectoriesAndTests";

/**
 * Constructs an error for files or directories' path that are conflicting.
 * @param files The files or directories' path that are conflicting.
 * @returns The error to throw.
 */
const conflictingFilesError = (...files: string[]) =>
  new Error(
    `The following paths are in conflict as they match all the tests in the same directory:\n${files.join(
      "\n",
    )}`,
  );

/**
 * The validated asynchronous strict file finder function.
 * @see [[AsynchronousStrictFileFinder]] The specifications of the function.
 */
const asyncFinder = (
  directories: Iterable<string>,
  tests: Array<Matcher<string>>,
) => {
  if (tests.length === 0) {
    return new Promise<null>((resolve) => resolve(null));
  }
  return new Promise<string | null>((resolve, reject) => {
    try {
      for (let directory of directories) {
        directory = resolvePath(directory);
        let retainedMatch: string | undefined;
        for (const match of files(directory, ...tests)) {
          if (retainedMatch) {
            throw conflictingFilesError(retainedMatch, match);
          }
          retainedMatch = match;
        }
        if (retainedMatch) {
          resolve(retainedMatch);
        }
      }
    } catch (error) {
      reject(error);
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
  tests: Array<Matcher<string>>,
): string | null => {
  if (tests.length === 0) {
    return null;
  }
  for (let directory of directories) {
    directory = resolvePath(directory);
    let retainedMatch: string | undefined;
    for (const match of files(directory, ...tests)) {
      if (retainedMatch) {
        throw conflictingFilesError(retainedMatch, match);
      }
      retainedMatch = match;
    }
    if (retainedMatch) {
      return retainedMatch;
    }
  }
  return null;
};

/**
 * Constructs a strict file finder in accordance with the `StrictFileFinder`
 * interface's specifications.
 * @see [[StrictFileFinder]] The specifications of a strict file finder.
 * @returns A strict find file function.
 */
export const makeStrictFindFile = (): StrictFileFinder => {
  /**
   * The asynchronous strict file finder function.
   * @see [[StrictFileFinder]] The specifications of the function.
   */
  const finder: any = (
    directories: string | Iterable<string> | Matcher<string>,
    ...tests: Array<Matcher<string>>
  ): Promise<string | null> => {
    const validatedParameters = validateDirectoriesAndTests(directories, tests);
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
    directories: string | Iterable<string> | Matcher<string>,
    ...tests: Array<Matcher<string>>
  ): string | null => {
    const validatedParameters = validateDirectoriesAndTests(directories, tests);
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
 * @version 0.7.0
 * @since 0.1.0
 */
export const strictFindFile: StrictFileFinder = makeStrictFindFile();
