import { readdir as fsReaddir, readdirSync as fsReaddirSync } from "fs";
import { join, resolve } from "path";
import { promisify } from "util";

import { multiMap, multiMapSync, simpleMap, simpleMapSync } from "./map";

const readdirPromise = promisify(fsReaddir);

/**
 * Constructs a generator which yields the files read asynchronously from the
 * given directory's path. The files are not yielded in any particular order.
 * @param directory The path to the directory to read. If it is not absolute,
 * then it is resolved relative to the current working directory.
 * @throws If the given directory's path is a file.
 * @throws If the given directory's path is inexistant.
 * @returns An iterator over the read files of the given directory's path.
 */
export async function* readdir(directory: string): AsyncIterable<string> {
  const resolvedDirectory = resolve(directory);
  yield* simpleMap(await readdirPromise(directory), (file) =>
    join(resolvedDirectory, file),
  );
}

/**
 * Constructs a generator which yields the files read synchronously from the
 * given directory's path. The files are not yielded in any particular order.
 * @param directory The path to the directory to read. If it is not absolute,
 * then it is resolved relative to the current working directory.
 * @throws If the given directory's path is a file.
 * @throws If the given directory's path is inexistant.
 * @returns An iterator over the read files of the given directory's path.
 */
export function* readdirSync(directory: string): Iterable<string> {
  const resolvedDirectory = resolve(directory);
  yield* simpleMapSync(fsReaddirSync(directory), (file) =>
    join(resolvedDirectory, file),
  );
}

/**
 * Constructs a generator which yields the files read asynchronously from the
 * given directory paths. The files are yielded in order of directory iterated
 * over, but are not yielded in any particular order in each directory.
 * @param directories The paths to the directories to read. If any of them is
 * not absolute, then it is resolved relative to the current working directory.
 * @throws If any of the given directory's path is a file.
 * @throws If any of the given directory's path is inexistant.
 * @returns An iterator over the read files of the given directory paths.
 */
export async function* readdirs(
  directories: Iterable<string> | AsyncIterable<string>,
): AsyncIterable<string> {
  yield* multiMap(directories, async (directory) => readdir(directory));
}

/**
 * Constructs a generator which yields the files read synchronously from the
 * given directory paths. The files are yielded in order of directory iterated
 * over, but are not yielded in any particular order in each directory.
 * @param directories The paths to the directories to read. If any of them is
 * not absolute, then it is resolved relative to the current working
 * directory.
 * @throws If any of the given directory's path is a file.
 * @throws If any of the given directory's path is inexistant.
 * @returns An iterator over the read files of the given directory paths.
 */
export function* readdirsSync(directories: Iterable<string>): Iterable<string> {
  yield* multiMapSync(directories, (directory) => readdirSync(directory));
}
