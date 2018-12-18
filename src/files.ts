import { realpath, realpathSync } from "fs";
import { resolve } from "path";
import { promisify } from "util";

import { readdir, readdirSync } from "./readdirs";
import { isDirectory, isDirectorySync } from "./stat";

/**
 * A directory in the file system has a path and a depth relative to another
 * directory.
 */
interface Directory {
  /**
   * The path to this directory.
   */
  path: string;

  /**
   * The depth of this directory with respect to the traversal it is subject to.
   */
  depth: number;
}

/**
 * Constructs a directory at the start of a downward traversal.
 * @param path The path to the directory. In order to determine whether or not a
 * directory has been traversed, its real path should not be equal to any of the
 * traversed directory paths.
 * @returns A directory whose depth is `0` at the start of the downward
 * traversal.
 */
const startingDirectory = (path: string): Directory => ({ path, depth: 0 });

/**
 * Constructs a subdirectory given its path and its parent.
 * @param path The path to the subdirectory.
 * @param parent The parent directory.
 * @returns A directory at the given path whose depth is `1` greater than that
 * of its parent.
 */
const subdirectory = (path: string, parent: Directory) => ({
  path,
  depth: parent.depth + 1,
});

/**
 * Constructs a function which determines whether or not a path has been
 * traversed.
 * @param paths The set of traversed paths.
 * @returns A function which determines whether or not a path has been
 * traversed.
 */
const pathHasNotBeenTraversed = (paths: Iterable<string>) => (path: string) => {
  for (const query of paths) {
    if (query === path) {
      return false;
    }
  }
  return true;
};

const realpathNative = promisify(realpath.native);
const realpathNativeSync = realpathSync.native;

/**
 * Constructs an error for a negative maximum depth for downward file fetchers.
 * @param maximumDepth The input maximum depth.
 * @returns An error for a negative maximum depth.
 */
const negativeMaximumDepthError = (maximumDepth: number) =>
  new Error(`The maximum depth of ${maximumDepth} should be positive`);

/**
 * Handles the function overload of downward file fetchers.
 * @param startDirectory The first argument of the function.
 * @param maximumDepth The second argument of the function.
 * @returns The validated arguments for the downward file fetchers function
 * call.
 */
const handleFunctionOverload = (
  startDirectory: number | string = ".",
  maximumDepth?: number,
): [string, number] => {
  if (typeof startDirectory === "number") {
    maximumDepth = startDirectory;
    startDirectory = ".";
  }
  return [startDirectory, maximumDepth];
};

/**
 * A downward files fetcher constructs an iterator over the files downwards from
 * a given directory path.
 */
interface DownwardFilesFetcher extends Function {
  /**
   * Constructs an iterator over the downward files starting from the current
   * working directory. Symbolic links are followed, and the directories are
   * traversed in breadth-first order. Directories are read only once.
   * @returns An iterator over the downward files.
   */
  (): AsyncIterable<string>;

  /**
   * Constructs an iterator over the downward files starting from the current
   * working directory and down to a given maximum depth of a directory.
   * Symbolic links are followed, and the directories are traversed in
   * breadth-first order. Directories are read only once.
   * @param maximumDepth The maximum depth of a read directory relative to the
   * start directory. This maximum depth should be zero or positive.
   * @throws If the maximum depth is negative.
   * @returns An iterator over the downward files down to the maximum depth.
   */
  // tslint:disable-next-line:unified-signatures
  (maximumDepth: number): AsyncIterable<string>;

  /**
   * Constructs an iterator over the downward files starting from a given path.
   * Symbolic links are followed, and the directories are traversed in
   * breadth-first order. Directories are read only once.
   * @param startDirectory The starting directory from which to start the
   * downward traversal.
   * @throws If the starting path is a file.
   * @throws If the starting path is inexistant.
   * @returns An iterator over the downward files.
   */
  // tslint:disable-next-line:unified-signatures
  (startDirectory: string): AsyncIterable<string>;

  /**
   * Constructs an iterator over the downward files starting from a given path
   * and down to a given maximum depth of a directory. Symbolic links are
   * followed, and the directories are traversed in breadth-first order.
   * Directories are read only once.
   * @param startDirectory The starting directory from which to start the
   * downward traversal.
   * @param maximumDepth The maximum depth of a read directory relative to the
   * start directory. This maximum depth should be zero or positive.
   * @throws If the starting path is a file.
   * @throws If the starting path is inexistant.
   * @throws If the maximum depth is negative.
   * @returns An iterator over the downward files down to the maximum depth.
   */
  // tslint:disable-next-line:unified-signatures
  (startDirectory: string, maximumDepth: number): AsyncIterable<string>;
}

