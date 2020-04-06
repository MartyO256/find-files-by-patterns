import { realpath, realpathSync } from "fs";
import { resolve } from "path";
import { promisify } from "util";

import { upwardDirectories, upwardDirectoriesSync } from "./directories";
import { readdir, readdirs, readdirsSync, readdirSync } from "./readdirs";
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
const subdirectory = (path: string, parent: Directory): Directory => ({
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
const pathHasNotBeenTraversed = (paths: Iterable<string>) => (
  path: string,
): boolean => {
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
const negativeMaximumDepthError = (maximumDepth: number): Error =>
  new Error(`The maximum depth of ${maximumDepth} should be positive`);

/**
 * Handles the function overload of downward file fetchers.
 * @param startDirectory The first argument of the function.
 * @param maximumDepth The second argument of the function.
 * @throws If the maximum depth to return is negative.
 * @returns The validated arguments for the downward file fetchers function
 * call.
 */
export const handleDownwardFilesOverload = (
  startDirectory: number | string = ".",
  maximumDepth?: number,
): [string, number] => {
  if (typeof startDirectory === "number") {
    maximumDepth = startDirectory;
    startDirectory = ".";
  }
  if (maximumDepth < 0) {
    throw negativeMaximumDepthError(maximumDepth);
  }
  return [startDirectory, maximumDepth];
};

/**
 * Constructs an iterable over the downward files starting from a given path.
 * Symbolic links are followed, and the directories are traversed in
 * breadth-first order. Directories are read only once.
 * @param startDirectory The starting directory from which to start the downward
 * traversal.
 * @throws If the starting path is a file.
 * @throws If the starting path is inexistant.
 * @returns An iterable over the downward files.
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
 * Constructs an iterable over the downward files starting from a given path and
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
 * @returns An iterable over the downward files down to the maximum depth.
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
 * Constructs an iterable over the downward files starting from the current
 * working directory. Symbolic links are followed, and the directories are
 * traversed in breadth-first order. Directories are read only once.
 * @returns An iterable over the downward files.
 */
export function downwardFiles(): AsyncIterable<string>;

/**
 * Constructs an iterable over the downward files starting from the current
 * working directory and down to a given maximum depth of a directory.
 * Symbolic links are followed, and the directories are traversed in
 * breadth-first order. Directories are read only once.
 * @param maximumDepth The maximum depth of a read directory relative to the
 * start directory. This maximum depth should be zero or positive.
 * @throws If the maximum depth is negative.
 * @returns An iterable over the downward files down to the maximum depth.
 */
export function downwardFiles(maximumDepth: number): AsyncIterable<string>;

/**
 * Constructs an iterable over the downward files starting from a given path.
 * Symbolic links are followed, and the directories are traversed in
 * breadth-first order. Directories are read only once.
 * @param startDirectory The starting directory from which to start the
 * downward traversal.
 * @throws If the starting path is a file.
 * @throws If the starting path is inexistant.
 * @returns An iterable over the downward files.
 */
export function downwardFiles(startDirectory: string): AsyncIterable<string>;

/**
 * Constructs an iterable over the downward files starting from a given path
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
 * @returns An iterable over the downward files down to the maximum depth.
 */
export function downwardFiles(
  startDirectory: string,
  maximumDepth: number,
): AsyncIterable<string>;

/**
 * A downward files fetcher constructs an iterable over the files downwards from
 * a given directory path.
 */
export function downwardFiles(
  startDirectory?: number | string,
  maximumDepth?: number,
): AsyncIterable<string> {
  [startDirectory, maximumDepth] = handleDownwardFilesOverload(
    startDirectory,
    maximumDepth,
  );
  if (maximumDepth >= 0) {
    return constrainedDownwardFiles(startDirectory, maximumDepth);
  } else {
    return unconstrainedDownwardFiles(startDirectory);
  }
}

/**
 * Constructs an iterable over the downward files starting from a given path.
 * Symbolic links are followed, and the directories are traversed in
 * breadth-first order. Directories are read only once.
 * @param startDirectory The starting directory from which to start the downward
 * traversal.
 * @throws If the starting path is a file.
 * @throws If the starting path is inexistant.
 * @returns An iterable over the downward files.
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
 * Constructs an iterable over the downward files starting from a given path and
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
 * @returns An iterable over the downward files down to the maximum depth.
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

/**
 * Constructs an iterable over the downward files starting from the current
 * working directory. Symbolic links are followed, and the directories are
 * traversed in breadth-first order. Directories are read only once.
 * @returns An iterable over the downward files.
 */
export function downwardFilesSync(): Iterable<string>;

/**
 * Constructs an iterable over the downward files starting from the current
 * working directory and down to a given maximum depth of a directory.
 * Symbolic links are followed, and the directories are traversed in
 * breadth-first order. Directories are read only once.
 * @param maximumDepth The maximum depth of a read directory relative to the
 * start directory. This maximum depth should be zero or positive.
 * @throws If the maximum depth is negative.
 * @returns An iterable over the downward files down to the maximum depth.
 */
export function downwardFilesSync(maximumDepth: number): Iterable<string>;

/**
 * Constructs an iterable over the downward files starting from a given path.
 * Symbolic links are followed, and the directories are traversed in
 * breadth-first order. Directories are read only once.
 * @param startDirectory The starting directory from which to start the
 * downward traversal.
 * @throws If the starting path is a file.
 * @throws If the starting path is inexistant.
 * @returns An iterable over the downward files.
 */
export function downwardFilesSync(startDirectory: string): Iterable<string>;

/**
 * Constructs an iterable over the downward files starting from a given path
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
 * @returns An iterable over the downward files down to the maximum depth.
 */
export function downwardFilesSync(
  startDirectory: string,
  maximumDepth: number,
): Iterable<string>;

/**
 * A downward files fetcher constructs an iterable over the files downwards from
 * a given directory path.
 */
export function downwardFilesSync(
  startDirectory?: number | string,
  maximumDepth?: number,
): Iterable<string> {
  [startDirectory, maximumDepth] = handleDownwardFilesOverload(
    startDirectory,
    maximumDepth,
  );
  if (maximumDepth >= 0) {
    return constrainedDownwardFilesSync(startDirectory, maximumDepth);
  } else {
    return unconstrainedDownwardFilesSync(startDirectory);
  }
}

/**
 * Handles the function overload of upward file fetchers.
 * @param startPath The first argument of the function.
 * @param maximumHeight The second argument of the function.
 * @returns The validated arguments for the upward file fetchers function call.
 */
const handleUpwardFilesOverload = (
  startPath: number | string = ".",
  maximumHeight?: number | string,
): [string, undefined | number | string] => {
  if (typeof startPath === "number") {
    return [".", startPath];
  }
  return [startPath, maximumHeight];
};

/**
 * Constructs an iterable over the files in the upward directories relative to
 * the current working directory, up to the root inclusively of the current
 * working directory. The directories are traversed in increasing order of
 * height relative to the start directory. The start directory is not read.
 * @returns An iterable over the upward files.
 */
export function upwardFiles(): AsyncIterable<string>;

/**
 * Constructs an iterable over the files in the upward directories relative to
 * the current working directory, up to the upward directory whose height
 * relative to the current working directory is equal to the given maximum
 * height. The directories are traversed in increasing order of height
 * relative to the start directory. The start directory is not read.
 * @param maximumHeight The maximum height of a directory. The height of the
 * start directory is zero. This value should be greater than or equal to one.
 * @returns An iterable over the upward files.
 */
export function upwardFiles(maximumHeight: number): AsyncIterable<string>;

/**
 * Constructs an iterable over the files in the upward directories relative to
 * the start path, up to the root inclusively of the start path directory. The
 * directories are traversed in increasing order of height relative to the
 * start directory. The start path is not read if it is a directory. If the
 * start path is a file, then its directory is the first directory to be read.
 * @param startPath The start path of the upward traversal.
 * @returns An iterable over the upward files.
 */
export function upwardFiles(startPath: string): AsyncIterable<string>;

/**
 * Constructs an iterable over the files in the upward directories relative to
 * the start path, up to the upward directory whose height relative to the
 * start path is equal to the given maximum height. The directories are
 * traversed in increasing order of height relative to the start directory.
 * The start path is not read if it is a directory. If the start path is a
 * file, then its directory is the first directory to be read, if its height
 * does not exceed the maximum height.
 * @param startPath The start path of the upward traversal.
 * @param maximumHeight The maximum height of a directory. The height of the
 * start path is zero. This value should be greater than or equal to one.
 * @returns An iterable over the upward files.
 */
export function upwardFiles(
  startPath: string,
  maximumHeight: number,
): AsyncIterable<string>;

/**
 * Constructs an iterable over the files in the upward directories relative to
 * the start path, up to an end path. The directories are traversed in
 * increasing order of height relative to the start directory. The start path
 * is not read if it is a directory. If the start path is a file, then its
 * directory is the first directory to be read. If the end directory is not
 * parent to the start path, then all the upward paths from the start path are
 * yielded up to its root. The iteration stops once the end directory is
 * reached and its files are yielded.
 * @param startPath The start path of the upward traversal.
 * @param endDirectory The end directory at which point all the upward
 * directories have been read.
 * @returns An iterable over the upward files.
 */
export function upwardFiles(
  startPath: string,
  endDirectory: string,
): AsyncIterable<string>;

/**
 * An upward file fetcher constructs an iterable over the files in upward
 * directories relative to a start path.
 */
export function upwardFiles(
  startPath?: number | string,
  upperBound?: number | string,
): AsyncIterable<string> {
  [startPath, upperBound] = handleUpwardFilesOverload(startPath, upperBound);
  return readdirs(
    (upwardDirectories as (
      startPath?: string,
      upperBound?: number | string,
    ) => AsyncIterable<string>)(startPath, upperBound),
  );
}

/**
 * Constructs an iterable over the files in the upward directories relative to
 * the current working directory, up to the root inclusively of the current
 * working directory. The directories are traversed in increasing order of
 * height relative to the start directory. The start directory is not read.
 * @returns An iterable over the upward files.
 */
export function upwardFilesSync(): Iterable<string>;

/**
 * Constructs an iterable over the files in the upward directories relative to
 * the current working directory, up to the upward directory whose height
 * relative to the current working directory is equal to the given maximum
 * height. The directories are traversed in increasing order of height
 * relative to the start directory. The start directory is not read.
 * @param maximumHeight The maximum height of a directory. The height of the
 * start directory is zero. This value should be greater than or equal to one.
 * @returns An iterable over the upward files.
 */
export function upwardFilesSync(maximumHeight: number): Iterable<string>;

/**
 * Constructs an iterable over the files in the upward directories relative to
 * the start path, up to the root inclusively of the start path directory. The
 * directories are traversed in increasing order of height relative to the
 * start directory. The start path is not read if it is a directory. If the
 * start path is a file, then its directory is the first directory to be read.
 * @param startPath The start path of the upward traversal.
 * @returns An iterable over the upward files.
 */
export function upwardFilesSync(startPath: string): Iterable<string>;

/**
 * Constructs an iterable over the files in the upward directories relative to
 * the start path, up to the upward directory whose height relative to the
 * start path is equal to the given maximum height. The directories are
 * traversed in increasing order of height relative to the start directory.
 * The start path is not read if it is a directory. If the start path is a
 * file, then its directory is the first directory to be read, if its height
 * does not exceed the maximum height.
 * @param startPath The start path of the upward traversal.
 * @param maximumHeight The maximum height of a directory. The height of the
 * start path is zero. This value should be greater than or equal to one.
 * @returns An iterable over the upward files.
 */
export function upwardFilesSync(
  startPath: string,
  maximumHeight: number,
): Iterable<string>;

/**
 * Constructs an iterable over the files in the upward directories relative to
 * the start path, up to an end path. The directories are traversed in
 * increasing order of height relative to the start directory. The start path
 * is not read if it is a directory. If the start path is a file, then its
 * directory is the first directory to be read. If the end directory is not
 * parent to the start path, then all the upward paths from the start path are
 * yielded up to its root. The iteration stops once the end directory is
 * reached and its files are yielded.
 * @param startPath The start path of the upward traversal.
 * @param endDirectory The end directory at which point all the upward
 * directories have been read.
 * @returns An iterable over the upward files.
 */
export function upwardFilesSync(
  startPath: string,
  endDirectory: string,
): Iterable<string>;

/**
 * An upward file fetcher constructs an iterable over the files in upward
 * directories relative to a start path.
 */
export function upwardFilesSync(
  startPath?: number | string,
  upperBound?: number | string,
): Iterable<string> {
  [startPath, upperBound] = handleUpwardFilesOverload(startPath, upperBound);
  return readdirsSync(
    (upwardDirectoriesSync as (
      startPath?: string,
      upperBound?: number | string,
    ) => Iterable<string>)(startPath, upperBound),
  );
}
