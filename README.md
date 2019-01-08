# find-files-by-patterns

[![npm Information Page](https://img.shields.io/npm/v/find-files-by-patterns.svg)](https://www.npmjs.com/package/find-files-by-patterns)
![Node Version](https://img.shields.io/badge/node-%3E%3D%2010.0.0-green.svg)
[![Documentation](https://img.shields.io/website-up-down-green-red/https/martyo256.github.io/find-files-by-patterns.svg?label=documentation)](https://martyo256.github.io/find-files-by-patterns/)
[![Build Status](https://travis-ci.org/MartyO256/find-files-by-patterns.svg)](https://travis-ci.org/MartyO256/find-files-by-patterns)
[![Coverage Status](https://coveralls.io/repos/github/MartyO256/find-files-by-patterns/badge.svg)](https://coveralls.io/github/MartyO256/find-files-by-patterns?branch=development)
[![Maintainability](https://api.codeclimate.com/v1/badges/6d2069677a848c509e3a/maintainability)](https://codeclimate.com/github/MartyO256/find-files-by-patterns/maintainability)
[![MIT license](http://img.shields.io/badge/license-MIT-brightgreen.svg)](http://opensource.org/licenses/MIT)

---

Use the iteration protocol to find files upwards and downwards in the file
system.

---

## Installation

Using npm:

```sh
npm install find-files-by-patterns
```

Assuming this file system, where the current working directory is
`/Documents/project`:

```txt
/
└── Documents
    ├── data.csv
    └── project
        ├── node_modules
        └── package.json
```

In Node.js:

```js
const { findFile, upwardDirectories,
  ofBasename, downwardFiles } = require("find-files-by-patterns");

(async () => {
  const dataFile = await findFile(upwardDirectories(), ofBasename("data.csv"));
  console.log(dataFile); //=> `/Documents/data.csv`

  for await (const file of downwardFiles("/Documents")) {
    console.log(file);
  }
  //=> `/Documents/data.csv`
  //=> `/Documents/project`
  //=> `/Documents/project/node_modules` ...
  //=> `/Documents/project/package.json`
})();

```

## Table of Contents

<details>

<!-- toc -->

- [API](#api)
  * [`findFile` and `findFileSync`](#findfile-and-findfilesync)
  * [`findAllFiles` and `findAllFilesSync`](#findallfiles-and-findallfilessync)
  * [`findOnlyFile` and `findOnlyFileSync`](#findonlyfile-and-findonlyfilesync)
  * [`downwardDirectories` and `downwardDirectoriesSync`](#downwarddirectories-and-downwarddirectoriessync)
  * [`upwardDirectories` and `upwardDirectoriesSync`](#upwarddirectories-and-upwarddirectoriessync)
  * [`downwardFiles` and `downwardFilesSync`](#downwardfiles-and-downwardfilessync)
  * [`upwardFiles` and `upwardFilesSync`](#upwardfiles-and-upwardfilessync)
  * [`ofBasename`, `ofName`, `ofDirname` and `ofExtname`](#ofbasename-ofname-ofdirname-and-ofextname)
  * [`hasPathSegments`](#haspathsegments)
  * [`isFile` and `isFileSync`](#isfile-and-isfilesync)
  * [`isDirectory` and `isDirectorySync`](#isdirectory-and-isdirectorysync)
  * [`hasFile` and `hasFileSync`](#hasfile-and-hasfilesync)
  * [`readdir` and `readdirSync`](#readdir-and-readdirsync)
  * [`readdirs` and `readdirsSync`](#readdirs-and-readdirssync)
  * [`filter` and `filterSync`](#filter-and-filtersync)
  * [`conjunction` and `conjunctionSync`](#conjunction-and-conjunctionsync)
  * [`disjunction` and `disjunctionSync`](#disjunction-and-disjunctionsync)
  * [`allElements` and `allElementsSync`](#allelements-and-allelementssync)
  * [`firstElement` and `firstElementSync`](#firstelement-and-firstelementsync)
  * [`onlyElement` and `onlyElementSync`](#onlyelement-and-onlyelementsync)
- [About](#about)
  * [Building the documentation](#building-the-documentation)
  * [Running the tests](#running-the-tests)
  * [Building the library](#building-the-library)
  * [Authors](#authors)
  * [License](#license)

<!-- tocstop -->

</details>

## API

<details>

<summary>Complete list of exported functions</summary>

Finders:

- [`findFile` and `findFileSync`](#findFile-and-findFileSync)
- [`findAllFiles` and `findAllFilesSync`](#findAllFiles-and-findAllFilesSync)
- [`findOnlyFile` and `findOnlyFileSync`](#findOnlyFile-and-findOnlyFileSync)

Files:

- [`downwardFiles` and `downwardFilesSync`](#downwardFiles-and-downwardFilesSync)
- [`upwardFiles` and `upwardFilesSync`](#upwardFiles-and-upwardFilesSync)

Directories:

- [`downwardDirectories` and `downwardDirectoriesSync`](#downwardDirectories-and-downwardDirectoriesSync)
- [`upwardDirectories` and `upwardDirectoriesSync`](#upwardDirectories-and-upwardDirectoriesSync)

Filters:

- [`ofBasename`, `ofName`, `ofDirname` and `ofExtname`](#ofBasename-ofName-ofDirname-and-ofExtname)
- [`hasPathSegments`](#hasPathSegments)
- [`isFile` and `isFileSync`](#isFile-and-isFileSync)
- [`isDirectory` and `isDirectorySync`](#isDirectory-and-isDirectorySync)
- [`hasFile` and `hasFileSync`](#hasFile-and-hasFileSync)
- [`conjunction` and `conjunctionSync`](#conjunction-and-conjunctionSync)
- [`disjunction` and `disjunctionSync`](#disjunction-and-disjunctionSync)

Iterable `readdir`:

- [`readdir` and `readdirSync`](#readdir-and-readdirSync)
- [`readdirs` and `readdirsSync`](#readdirs-and-readdirsSync)

Iterable utilities:

- [`filter` and `filterSync`](#filter-and-filterSync)
- [`allElements` and `allElementsSync`](#allElements-and-allElementsSync)
- [`firstElement` and `firstElementSync`](#firstElement-and-firstElementSync)
- [`onlyElement` and `onlyElementSync`](#onlyElement-and-onlyElementSync)

</details>

### `findFile` and `findFileSync`

Finds the first file that matches all of the given filters in the given
directories.
If no directory is supplied, then the current working directory is read.

> Specifications

```ts
type Filter<T> = (element: T) => Promise<boolean>;
type FilterSync<T> = (element: T) => boolean;
findFile(...tests: Array<Filter<string> | FilterSync<string>>): Promise<
  string | null
>;
findFile(
  directories: string | AsyncIterable<string> | Iterable<string>,
  ...tests: Array<Filter<string> | FilterSync<string>>
): Promise<string | null>;
findFileSync(...tests: Array<FilterSync<string>>): string | null;
findFileSync(
  directories: string | Iterable<string>,
  ...tests: Array<FilterSync<string>>
): string | null;
```

### `findAllFiles` and `findAllFilesSync`

Finds all the files that match all of the given filters in the given
directories.
If no directory is supplied, then the current working directory is read.

> Specifications

```ts
type Filter<T> = (element: T) => Promise<boolean>;
type FilterSync<T> = (element: T) => boolean;
findAllFiles(...tests: Array<Filter<string>
                     | FilterSync<string>>): Promise<string[]>;
findAllFiles(
  directories: string | AsyncIterable<string> | Iterable<string>,
  ...tests: Array<Filter<string> | FilterSync<string>>
): Promise<string[]>;
findAllFilesSync(...tests: Array<FilterSync<string>>): string[];
findAllFilesSync(
  directories: string | Iterable<string>,
  ...tests: Array<FilterSync<string>>
): string[];
```

### `findOnlyFile` and `findOnlyFileSync`

Finds the first and only file in its directory that matches all of the given
filters.
If no directory is supplied, then the current working directory is read.

> Specifications

```ts
type Filter<T> = (element: T) => Promise<boolean>;
type FilterSync<T> = (element: T) => boolean;
findOnlyFile(...tests: Array<Filter<string> | FilterSync<string>>): Promise<
  string | null
>;
findOnlyFile(
  directories: string | AsyncIterable<string> | Iterable<string>,
  ...tests: Array<Filter<string> | FilterSync<string>>
): Promise<string | null>;
findOnlyFileSync(...tests: Array<FilterSync<string>>): string | null;
findOnlyFileSync(
  directories: string | Iterable<string>,
  ...tests: Array<FilterSync<string>>
): string | null;
```

### `downwardDirectories` and `downwardDirectoriesSync`

Returns an iterable ocer the existing downward files from a start path. Symbolic
links are followed and handled such that no directory is traversed twice.

> Specifications

```ts
downwardDirectories(): AsyncIterable<string>;
downwardDirectories(maximumDepth: number): AsyncIterable<string>;
downwardDirectories(startDirectory: string): AsyncIterable<string>;
downwardDirectories(startDirectory: string,
                    maximumDepth: number): AsyncIterable<string>;
downwardDirectoriesSync(): Iterable<string>;
downwardDirectoriesSync(maximumDepth: number): Iterable<string>;
downwardDirectoriesSync(startDirectory: string): Iterable<string>;
downwardDirectoriesSync(startDirectory: string,
                        maximumDepth: number): Iterable<string>;
```

> Example

Assuming this file system, where the current working directory is `/Documents`:

```txt
/
└── Documents
    ├── Images
    |   └── image.jpeg
    └── project
        ├── node_modules
        └── package.json
```

```js
const { downwardDirectoriesSync } = require("find-files-by-patterns");

[
  ...downwardDirectoriesSync()
]; /*=> `[ '/Documents/Images',
           '/Documents/project',
           '/Documents/project/node_modules' ]`*/
[...downwardDirectoriesSync(1)]; /*=> `[ '/Documents/Images',
                                         '/Documents/project' ]`*/
[...downwardDirectoriesSync(
  "/Documents/project"
)]; //=> `[ '/Documents/project/node_modules' ]`
[...downwardDirectoriesSync(
  "/Documents", 1
)]; //=> `[ '/Documents/Images', '/Documents/project' ]`
```

### `upwardDirectories` and `upwardDirectoriesSync`

Returns an iterable over the existing directories upwards from a start path.

> Specifications

```ts
upwardDirectories(): AsyncIterable<string>;
upwardDirectories(startPath: string): AsyncIterable<string>;
upwardDirectories(startPath: string,
                  maximumHeight: number): AsyncIterable<string>;
upwardDirectories(startPath: string, endPath: string): AsyncIterable<string>;
upwardDirectoriesSync(): Iterable<string>;
upwardDirectoriesSync(startPath: string): Iterable<string>;
upwardDirectoriesSync(startPath: string,
                      maximumHeight: number): Iterable<string>;
upwardDirectoriesSync(startPath: string, endPath: string): Iterable<string>;
```

> Example

Assuming this file system, where the current working directory is
`/Documents/project`:

```txt
/
└── Documents
    ├── Images
    |   └── image.jpeg
    └── project
        ├── node_modules
        └── package.json
```

```js
const { upwardDirectoriesSync } = require("find-files-by-patterns");

[...upwardDirectoriesSync()]; //=> `[ '/Documents', '/' ]`
[...upwardDirectoriesSync(1)]; //=> `[ '/Documents' ]`
[...upwardDirectoriesSync(
  "/Documents/Images/image.jpeg"
)]; //=> `[ '/Documents/Images', '/Documents', '/' ]`
[...upwardDirectoriesSync(
  "/Documents/Images/image.jpeg", 2
)]; //=> `[ '/Documents/Images', '/Documents' ]`
[...upwardDirectoriesSync(
  "/Documents/Images/image.jpeg", "/Documents"
)]; //=> `[ '/Documents/Images', '/Documents' ]`
```

### `downwardFiles` and `downwardFilesSync`

Returns and iterable over the files in each downward directory yielded by
`downwardDirectories` or `downwardDirectoriesSync`.

> Specifications

```ts
downwardFiles(): AsyncIterable<string>;
downwardFiles(maximumDepth: number): AsyncIterable<string>;
downwardFiles(startDirectory: string): AsyncIterable<string>;
downwardFiles(startDirectory: string,
              maximumDepth: number): AsyncIterable<string>;
downwardFilesSync(): Iterable<string>;
downwardFilesSync(maximumDepth: number): Iterable<string>;
downwardFilesSync(startDirectory: string): Iterable<string>;
downwardFilesSync(startDirectory: string,
                  maximumDepth: number): Iterable<string>;
```

### `upwardFiles` and `upwardFilesSync`

Returns and iterable over the files in each upward directory yielded by
`upwardDirectories` or `upwardDirectoriesSync`.

> Specifications

```ts
upwardFiles(): AsyncIterable<string>;
upwardFiles(startPath: string): AsyncIterable<string>;
upwardFiles(startPath: string, maximumHeight: number): AsyncIterable<string>;
upwardFiles(startPath: string, endPath: string): AsyncIterable<string>;
upwardFilesSync(): Iterable<string>;
upwardFilesSync(startPath: string): Iterable<string>;
upwardFilesSync(startPath: string, maximumHeight: number): Iterable<string>;
upwardFilesSync(startPath: string, endPath: string): Iterable<string>;
```

### `ofBasename`, `ofName`, `ofDirname` and `ofExtname`

Determines whether or not a path's `basename`, `name`, `dirname` or `extname`
matches any of a sequence of segment testers.
A segment tester can be a string, a regular expression or a function.

- If it is a string, then the segment must correspond to it for the path to
  match.
- If it is a regular expression, then the segment must test against it for the
  path to match.
- If it is a function, then the segment must make it return `true` for the path
  to match.

> Specifications

```ts
type SegmentTester = string | RegExp | ((segment: string) => boolean);
ofBasename(...tests: SegmentTester[]): FilterSync<string>;
ofName(...tests: SegmentTester[]): FilterSync<string>;
ofDirname(...tests: SegmentTester[]): FilterSync<string>;
ofExtname(...tests: SegmentTester[]): FilterSync<string>;
```

> Example

```js
const { ofBasename, ofName,
        ofDirname, ofExtname } = require("find-files-by-patterns");

const isMarkdownFile = ofExtname(".md", ".markdown");
const isIndexFile = ofName("index");
const isDataFilename = ofBasename(/^data/);
const isInDocuments = ofDirname("/Documents");

isMarkdownFile("/Documents/article.md"); //=> `true`
isMarkdownFile("/Documents/data.json"); //=> `false`
isIndexFile("/Documents/index.html"); //=> `true`
isIndexFile("/Documents/index.md"); //=> `true`
isDataFilename("/Documents/data.json"); //=> `true`
isInDocuments("/Documents/data.json"); //=> `true`
isInDocuments("/Documents/src/index.js"); //=> `false`
```

### `hasPathSegments`

Determines whether or not all the paths segments of a path match a sequence of
segment testers.
A segment tester can be a string, a regular expression or a function.

- If it is a string, then the segment must correspond to it for the path to
  match.
- If it is a regular expression, then the segment must test against it for the
  path to match.
- If it is a function, then the segment must make it return `true` for the path
  to match.

> Specifications

```ts
type SegmentTester = string | RegExp | ((segment: string) => boolean);
hasPathSegments(...tests: SegmentTester[]): FilterSync<string>;
```

> Example

```js
const { hasPathSegments } = require("find-files-by-patterns");

const isNotIgnored = hasPathSegments(segment => !segment.startsWith("_"));
isNotIgnored("project/src/_ignored.json"); //=> `false`
isNotIgnored("project/_ignored/data.json"); //=> `false`
isNotIgnored("project/src/data.yaml"); //=> `true`
```

### `isFile` and `isFileSync`

Determines whether or not a path exists on the file system and is a file.

> Specifications

```ts
isFile(path: string): Promise<boolean>;
isFileSync(path: string): boolean;
```

### `isDirectory` and `isDirectorySync`

Determines whether or not a path exists on the file system and is a directory.

> Specifications

```ts
isDirectory(path: string): Promise<boolean>;
isDirectorySync(path: string): boolean;
```

### `hasFile` and `hasFileSync`

Returns a filter which determines whether or not a path is a directory that has
a file which matches a filter.

> Specifications

```ts
hasFile(test: Filter<string> | FilterSync<string>): Filter<string>;
hasFileSync(test: FilterSync<string>): FilterSync<string>;
```

> Example

Assuming this file system, where the current working directory is
`/Documents/project`:

```txt
/
└── Documents
    ├── Images
    |   └── image.jpeg
    └── project
        ├── node_modules
        └── package.json
```

```js
const { findFileSync, upwardDirectoriesSync,
  hasFileSync, ofBasename } = require("find-files-by-patterns");

const imagesDirectory = findFileSync(
  upwardDirectoriesSync(),
  hasFileSync(ofBasename("image.jpeg"))
); //=> `/Documents/Images`
```

### `readdir` and `readdirSync`

Returns an iterable over the fully qualified file names in the given directory.

> Specifications

```ts
readdir(directory: string): AsyncIterable<string>;
readdirSync(directory: string): Iterable<string>;
```

### `readdirs` and `readdirsSync`

Returns an iterable over the fully qualified file names in the given sequence of
directories.

> Specifications

```ts
readdirs(directory: string): AsyncIterable<string>;
readdirsSync(directory: string): Iterable<string>;
```

### `filter` and `filterSync`

Filters out the iterated elements of an iterable for which the filter function
returns `false`.
This is analogous to the array filter method.

> Specifications

```ts
type Filter<T> = (element: T) => Promise<boolean>;
type FilterSync<T> = (element: T) => boolean;
filter<T>(iterable: Iterable<T> | AsyncIterable<T>,
          filter: Filter<T> | FilterSync<T>): AsyncIterable<T>;
filterSync<T>(iterable: Iterable<T>,
              filter: FilterSync<T>): Iterable<T>;
```

> Example

```js
const { filterSync, hasPathSegments } = require("find-files-by-patterns");

const paths = [
  "/Documents/project",
  "/Documents/project/data.json",
  "/Documents/project/_directory",
  "/Documents/project/_directory/data.json"
];
[...filterSync(paths, hasPathSegments(segment => !segment.startsWith("_")))];
//=> `[ '/Documents/project', '/Documents/project/data.json' ]`
```

### `conjunction` and `conjunctionSync`

Compounds a sequence of filters using logical conjunction.

> Specifications

```ts
type Filter<T> = (element: T) => Promise<boolean>;
type FilterSync<T> = (element: T) => boolean;
conjunction<T>(filters: Array<Filter<T> | FilterSync<T>>): Filter<T>;
conjunctionSync<T>(filters: Array<FilterSync<T>>): FilterSync<T>;
```

> Example

```js
const { ofBasename, ofExtname,
  conjunctionSync } = require("find-files-by-patterns");

const validDataExtensions = [".json", ".yaml", ".csv"];
const isDataFile = conjunctionSync([
  ofBasename(basename => basename.startsWith("data")),
  ofExtname(...validDataExtensions)
]);

isDataFile("/Documents/project/data.json"); //=> `true`
isDataFile("/Documents/project/data.yaml"); //=> `true`
isDataFile("/Documents/project/_data.json"); //=> `false`
```

### `disjunction` and `disjunctionSync`

Compounds a sequence of filters using logical disjunction.

> Specifications

```ts
type Filter<T> = (element: T) => Promise<boolean>;
type FilterSync<T> = (element: T) => boolean;
disjunction<T>(filters: Array<Filter<T> | FilterSync<T>>): Filter<T>;
disjunctionSync<T>(filters: Array<FilterSync<T>>): FilterSync<T>;
```

> Example

```js
const { ofBasename, disjunctionSync } = require("find-files-by-patterns");

const isDataFilename = disjunctionSync([
  ofBasename("data.json"),
  ofBasename("_data.json")
]);

isDataFilename("/Documents/project/data.json"); //=> `true`
isDataFilename("/Documents/project/_data.json"); //=> `true`
isDataFilename("/Documents/project/data.yaml"); //=> `false`
```

### `allElements` and `allElementsSync`

Converts an iterable to an array.

> Specifications

```ts
allElements<T>(iterable: AsyncIterable<T>): Promise<T[]>;
allElementsSync<T>(iterable: Iterable<T>): T[];
```

### `firstElement` and `firstElementSync`

Returns the first element of an iterable.

> Specifications

```ts
firstElement<T>(iterable: AsyncIterable<T>): Promise<T | null>;
firstElementSync<T>(iterable: Iterable<T>): T | null;
```

### `onlyElement` and `onlyElementSync`

Returns the only yielded element of an iterable.
If there is more than one element yielded by the iterable, then an error is
thrown.

> Specifications

```ts
onlyElement<T>(iterable: AsyncIterable<T>): Promise<T | null>;
onlyElementSync<T>(iterable: Iterable<T>): T | null;
```

## About

### Building the documentation

```sh
npm run doc
```

### Running the tests

```sh
npm run test
```

### Building the library

```sh
npm run build
```

### Authors

- **Marc-Antoine Ouimet** - [MartyO256](https://github.com/MartyO256)

### License

This project is licensed under the MIT License. See the [LICENSE.md](LICENSE.md)
file for details.