/**
 * A downward files fetcher constructs an iterator over the files downwards from
 * a given directory path.
 */
interface DownwardFilesFetcherSync extends Function {
  /**
   * Constructs an iterator over the downward files starting from the current
   * working directory. Symbolic links are followed, and the directories are
   * traversed in breadth-first order. Directories are read only once.
   * @returns An iterator over the downward files.
   */
  (): Iterable<string>;

  /**
   * Constructs an iterator over the downward files starting from the current
   * working directory and down to a given maximum depth of a directory.
   * Symbolic links are followed, and the directories are traversed in
   * breadth-first order. Directories are read only once.
   * @param maximumDepth The maximum depth of a read directory relative to the
   * start directory. This maximum depth should be zero or positive.
   * @throws If the maximum depth is negative.
   * @returns An iterator over the downward files down to the maximum depth.
   */
  // tslint:disable-next-line:unified-signatures
  (maximumDepth: number): Iterable<string>;

  /**
   * Constructs an iterator over the downward files starting from a given path.
   * Symbolic links are followed, and the directories are traversed in
   * breadth-first order. Directories are read only once.
   * @param startDirectory The starting directory from which to start the
   * downward traversal.
   * @throws If the starting path is a file.
   * @throws If the starting path is inexistant.
   * @returns An iterator over the downward files.
   */
  // tslint:disable-next-line:unified-signatures
  (startDirectory: string): Iterable<string>;

  /**
   * Constructs an iterator over the downward files starting from a given path
   * and down to a given maximum depth of a directory. Symbolic links are
   * followed, and the directories are traversed in breadth-first order.
   * Directories are read only once.
   * @param startDirectory The starting directory from which to start the
   * downward traversal.
   * @param maximumDepth The maximum depth of a read directory relative to the
   * start directory. This maximum depth should be zero or positive.
   * @throws If the starting path is a file.
   * @throws If the starting path is inexistant.
   * @throws If the maximum depth is negative.
   * @returns An iterator over the downward files down to the maximum depth.
   */
  // tslint:disable-next-line:unified-signatures
  (startDirectory: string, maximumDepth: number): Iterable<string>;
}

/**
 * @see [[DownwardFilesFetcher]] The specifications of the function.
 */
export const downwardFiles: DownwardFilesFetcher = (
  startDirectory?: number | string,
  maximumDepth?: number,
): AsyncIterable<string> => {
  [startDirectory, maximumDepth] = handleFunctionOverload(
    startDirectory,
    maximumDepth,
  );
  if (maximumDepth === undefined) {
    return unconstrainedDownwardFiles(startDirectory);
  } else if (maximumDepth >= 0) {
    return constrainedDownwardFiles(startDirectory, maximumDepth);
  } else {
    throw negativeMaximumDepthError(maximumDepth);
  }
};

/**
 * Constructs an iterator over the downward files starting from a given path.
 * Symbolic links are followed, and the directories are traversed in
 * breadth-first order. Directories are read only once.
 * @param startDirectory The starting directory from which to start the downward
 * traversal.
 * @throws If the starting path is a file.
 * @throws If the starting path is inexistant.
 * @returns An iterator over the downward files.
 */
async function* unconstrainedDownwardFiles(
  startDirectory: string,
): AsyncIterable<string> {
  const start = resolve(startDirectory);
  const pendingFiles: Array<AsyncIterable<string>> = [readdir(start)];
  const traversedDirectories: string[] = [await realpathNative(start)];
  const isUntraversedDirectory = pathHasNotBeenTraversed(traversedDirectories);
  while (pendingFiles.length > 0) {
    for await (const file of pendingFiles.pop()) {
      yield file;
      if (await isDirectory(file)) {
        const realpath = await realpathNative(file);
        if (isUntraversedDirectory(realpath)) {
          traversedDirectories.push(realpath);
          pendingFiles.unshift(readdir(file));
        }
      }
    }
  }
}

/**
 * Constructs an iterator over the downward files starting from a given path and
 * down to a given maximum depth of a directory. Symbolic links are followed,
 * and the directories are traversed in breadth-first order. Directories are
 * read only once.
 * @param startDirectory The starting directory from which to start the downward
 * traversal.
 * @param maximumDepth The maximum depth of a read directory relative to the
 * start directory. This maximum depth should be zero or positive.
 * @throws If the starting path is a file.
 * @throws If the starting path is inexistant.
 * @throws If the maximum depth is negative.
 * @returns An iterator over the downward files down to the maximum depth.
 */
