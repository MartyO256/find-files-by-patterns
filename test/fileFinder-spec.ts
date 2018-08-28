import { assert } from "chai";
import chai = require("chai");
import chaiAsPromised = require("chai-as-promised");

import { PathLike } from "fs";
import * as mock from "mock-fs";
import { resolve } from "path";
import { URL } from "url";

import { FileFinder, ofBasename } from "../src";

chai.use(chaiAsPromised);

const fileFinders: Map<string, FileFinder> = new Map();

const testFileFinder = (findFile: FileFinder, name: string): void => {
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
      it("should arbitrarily resolve to `null` if there are no test to perform on files' path", () => {
        assert.eventually.isNull(findFile("./"));
      });
      it("should resolve an undefined directory path to the current working directory", () => {
        assert.eventually.strictEqual(
          findFile(ofBasename("file.html")),
          resolve("./file.html"),
        );
      });
      it("should handle a directory specified with a string path", () => {
        assert.eventually.strictEqual(
          findFile("./", ofBasename("file.html")),
          resolve("./file.html"),
        );
      });
      it("should handle a directory specified with a buffer", () => {
        assert.eventually.strictEqual(
          findFile(Buffer.from("./"), ofBasename("file.html")),
          resolve("./file.html"),
        );
      });
      it("should handle a directory specified with a URL with the file protocol", () => {
        assert.eventually.strictEqual(
          findFile(new URL(resolve(), "file:"), ofBasename("file.html")),
          resolve("./file.html"),
        );
      });
      it("should handle directories specified with string paths", () => {
        assert.eventually.strictEqual(
          findFile(["./", "./files"], ofBasename("file.html")),
          resolve("./file.html"),
        );
      });
      it("should handle directories specified with buffers", () => {
        assert.eventually.strictEqual(
          findFile(
            [Buffer.from("./"), Buffer.from("./files")],
            ofBasename("file.html"),
          ),
          resolve("./file.html"),
        );
      });
      it("should handle directories specified with URLs with the file protocol", () => {
        assert.eventually.strictEqual(
          findFile(
            [new URL(resolve(), "file:"), new URL(resolve("files"), "file:")],
            ofBasename("file.html"),
          ),
          resolve("./file.html"),
        );
      });
      it("should resolve directory paths which are not absolute relative to the current working directory", () => {
        assert.eventually.strictEqual(
          findFile("./", ofBasename("file.html")),
          resolve("./file.html"),
        );
        assert.eventually.strictEqual(
          findFile("./files", ofBasename("file.html")),
          resolve("./files/file.html"),
        );
      });
      it("should return null if there is no matching file in a directory", () => {
        assert.eventually.isNull(
          findFile("/home/user/files", ofBasename("inexistant.json")),
        );
      });
      it("should return null if there is no matching file in directories", () => {
        assert.eventually.isNull(
          findFile(
            ["/home/user/files", "/home/user/symbolic-files"],
            ofBasename("inexistant.json"),
          ),
        );
      });
      it("should return a file's path if there is only one matching file in a directory", () => {
        assert.eventually.strictEqual(
          findFile("/home/user/files", ofBasename("file.html")),
          "/home/user/files/file.html",
        );
      });
      it("should return a file's path if there is only one matching file in a directory among the directories", () => {
        assert.eventually.strictEqual(
          findFile(
            ["/home/user/files", "/home/user/symbolic-files"],
            ofBasename("file.html"),
          ),
          "/home/user/files/file.html",
        );
      });
      it("should be rejected if one of the tests throws an error", () => {
        assert.isRejected(
          findFile(
            (path: PathLike): boolean => {
              throw new Error();
            },
          ),
        );
      });
      it("should be rejected if there is more than one matching file in a directory", () => {
        assert.isRejected(findFile("/home/user/files", ofBasename(/^file\./)));
      });
      it("should be rejected if there is more than one matching file across multiple directories", () => {
        assert.isRejected(
          findFile(["./", "/home/user/files"], ofBasename(/^file\./)),
        );
      });
    });
    describe("Synchronous", () => {
      it("should arbitrarily return `null` if there are no tests to perform on files' path", () => {
        assert.isNull(findFile.sync("./"));
      });
      it("should resolve an undefined directory path to the current working directory", () => {
        assert.strictEqual(
          findFile.sync(ofBasename("file.html")),
          resolve("./file.html"),
        );
      });
      it("should handle a directory specified with a string path", () => {
        assert.strictEqual(
          findFile.sync("./", ofBasename("file.html")),
          resolve("./file.html"),
        );
      });
      it("should handle a directory specified with a buffer", () => {
        assert.strictEqual(
          findFile.sync(Buffer.from("./"), ofBasename("file.html")),
          resolve("./file.html"),
        );
      });
      it("should handle a directory specified with a URL with the file protocol", () => {
        assert.strictEqual(
          findFile.sync(new URL(resolve(), "file:"), ofBasename("file.html")),
          resolve("./file.html"),
        );
      });
      it("should handle directories specified with string paths", () => {
        assert.strictEqual(
          findFile.sync(["./", "./files"], ofBasename("file.html")),
          resolve("./file.html"),
        );
      });
      it("should handle directories specified with buffers", () => {
        assert.strictEqual(
          findFile.sync(
            [Buffer.from("./"), Buffer.from("./files")],
            ofBasename("file.html"),
          ),
          resolve("./file.html"),
        );
      });
      it("should handle directories specified with URLs with the file protocol", () => {
        assert.strictEqual(
          findFile.sync(
            [new URL(resolve(), "file:"), new URL(resolve("files"), "file:")],
            ofBasename("file.html"),
          ),
          resolve("./file.html"),
        );
      });
      it("should resolve directory paths which are not absolute relative to the current working directory", () => {
        assert.strictEqual(
          findFile.sync("./", ofBasename("file.html")),
          resolve("./file.html"),
        );
        assert.strictEqual(
          findFile.sync("./files", ofBasename("file.html")),
          resolve("./files/file.html"),
        );
      });
      it("should return null if there is no matching file in a directory", () => {
        assert.isNull(
          findFile.sync("/home/user/files", ofBasename("inexistant.json")),
        );
      });
      it("should return null if there is no matching file in directories", () => {
        assert.isNull(
          findFile.sync(
            ["/home/user/files", "/home/user/symbolic-files"],
            ofBasename("inexistant.json"),
          ),
        );
      });
      it("should return a file's path if there is only one matching file in a directory", () => {
        assert.strictEqual(
          findFile.sync("/home/user/files", ofBasename("file.html")),
          "/home/user/files/file.html",
        );
      });
      it("should return a file's path if there is only one matching file in a directory among the directories", () => {
        assert.strictEqual(
          findFile.sync(
            ["/home/user/files", "/home/user/symbolic-files"],
            ofBasename("file.html"),
          ),
          "/home/user/files/file.html",
        );
      });
      it("should throw an error if one of the tests throws an error", () => {
        assert.throws(() => {
          findFile.sync(
            (path: PathLike): boolean => {
              throw new Error();
            },
          );
        });
      });
      it("should throw an error if there is more than one matching file in a directory", () => {
        assert.throws(() =>
          findFile.sync("/home/user/files", ofBasename(/^file\./)),
        );
      });
      it("should throw an error if there is more than one matching file across multiple directories", () => {
        assert.throws(() =>
          findFile.sync(["./", "/home/user/files"], ofBasename(/^file\./)),
        );
      });
    });
  });
};

fileFinders.forEach(testFileFinder);
