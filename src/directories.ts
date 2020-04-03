import { dirname, parse, resolve } from "path";

import {
  downwardFiles,
  downwardFilesSync,
  handleDownwardFilesOverload,
} from "./files";
import { filter, filterSync } from "./filter";
import { isDirectory, isDirectorySync } from "./stat";

/**
 * A downward directories fetcher constructs an iterable over the directories
 * downwards from a given directory path.
 */
export interface DownwardDirectoriesFetcher extends Function {
  /**
   * Constructs an iterable over the downward directories starting from the
   * current working directory. Symbolic links are followed, and the directories
   * are traversed in breadth-first order. Directories are read only once. The
   * current working directory is not yielded.
   * @returns An iterable over the downward directories.
   */
  (): AsyncIterable<string>;

  /**
   * Constructs an iterable over the downward directories starting from the
   * current working directory and down to a given maximum depth of a directory.
   * Symbolic links are followed, and the directories are traversed in
   * breadth-first order. Directories are read only once. The start directory is
   * not yielded.
   * @param maximumDepth The maximum depth of a read directory relative to the
   * start directory. This maximum depth should be zero or positive.
   * @throws If the maximum depth is negative.
   * @returns An iterable over the downward directories down to the maximum
   * depth.
   */
  (maximumDepth: number): AsyncIterable<string>;

  /**
   * Constructs an iterable over the downward directories starting from a given
   * path. Symbolic links are followed, and the directories are traversed in
   * breadth-first order. Directories are read only once. The start directory is
   * not yielded.
   * @param startDirectory The start directory from which to start the downward
   * traversal.
   * @throws If the start path is a file.
   * @throws If the start path is inexistant.
   * @returns An iterable over the downward directories.
   */
  (startDirectory: string): AsyncIterable<string>;

  /**
   * Constructs an iterable over the downward directories starting from a given
   * path and down to a given maximum depth of a directory. Symbolic links are
   * followed, and the directories are traversed in breadth-first order.
   * Directories are read only once. The start directory is not yielded.
   * @param startDirectory The start directory from which to start the downward
   * traversal.
   * @param maximumDepth The maximum depth of a read directory relative to the
   * start directory. This maximum depth should be zero or positive.
   * @throws If the start path is a file.
   * @throws If the start path is inexistant.
   * @throws If the maximum depth is negative.
   * @returns An iterable over the downward directories down to the maximum
   * depth.
   */
  (startDirectory: string, maximumDepth: number): AsyncIterable<string>;
}

/**
 * A downward directories fetcher constructs an iterable over the directories
 * downwards from a given directory path.
 */
export interface DownwardDirectoriesFetcherSync extends Function {
  /**
   * Constructs an iterable over the downward directories starting from the
   * current working directory. Symbolic links are followed, and the directories
   * are traversed in breadth-first order. Directories are read only once. The
   * start directory is not yielded.
   * @returns An iterable over the downward directories.
   */
  (): Iterable<string>;

  /**
   * Constructs an iterable over the downward directories starting from the
   * current working directory and down to a given maximum depth of a directory.
   * Symbolic links are followed, and the directories are traversed in
   * breadth-first order. Directories are read only once. The start directory is
   * not yielded.
   * @param maximumDepth The maximum depth of a read directory relative to the
   * start directory. This maximum depth should be zero or positive.
   * @throws If the maximum depth is negative.
   * @returns An iterable over the downward directories down to the maximum
   * depth.
   */
  (maximumDepth: number): Iterable<string>;

  /**
   * Constructs an iterable over the downward directories starting from a given
   * path. Symbolic links are followed, and the directories are traversed in
   * breadth-first order. Directories are read only once. The start directory is
   * not yielded.
   * @param startDirectory The start directory from which to start the downward
   * traversal.
   * @throws If the start path is a file.
   * @throws If the start path is inexistant.
   * @returns An iterable over the downward directories.
   */
  (startDirectory: string): Iterable<string>;

  /**
   * Constructs an iterable over the downward directories starting from a given
   * path and down to a given maximum depth of a directory. Symbolic links are
   * followed, and the directories are traversed in breadth-first order.
   * Directories are read only once. The start directory is not yielded.
   * @param startDirectory The start directory from which to start the downward
   * traversal.
   * @param maximumDepth The maximum depth of a read directory relative to the
   * start directory. This maximum depth should be zero or positive.
   * @throws If the start path is a file.
   * @throws If the start path is inexistant.
   * @throws If the maximum depth is negative.
   * @returns An iterable over the downward directories down to the maximum
   * depth.
   */
  (startDirectory: string, maximumDepth: number): Iterable<string>;
}

