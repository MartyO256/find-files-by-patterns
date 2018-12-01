import { readdirSync } from "fs";
import { join, resolve } from "path";

import { filteredIterable } from "./filteredIterable";
import { mappedIterable } from "./mappedIterable";
import { Matcher } from "./matcher";

/**
 * Creates an iterable over the files and directories' paths that pass the given
 * sequence of tests in the given directories.
 * @param directories The sequence of directories to read.
 * @param tests The sequence of tests a file must pass in order to be iterated
 * over.
 * @return An iterable over the files and directories' paths that pass the given
 * sequence of tests in the given directories.
 * @since 0.7.0
 * @version 0.7.0
 */
export const files = (
  directories: string | Iterable<string>,
  ...tests: Array<Matcher<string>>
): Iterable<string> => {
  if (typeof directories === "string") {
    directories = [directories]; // Strings are iterable
  }
  return filteredIterable<string>(
    mappedIterable<string, string>(directories, (directory) => {
      const resolvedDirectory = resolve(directory);
      return readdirSync(resolvedDirectory)
        .sort()
        .map((file) => join(resolvedDirectory, file));
    }),
    tests,
  );
};
