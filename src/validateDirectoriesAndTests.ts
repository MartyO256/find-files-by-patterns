import { isMatcher, Matcher } from "./matcher";

/**
 * Validates given directories and tests such that each of them will be found as
 * an appropriate attribute of the returned object. Using the overloaded
 * definition of a file finder, it is possible for a matcher function to be
 * assigned to the directories if no directories are specified. This function
 * ensures that such a test is unshifted to the actual tests and that the
 * directories are set to the default directories.
 * @param directories The directories to validate.
 * @param tests The tests to validate.
 * @return The validated directories and tests.
 */
export const validateDirectoriesAndTests = (
  directories: string | Iterable<string> | Matcher,
  tests: Matcher[],
  defaultDirectories: Iterable<string>,
): {
  directories: Iterable<string>;
  tests: Matcher[];
} => {
  if (isMatcher(directories)) {
    tests.unshift(directories);
    directories = defaultDirectories;
  }
  if (typeof directories === "string") {
    directories = [directories];
  }
  return {
    directories: directories || [],
    tests,
  };
};