/**
 * Returns a downward directories fetcher using the downward files function. As
 * a consequence, the status of each downward file is queried twice.
 * @see [[DownwardDirectoriesFetcher]] The specifications of the function.
 */
export const downwardDirectories: DownwardDirectoriesFetcher = (
  startDirectory?: number | string,
  maximumDepth?: number,
): AsyncIterable<string> => {
  [startDirectory, maximumDepth] = handleDownwardFilesOverload(
    startDirectory,
    maximumDepth,
  );
  return filter(downwardFiles(startDirectory, maximumDepth), isDirectory);
};

/**
 * Returns a downward directories fetcher using the downward files function. As
 * a consequence, the status of each downward file is queried twice.
 * @see [[DownwardDirectoriesFetcherSync]] The specifications of the function.
 */
export const downwardDirectoriesSync: DownwardDirectoriesFetcherSync = (
  startDirectory?: number | string,
  maximumDepth?: number,
): Iterable<string> => {
  [startDirectory, maximumDepth] = handleDownwardFilesOverload(
    startDirectory,
    maximumDepth,
  );
  return filterSync(
    downwardFilesSync(startDirectory, maximumDepth),
    isDirectorySync,
  );
};

/**
 * Returns an iterable over the upward paths from a given start path up to the
 * root. The start path may be a file, a directory, or be inexistant. The
 * yielded paths may not exist on the file system. The start path is not
 * yielded. The paths are yielded in increasing order of height relative to the
 * start path.
 * @param startPath The start path from which to iterate upward.
 * @returns The iterable over the upward paths starting from the given path.
 */
export function* upwardPaths(startPath: string): Iterable<string> {
  let upwardDirectory = startPath;
  const { root } = parse(upwardDirectory);
  do {
    upwardDirectory = dirname(upwardDirectory);
    yield upwardDirectory;
  } while (upwardDirectory !== root);
}

/**
 * Returns an iterable over the upward paths from a given start path up to a
 * maximum path height in the file system graph. The path at the maximum depth
 * is yielded. The start path may be a file, a directory, or be inexistant. The
 * yielded paths may not exist on the file system. The start path is not
 * yielded. The paths are yielded in increasing order of height relative to the
 * start path.
 * @param startPath The start path from which to iterate upward.
 * @param maximumHeight The maximum height of any yielded path relative to the
 * start path. If it is zero or negative, then no paths are yielded.
 * @returns The iterable over the upward paths starting from the given path and
 * up to the given maximum height.
 */
export function* upwardConstrainedPaths(
  startPath: string,
  maximumHeight: number,
): Iterable<string> {
  let height = 1;
  for (const upwardPath of upwardPaths(startPath)) {
    if (height <= maximumHeight) {
      yield upwardPath;
      height++;
    } else {
      break;
    }
  }
}

/**
 * Returns an iterable over the upward paths from a given start path up to a
 * limit path. End path is yielded if it is reached. The start and end paths may
 * be files, directories, or be inexistant. The yielded paths may not exist on
 * the file system. The start path is not yielded. The paths are yielded in
 * increasing order of height relative to the start path. If the start and end
 * paths do not share the same root, then the end path won't be yielded as it
 * cannot be reached upwards from the start path.
 * @param startPath The start path from which to iterate upward.
 * @param endPath The limit path at which to end the iteration if it is ever
 * reached.
 * @returns The iterable over the upward paths starting from the given path and
 * up to the given end path.
 */
export function* upwardLimitedPaths(
  startPath: string,
  endPath: string,
): Iterable<string> {
  for (const upwardPath of upwardPaths(startPath)) {
    yield upwardPath;
    if (endPath === upwardPath) {
      break;
    }
  }
}

/**
 * Returns an upward paths iterable with either a string or number path, each
 * corresponding to an end path and a maximum path height respectively.
 * @see [[upwardPaths]] The unbounded upward paths iterable.
 * @see [[upwardConstrainedPaths]] The upward paths iterable bounded by a
 * maximum path height.
 * @see [[upwardLimitedPaths]] The upward paths iterable bounded by limit path.
 * @param startPath The start path of the iteration.
 * @param upperBound The upper bound on the iterable.
 * @returns A bounded or unbounded upward paths iterable based on the given
 * upper bound.
 */
const overloadedUpwardPaths = (
  startPath: string,
  upperBound?: number | string,
): Iterable<string> => {
  startPath = resolve(startPath);
  if (upperBound === undefined) {
    return upwardPaths(startPath);
  } else if (typeof upperBound === "string") {
    upperBound = resolve(upperBound);
  }
  return typeof upperBound === "number"
    ? upwardConstrainedPaths(startPath, upperBound)
    : upwardLimitedPaths(startPath, upperBound);
};

