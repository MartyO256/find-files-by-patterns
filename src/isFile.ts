import { existsSync, statSync } from "fs";

import { Matcher } from "./matcher";

/**
 * A matcher function which determines if a given path is a file. It first
 * checks whether or not the path exists, then retrieves the file status to
 * determine whether or not the existing path is a file. The path is resolved
 * relative to the current working directory if it is not absolute.
 * @param path The path to check.
 * @returns Whether or not the path points to an existing file.
 * @see [[existsSync]] How the existence of the path is determined.
 * @see [[statSync]] How the file status is retrieved.
 * @version 0.6.0
 * @since 0.6.0
 */
export const isFile: Matcher<string> = (path: string): boolean =>
  existsSync(path) && statSync(path).isFile();
