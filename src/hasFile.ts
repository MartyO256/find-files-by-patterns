import { existsSync, readdirSync, statSync } from "fs";
import { join } from "path";

import { filteredIterable } from "./filteredIterable";
import { mappedIterable } from "./mappedIterable";
import { Matcher } from "./matcher";

/**
 * Constructs a matcher function which determines whether of not a directory has
 * a file or directory's path that passes a given sequence of tests. The
 * returned matcher function will arbitrarily be false for any path that isn't a
 * directory. The path should have already been resolved.
 * @param tests The tests to perform on each files' path until there is a match.
 * @throws If any of the tests throws an error for any of the files in the
 * directory.
 * @returns A matcher function which determines whether of not a directory has a
 * file or directory's path that passes a given sequence of tests.
 * @see [[statSync]] How the file statuses are retrieved.
 * @since 0.6.0
 * @version 0.6.0
 */
export const hasFile = (...tests: Array<Matcher<string>>): Matcher<string> => (
  path: string,
): boolean => {
  if (existsSync(path) && statSync(path).isDirectory()) {
    for (const match of filteredIterable(
      mappedIterable(readdirSync(path), (file) => join(path, file)),
      tests,
    )) {
      return true;
    }
  }
  return false;
};
