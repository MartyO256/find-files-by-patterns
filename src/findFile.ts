import { FileFinder } from "./fileFinder";
import { files } from "./files";
import { Matcher } from "./matcher";
import { validateDirectoriesAndTests } from "./validateDirectoriesAndTests";

/**
 * The validated asynchronous file finder function.
 * @see [[AsynchronousFileFinder]] The specifications of the function.
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
      for (const file of files(directories, ...tests)) {
        resolve(file);
      }
    } catch (error) {
      reject(error);
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
  tests: Array<Matcher<string>>,
): string | null => {
  if (tests.length === 0) {
    return null;
  }
  for (const file of files(directories, ...tests)) {
    return file;
  }
  return null;
};

/**
 * Constructs a file finder in accordance with the `FileFinder` interface's
 * specifications.
 * @see [[FileFinder]] The specifications of a file finder.
 * @returns A find file function.
 */
export const makeFindFile = (): FileFinder => {
  /**
   * The asynchronous file finder function.
   * @see [[FileFinder]] The specifications of the function.
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
   * The synchronous file finder function.
   * @see [[FileFinder.sync]] The specifications of the function.
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
  return finder as FileFinder;
};

/**
 * A file finder function.
 * @see [[FileFinder]] The specifications of the function.
 * @version 0.7.0
 * @since 0.2.0
 */
export const findFile: FileFinder = makeFindFile();
