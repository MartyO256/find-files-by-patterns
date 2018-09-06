import { assert } from "chai";
import chai = require("chai");
import chaiAsPromised = require("chai-as-promised");

import { PathLike } from "fs";
import * as mock from "mock-fs";
import { resolve } from "path";

import { FilesFinder, findFiles as defaultFindFiles, ofBasename } from "../src";

chai.use(chaiAsPromised);

const filesFinders: Map<string, FilesFinder> = new Map();

filesFinders.set("DefaultFindFiles", defaultFindFiles);

const testFilesFinder = (findFiles: FilesFinder, name: string): void => {
  describe(name, () => {
    beforeEach(() => {
      mock(
        {
          "/home/user": {
            files: {
              "file.md": "",
              "file.html": "",
              _a: "",
              _b: "",
              _c: "",
            },
            "other-folder": {
              files: mock.symlink({
                path: "/home/user/files",
              }),
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
      it("should arbitrarily resolve to an empty set if there are no test to perform on files' path", () => {
        assert.eventually.isEmpty(findFiles("./"));
      });
      it("should resolve an undefined directory path to the current working directory", () => {
        assert.eventually.deepEqual(
          findFiles(ofBasename("file.html")),
          new Set([resolve("./file.html")]),
        );
      });
      it("should handle a directory specified with a string path", () => {
        assert.eventually.deepEqual(
          findFiles("./", ofBasename("file.html")),
          new Set([resolve("./file.html")]),
        );
      });
      it("should handle directories specified with string paths", () => {
        assert.eventually.deepEqual(
          findFiles(["./", "./files"], ofBasename("file.html")),
          new Set([resolve("./file.html"), resolve("./files/file.html")]),
        );
      });
      it("should resolve directory paths which are not absolute relative to the current working directory", () => {
        assert.eventually.deepEqual(
          findFiles("./", ofBasename("file.html")),
          new Set([resolve("./file.html")]),
        );
        assert.eventually.deepEqual(
          findFiles("./files", ofBasename("file.html")),
          new Set([resolve("./files/file.html")]),
        );
      });
      it("should resolve to an empty set if there is no matching file in a directory", () => {
        assert.eventually.isEmpty(
          findFiles("/home/user/files", ofBasename("inexistant.json")),
        );
      });
      it("should resolve to en empty set if there is no matching file in directories", () => {
        assert.eventually.isEmpty(
          findFiles(
            ["/home/user/files", "/home/user/symbolic-files"],
            ofBasename("inexistant.json"),
          ),
        );
      });
      it("should resolve to a set with one file's path if there is only one matching file in a directory", () => {
        assert.eventually.deepEqual(
          findFiles("/home/user/files", ofBasename("file.html")),
          new Set(["/home/user/files/file.html"]),
        );
      });
      it("should resolve to a set with one file's path if there is only one matching file in a directory among the directories", () => {
        assert.eventually.deepEqual(
          findFiles(
            ["/home/user/files", "/home/user/symbolic-files"],
            ofBasename("file.md"),
          ),
          new Set(["/home/user/files/file.md"]),
        );
      });
      it("should resolve to a set of matching files' path in a directory", () => {
        assert.eventually.deepEqual(
          findFiles("/home/user/files", ofBasename(/^file/)),
          new Set(["/home/user/files/file.html", "/home/user/files/file.md"]),
        );
      });
      it("should resolve to a set of matching files' path in directories", () => {
        assert.eventually.deepEqual(
          findFiles(
            ["/home/user/files", "/home/user/symbolic-files"],
            ofBasename("file.html"),
          ),
          new Set([
            "/home/user/files/file.html",
            "/home/user/symbolic-files/file.html",
          ]),
        );
      });
      it("should resolve to a set with one directory's path if there is only one matching file in a directory", () => {
        assert.eventually.deepEqual(
          findFiles("/home/user", ofBasename("files")),
          new Set(["/home/user/files"]),
        );
      });
      it("should resolve to a set with one directory's path if there is only one matching file in a directory among the directories", () => {
        assert.eventually.deepEqual(
          findFiles(["/home/user/files", "/home/user/"], ofBasename("files")),
          new Set(["/home/user/files"]),
        );
      });
      it("should resolve to a set of matching directories' path in a directory", () => {
        assert.eventually.deepEqual(
          findFiles("/home/user", ofBasename(/^files/, /files$/)),
          new Set(["/home/user/files", "/home/user/symbolic-files"]),
        );
      });
      it("should resolve to a set of matching directories' path in directories", () => {
        assert.eventually.deepEqual(
          findFiles(
            ["/home/user", "/home/user/other-folder"],
            ofBasename("files"),
          ),
          new Set(["/home/user/files", "/home/user/other-folder/files"]),
        );
      });
      it("should resolve to a set of matching files and directories' path", () => {
        assert.eventually.deepEqual(
          findFiles(["/home/user", "/home/user/files"], ofBasename(/^file/)),
          new Set([
            "/home/user/files",
            "/home/user/files/file.md",
            "/home/user/files/file.html",
          ]),
        );
      });
      it("should resolve to a sorted set of matching files in a directory", () => {
        assert.eventually.deepEqual(
          findFiles("/home/user/files", ofBasename(/^_/)),
          new Set([
            "/home/user/files/_a",
            "/home/user/files/_b",
            "/home/user/files/_c",
          ]),
        );
      });
      it("should resolve to a set of sequences of matching files sorted by directory", () => {
        assert.eventually.deepEqual(
          findFiles(
            ["/home/user/files", "/home/user/symbolic-folder"],
            ofBasename(/^_/),
          ),
          new Set([
            "/home/user/files/_a",
            "/home/user/files/_b",
            "/home/user/files/_c",
            "/home/user/symbolic-folder/_a",
            "/home/user/symbolic-folder/_b",
            "/home/user/symbolic-folder/_c",
          ]),
        );
      });
      it("should be rejected if any of the given directories does not exist", () => {
        assert.isRejected(
          findFiles("./unexistant-folder", ofBasename("unexistant.html")),
        );
      });
      it("should be rejected if one of the tests throws an error", () => {
        assert.isRejected(
          findFiles(
            (path: PathLike): boolean => {
              throw new Error();
            },
          ),
        );
      });
    });
    describe("Synchronous", () => {
      it("should arbitrarily return an empty set if there are no test to perform on files' path", () => {
        assert.isEmpty(findFiles.sync("./"));
      });
      it("should resolve an undefined directory path to the current working directory", () => {
        assert.deepEqual(
          findFiles.sync(ofBasename("file.html")),
          new Set([resolve("./file.html")]),
        );
      });
      it("should handle a directory specified with a string path", () => {
        assert.deepEqual(
          findFiles.sync("./", ofBasename("file.html")),
          new Set([resolve("./file.html")]),
        );
      });
      it("should handle directories specified with string paths", () => {
        assert.deepEqual(
          findFiles.sync(["./", "./files"], ofBasename("file.html")),
          new Set([resolve("./file.html"), resolve("./files/file.html")]),
        );
      });
      it("should resolve directory paths which are not absolute relative to the current working directory", () => {
        assert.deepEqual(
          findFiles.sync("./", ofBasename("file.html")),
          new Set([resolve("./file.html")]),
        );
        assert.deepEqual(
          findFiles.sync("./files", ofBasename("file.html")),
          new Set([resolve("./files/file.html")]),
        );
      });
      it("should return an empty set if there is no matching file in a directory", () => {
        assert.isEmpty(
          findFiles.sync("/home/user/files", ofBasename("inexistant.json")),
        );
      });
      it("should return en empty set if there is no matching file in directories", () => {
        assert.isEmpty(
          findFiles.sync(
            ["/home/user/files", "/home/user/symbolic-files"],
            ofBasename("inexistant.json"),
          ),
        );
      });
      it("should return a set with one file's path if there is only one matching file in a directory", () => {
        assert.deepEqual(
          findFiles.sync("/home/user/files", ofBasename("file.html")),
          new Set(["/home/user/files/file.html"]),
        );
      });
      it("should return a set with one file's path if there is only one matching file in a directory among the directories", () => {
        assert.deepEqual(
          findFiles.sync(
            ["/home/user/files", "/home/user/symbolic-files"],
            ofBasename("file.md"),
          ),
          new Set(["/home/user/files/file.md"]),
        );
      });
      it("should return a set of matching files in a directory", () => {
        assert.deepEqual(
          findFiles.sync("/home/user/files", ofBasename(/^file/)),
          new Set(["/home/user/files/file.html", "/home/user/files/file.md"]),
        );
      });
      it("should return a set of matching files in directories", () => {
        assert.deepEqual(
          findFiles.sync(
            ["/home/user/files", "/home/user/symbolic-files"],
            ofBasename("file.html"),
          ),
          new Set([
            "/home/user/files/file.html",
            "/home/user/symbolic-files/file.html",
          ]),
        );
      });
      it("should return a set with one directory's path if there is only one matching file in a directory", () => {
        assert.deepEqual(
          findFiles.sync("/home/user", ofBasename("files")),
          new Set(["/home/user/files"]),
        );
      });
      it("should return a set with one directory's path if there is only one matching file in a directory among the directories", () => {
        assert.deepEqual(
          findFiles.sync(
            ["/home/user/files", "/home/user/"],
            ofBasename("files"),
          ),
          new Set(["/home/user/files"]),
        );
      });
      it("should return a set of matching directories' path in a directory", () => {
        assert.deepEqual(
          findFiles.sync("/home/user", ofBasename(/^files/, /files$/)),
          new Set(["/home/user/files", "/home/user/symbolic-files"]),
        );
      });
      it("should return a set of matching directories' path in directories", () => {
        assert.deepEqual(
          findFiles.sync(
            ["/home/user", "/home/user/other-folder"],
            ofBasename("files"),
          ),
          new Set(["/home/user/files", "/home/user/other-folder/files"]),
        );
      });
      it("should return a set of matching files and directories' path", () => {
        assert.deepEqual(
          findFiles.sync(
            ["/home/user", "/home/user/files"],
            ofBasename(/^file/),
          ),
          new Set([
            "/home/user/files",
            "/home/user/files/file.md",
            "/home/user/files/file.html",
          ]),
        );
      });
      it("should return a sorted set of matching files in a directory", () => {
        assert.deepEqual(
          findFiles.sync("/home/user/files", ofBasename(/^_/)),
          new Set([
            "/home/user/files/_a",
            "/home/user/files/_b",
            "/home/user/files/_c",
          ]),
        );
      });
      it("should return a set of sequences of matching files sorted by directory", () => {
        assert.deepEqual(
          findFiles.sync(
            ["/home/user/files", "/home/user/symbolic-folder"],
            ofBasename(/^_/),
          ),
          new Set([
            "/home/user/files/_a",
            "/home/user/files/_b",
            "/home/user/files/_c",
            "/home/user/symbolic-folder/_a",
            "/home/user/symbolic-folder/_b",
            "/home/user/symbolic-folder/_c",
          ]),
        );
      });
      it("should throw an error if any of the given directories does not exist", () => {
        assert.throws(() => {
          findFiles.sync("./unexistant-folder", ofBasename("unexistant.html"));
        });
      });
      it("should throw an error if one of the tests throws an error", () => {
        assert.throws(() => {
          findFiles.sync(
            (path: PathLike): boolean => {
              throw new Error();
            },
          );
        });
      });
    });
  });
};

filesFinders.forEach(testFilesFinder);
