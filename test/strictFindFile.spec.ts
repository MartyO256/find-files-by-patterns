import { rejects } from "assert";
import { assert } from "chai";

import * as mock from "mock-fs";
import { resolve } from "path";

import { strictFindFile, strictFindFileSync } from "../src/fileFinders";
import { Filter, FilterSync } from "../src/filter";
import { ofBasename } from "../src/path";

const error: Filter<string> = async () => {
  throw new Error();
};
const errorSync: FilterSync<string> = () => {
  throw new Error();
};
const resolvedPath = (path: string) => resolve(path);

describe("strictFindFile", () => {
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
        assert.isNull(await strictFindFile());
      });
      it("should arbitrarily resolve to `null` if only an empty set of tests is provided", async () => {
        const tests: Array<Filter<string>> = [];
        assert.isNull(await strictFindFile(...tests));
      });
      it("should arbitrarily resolve to `null` if there are no test to perform on files' path", async () => {
        assert.isNull(await strictFindFile("./"));
      });
      it("should resolve an undefined directory path to the current working directory", async () => {
        assert.strictEqual(
          await strictFindFile(ofBasename("file.html")),
          resolvedPath("./file.html"),
        );
      });
      it("should resolve to a found directory's path", async () => {
        assert.strictEqual(
          await strictFindFile(ofBasename("files")),
          resolvedPath("./files"),
        );
      });
      it("should resolve to a found file's path", async () => {
        assert.strictEqual(
          await strictFindFile(ofBasename("file.html")),
          resolvedPath("./file.html"),
        );
      });
      it("should not resolve to a path that doesn't pass all the tests", async () => {
        assert.isNull(
          await strictFindFile(ofBasename("file.html"), ofBasename("files")),
        );
      });
      it("should resolve to a path that passes all the tests", async () => {
        assert.isNotNull(
          await strictFindFile(ofBasename(/^file/), ofBasename(/\.html$/)),
        );
      });
      it("should be rejected if one of the tests throws an error", async () => {
        rejects(strictFindFile(error));
      });
      it("should be rejected if there is more than one matching file in a directory", async () => {
        rejects(strictFindFile(ofBasename(/^file/)));
      });
    });
    describe("(directories: string | AsyncIterable<string> | Iterable<string>, ...tests: Array<Filter<string> | FilterSync<string>>): Promise<string | null>", () => {
      it("should arbitrarily resolve to `null` if no arguments are provided", async () => {
        assert.isNull(await strictFindFile());
      });
      it("should arbitrarily resolve to `null` if only an empty set of directories is provided", async () => {
        assert.isNull(await strictFindFile([]));
      });
      it("should arbitrarily resolve to `null` if an empty set of directories is provided", async () => {
        assert.isNull(await strictFindFile([], ofBasename()));
      });
      it("should arbitrarily resolve to `null` if empty sets of directories and tests are provided", async () => {
        assert.isNull(await strictFindFile([], ...[]));
      });
      it("should handle a directory specified with a string path", async () => {
        assert.strictEqual(
          await strictFindFile("./", ofBasename("file.html")),
          resolvedPath("./file.html"),
        );
      });
      it("should handle directories specified with string paths", async () => {
        assert.strictEqual(
          await strictFindFile(["./", "./files"], ofBasename("file.html")),
          resolvedPath("./file.html"),
        );
      });
      it("should resolve directory paths which are not absolute relative to the current working directory", async () => {
        assert.strictEqual(
          await strictFindFile("./", ofBasename("file.html")),
          resolvedPath("./file.html"),
        );
        assert.strictEqual(
          await strictFindFile("./files", ofBasename("file.html")),
          resolvedPath("./files/file.html"),
        );
      });
      it("should resolve to null if there is no matching file in a directory", async () => {
        assert.isNull(
          await strictFindFile(
            "/home/user/files",
            ofBasename("inexistant.json"),
          ),
        );
      });
      it("should resolve to null if there is no matching file in directories", async () => {
        assert.isNull(
          await strictFindFile(
            ["/home/user/files", "/home/user/symbolic-files"],
            ofBasename("inexistant.json"),
          ),
        );
      });
      it("should resolve to a file's path if there is only one matching file in a directory", async () => {
        assert.strictEqual(
          await strictFindFile("/home/user/files", ofBasename("file.html")),
          resolvedPath("/home/user/files/file.html"),
        );
      });
      it("should resolve to a file's path if there is only one matching file in a directory among the directories", async () => {
        assert.strictEqual(
          await strictFindFile(
            ["/home/user/files", "/home/user/symbolic-files"],
            ofBasename("file.html"),
          ),
          resolvedPath("/home/user/files/file.html"),
        );
      });
      it("should resolve to a found directory's path", async () => {
        assert.strictEqual(
          await strictFindFile("./", ofBasename("files")),
          resolvedPath("./files"),
        );
      });
      it("should resolve to a found file's path", async () => {
        assert.strictEqual(
          await strictFindFile("./", ofBasename("file.html")),
          resolvedPath("./file.html"),
        );
      });
      it("should be rejected if any of the given directories does not exist", async () => {
        rejects(
          strictFindFile("./inexistant-folder", ofBasename("inexistant.html")),
        );
      });
      it("should be rejected if one of the tests throws an error", async () => {
        rejects(strictFindFile("./", error));
      });
      it("should be rejected if there is more than one matching file in a directory", async () => {
        rejects(strictFindFile("/home/user/files", ofBasename(/^file\./)));
      });
      it("should be rejected if one of the directories is a file", async () => {
        rejects(
          strictFindFile(["./", "./file.html"], ofBasename("inexistant.html")),
        );
      });
    });
  });
  describe("sync", () => {
    describe("(...tests: Array<FilterSync<string>>): string | null", () => {
      it("should arbitrarily return `null` if no arguments are provided", () => {
        assert.isNull(strictFindFileSync());
      });
      it("should arbitrarily return `null` if only an empty set of tests is provided", () => {
        const tests: Array<FilterSync<string>> = [];
        assert.isNull(strictFindFileSync(...tests));
      });
      it("should resolve an undefined directory path to the current working directory", () => {
        assert.strictEqual(
          strictFindFileSync(ofBasename("file.html")),
          resolve("./file.html"),
        );
      });
      it("should return a found directory's path", () => {
        assert.strictEqual(
          strictFindFileSync(ofBasename("files")),
          resolve("./files"),
        );
      });
      it("should return a found file's path", () => {
        assert.strictEqual(
          strictFindFileSync(ofBasename("file.html")),
          resolve("./file.html"),
        );
      });
      it("should not return a path that doesn't pass all the tests", () => {
        assert.isNull(
          strictFindFileSync(ofBasename("file.html"), ofBasename("files")),
        );
      });
      it("should return a path that passes all the tests", () => {
        assert.isNotNull(
          strictFindFileSync(ofBasename(/^file/), ofBasename(/\.html$/)),
        );
      });
      it("should throw an error if one of the tests throws an error", () => {
        assert.throws(() => strictFindFileSync(errorSync));
      });
      it("should throw an error if there is more than one matching file in a directory", () => {
        assert.throws(() => strictFindFileSync(ofBasename(/^file/)));
      });
    });
    describe("(directories: string | Iterable<string>, ...tests: Array<FilterSync<string>>): string | null", () => {
      it("should arbitrarily return `null` if no arguments are provided", () => {
        assert.isNull(strictFindFileSync());
      });
      it("should arbitrarily return `null` if only an empty set of directories is provided", () => {
        assert.isNull(strictFindFileSync([]));
      });
      it("should arbitrarily return `null` if an empty set of directories is provided", () => {
        assert.isNull(strictFindFileSync([], ofBasename()));
      });
      it("should arbitrarily return `null` if empty sets of directories and tests are provided", () => {
        assert.isNull(strictFindFileSync([], ...[]));
      });
      it("should arbitrarily return `null` if there are no tests to perform on files' path", () => {
        assert.isNull(strictFindFileSync("./"));
      });
      it("should handle a directory specified with a string path", () => {
        assert.strictEqual(
          strictFindFileSync("./", ofBasename("file.html")),
          resolve("./file.html"),
        );
      });
      it("should handle directories specified with string paths", () => {
        assert.strictEqual(
          strictFindFileSync(["./", "./files"], ofBasename("file.html")),
          resolve("./file.html"),
        );
      });
      it("should resolve directory paths which are not absolute relative to the current working directory", () => {
        assert.strictEqual(
          strictFindFileSync("./", ofBasename("file.html")),
          resolve("./file.html"),
        );
        assert.strictEqual(
          strictFindFileSync("./files", ofBasename("file.html")),
          resolve("./files/file.html"),
        );
      });
      it("should return null if there is no matching file in a directory", () => {
        assert.isNull(
          strictFindFileSync("/home/user/files", ofBasename("inexistant.json")),
        );
      });
      it("should return null if there is no matching file in directories", () => {
        assert.isNull(
          strictFindFileSync(
            ["/home/user/files", "/home/user/symbolic-files"],
            ofBasename("inexistant.json"),
          ),
        );
      });
      it("should return a file's path if there is only one matching file in a directory", () => {
        assert.strictEqual(
          strictFindFileSync("/home/user/files", ofBasename("file.html")),
          resolve("/home/user/files/file.html"),
        );
        it("should return a found directory's path", () => {
          assert.strictEqual(
            strictFindFileSync("./", ofBasename("files")),
            resolve("./files"),
          );
        });
        it("should return a found file's path", () => {
          assert.strictEqual(
            strictFindFileSync("./", ofBasename("file.html")),
            resolve("./file.html"),
          );
        });
      });
      it("should return a file's path if there is only one matching file in a directory among the directories", () => {
        assert.strictEqual(
          strictFindFileSync(
            ["/home/user/files", "/home/user/symbolic-files"],
            ofBasename("file.html"),
          ),
          resolve("/home/user/files/file.html"),
        );
      });
      it("should throw an error if any of the given directories does not exist", () => {
        assert.throws(() => {
          strictFindFileSync(
            "./inexistant-folder",
            ofBasename("inexistant.html"),
          );
        });
      });
      it("should throw an error if one of the tests throws an error", () => {
        assert.throws(() => strictFindFileSync("./", errorSync));
      });
      it("should throw an error if there is more than one matching file in a directory", () => {
        assert.throws(() =>
          strictFindFileSync("/home/user/files", ofBasename(/^file\./)),
        );
      });
      it("should be rejected if one of the directories is a file", () => {
        assert.throws(() =>
          strictFindFileSync(
            ["./", "./file.html"],
            ofBasename("inexistant.html"),
          ),
        );
      });
    });
  });
});
