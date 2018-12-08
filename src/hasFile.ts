import {
  conjunction,
  conjunctionSync,
  filter,
  Filter,
  FilterSync,
  filterSync,
} from "./filter";
import { readdir, readdirSync } from "./readdirs";
import { isDirectory, isDirectorySync } from "./stat";

/**
 * Constructs a filter which determines whether of not a directory has a file or
 * directory's path that passes a given sequence of tests. The returned filter
 * will arbitrarily be false for any path that isn't a directory. The path
 * should have already been resolved.
 * @param tests The tests to perform on each files' path until there is a match.
 * @throws If any of the tests throws an error for any of the files in the
 * directory.
 * @returns A filter which determines whether of not a directory has a file or
 * directory's path that passes a given sequence of tests.
 */
export const hasFile = (
  ...tests: Array<Filter<string> | FilterSync<string>>
): Filter<string> => {
  const test = conjunction(tests);
  return conjunction([
    isDirectory,
    async (directory: string): Promise<boolean> => {
      for await (const match of filter(readdir(directory), test)) {
        return true;
      }
      return false;
    },
  ]);
};

/**
 * Constructs a filter which determines whether of not a directory has a file or
 * directory's path that passes a given sequence of tests. The returned filter
 * will arbitrarily be false for any path that isn't a directory. The path
 * should have already been resolved.
 * @param tests The tests to perform on each files' path until there is a match.
 * @throws If any of the tests throws an error for any of the files in the
 * directory.
 * @returns A filter which determines whether of not a directory has a file or
 * directory's path that passes a given sequence of tests.
 */
export const hasFileSync = (
  ...tests: Array<FilterSync<string>>
): FilterSync<string> => {
  const test = conjunctionSync(tests);
  return conjunctionSync([
    isDirectorySync,
    (directory: string): boolean => {
      for (const match of filterSync(readdirSync(directory), test)) {
        return true;
      }
      return false;
    },
  ]);
};
