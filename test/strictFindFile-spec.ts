import { assert } from "chai";
import chai = require("chai");
import chaiAsPromised = require("chai-as-promised");

import * as mock from "mock-fs";
import { resolve } from "path";

import { Matcher, ofBasename, strictFindFile } from "../src";

chai.use(chaiAsPromised);

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
  describe("Asynchronous", () => {
    describe("(...tests: Matcher[]): Promise<string | null>", () => {
      it("should arbitrarily resolve to `null` if no arguments are provided", () => {
        return assert.eventually.isNull(strictFindFile());
      });
      it("should arbitrarily resolve to `null` if only an empty set of tests is provided", () => {
        const tests: Matcher[] = [];
        return assert.eventually.isNull(strictFindFile(...tests));
      });
      it("should arbitrarily resolve to `null` if there are no test to perform on files' path", () => {
        return assert.eventually.isNull(strictFindFile("./"));
      });
      it("should resolve an undefined directory path to the current working directory", () => {
        return assert.eventually.strictEqual(
          strictFindFile(ofBasename("file.html")),
          resolve("./file.html"),
        );
      });
      it("should resolve to a found directory's path", () => {
        return assert.eventually.strictEqual(
          strictFindFile(ofBasename("files")),
          resolve("./files"),
        );
      });
      it("should resolve to a found file's path", () => {
        return assert.eventually.strictEqual(
          strictFindFile(ofBasename("file.html")),
          resolve("./file.html"),
        );
      });
      it("should not resolve to a path that doesn't pass all the tests", () => {
        return assert.eventually.isNull(
          strictFindFile(ofBasename("file.html"), ofBasename("files")),
        );
      });
      it("should resolve to a path that passes all the tests", () => {
        return assert.eventually.isNotNull(
          strictFindFile(ofBasename(/^file/), ofBasename(/\.html$/)),
        );
      });
      it("should be rejected if one of the tests throws an error", () => {
        return assert.isRejected(
          strictFindFile(
            (path: string): boolean => {
              throw new Error();
            },
          ),
        );
      });
      it("should be rejected if there is more than one matching file in a directory", () => {
        return assert.isRejected(strictFindFile(ofBasename(/^file/)));
      });
    });
    describe("(directories: string | Iterable<string>, ...tests: Matcher[]): Promise<string | null>", () => {
      it("should arbitrarily resolve to `null` if no arguments are provided", () => {
        return assert.eventually.isNull(strictFindFile());
      });
      it("should arbitrarily resolve to `null` if only an empty set of directories is provided", () => {
        return assert.eventually.isNull(strictFindFile([]));
      });
      it("should arbitrarily resolve to `null` if an empty set of directories is provided", () => {
        return assert.eventually.isNull(strictFindFile([], ofBasename()));
      });
      it("should arbitrarily resolve to `null` if empty sets of directories and tests are provided", () => {
        return assert.eventually.isNull(strictFindFile([], ...[]));
      });
      it("should handle a directory specified with a string path", () => {
        return assert.eventually.strictEqual(
          strictFindFile("./", ofBasename("file.html")),
          resolve("./file.html"),
        );
      });
      it("should handle directories specified with string paths", () => {
        return assert.eventually.strictEqual(
          strictFindFile(["./", "./files"], ofBasename("file.html")),
          resolve("./file.html"),
        );
      });
      it("should resolve directory paths which are not absolute relative to the current working directory", () => {
        return Promise.all([
          assert.eventually.strictEqual(
            strictFindFile("./", ofBasename("file.html")),
            resolve("./file.html"),
          ),
          assert.eventually.strictEqual(
            strictFindFile("./files", ofBasename("file.html")),
            resolve("./files/file.html"),
          ),
        ]);
      });
      it("should resolve to null if there is no matching file in a directory", () => {
        return assert.eventually.isNull(
          strictFindFile("/home/user/files", ofBasename("inexistant.json")),
        );
      });
      it("should resolve to null if there is no matching file in directories", () => {
        return assert.eventually.isNull(
          strictFindFile(
            ["/home/user/files", "/home/user/symbolic-files"],
            ofBasename("inexistant.json"),
          ),
        );
      });
      it("should resolve to a file's path if there is only one matching file in a directory", () => {
        return assert.eventually.strictEqual(
          strictFindFile("/home/user/files", ofBasename("file.html")),
          resolve("/home/user/files/file.html"),
        );
      });
      it("should resolve to a file's path if there is only one matching file in a directory among the directories", () => {
        return assert.eventually.strictEqual(
          strictFindFile(
            ["/home/user/files", "/home/user/symbolic-files"],
            ofBasename("file.html"),
          ),
          resolve("/home/user/files/file.html"),
        );
      });
      it("should resolve to a found directory's path", () => {
        return assert.eventually.strictEqual(
          strictFindFile("./", ofBasename("files")),
          resolve("./files"),
        );
      });
      it("should resolve to a found file's path", () => {
        return assert.eventually.strictEqual(
          strictFindFile("./", ofBasename("file.html")),
          resolve("./file.html"),
        );
      });
      it("should be rejected if any of the given directories does not exist", () => {
        return assert.isRejected(
          strictFindFile("./unexistant-folder", ofBasename("unexistant.html")),
        );
      });
      it("should be rejected if one of the tests throws an error", () => {
        return assert.isRejected(
          strictFindFile(
            "./",
            (path: string): boolean => {
              throw new Error();
            },
          ),
        );
      });
      it("should be rejected if there is more than one matching file in a directory", () => {
        return assert.isRejected(
          strictFindFile("/home/user/files", ofBasename(/^file\./)),
        );
      });
      it("should be rejected if one of the directories is a file", () => {
        return assert.isRejected(
          strictFindFile(["./", "./file.html"], ofBasename("unexistant.html")),
        );
      });
    });
  });
  describe("Synchronous", () => {
    describe("(...tests: Matcher[]): string | null", () => {
      it("should arbitrarily return `null` if no arguments are provided", () => {
        assert.isNull(strictFindFile.sync());
      });
      it("should arbitrarily return `null` if only an empty set of tests is provided", () => {
        const tests: Matcher[] = [];
        assert.isNull(strictFindFile.sync(...tests));
      });
      it("should resolve an undefined directory path to the current working directory", () => {
        assert.strictEqual(
          strictFindFile.sync(ofBasename("file.html")),
          resolve("./file.html"),
        );
      });
      it("should return a found directory's path", () => {
        assert.strictEqual(
          strictFindFile.sync(ofBasename("files")),
          resolve("./files"),
        );
      });
      it("should return a found file's path", () => {
        assert.strictEqual(
          strictFindFile.sync(ofBasename("file.html")),
          resolve("./file.html"),
        );
      });
      it("should not return a path that doesn't pass all the tests", () => {
        assert.isNull(
          strictFindFile.sync(ofBasename("file.html"), ofBasename("files")),
        );
      });
      it("should return a path that passes all the tests", () => {
        assert.isNotNull(
          strictFindFile.sync(ofBasename(/^file/), ofBasename(/\.html$/)),
        );
      });
      it("should throw an error if one of the tests throws an error", () => {
        assert.throws(() =>
          strictFindFile.sync(
            (path: string): boolean => {
              throw new Error();
            },
          ),
        );
      });
      it("should throw an error if there is more than one matching file in a directory", () => {
        assert.throws(() => strictFindFile.sync(ofBasename(/^file/)));
      });
    });
    describe("(directories: string | Iterable<string>, ...tests: Matcher[]): string | null", () => {
      it("should arbitrarily return `null` if no arguments are provided", () => {
        assert.isNull(strictFindFile.sync());
      });
      it("should arbitrarily return `null` if only an empty set of directories is provided", () => {
        assert.isNull(strictFindFile.sync([]));
      });
      it("should arbitrarily return `null` if an empty set of directories is provided", () => {
        assert.isNull(strictFindFile.sync([], ofBasename()));
      });
      it("should arbitrarily return `null` if empty sets of directories and tests are provided", () => {
        assert.isNull(strictFindFile.sync([], ...[]));
      });
      it("should arbitrarily return `null` if there are no tests to perform on files' path", () => {
        assert.isNull(strictFindFile.sync("./"));
      });
      it("should handle a directory specified with a string path", () => {
        assert.strictEqual(
          strictFindFile.sync("./", ofBasename("file.html")),
          resolve("./file.html"),
        );
      });
      it("should handle directories specified with string paths", () => {
        assert.strictEqual(
          strictFindFile.sync(["./", "./files"], ofBasename("file.html")),
          resolve("./file.html"),
        );
      });
      it("should resolve directory paths which are not absolute relative to the current working directory", () => {
        assert.strictEqual(
          strictFindFile.sync("./", ofBasename("file.html")),
          resolve("./file.html"),
        );
        assert.strictEqual(
          strictFindFile.sync("./files", ofBasename("file.html")),
          resolve("./files/file.html"),
        );
      });
      it("should return null if there is no matching file in a directory", () => {
        assert.isNull(
          strictFindFile.sync(
            "/home/user/files",
            ofBasename("inexistant.json"),
          ),
        );
      });
      it("should return null if there is no matching file in directories", () => {
        assert.isNull(
          strictFindFile.sync(
            ["/home/user/files", "/home/user/symbolic-files"],
            ofBasename("inexistant.json"),
          ),
        );
      });
      it("should return a file's path if there is only one matching file in a directory", () => {
        assert.strictEqual(
          strictFindFile.sync("/home/user/files", ofBasename("file.html")),
          resolve("/home/user/files/file.html"),
        );
        it("should return a found directory's path", () => {
          assert.strictEqual(
            strictFindFile.sync("./", ofBasename("files")),
            resolve("./files"),
          );
        });
        it("should return a found file's path", () => {
          assert.strictEqual(
            strictFindFile.sync("./", ofBasename("file.html")),
            resolve("./file.html"),
          );
        });
      });
      it("should return a file's path if there is only one matching file in a directory among the directories", () => {
        assert.strictEqual(
          strictFindFile.sync(
            ["/home/user/files", "/home/user/symbolic-files"],
            ofBasename("file.html"),
          ),
          resolve("/home/user/files/file.html"),
        );
      });
      it("should throw an error if any of the given directories does not exist", () => {
        assert.throws(() => {
          strictFindFile.sync(
            "./unexistant-folder",
            ofBasename("unexistant.html"),
          );
        });
      });
      it("should throw an error if one of the tests throws an error", () => {
        assert.throws(() =>
          strictFindFile.sync(
            "./",
            (path: string): boolean => {
              throw new Error();
            },
          ),
        );
      });
      it("should throw an error if there is more than one matching file in a directory", () => {
        assert.throws(() =>
          strictFindFile.sync("/home/user/files", ofBasename(/^file\./)),
        );
      });
      it("should be rejected if one of the directories is a file", () => {
        assert.throws(() =>
          strictFindFile.sync(
            ["./", "./file.html"],
            ofBasename("unexistant.html"),
          ),
        );
      });
    });
  });
});
