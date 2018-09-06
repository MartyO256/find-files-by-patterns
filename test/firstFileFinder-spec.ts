import { assert } from "chai";
import chai = require("chai");
import chaiAsPromised = require("chai-as-promised");

import * as mock from "mock-fs";
import { resolve } from "path";

import {
  findFirstFile as defaultFindFirstFile,
  FirstFileFinder,
  ofBasename,
} from "../src";

chai.use(chaiAsPromised);

const FirstFileFinders: Map<string, FirstFileFinder> = new Map();

FirstFileFinders.set("DefaultFindFirstFile", defaultFindFirstFile);

const testFirstFileFinder = (
  findFirstFile: FirstFileFinder,
  name: string,
): void => {
  describe(name, () => {
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
      it("should arbitrarily resolve to `null` if no arguments are provided", () => {
        assert.eventually.isNull(findFirstFile());
      });
      it("should arbitrarily resolve to `null` if only an empty set of directories is provided", () => {
        assert.eventually.isNull(findFirstFile([]));
      });
      it("should arbitrarily resolve to `null` if an empty set of directories is provided", () => {
        assert.eventually.isNull(findFirstFile([], ofBasename()));
      });
      it("should arbitrarily resolve to `null` if empty sets of directories and tests are provided", () => {
        assert.eventually.isNull(findFirstFile([], ...[]));
      });
      it("should arbitrarily resolve to `null` if no tests are provided", () => {
        assert.eventually.isNull(findFirstFile("./"));
      });
      it("should resolve an undefined directory path to the current working directory", () => {
        assert.eventually.strictEqual(
          findFirstFile(ofBasename("file.html")),
          resolve("./file.html"),
        );
      });
      it("should handle a directory specified with a string path", () => {
        assert.eventually.strictEqual(
          findFirstFile("./", ofBasename("file.html")),
          resolve("./file.html"),
        );
      });
      it("should handle directories specified with string paths", () => {
        assert.eventually.strictEqual(
          findFirstFile(["./", "./files"], ofBasename("file.html")),
          resolve("./file.html"),
        );
      });
      it("should resolve directory paths which are not absolute relative to the current working directory", () => {
        assert.eventually.strictEqual(
          findFirstFile("./", ofBasename("file.html")),
          resolve("./file.html"),
        );
        assert.eventually.strictEqual(
          findFirstFile("./files", ofBasename("file.html")),
          resolve("./files/file.html"),
        );
      });
      it("should resolve to null if there is no matching file in a directory", () => {
        assert.eventually.isNull(
          findFirstFile("/home/user/files", ofBasename("inexistant.json")),
        );
      });
      it("should resolve to null if there is no matching file in directories", () => {
        assert.eventually.isNull(
          findFirstFile(
            ["/home/user/files", "/home/user/symbolic-files"],
            ofBasename("inexistant.json"),
          ),
        );
      });
      it("should resolve to a file's path if there is only one matching file in a directory", () => {
        assert.eventually.strictEqual(
          findFirstFile("/home/user/files", ofBasename("file.html")),
          resolve("/home/user/files/file.html"),
        );
      });
      it("should resolve to a file's path if there is only one matching file in a directory among the directories", () => {
        assert.eventually.strictEqual(
          findFirstFile(
            ["/home/user/files", "/home/user/symbolic-files"],
            ofBasename("file.html"),
          ),
          resolve("/home/user/files/file.html"),
        );
      });
      it("should resolve to a found directory's path", () => {
        assert.eventually.strictEqual(
          findFirstFile(ofBasename("files")),
          resolve("./files"),
        );
      });
      it("should resolve to a found file's path", () => {
        assert.eventually.strictEqual(
          findFirstFile(ofBasename("file.html")),
          resolve("./file.html"),
        );
      });
      it("should not resolve to a path that doesn't pass all the tests", () => {
        assert.eventually.isNull(
          findFirstFile(ofBasename("file.html"), ofBasename("files")),
        );
      });
      it("should resolve to a path that passes all the tests", () => {
        assert.eventually.isNotNull(
          findFirstFile(ofBasename(/^file/), ofBasename(/\.html$/)),
        );
      });
      it("should be rejected if any of the given directories does not exist", () => {
        assert.isRejected(
          findFirstFile("./unexistant-folder", ofBasename("unexistant.html")),
        );
      });
      it("should be rejected if one of the tests throws an error", () => {
        assert.isRejected(
          findFirstFile(
            (path: string): boolean => {
              throw new Error();
            },
          ),
        );
      });
      it("should not be rejected if there is more than one matching file in a directory", () => {
        assert.eventually.isNotNull(
          findFirstFile("/home/user/files", ofBasename(/^file\./)),
        );
      });
    });
    describe("Synchronous", () => {
      it("should arbitrarily return `null` if no arguments are provided", () => {
        assert.isNull(findFirstFile.sync());
      });
      it("should arbitrarily return `null` if only an empty set of directories is provided", () => {
        assert.isNull(findFirstFile.sync([]));
      });
      it("should arbitrarily return `null` if an empty set of directories is provided", () => {
        assert.isNull(findFirstFile.sync([], ofBasename()));
      });
      it("should arbitrarily return `null` if empty sets of directories and tests are provided", () => {
        assert.isNull(findFirstFile.sync([], ...[]));
      });
      it("should arbitrarily return `null` if there are no tests to perform on files' path", () => {
        assert.isNull(findFirstFile.sync("./"));
      });
      it("should resolve an undefined directory path to the current working directory", () => {
        assert.strictEqual(
          findFirstFile.sync(ofBasename("file.html")),
          resolve("./file.html"),
        );
      });
      it("should handle a directory specified with a string path", () => {
        assert.strictEqual(
          findFirstFile.sync("./", ofBasename("file.html")),
          resolve("./file.html"),
        );
      });
      it("should handle directories specified with string paths", () => {
        assert.strictEqual(
          findFirstFile.sync(["./", "./files"], ofBasename("file.html")),
          resolve("./file.html"),
        );
      });
      it("should resolve directory paths which are not absolute relative to the current working directory", () => {
        assert.strictEqual(
          findFirstFile.sync("./", ofBasename("file.html")),
          resolve("./file.html"),
        );
        assert.strictEqual(
          findFirstFile.sync("./files", ofBasename("file.html")),
          resolve("./files/file.html"),
        );
      });
      it("should return a found directory's path", () => {
        assert.strictEqual(
          findFirstFile.sync(ofBasename("files")),
          resolve("./files"),
        );
      });
      it("should return a found file's path", () => {
        assert.strictEqual(
          findFirstFile.sync(ofBasename("file.html")),
          resolve("./file.html"),
        );
      });
      it("should not return a path that doesn't pass all the tests", () => {
        assert.isNull(
          findFirstFile.sync(ofBasename("file.html"), ofBasename("files")),
        );
      });
      it("should return a path that passes all the tests", () => {
        assert.isNotNull(
          findFirstFile.sync(ofBasename(/^file/), ofBasename(/\.html$/)),
        );
      });
      it("should return null if there is no matching file in a directory", () => {
        assert.isNull(
          findFirstFile.sync("/home/user/files", ofBasename("inexistant.json")),
        );
      });
      it("should return null if there is no matching file in directories", () => {
        assert.isNull(
          findFirstFile.sync(
            ["/home/user/files", "/home/user/symbolic-files"],
            ofBasename("inexistant.json"),
          ),
        );
      });
      it("should return a file's path if there is only one matching file in a directory", () => {
        assert.strictEqual(
          findFirstFile.sync("/home/user/files", ofBasename("file.html")),
          resolve("/home/user/files/file.html"),
        );
      });
      it("should return a file's path if there is only one matching file in a directory among the directories", () => {
        assert.strictEqual(
          findFirstFile.sync(
            ["/home/user/files", "/home/user/symbolic-files"],
            ofBasename("file.html"),
          ),
          resolve("/home/user/files/file.html"),
        );
      });
      it("should throw an error if any of the given directories does not exist", () => {
        assert.throws(() => {
          findFirstFile.sync(
            "./unexistant-folder",
            ofBasename("unexistant.html"),
          );
        });
      });
      it("should throw an error if one of the tests throws an error", () => {
        assert.throws(() => {
          findFirstFile.sync(
            (path: string): boolean => {
              throw new Error();
            },
          );
        });
      });
      it("should not throw an error if there is more than one matching file in a directory", () => {
        assert.isNotNull(
          findFirstFile.sync("/home/user/files", ofBasename(/^file\./)),
        );
      });
    });
  });
};

FirstFileFinders.forEach(testFirstFileFinder);
