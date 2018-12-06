import { assert } from "chai";

import * as mock from "mock-fs";
import { resolve } from "path";

import { findFile, findFileSync } from "../src/fileFinders";
import { Filter, FilterSync } from "../src/filter";
import { ofBasename } from "../src/path";

const error: Filter<string> = async () => {
  throw new Error();
};
const errorSync: FilterSync<string> = () => {
  throw new Error();
};
const resolvedPath = (path: string) => resolve(path);

describe("findFile", () => {
  beforeEach(() => {
    mock(
      {
        "/home/user": {
          files: {
            "file.md": "",
            "file.html": "",
          },
          "symbolic-files": {
            "file.json": "",
            "file.html": mock.symlink({
              path: "/home/user/files/file.html",
            }),
          },
          "symbolic-folder": mock.symlink({
            path: "/home/user/files",
          }),
        },
        [process.cwd()]: {
          "file.html": mock.symlink({
            path: "/home/user/files/file.html",
          }),
          files: mock.symlink({
            path: "/home/user/files",
          }),
        },
      },
      {
        createCwd: false,
        createTmp: false,
      },
    );
  });
  afterEach(() => {
    mock.restore();
  });
  describe("async", () => {
    describe("(...tests: Array<Filter<string> | FilterSync<string>>): Promise<string | null>", () => {
      it("should arbitrarily resolve to `null` if no arguments are provided", async () => {
        assert.isNull(await await findFile());
      });
      it("should arbitrarily resolve to `null` if only an empty set of tests is provided", async () => {
        const tests: Array<Filter<string>> = [];
        assert.isNull(await await findFile(...tests));
      });
      it("should resolve an undefined directory path to the current working directory", async () => {
        return assert.strictEqual(
          await findFile(ofBasename("file.html")),
          resolvedPath("./file.html"),
        );
      });
      it("should resolve to a found directory's path", async () => {
        assert.strictEqual(
          await findFile(ofBasename("files")),
          resolvedPath("./files"),
        );
      });
      it("should resolve to a found file's path", async () => {
        assert.strictEqual(
          await findFile(ofBasename("file.html")),
          resolvedPath("./file.html"),
        );
      });
      it("should not resolve to a path that doesn't pass all the tests", async () => {
        assert.isNull(
          await findFile(ofBasename("file.html"), ofBasename("files")),
        );
      });
      it("should resolve to a path that passes all the tests", async () => {
        assert.isNotNull(
          await findFile(ofBasename(/^file/), ofBasename(/\.html$/)),
        );
      });
      it("should be rejected if one of the tests throws an error", async () => {
        assert.isRejected(findFile(error));
      });
    });
    describe("(directories: string | AsyncIterable<string> | Iterable<string>, ...tests: Array<Filter<string> | FilterSync<string>>): Promise<string | null>", () => {
      it("should arbitrarily resolve to `null` if no arguments are provided", async () => {
        assert.isNull(await findFile());
      });
      it("should arbitrarily resolve to `null` if only an empty set of directories is provided", async () => {
        assert.isNull(await findFile([]));
      });
      it("should arbitrarily resolve to `null` if an empty set of directories is provided", async () => {
        assert.isNull(await findFile([], ofBasename()));
      });
      it("should arbitrarily resolve to `null` if empty sets of directories and tests are provided", async () => {
        assert.isNull(await findFile([], ...[]));
      });
      it("should arbitrarily resolve to `null` if no tests are provided", async () => {
        assert.isNull(await findFile("./"));
      });
      it("should handle a directory specified with a string path", async () => {
        assert.strictEqual(
          await findFile("./", ofBasename("file.html")),
          resolvedPath("./file.html"),
        );
      });
      it("should handle directories specified with string paths", async () => {
        assert.strictEqual(
          await findFile(["./", "./files"], ofBasename("file.html")),
          resolvedPath("./file.html"),
        );
      });
      it("should resolve directory paths which are not absolute relative to the current working directory", async () => {
        assert.strictEqual(
          await findFile("./", ofBasename("file.html")),
          resolvedPath("./file.html"),
        );
        assert.strictEqual(
          await findFile("./files", ofBasename("file.html")),
          resolvedPath("./files/file.html"),
        );
      });
      it("should resolve to null if there is no matching file in a directory", async () => {
        assert.isNull(
          await findFile("/home/user/files", ofBasename("inexistant.json")),
        );
      });
      it("should resolve to null if there is no matching file in directories", async () => {
        assert.isNull(
          await findFile(
            ["/home/user/files", "/home/user/symbolic-files"],
            ofBasename("inexistant.json"),
          ),
        );
      });
      it("should resolve to a found directory's path", async () => {
        assert.strictEqual(
          await findFile("./", ofBasename("files")),
          resolvedPath("./files"),
        );
      });
      it("should resolve to a found file's path", async () => {
        assert.strictEqual(
          await findFile("./", ofBasename("file.html")),
          resolvedPath("./file.html"),
        );
      });
      it("should resolve to a file's path if there is only one matching file in a directory", async () => {
        assert.strictEqual(
          await findFile("/home/user/files", ofBasename("file.html")),
          resolvedPath("/home/user/files/file.html"),
        );
      });
      it("should resolve to a file's path if there is only one matching file in a directory among the directories", async () => {
        assert.strictEqual(
          await findFile(
            ["/home/user/files", "/home/user/symbolic-files"],
            ofBasename("file.html"),
          ),
          resolvedPath("/home/user/files/file.html"),
        );
      });
      it("should be rejected if any of the given directories does not exist", async () => {
        assert.isRejected(
          findFile("./inexistant-folder", ofBasename("inexistant.html")),
        );
      });
      it("should be rejected if one of the tests throws an error", async () => {
        assert.isRejected(findFile("./", error));
      });
      it("should be rejected if one of the directories is a file", async () => {
        assert.isRejected(
          findFile(["./", "./file.html"], ofBasename("inexistant.html")),
        );
      });
      it("should not be rejected if there is more than one matching file in a directory", async () => {
        assert.eventually.isNotNull(
          findFile("/home/user/files", ofBasename(/^file\./)),
        );
      });
    });
  });
  describe("sync", () => {
    describe("(...tests: Array<FilterSync<string>>): string | null", () => {
      it("should arbitrarily return `null` if no arguments are provided", () => {
        assert.isNull(findFileSync());
      });
      it("should arbitrarily return `null` if only an empty set of tests is provided", () => {
        const tests: Array<FilterSync<string>> = [];
        assert.isNull(findFileSync(...tests));
      });
      it("should resolve an undefined directory path to the current working directory", () => {
        assert.strictEqual(
          findFileSync(ofBasename("file.html")),
          resolvedPath("./file.html"),
        );
      });
      it("should return a found directory's path", () => {
        assert.strictEqual(
          findFileSync(ofBasename("files")),
          resolvedPath("./files"),
        );
      });
      it("should return a found file's path", () => {
        assert.strictEqual(
          findFileSync(ofBasename("file.html")),
          resolvedPath("./file.html"),
        );
      });
      it("should not return a path that doesn't pass all the tests", () => {
        assert.isNull(
          findFileSync(ofBasename("file.html"), ofBasename("files")),
        );
      });
      it("should return a path that passes all the tests", () => {
        assert.isNotNull(
          findFileSync(ofBasename(/^file/), ofBasename(/\.html$/)),
        );
      });
      it("should throw an error if one of the tests throws an error", () => {
        assert.throws(() => findFileSync(errorSync));
      });
    });
    describe("(directories: string | Iterable<string>, ...tests: Array<FilterSync<string>>): string | null", () => {
      it("should arbitrarily return `null` if no arguments are provided", () => {
        assert.isNull(findFileSync());
      });
      it("should arbitrarily return `null` if only an empty set of directories is provided", () => {
        assert.isNull(findFileSync([]));
      });
      it("should arbitrarily return `null` if an empty set of directories is provided", () => {
        assert.isNull(findFileSync([], ofBasename()));
      });
      it("should arbitrarily return `null` if empty sets of directories and tests are provided", () => {
        assert.isNull(findFileSync([], ...[]));
      });
      it("should arbitrarily return `null` if there are no tests to perform on files' path", () => {
        assert.isNull(findFileSync("./"));
      });
      it("should handle a directory specified with a string path", () => {
        assert.strictEqual(
          findFileSync("./", ofBasename("file.html")),
          resolvedPath("./file.html"),
        );
      });
      it("should handle directories specified with string paths", () => {
        assert.strictEqual(
          findFileSync(["./", "./files"], ofBasename("file.html")),
          resolvedPath("./file.html"),
        );
      });
      it("should resolve directory paths which are not absolute relative to the current working directory", () => {
        assert.strictEqual(
          findFileSync("./", ofBasename("file.html")),
          resolvedPath("./file.html"),
        );
        assert.strictEqual(
          findFileSync("./files", ofBasename("file.html")),
          resolvedPath("./files/file.html"),
        );
      });
      it("should return null if there is no matching file in a directory", () => {
        assert.isNull(
          findFileSync("/home/user/files", ofBasename("inexistant.json")),
        );
      });
      it("should return null if there is no matching file in directories", () => {
        assert.isNull(
          findFileSync(
            ["/home/user/files", "/home/user/symbolic-files"],
            ofBasename("inexistant.json"),
          ),
        );
      });
      it("should return a found directory's path", () => {
        assert.strictEqual(
          findFileSync("./", ofBasename("files")),
          resolvedPath("./files"),
        );
      });
      it("should return a found file's path", () => {
        assert.strictEqual(
          findFileSync("./", ofBasename("file.html")),
          resolvedPath("./file.html"),
        );
      });
      it("should return a file's path if there is only one matching file in a directory", () => {
        assert.strictEqual(
          findFileSync("/home/user/files", ofBasename("file.html")),
          resolvedPath("/home/user/files/file.html"),
        );
      });
      it("should return a file's path if there is only one matching file in a directory among the directories", () => {
        assert.strictEqual(
          findFileSync(
            ["/home/user/files", "/home/user/symbolic-files"],
            ofBasename("file.html"),
          ),
          resolvedPath("/home/user/files/file.html"),
        );
      });
      it("should throw an error if any of the given directories does not exist", () => {
        assert.throws(() => {
          findFileSync("./inexistant-folder", ofBasename("inexistant.html"));
        });
      });
      it("should throw an error if one of the tests throws an error", () => {
        assert.throws(() => findFileSync("./", errorSync));
      });
      it("should not throw an error if there is more than one matching file in a directory", () => {
        assert.isNotNull(
          findFileSync("/home/user/files", ofBasename(/^file\./)),
        );
      });
      it("should throw an error if one of the directories is a file", () => {
        assert.throws(() =>
          findFileSync(["./", "./file.html"], ofBasename("inexistant.html")),
        );
      });
    });
  });
});
