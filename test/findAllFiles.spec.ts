import { rejects } from "assert";
import { assert } from "chai";

import * as mock from "mock-fs";
import { resolve } from "path";

import { findAllFiles, findAllFilesSync } from "../src/fileFinders";
import { Filter, FilterSync } from "../src/filter";
import { ofBasename } from "../src/path";

const error: Filter<string> = async () => {
  throw new Error();
};
const errorSync: FilterSync<string> = () => {
  throw new Error();
};
const resolvedPath = (path: string) => resolve(path);
const resolvedPaths = (...path: string[]) => path.map(resolvedPath);

describe("findAllFiles", () => {
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
          "file.csv": "",
          "file.yml": "",
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
    describe("(...tests: Array<Filter<string> | FilterSync<string>>): Promise<string[]>", () => {
      it("should arbitrarily resolve to an empty set if no arguments are provided", async () => {
        assert.isEmpty(findAllFiles());
      });
      it("should arbitrarily resolve to an empty set if only an empty set of tests is provided", async () => {
        const tests: Array<Filter<string>> = [];
        assert.isEmpty(findAllFiles(...tests));
      });
      it("should search in the current working directory", async () => {
        assert.deepStrictEqual(
          await findAllFiles(ofBasename("file.html")),
          resolvedPaths("./file.html"),
        );
      });
      it("should return a found directory's path", async () => {
        assert.deepStrictEqual(
          await findAllFiles(ofBasename("files")),
          resolvedPaths("./files"),
        );
      });
      it("should return a found file's path", async () => {
        assert.deepStrictEqual(
          await findAllFiles(ofBasename("file.html")),
          resolvedPaths("./file.html"),
        );
      });
      it("should return a set with one file's path if there is only one matching file in the current working directory", async () => {
        assert.deepStrictEqual(
          await findAllFiles(ofBasename("file.html")),
          resolvedPaths("./file.html"),
        );
      });
      it("should return a set of matching files in the current working directory", async () => {
        assert.notEqual(
          await findAllFiles(ofBasename(/^file\./)),
          resolvedPaths("./file.csv", "./file.html", "./file.yml"),
        );
        assert.deepStrictEqual(
          (await findAllFiles(ofBasename(/^file\./))).sort(),
          resolvedPaths("./file.csv", "./file.html", "./file.yml").sort(),
        );
      });
      it("should return a sorted set of matching files in the current working directory", async () => {
        assert.deepStrictEqual(
          await findAllFiles(ofBasename(/^file\./)),
          resolvedPaths("./file.csv", "./file.html", "./file.yml"),
        );
      });
      it("should return an empty set if there are no matching files in the current working directory", async () => {
        assert.deepStrictEqual(await findAllFiles(ofBasename("file.json")), []);
      });
      it("should be rejected if one of the tests throws an error", async () => {
        rejects(findAllFiles(error));
      });
    });
    describe("(directories: string | AsyncIterable<string> | Iterable<string>, ...tests: Array<Filter<string> | FilterSync<string>>): Promise<string[]>", () => {
      it("should arbitrarily resolve to an empty set if no arguments are provided", async () => {
        assert.isEmpty(await findAllFiles());
      });
      it("should arbitrarily resolve to an empty set if only an empty set of directories is provided", async () => {
        assert.isEmpty(await findAllFiles([]));
      });
      it("should arbitrarily resolve to an empty set if an empty set of directories is provided", async () => {
        assert.isEmpty(await findAllFiles([], ofBasename()));
      });
      it("should arbitrarily resolve to an empty set if empty sets of directories and tests are provided", async () => {
        assert.isEmpty(await findAllFiles([], ...[]));
      });
      it("should arbitrarily resolve to an empty set if there are no test to perform on files' path", async () => {
        assert.isEmpty(await findAllFiles("./"));
      });
      it("should handle a directory specified with a string path", async () => {
        assert.deepStrictEqual(
          await findAllFiles("./", ofBasename("file.html")),
          resolvedPaths("./file.html"),
        );
      });
      it("should handle directories specified with string paths", async () => {
        assert.deepStrictEqual(
          (await findAllFiles(
            ["./", "./files"],
            ofBasename("file.html"),
          )).sort(),
          resolvedPaths("./file.html", "./files/file.html").sort(),
        );
      });
      it("should resolve directory paths which are not absolute relative to the current working directory", async () => {
        assert.deepStrictEqual(
          await findAllFiles("./", ofBasename("file.html")),
          resolvedPaths("./file.html"),
        );
        assert.deepStrictEqual(
          await findAllFiles("./files", ofBasename("file.html")),
          resolvedPaths("./files/file.html"),
        );
      });
      it("should resolve to an empty set if there is no matching file in a directory", async () => {
        assert.isEmpty(
          await findAllFiles("/home/user/files", ofBasename("inexistant.json")),
        );
      });
      it("should resolve to en empty set if there is no matching file in directories", async () => {
        assert.isEmpty(
          await findAllFiles(
            ["/home/user/files", "/home/user/symbolic-files"],
            ofBasename("inexistant.json"),
          ),
        );
      });
      it("should return a found directory's path", async () => {
        assert.deepStrictEqual(
          await findAllFiles("./", ofBasename("files")),
          resolvedPaths("./files"),
        );
      });
      it("should return a found file's path", async () => {
        assert.deepStrictEqual(
          await findAllFiles("./", ofBasename("file.html")),
          resolvedPaths("./file.html"),
        );
      });
      it("should resolve to a set with one file's path if there is only one matching file in a directory", async () => {
        assert.deepStrictEqual(
          await findAllFiles("/home/user/files", ofBasename("file.html")),
          resolvedPaths("/home/user/files/file.html"),
        );
      });
      it("should resolve to a set with one file's path if there is only one matching file in a directory among the directories", async () => {
        assert.deepStrictEqual(
          await findAllFiles(
            ["/home/user/files", "/home/user/symbolic-files"],
            ofBasename("file.md"),
          ),
          resolvedPaths("/home/user/files/file.md"),
        );
      });
      it("should resolve to a set of matching files' path in a directory", async () => {
        assert.deepStrictEqual(
          (await findAllFiles("/home/user/files", ofBasename(/^file/))).sort(),
          resolvedPaths(
            "/home/user/files/file.html",
            "/home/user/files/file.md",
          ).sort(),
        );
      });
      it("should resolve to a set of matching files' path in directories", async () => {
        assert.deepStrictEqual(
          (await findAllFiles(
            ["/home/user/files", "/home/user/symbolic-files"],
            ofBasename("file.html"),
          )).sort(),
          resolvedPaths(
            "/home/user/files/file.html",
            "/home/user/symbolic-files/file.html",
          ).sort(),
        );
      });
      it("should resolve to a set with one directory's path if there is only one matching file in a directory", async () => {
        assert.deepStrictEqual(
          await findAllFiles("/home/user", ofBasename("files")),
          resolvedPaths("/home/user/files"),
        );
      });
      it("should resolve to a set with one directory's path if there is only one matching file in a directory among the directories", async () => {
        assert.deepStrictEqual(
          await findAllFiles(
            ["/home/user/files", "/home/user/"],
            ofBasename("files"),
          ),
          resolvedPaths("/home/user/files"),
        );
      });
      it("should resolve to a set of matching directories' path in a directory", async () => {
        assert.deepStrictEqual(
          (await findAllFiles(
            "/home/user",
            ofBasename(/^files/, /files$/),
          )).sort(),
          resolvedPaths("/home/user/files", "/home/user/symbolic-files").sort(),
        );
      });
      it("should resolve to a set of matching directories' path in directories", async () => {
        assert.deepStrictEqual(
          (await findAllFiles(
            ["/home/user", "/home/user/other-folder"],
            ofBasename("files"),
          )).sort(),
          resolvedPaths(
            "/home/user/files",
            "/home/user/other-folder/files",
          ).sort(),
        );
      });
      it("should resolve to a set of matching files and directories' path", async () => {
        assert.deepStrictEqual(
          (await findAllFiles(
            ["/home/user", "/home/user/files"],
            ofBasename(/^file/),
          )).sort(),
          resolvedPaths(
            "/home/user/files",
            "/home/user/files/file.md",
            "/home/user/files/file.html",
          ).sort(),
        );
      });
      it("should resolve to a sorted set of matching files in a directory", async () => {
        assert.deepStrictEqual(
          (await findAllFiles("/home/user/files", ofBasename(/^_/))).sort(),
          resolvedPaths(
            "/home/user/files/_a",
            "/home/user/files/_b",
            "/home/user/files/_c",
          ).sort(),
        );
      });
      it("should resolve to a set of sequences of matching files sorted by directory", async () => {
        assert.deepStrictEqual(
          (await findAllFiles(
            ["/home/user/files", "/home/user/symbolic-folder"],
            ofBasename(/^_/),
          )).sort(),
          resolvedPaths(
            "/home/user/files/_a",
            "/home/user/files/_b",
            "/home/user/files/_c",
            "/home/user/symbolic-folder/_a",
            "/home/user/symbolic-folder/_b",
            "/home/user/symbolic-folder/_c",
          ).sort(),
        );
      });
      it("should be rejected if any of the given directories does not exist", async () => {
        rejects(
          findAllFiles("./inexistant-folder", ofBasename("inexistant.html")),
        );
      });
      it("should be rejected if one of the tests throws an error", async () => {
        rejects(findAllFiles("./", error));
      });
      it("should be rejected if one of the directories is a file", async () => {
        rejects(
          findAllFiles(["./", "./file.html"], ofBasename("inexistant.html")),
        );
      });
    });
  });
  describe("sync", () => {
    describe("(...tests: Array<FilterSync<string>>): string[]", () => {
      it("should arbitrarily return an empty set if no arguments are provided", () => {
        assert.isEmpty(findAllFilesSync());
      });
      it("should arbitrarily return an empty set if only an empty set of tests is provided", () => {
        const tests: Array<FilterSync<string>> = [];
        assert.isEmpty(findAllFilesSync(...tests));
      });
      it("should search in the current working directory", () => {
        assert.deepStrictEqual(
          findAllFilesSync(ofBasename("file.html")),
          resolvedPaths("./file.html"),
        );
      });
      it("should return a found directory's path", () => {
        assert.deepStrictEqual(
          findAllFilesSync(ofBasename("files")),
          resolvedPaths("./files"),
        );
      });
      it("should return a found file's path", () => {
        assert.deepStrictEqual(
          findAllFilesSync("./", ofBasename("file.html")),
          resolvedPaths("./file.html"),
        );
      });
      it("should return a set with one file's path if there is only one matching file in the current working directory", () => {
        assert.deepStrictEqual(
          findAllFilesSync(ofBasename("file.html")),
          resolvedPaths("./file.html"),
        );
      });
      it("should return a set of matching files in the current working directory", () => {
        const actualFiles = [...findAllFilesSync(ofBasename(/^file\./))];
        for (const path of resolvedPaths(
          "./file.csv",
          "./file.yml",
          "./file.html",
        )) {
          assert.isTrue(actualFiles.includes(path));
        }
      });
      it("should return a sorted set of matching files in the current working directory", () => {
        assert.deepStrictEqual(
          findAllFilesSync(ofBasename(/^file\./)).sort(),
          resolvedPaths("./file.csv", "./file.html", "./file.yml").sort(),
        );
      });
      it("should return an empty set if there are no matching files in the current working directory", () => {
        assert.deepStrictEqual(findAllFilesSync(ofBasename("file.json")), []);
      });
      it("should throw an error if one of the tests throws an error", () => {
        assert.throws(() => findAllFilesSync(errorSync));
      });
    });
    describe("(directories: string | Iterable<string>, ...tests: Array<FilterSync<string>>): string[]", () => {
      it("should arbitrarily return an empty set if no arguments are provided", () => {
        assert.isEmpty(findAllFilesSync());
      });
      it("should arbitrarily return an empty set if only an empty set of directories is provided", () => {
        const directories: string[] = [];
        assert.isEmpty(findAllFilesSync(directories));
      });
      it("should arbitrarily return an empty set if an empty set of directories is provided", () => {
        assert.isEmpty(findAllFilesSync([], ofBasename()));
      });
      it("should arbitrarily return an empty set if empty sets of directories and tests are provided", () => {
        assert.isEmpty(findAllFilesSync([], ...[]));
      });
      it("should arbitrarily return an empty set if there are no tests to perform on files' path", () => {
        assert.isEmpty(findAllFilesSync("./"));
      });
      it("should handle a directory specified with a string path", () => {
        assert.deepStrictEqual(
          findAllFilesSync("./", ofBasename("file.html")),
          resolvedPaths("./file.html"),
        );
      });
      it("should handle directories specified with string paths", () => {
        assert.deepStrictEqual(
          findAllFilesSync(["./", "./files"], ofBasename("file.html")).sort(),
          resolvedPaths("./file.html", "./files/file.html").sort(),
        );
      });
      it("should resolve directory paths which are not absolute relative to the current working directory", () => {
        assert.deepStrictEqual(
          findAllFilesSync("./", ofBasename("file.html")),
          resolvedPaths("./file.html"),
        );
        assert.deepStrictEqual(
          findAllFilesSync("./files", ofBasename("file.html")),
          resolvedPaths("./files/file.html"),
        );
      });
      it("should return an empty set if there is no matching file in a directory", () => {
        assert.isEmpty(
          findAllFilesSync("/home/user/files", ofBasename("inexistant.json")),
        );
      });
      it("should return en empty set if there is no matching file in directories", () => {
        assert.isEmpty(
          findAllFilesSync(
            ["/home/user/files", "/home/user/symbolic-files"],
            ofBasename("inexistant.json"),
          ),
        );
      });
      it("should return a found directory's path", () => {
        assert.deepStrictEqual(
          findAllFilesSync("./", ofBasename("files")),
          resolvedPaths("./files"),
        );
      });
      it("should return a found file's path", () => {
        assert.deepStrictEqual(
          findAllFilesSync("./", ofBasename("file.html")),
          resolvedPaths("./file.html"),
        );
      });
      it("should return a set with one file's path if there is only one matching file in a directory", () => {
        assert.deepStrictEqual(
          findAllFilesSync("/home/user/files", ofBasename("file.html")),
          resolvedPaths("/home/user/files/file.html"),
        );
      });
      it("should return a set with one file's path if there is only one matching file in a directory among the directories", () => {
        assert.deepStrictEqual(
          findAllFilesSync(
            ["/home/user/files", "/home/user/symbolic-files"],
            ofBasename("file.md"),
          ),
          resolvedPaths("/home/user/files/file.md"),
        );
      });
      it("should return a set of matching files in a directory", () => {
        assert.deepStrictEqual(
          findAllFilesSync("/home/user/files", ofBasename(/^file/)).sort(),
          resolvedPaths(
            "/home/user/files/file.html",
            "/home/user/files/file.md",
          ).sort(),
        );
      });
      it("should return a set of matching files in directories", () => {
        assert.deepStrictEqual(
          findAllFilesSync(
            ["/home/user/files", "/home/user/symbolic-files"],
            ofBasename("file.html"),
          ).sort(),
          resolvedPaths(
            "/home/user/files/file.html",
            "/home/user/symbolic-files/file.html",
          ).sort(),
        );
      });
      it("should return a set with one directory's path if there is only one matching file in a directory", () => {
        assert.deepStrictEqual(
          findAllFilesSync("/home/user", ofBasename("files")),
          resolvedPaths("/home/user/files"),
        );
      });
      it("should return a set with one directory's path if there is only one matching file in a directory among the directories", () => {
        assert.deepStrictEqual(
          findAllFilesSync(
            ["/home/user/files", "/home/user/"],
            ofBasename("files"),
          ),
          resolvedPaths("/home/user/files"),
        );
      });
      it("should return a set of matching directories' path in a directory", () => {
        assert.deepStrictEqual(
          findAllFilesSync("/home/user", ofBasename(/^files/, /files$/)).sort(),
          resolvedPaths("/home/user/files", "/home/user/symbolic-files").sort(),
        );
      });
      it("should return a set of matching directories' path in directories", () => {
        assert.deepStrictEqual(
          findAllFilesSync(
            ["/home/user", "/home/user/other-folder"],
            ofBasename("files"),
          ).sort(),
          resolvedPaths(
            "/home/user/files",
            "/home/user/other-folder/files",
          ).sort(),
        );
      });
      it("should return a set of matching files and directories' path", () => {
        assert.deepStrictEqual(
          findAllFilesSync(
            ["/home/user", "/home/user/files"],
            ofBasename(/^file/),
          ).sort(),
          resolvedPaths(
            "/home/user/files",
            "/home/user/files/file.md",
            "/home/user/files/file.html",
          ).sort(),
        );
      });
      it("should return a sorted set of matching files in a directory", () => {
        assert.deepStrictEqual(
          findAllFilesSync("/home/user/files", ofBasename(/^_/)).sort(),
          resolvedPaths(
            "/home/user/files/_a",
            "/home/user/files/_b",
            "/home/user/files/_c",
          ).sort(),
        );
      });
      it("should return a set of sequences of matching files sorted by directory", () => {
        assert.deepStrictEqual(
          findAllFilesSync(
            ["/home/user/files", "/home/user/symbolic-folder"],
            ofBasename(/^_/),
          ).sort(),
          resolvedPaths(
            "/home/user/files/_a",
            "/home/user/files/_b",
            "/home/user/files/_c",
            "/home/user/symbolic-folder/_a",
            "/home/user/symbolic-folder/_b",
            "/home/user/symbolic-folder/_c",
          ).sort(),
        );
      });
      it("should throw an error if any of the given directories does not exist", () => {
        assert.throws(() => {
          findAllFilesSync(
            "./inexistant-folder",
            ofBasename("inexistant.html"),
          );
        });
      });
      it("should throw an error if one of the tests throws an error", () => {
        assert.throws(() => findAllFilesSync("./", errorSync));
      });
      it("should throw an error if one of the directories is a file", () => {
        assert.throws(() =>
          findAllFilesSync(
            ["./", "./file.html"],
            ofBasename("inexistant.html"),
          ),
        );
      });
    });
  });
});