/**
 * An upward directories fetcher constructs an iterable over the directories
 * upwards from a given directory path.
 */
export interface UpwardDirectoriesFetcher extends Function {
  /**
   * Constructs an iterable over the upward directories starting from the
   * current working directory. The current working directory is not yielded.
   * The directories are yielded in ascending order of height relative to the
   * current working directory.
   * @returns An iterable over the upward directories.
   */
  (): AsyncIterable<string>;

  /**
   * Constructs an iterable over the upward directories starting from the given
   * path. The start path is not yielded. If the start path is a file, then its
   * directory is yielded. The directories are yielded in ascending order of
   * height relative to the given start path.
   * @param startPath The start path from which to traverse upwards.
   * @returns An iterable over the upward directories.
   */
  (startPath: string): AsyncIterable<string>;

  /**
   * Constructs an iterable over the upward directories starting from the given
   * path and up to a given maximum height. The start path is not yielded. If
   * the start path is a file, then its directory is yielded. The directories
   * are yielded in ascending order of height relative to the given start path.
   * Each yielded directory has a height greater than one, and less than or
   * equal to the given maximum height.
   * @param startPath The start path from which to traverse upwards.
   * @param maximumHeight The maximum height of any yielded directory path.
   * @returns An iterable over the upward directories.
   */
  (startPath: string, maximumHeight: number): AsyncIterable<string>;

  /**
   * Constructs an iterable over the upward directories starting from the given
   * path and up to a given end path. The start path is not yielded. If the
   * start path is a file, then its directory is yielded. The directories are
   * yielded in ascending order of height relative to the given start path. If
   * the end path is not parent to the start path, then the iteration ends with
   * the root of the start path. The iteration has to encounter the end path in
   * order to end once it is yielded.
   * @param startPath The start path from which to traverse upwards.
   * @param endPath The path on which the iteration will end if it is
   * encountered in the upward traversal.
   * @returns An iterable over the upward directories.
   */
  (startPath: string, endPath: string): AsyncIterable<string>;
}

/**
 * An upward directories fetcher constructs an iterable over the directories
 * upwards from a given directory path.
 */
export interface UpwardDirectoriesFetcherSync extends Function {
  /**
   * Constructs an iterable over the upward directories starting from the
   * current working directory. The current working directory is not yielded.
   * The directories are yielded in ascending order of height relative to the
   * current working directory.
   * @returns An iterable over the upward directories.
   */
  (): Iterable<string>;

  /**
   * Constructs an iterable over the upward directories starting from the given
   * path. The start path is not yielded. If the start path is a file, then its
   * directory is yielded. The directories are yielded in ascending order of
   * height relative to the given start path.
   * @param startPath The start path from which to traverse upwards.
   * @returns An iterable over the upward directories.
   */
  (startPath: string): Iterable<string>;

  /**
   * Constructs an iterable over the upward directories starting from the given
   * path and up to a given maximum height. The start path is not yielded. If
   * the start path is a file, then its directory is yielded. The directories
   * are yielded in ascending order of height relative to the given start path.
   * Each yielded directory has a height greater than one, and less than or
   * equal to the given maximum height.
   * @param startPath The start path from which to traverse upwards.
   * @param maximumHeight The maximum height of any yielded directory path.
   * @returns An iterable over the upward directories.
   */
  (startPath: string, maximumHeight: number): Iterable<string>;

  /**
   * Constructs an iterable over the upward directories starting from the given
   * path and up to a given end path. The start path is not yielded. If the
   * start path is a file, then its directory is yielded. The directories are
   * yielded in ascending order of height relative to the given start path. If
   * the end path is not parent to the start path, then the iteration ends with
   * the root of the start path. The iteration has to encounter the end path in
   * order to end once it is yielded.
   * @param startPath The start path from which to traverse upwards.
   * @param endPath The path on which the iteration will end if it is
   * encountered in the upward traversal.
   * @returns An iterable over the upward directories.
   */
  (startPath: string, endPath: string): Iterable<string>;
}

/**
 * @see [[UpwardDirectoriesFetcher]] The specifications of the function.
 */
export const upwardDirectories: UpwardDirectoriesFetcher = (
  startPath = ".",
  upperBound?: number | string,
): AsyncIterable<string> =>
  filter(overloadedUpwardPaths(startPath, upperBound), isDirectory);

/**
 * @see [[UpwardDirectoriesFetcherSync]] The specifications of the function.
 */
export const upwardDirectoriesSync: UpwardDirectoriesFetcherSync = (
  startPath = ".",
  upperBound?: number | string,
): Iterable<string> =>
  filterSync(overloadedUpwardPaths(startPath, upperBound), isDirectorySync);
