import {
  conjunction,
  conjunctionSync,
  Filter,
  filter,
  FilterSync,
  filterSync,
} from "./filter";
import {
  allElements,
  allElementsSync,
  firstElement,
  firstElementSync,
  strictFirstElement,
  strictFirstElementSync,
} from "./iterable";
import { readdir, readdirs, readdirsSync, readdirSync } from "./readdirs";

import { AllFilesFinder, AllFilesFinderSync } from "./allFilesFinder";
import { FileFinder, FileFinderSync } from "./fileFinder";
import { StrictFileFinder, StrictFileFinderSync } from "./strictFileFinder";

/**
 * Handles the function overload of asynchronous file finders. Converts a string
 * first argument into an iterable over strings. Unshifts a function first
 * argument into the array of filters. Sets the directories to the current
 * working directory if it is undefined.
 * @param directories The first argument of the function.
 * @param tests The array of tests to perform in the file finder function.
 * @returns The validated arguments for the file finder function call.
 */
const handleFunctionOverload = (
  directories:
    | undefined
    | string
    | Iterable<string>
    | AsyncIterable<string>
    | Filter<string>
    | FilterSync<string>,
  tests: Array<Filter<string> | FilterSync<string>>,
): [
  Iterable<string> | AsyncIterable<string>,
  Array<Filter<string> | FilterSync<string>>
] => {
  if (typeof directories === "string") {
    directories = [directories];
  } else if (typeof directories === "function") {
    tests.unshift(directories);
    directories = ["."];
  } else if (!directories) {
    directories = ["."];
  }
  return [directories, tests];
};

/**
 * Handles the function overload of synchronous file finders. Converts a string
 * first argument into an iterable over strings. Unshifts a function first
 * argument into the array of filters. Sets the directories to the current
 * working directory if it is undefined.
 * @param directories The first argument of the function.
 * @param tests The array of tests to perform in the file finder function.
 * @returns The validated arguments for the file finder function call.
 */
const handleFunctionOverloadSync = (
  directories: string | Iterable<string> | FilterSync<string>,
  tests: Array<FilterSync<string>>,
): [Iterable<string>, Array<FilterSync<string>>] => {
  if (typeof directories === "string") {
    directories = [directories];
  } else if (typeof directories === "function") {
    tests.unshift(directories);
    directories = ["."];
  } else if (!directories) {
    directories = ["."];
  }
  return [directories, tests];
};

/**
 * @see [[FileFinder]]
 */
export const findFile: FileFinder = async (
  directories?:
    | string
    | AsyncIterable<string>
    | Iterable<string>
    | Filter<string>
    | FilterSync<string>,
  ...filters: Array<Filter<string> | FilterSync<string>>
): Promise<string | null> => {
  [directories, filters] = handleFunctionOverload(directories, filters);
  return filters.length > 0
    ? firstElement(filter(readdirs(directories), conjunction(filters)))
    : null;
};

/**
 * @see [[FileFinderSync]]
 */
export const findFileSync: FileFinderSync = (
  directories?: string | Iterable<string> | FilterSync<string>,
  ...filters: Array<FilterSync<string>>
): string | null => {
  [directories, filters] = handleFunctionOverloadSync(directories, filters);
  return filters.length > 0
    ? firstElementSync(
        filterSync(readdirsSync(directories), conjunctionSync(filters)),
      )
    : null;
};

/**
 * @see [[StrictFileFinder]]
 */
export const strictFindFile: StrictFileFinder = async (
  directories?:
    | string
    | AsyncIterable<string>
    | Iterable<string>
    | Filter<string>
    | FilterSync<string>,
  ...filters: Array<Filter<string> | FilterSync<string>>
): Promise<string | null> => {
  [directories, filters] = handleFunctionOverload(directories, filters);
  if (filters.length > 0) {
    for await (const directory of directories) {
      const match = await strictFirstElement(
        filter(readdir(directory), conjunction(filters)),
      );
      if (match) {
        return match;
      }
    }
  }
  return null;
};

/**
 * @see [[StrictFileFinderSync]]
 */
export const strictFindFileSync: StrictFileFinderSync = (
  directories?: string | Iterable<string> | FilterSync<string>,
  ...filters: Array<FilterSync<string>>
): string | null => {
  [directories, filters] = handleFunctionOverloadSync(directories, filters);
  if (filters.length > 0) {
    for (const directory of directories) {
      const match = strictFirstElementSync(
        filterSync(readdirSync(directory), conjunctionSync(filters)),
      );
      if (match) {
        return match;
      }
    }
  }
  return null;
};

/**
 * @see [[AllFilesFinder]]
 */
export const findAllFiles: AllFilesFinder = async (
  directories?:
    | string
    | AsyncIterable<string>
    | Iterable<string>
    | Filter<string>
    | FilterSync<string>,
  ...filters: Array<Filter<string> | FilterSync<string>>
): Promise<string[]> => {
  [directories, filters] = handleFunctionOverload(directories, filters);
  return filters.length === 0
    ? []
    : allElements(filter(readdirs(directories), conjunction(filters)));
};

/**
 * @see [[AllFilesFinderSync]]
 */
export const findAllFilesSync: AllFilesFinderSync = (
  directories?: string | Iterable<string> | FilterSync<string>,
  ...filters: Array<FilterSync<string>>
): string[] => {
  [directories, filters] = handleFunctionOverloadSync(directories, filters);
  return filters.length === 0
    ? []
    : allElementsSync(
        filterSync(readdirsSync(directories), conjunctionSync(filters)),
      );
};
