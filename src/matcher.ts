import { PathLike } from "fs";

/**
 * A matcher is a function that determines whether or not a given path matches a
 * pattern.
 */
export type Matcher = (path: PathLike) => boolean;
