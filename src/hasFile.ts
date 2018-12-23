import {
  conjunction,
  conjunctionSync,
  filter,
  Filter,
  FilterSync,
  filterSync,
} from "./filter";
import { firstElement, firstElementSync } from "./iterable";
import { readdir, readdirSync } from "./readdirs";
import { isDirectory, isDirectorySync } from "./stat";

/**
 * Constructs a filter which determines whether of not a directory has a file or
 * directory's path that passes a given test. The returned filter will
 * arbitrarily be false for any path that isn't a directory. The path should
 * have already been resolved.
 * @param test The test to perform on each files' path until there is a match.
 * @throws If the test throws an error for any of the files in the directory.
 * @returns A filter which determines whether of not a directory has a file or
 * directory's path that passes a given test.
 */
export const hasFile = (
  test: Filter<string> | FilterSync<string>,
): Filter<string> =>
  conjunction([
    isDirectory,
    async (directory: string): Promise<boolean> =>
      (await firstElement(filter(readdir(directory), test))) !== null,
  ]);

/**
 * Constructs a filter which determines whether of not a directory has a file or
 * directory's path that passes a given test. The returned filter will
 * arbitrarily be false for any path that isn't a directory. The path should
 * have already been resolved.
 * @param test The test to perform on each files' path until there is a match.
 * @throws If the test throws an error for any of the files in the directory.
 * @returns A filter which determines whether of not a directory has a file or
 * directory's path that passes a given test.
 */
export const hasFileSync = (test: FilterSync<string>): FilterSync<string> =>
  conjunctionSync([
    isDirectorySync,
    (directory: string): boolean =>
      firstElementSync(filterSync(readdirSync(directory), test)) !== null,
  ]);
