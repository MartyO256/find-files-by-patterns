import { rejects } from "assert";
import { assert } from "chai";

import mock from "mock-fs";
import { resolve } from "path";

import { findFile, findFileSync } from "../src/fileFinders.js";
import { Filter, FilterSync } from "../src/filter.js";
import { ofBasename } from "../src/path.js";

const error: Filter<string> = async () => {
  throw new Error();
};
const errorSync: FilterSync<string> = () => {
  throw new Error();
};
const resolvedPath = (path: string): string => resolve(path);

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
      it("arbitrarily resolves to `null` if no arguments are provided", async () => {
        assert.isNull(await findFile());
      });
      it("arbitrarily resolves to `null` if only an empty set of tests is provided", async () => {
        const tests: Array<Filter<string>> = [];
        assert.isNull(await findFile(...tests));
      });
      it("resolves an undefined directory path to the current working directory", async () => {
        return assert.strictEqual(
          await findFile(ofBasename("file.html")),
          resolvedPath("./file.html"),
        );
      });
      it("resolves to a found directory's path", async () => {
        assert.strictEqual(
          await findFile(ofBasename("files")),
          resolvedPath("./files"),
        );
      });
      it("resolves to a found file's path", async () => {
        assert.strictEqual(
          await findFile(ofBasename("file.html")),
          resolvedPath("./file.html"),
        );
      });
      it("does not resolve to a path that doesn't pass all the tests", async () => {
        assert.isNull(
          await findFile(ofBasename("file.html"), ofBasename("files")),
        );
      });
      it("resolves to a path that passes all the tests", async () => {
        assert.isNotNull(
          await findFile(ofBasename(/^file/), ofBasename(/\.html$/)),
        );
      });
      it("rejects if one of the tests throws an error", async () => {
        rejects(findFile(error));
      });
    });
    describe("(directories: string | AsyncIterable<string> | Iterable<string>, ...tests: Array<Filter<string> | FilterSync<string>>): Promise<string | null>", () => {
      it("arbitrarily resolves to `null` if no arguments are provided", async () => {
        assert.isNull(await findFile());
      });
      it("arbitrarily resolves to `null` if only an empty set of directories is provided", async () => {
        assert.isNull(await findFile([]));
      });
      it("arbitrarily resolves to `null` if an empty set of directories is provided", async () => {
        assert.isNull(await findFile([], ofBasename()));
      });
      it("arbitrarily resolves to `null` if empty sets of directories and tests are provided", async () => {
        assert.isNull(await findFile([], ...[]));
      });
      it("arbitrarily resolves to `null` if no tests are provided", async () => {
        assert.isNull(await findFile("./"));
      });
      it("handles a directory specified with a string path", async () => {
        assert.strictEqual(
          await findFile("./", ofBasename("file.html")),
          resolvedPath("./file.html"),
        );
      });
      it("handles directories specified with string paths", async () => {
        assert.strictEqual(
          await findFile(["./", "./files"], ofBasename("file.html")),
          resolvedPath("./file.html"),
        );
      });
      it("resolves directory paths which are not absolute relative to the current working directory", async () => {
        assert.strictEqual(
          await findFile("./", ofBasename("file.html")),
          resolvedPath("./file.html"),
        );
        assert.strictEqual(
          await findFile("./files", ofBasename("file.html")),
          resolvedPath("./files/file.html"),
        );
      });
      it("resolves to null if there is no matching file in a directory", async () => {
        assert.isNull(
          await findFile("/home/user/files", ofBasename("inexistant.json")),
        );
      });
      it("resolves to null if there is no matching file in directories", async () => {
        assert.isNull(
          await findFile(
            ["/home/user/files", "/home/user/symbolic-files"],
            ofBasename("inexistant.json"),
          ),
        );
      });
      it("resolves to a found directory's path", async () => {
        assert.strictEqual(
          await findFile("./", ofBasename("files")),
          resolvedPath("./files"),
        );
      });
      it("resolves to a found file's path", async () => {
        assert.strictEqual(
          await findFile("./", ofBasename("file.html")),
          resolvedPath("./file.html"),
        );
      });
      it("resolves to a file's path if there is only one matching file in a directory", async () => {
        assert.strictEqual(
          await findFile("/home/user/files", ofBasename("file.html")),
          resolvedPath("/home/user/files/file.html"),
        );
      });
      it("resolves to a file's path if there is only one matching file in a directory among the directories", async () => {
        assert.strictEqual(
          await findFile(
            ["/home/user/files", "/home/user/symbolic-files"],
            ofBasename("file.html"),
          ),
          resolvedPath("/home/user/files/file.html"),
        );
      });
      it("rejects if any of the given directories does not exist", async () => {
        rejects(findFile("./inexistant-folder", ofBasename("inexistant.html")));
      });
      it("rejects if one of the tests throws an error", async () => {
        rejects(findFile("./", error));
      });
      it("rejects if one of the directories is a file", async () => {
        rejects(findFile(["./", "./file.html"], ofBasename("inexistant.html")));
      });
      it("does not reject if there is more than one matching file in a directory", async () => {
        assert.isNotNull(
          await findFile("/home/user/files", ofBasename(/^file\./)),
        );
      });
    });
  });
  describe("sync", () => {
    describe("(...tests: Array<FilterSync<string>>): string | null", () => {
      it("returns `null` if no arguments are provided", () => {
        assert.isNull(findFileSync());
      });
      it("returns `null` if only an empty set of tests is provided", () => {
        const tests: Array<FilterSync<string>> = [];
        assert.isNull(findFileSync(...tests));
      });
      it("resolves an undefined directory path to the current working directory", () => {
        assert.strictEqual(
          findFileSync(ofBasename("file.html")),
          resolvedPath("./file.html"),
        );
      });
      it("returns a found directory's path", () => {
        assert.strictEqual(
          findFileSync(ofBasename("files")),
          resolvedPath("./files"),
        );
      });
      it("returns a found file's path", () => {
        assert.strictEqual(
          findFileSync(ofBasename("file.html")),
          resolvedPath("./file.html"),
        );
      });
      it("does not return a path that doesn't pass all the tests", () => {
        assert.isNull(
          findFileSync(ofBasename("file.html"), ofBasename("files")),
        );
      });
      it("returns a path that passes all the tests", () => {
        assert.isNotNull(
          findFileSync(ofBasename(/^file/), ofBasename(/\.html$/)),
        );
      });
      it("throws an error if one of the tests throws an error", () => {
        assert.throws(() => findFileSync(errorSync));
      });
    });
    describe("(directories: string | Iterable<string>, ...tests: Array<FilterSync<string>>): string | null", () => {
      it("returns `null` if no arguments are provided", () => {
        assert.isNull(findFileSync());
      });
      it("returns `null` if only an empty set of directories is provided", () => {
        assert.isNull(findFileSync([]));
      });
      it("returns `null` if an empty set of directories is provided", () => {
        assert.isNull(findFileSync([], ofBasename()));
      });
      it("returns `null` if empty sets of directories and tests are provided", () => {
        assert.isNull(findFileSync([], ...[]));
      });
      it("returns `null` if there are no tests to perform on files' path", () => {
        assert.isNull(findFileSync("./"));
      });
      it("handles a directory specified with a string path", () => {
        assert.strictEqual(
          findFileSync("./", ofBasename("file.html")),
          resolvedPath("./file.html"),
        );
      });
      it("handles directories specified with string paths", () => {
        assert.strictEqual(
          findFileSync(["./", "./files"], ofBasename("file.html")),
          resolvedPath("./file.html"),
        );
      });
      it("resolves directory paths which are not absolute relative to the current working directory", () => {
        assert.strictEqual(
          findFileSync("./", ofBasename("file.html")),
          resolvedPath("./file.html"),
        );
        assert.strictEqual(
          findFileSync("./files", ofBasename("file.html")),
          resolvedPath("./files/file.html"),
        );
      });
      it("returns null if there is no matching file in a directory", () => {
        assert.isNull(
          findFileSync("/home/user/files", ofBasename("inexistant.json")),
        );
      });
      it("returns null if there is no matching file in directories", () => {
        assert.isNull(
          findFileSync(
            ["/home/user/files", "/home/user/symbolic-files"],
            ofBasename("inexistant.json"),
          ),
        );
      });
      it("returns a found directory's path", () => {
        assert.strictEqual(
          findFileSync("./", ofBasename("files")),
          resolvedPath("./files"),
        );
      });
      it("returns a found file's path", () => {
        assert.strictEqual(
          findFileSync("./", ofBasename("file.html")),
          resolvedPath("./file.html"),
        );
      });
      it("returns a file's path if there is only one matching file in a directory", () => {
        assert.strictEqual(
          findFileSync("/home/user/files", ofBasename("file.html")),
          resolvedPath("/home/user/files/file.html"),
        );
      });
      it("returns a file's path if there is only one matching file in a directory among the directories", () => {
        assert.strictEqual(
          findFileSync(
            ["/home/user/files", "/home/user/symbolic-files"],
            ofBasename("file.html"),
          ),
          resolvedPath("/home/user/files/file.html"),
        );
      });
      it("throws an error if any of the given directories does not exist", () => {
        assert.throws(() => {
          findFileSync("./inexistant-folder", ofBasename("inexistant.html"));
        });
      });
      it("throws an error if one of the tests throws an error", () => {
        assert.throws(() => findFileSync("./", errorSync));
      });
      it("does not throw an error if there is more than one matching file in a directory", () => {
        assert.isNotNull(
          findFileSync("/home/user/files", ofBasename(/^file\./)),
        );
      });
      it("throws an error if one of the directories is a file", () => {
        assert.throws(() =>
          findFileSync(["./", "./file.html"], ofBasename("inexistant.html")),
        );
      });
    });
  });
});
