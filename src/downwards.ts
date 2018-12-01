import { existsSync, readdirSync, realpathSync, statSync } from "fs";
import { join, resolve } from "path";

import { DownwardDirectoriesFetcher } from "./downwardDirectoriesFetcher";
import { Matcher, matches } from "./matcher";

/**
 * A simple directory has an absolute path and a depth relative to some other
 * directory. This is used for constrained breadth-first traversal of downward
 * directories.
 */
interface Directory {
  path: string;
  depth: number;
}

/**
 * Reads the given directory path and returns the sorted set of its
 * subdirectories' paths in lexicographical order.
 * @param directory The directory of which to find its subdirectories.
 * @returns The set of subdirectories of the given directory, sorted
 * lexicographically.
 */
const sortedSubdirectories = (directory: string): string[] =>
  readdirSync(directory)
    .filter((file) => statSync(join(directory, file)).isDirectory())
    .sort()
    .map((file) => join(directory, file));

/**
 * Constructs an unconstrained downwards traversal iterable which traverses the
 * directories of the file system downwards from a given directory using
 * breadth-first traversal. Each traversed level is sorted lexicographically.
 * Each of the traversed directory paths must pass the given sequence of tests.
 * The traversal does not stop if a parent directory does not pass the tests.
 * @param from The highest directory traversed, which is the starting point for
 * the breadth-first traversal.
 * @param tests The sequence of tests each path returned by the iterator have
 * passed.
 * @returns An iterable over the directories downwards from the given directory
 * that pass the given sequence of tests.
 */
const unconstrainedDownwardsTraversal = (
  from: string,
  tests: Array<Matcher<string>>,
): Iterable<string> => {
  const traversedDirectories: string[] = [];
  const directoriesToTraverse: string[] = [from];
  return {
    [Symbol.iterator]: (): Iterator<string> => {
      return {
        next: (): IteratorResult<string> => {
          let directory: string | undefined;
          do {
            directory = directoriesToTraverse.pop();
            if (directory) {
              traversedDirectories.push(realpathSync.native(directory));
              const newDirectoriesToTraverse = sortedSubdirectories(
                directory,
              ).filter(
                (subdirectory) =>
                  !traversedDirectories.includes(
                    realpathSync.native(subdirectory),
                  ),
              );
              for (const newDirectoryToTraverse of newDirectoriesToTraverse) {
                directoriesToTraverse.unshift(newDirectoryToTraverse);
              }
            }
          } while (tests.length > 0 && directory && !matches(directory, tests));
          return {
            done: !directory,
            value: directory as any,
          };
        },
      };
    },
  };
};

const constrainedDownwardsTraversal = (
  from: string,
  maximumDepth: number,
  tests: Array<Matcher<string>>,
): Iterable<string> => {
  const traversedDirectories: Directory[] = [];
  const directoriesToTraverse: Directory[] = [{ path: from, depth: 0 }];
  return {
    [Symbol.iterator]: (): Iterator<string> => {
      return {
        next: (): IteratorResult<string> => {
          let directory: Directory | undefined;
          do {
            directory = directoriesToTraverse.pop();
            if (directory) {
              traversedDirectories.push({
                path: realpathSync.native(directory.path),
                depth: directory.depth,
              });
              const parentDirectoryDepth = directory.depth;
              if (parentDirectoryDepth < maximumDepth) {
                const newDirectoriesToTraverse = sortedSubdirectories(
                  directory.path,
                )
                  .filter(
                    (subdirectory) =>
                      !traversedDirectories.find(
                        (traversedDirectory) =>
                          traversedDirectory.path ===
                          realpathSync.native(subdirectory),
                      ),
                  )
                  .map((path) => ({
                    path,
                    depth: parentDirectoryDepth + 1,
                  }));
                for (const newDirectoryToTraverse of newDirectoriesToTraverse) {
                  directoriesToTraverse.unshift(newDirectoryToTraverse);
                }
              }
            }
          } while (
            tests.length > 0 &&
            directory &&
            !matches(directory.path, tests)
          );
          return {
            done: !directory,
            value: directory ? directory.path : (undefined as any),
          };
        },
      };
    },
  };
};

const makeDownwards = (): DownwardDirectoriesFetcher => {
  const downwards = (
    from: undefined | string | Matcher<string>,
    depth: undefined | number | Matcher<string>,
    ...tests: Array<Matcher<string>>
  ): Iterable<string> => {
    if (typeof from === "undefined") {
      from = process.cwd();
    } else if (typeof from === "function") {
      tests.unshift(from);
      from = process.cwd();
    } else {
      from = resolve(from);
      if (!existsSync(from)) {
        throw new Error(`The given starting directory does not exist ${from}`);
      } else if (statSync(from).isFile()) {
        throw new Error(`The given starting path is not a directory ${from}`);
      }
    }
    if (typeof depth === "function") {
      tests.unshift(depth);
      depth = undefined;
    } else if (typeof depth === "number" && depth < 0) {
      throw new Error(
        `The depth of directories to traverse must be non-negative ${depth}`,
      );
    }
    if (depth === undefined) {
      return unconstrainedDownwardsTraversal(from, tests);
    } else {
      return constrainedDownwardsTraversal(from, depth as number, tests);
    }
  };
  return downwards;
};

export const downwards = makeDownwards();