async function* constrainedDownwardFiles(
  startDirectory: string,
  maximumDepth: number,
): AsyncIterable<string> {
  const start = startingDirectory(resolve(startDirectory));
  const pendingDirectories: Directory[] = [start];
  const traversedDirectories: string[] = [await realpathNative(start.path)];
  const isUntraversed = pathHasNotBeenTraversed(traversedDirectories);
  while (pendingDirectories.length > 0) {
    const currentDirectory = pendingDirectories.pop();
    for await (const file of readdir(currentDirectory.path)) {
      yield file;
      if (await isDirectory(file)) {
        const directory = subdirectory(file, currentDirectory);
        const realpath = await realpathNative(file);
        if (directory.depth <= maximumDepth && isUntraversed(realpath)) {
          traversedDirectories.push(realpath);
          pendingDirectories.unshift(directory);
        }
      }
    }
  }
}

/**
 * @see [[DownwardFilesFetcherSync]] The specifications of the function.
 */
export const downwardFilesSync: DownwardFilesFetcherSync = (
  startDirectory?: number | string,
  maximumDepth?: number,
): Iterable<string> => {
  [startDirectory, maximumDepth] = handleFunctionOverload(
    startDirectory,
    maximumDepth,
  );
  if (maximumDepth === undefined) {
    return unconstrainedDownwardFilesSync(startDirectory);
  } else if (maximumDepth >= 0) {
    return constrainedDownwardFilesSync(startDirectory, maximumDepth);
  } else {
    throw negativeMaximumDepthError(maximumDepth);
  }
};

/**
 * Constructs an iterator over the downward files starting from a given path.
 * Symbolic links are followed, and the directories are traversed in
 * breadth-first order. Directories are read only once.
 * @param startDirectory The starting directory from which to start the downward
 * traversal.
 * @throws If the starting path is a file.
 * @throws If the starting path is inexistant.
 * @returns An iterator over the downward files.
 */
function* unconstrainedDownwardFilesSync(
  startDirectory: string,
): Iterable<string> {
  const start = resolve(startDirectory);
  const pendingFiles: Array<Iterable<string>> = [readdirSync(start)];
  const traversedDirectories: string[] = [realpathNativeSync(start)];
  const isUntraversedDirectory = pathHasNotBeenTraversed(traversedDirectories);
  while (pendingFiles.length > 0) {
    for (const file of pendingFiles.pop()) {
      yield file;
      if (isDirectorySync(file)) {
        const realpath = realpathNativeSync(file);
        if (isUntraversedDirectory(realpath)) {
          traversedDirectories.push(realpath);
          pendingFiles.unshift(readdirSync(file));
        }
      }
    }
  }
}

/**
 * Constructs an iterator over the downward files starting from a given path and
 * down to a given maximum depth of a directory. Symbolic links are followed,
 * and the directories are traversed in breadth-first order. Directories are
 * read only once.
 * @param startDirectory The starting directory from which to start the downward
 * traversal.
 * @param maximumDepth The maximum depth of a read directory relative to the
 * start directory. This maximum depth should be zero or positive.
 * @throws If the starting path is a file.
 * @throws If the starting path is inexistant.
 * @throws If the maximum depth is negative.
 * @returns An iterator over the downward files down to the maximum depth.
 */
function* constrainedDownwardFilesSync(
  startDirectory: string,
  maximumDepth: number,
): Iterable<string> {
  const start = startingDirectory(resolve(startDirectory));
  const pendingDirectories: Directory[] = [start];
  const traversedDirectories: string[] = [realpathNativeSync(start.path)];
  const isUntraversed = pathHasNotBeenTraversed(traversedDirectories);
  while (pendingDirectories.length > 0) {
    const currentDirectory = pendingDirectories.pop();
    for (const file of readdirSync(currentDirectory.path)) {
      yield file;
      if (isDirectorySync(file)) {
        const directory = subdirectory(file, currentDirectory);
        const realpath = realpathNativeSync(file);
        if (directory.depth <= maximumDepth && isUntraversed(realpath)) {
          traversedDirectories.push(realpath);
          pendingDirectories.unshift(directory);
        }
      }
    }
  }
}
