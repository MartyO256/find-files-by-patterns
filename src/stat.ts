import { stat, Stats, statSync } from "fs";

import { Filter, FilterSync } from "./filter.js";

/**
 * Determines whether or not an error is a file not found exception.
 * @param error The error the check.
 * @returns Whether or not the given error is a file not found exception.
 */
const isFileNotFoundException = (error: NodeJS.ErrnoException): boolean =>
  error.code === "ENOENT";

/**
 * Safely retrieves the status of a file which may or may not exist.
 * @param path The path to the file to retrieve the status from.
 * @throws If an I/O error different from a file not found exception occurs.
 * @returns The status of the file at the given path, or null if there is no
 * file at the given path.
 */
const safeStat = (path: string): Promise<Stats | null> =>
  new Promise((resolve, reject) => {
    stat(path, (error, stats) => {
      if (error) {
        if (isFileNotFoundException(error)) {
          resolve(null);
        }
        reject(error);
      } else {
        resolve(stats);
      }
    });
  });

/**
 * Safely retrieves the status of a file which may or may not exist.
 * @param path The path to the file to retrieve the status from.
 * @throws If an I/O error different from a file not found exception occurs.
 * @returns The status of the file at the given path, or null if there is no
 * file at the given path.
 */
const safeStatSync = (path: string): Stats | null => {
  try {
    return statSync(path);
  } catch (error) {
    if (isFileNotFoundException(error)) {
      return null;
    }
    throw error;
  }
};

/**
 * A stat checker is a function which performs a check on the given status of a
 * file.
 */
export type StatChecker = (stats: Stats) => boolean;

/**
 * Checks whether or not a file status is that of a file.
 * @param stats The file status to check.
 * @returns Whether or not the given status is that of a file.
 */
export const isFileStatChecker: StatChecker = (stats: Stats) => stats.isFile();

/**
 * Checks whether or not a file status is that of a directory.
 * @param stats The file status to check.
 * @returns Whether or not the given status is that of a directory.
 */
export const isDirectoryStatChecker: StatChecker = (stats: Stats) =>
  stats.isDirectory();

/**
 * Performs a check on the safely retrieved file status of the file at a given
 * path.
 * @param path The path of the file to check.
 * @param checker The performed check on the file status.
 * @throws If an I/O error different from a file not found exception occurs.
 * @returns Whether or not the file at the given path passes the check.
 */
export const isSafeStat = async (
  path: string,
  checker: StatChecker,
): Promise<boolean> => {
  const stats = await safeStat(path);
  return stats ? checker(stats) : false;
};

/**
 * Performs a check on the safely retrieved file status of the file at a given
 * path.
 * @param path The path of the file to check.
 * @param checker The performed check on the file status.
 * @throws If an I/O error different from a file not found exception occurs.
 * @returns Whether or not the file at the given path passes the check.
 */
export const isSafeStatSync = (path: string, checker: StatChecker): boolean => {
  const stats = safeStatSync(path);
  return stats ? checker(stats) : false;
};

/**
 * Safely determines whether or not the file at a given path is a file. Is there
 * is no file at the given path, then this returns false.
 * @param path The path to the file to check.
 * @throws If an I/O error different from a file not found exception occurs.
 * @returns Whether or not the file at the given path is a file.
 */
export const isFile: Filter<string> = async (path: string): Promise<boolean> =>
  isSafeStat(path, isFileStatChecker);

/**
 * Safely determines whether or not the file at a given path is a file. Is there
 * is no file at the given path, then this returns false.
 * @param path The path to the file to check.
 * @throws If an I/O error different from a file not found exception occurs.
 * @returns Whether or not the file at the given path is a file.
 */
export const isFileSync: FilterSync<string> = (path: string): boolean =>
  isSafeStatSync(path, isFileStatChecker);

/**
 * Safely determines whether or not the file at a given path is a directory. Is
 * there is no file at the given path, then this returns false.
 * @param path The path to the file to check.
 * @throws If an I/O error different from a file not found exception occurs.
 * @returns Whether or not the file at the given path is a directory.
 */
export const isDirectory: Filter<string> = async (
  path: string,
): Promise<boolean> => isSafeStat(path, isDirectoryStatChecker);

/**
 * Safely determines whether or not the file at a given path is a directory.
 * Is there is no file at the given path, then this returns false.
 * @param path The path to the file to check.
 * @throws If an I/O error different from a file not found exception occurs.
 * @returns Whether or not the file at the given path is a directory.
 */
export const isDirectorySync: FilterSync<string> = (path: string): boolean =>
  isSafeStatSync(path, isDirectoryStatChecker);
