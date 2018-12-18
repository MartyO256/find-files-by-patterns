import { rejects } from "assert";
import { assert } from "chai";

import * as mock from "mock-fs";
import { join, resolve } from "path";

import { downwardFiles, downwardFilesSync } from "../src/files";
import { allElements, allElementsSync } from "../src/iterable";

const resolvedPath = (path: string) => resolve(path);
const resolvedPaths = (...paths: string[]) => paths.map(resolvedPath);

describe("files", () => {
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
          loop: {
            "file.md": "",
            loop: mock.symlink({
              path: "/home/user/loop",
            }),
          },
          "breadth-first": {
            "1": {
              "1": "",
              "2": "",
              "3": "",
            },
            "2": {
              "1": "",
              "2": "",
              "3": "",
            },
            "3": {
              "1": "",
              "2": "",
              "3": "",
            },
          },
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
  describe("downwardFiles", () => {
    describe("unconstrained", () => {
      it("should terminate", async () => downwardFiles());
      it("should not yield the starting directory", async () => {
        const files = await allElements(downwardFiles());
        assert.isFalse(
          files.includes(resolvedPath(".")),
          `Starting directory ${resolvedPath(".")} was yielded.`,
        );
      });
      it("should yield the correct amount of files", async () => {
        assert.strictEqual(
          (await allElements(downwardFiles())).length,
          4,
          "Actual and expected files differ in length.",
        );
      });
      it("should only yield correct files", async () => {
        const files = resolvedPaths(
          "./file.html",
          "./files",
          "./files/file.md",
          "./files/file.html",
        );
        for await (const file of downwardFiles()) {
          assert.isTrue(files.includes(file), `Unexpected file ${file}`);
        }
      });
      it("should yield all the correct files", async () => {
        assert.deepStrictEqual(
          (await allElements(downwardFiles())).sort(),
          resolvedPaths(
            "./file.html",
            "./files",
            "./files/file.md",
            "./files/file.html",
          ).sort(),
        );
      });
      it("should not traverse symbolic cycles infinitely", async () =>
        downwardFiles("/home/user/loop"));
      it("should traverse symbolic cycles only once", async () => {
        assert.deepStrictEqual(
          (await allElements(downwardFiles("/home/user/loop"))).sort(),
          resolvedPaths(
            "/home/user/loop/file.md",
            "/home/user/loop/loop",
          ).sort(),
        );
      });
      it("should use breadth-first traversal", async () => {
        const concat = (path, segment) => join(path, segment);
        const basenames = ["1", "2", "3"];
        const parentDirectories = resolvedPaths(
          ...basenames.map((directory) =>
            concat("/home/user/breadth-first", directory),
          ),
        );
        const files = await allElements(
          downwardFiles("/home/user/breadth-first"),
        );
        assert.deepStrictEqual(
          files.slice(0, basenames.length).sort(),
          parentDirectories.sort(),
        );
        let j = basenames.length;
        for (let i = 0; i < basenames.length; i++) {
          const directory = files[i];
          assert.deepStrictEqual(
            basenames.map((file) => concat(directory, file)).sort(),
            files.slice(j, j + basenames.length).sort(),
          );
          j += basenames.length;
        }
      });
      it("should throw an error if the starting directory is a file", async () =>
        rejects(allElements(downwardFiles("./file.html"))));
      it("should throw an error if the starting directory does not exist", async () =>
        rejects(allElements(downwardFiles("./inexistant-directory"))));
    });
    describe("constrained", () => {
      it("should terminate", async () => downwardFiles(0));
      it("should not yield the starting directory", async () => {
        const files = await allElements(downwardFiles(0));
        assert.isFalse(
          files.includes(resolvedPath(".")),
          `Starting directory ${resolvedPath(".")} was yielded.`,
        );
      });
      it("should yield the correct amount of files", async () => {
        assert.strictEqual(
          (await allElements(downwardFiles(1))).length,
          4,
          "Actual and expected files differ in length.",
        );
      });
      it("should yield the correct amount of files with a constraint", async () => {
        assert.strictEqual(
          (await allElements(downwardFiles(0))).length,
          2,
          "Actual and expected files differ in length.",
        );
      });
      it("should only yield correct files", async () => {
        const files = resolvedPaths(
          "./file.html",
          "./files",
          "./files/file.md",
          "./files/file.html",
        );
        for await (const file of downwardFiles(1)) {
          assert.isTrue(files.includes(file), `Unexpected file ${file}`);
        }
      });
      it("should only yield correct files with a constraint", async () => {
        const files = resolvedPaths("./file.html", "./files");
        for await (const file of downwardFiles(0)) {
          assert.isTrue(files.includes(file), `Unexpected file ${file}`);
        }
      });
      it("should yield all the correct files", async () => {
        assert.deepStrictEqual(
          (await allElements(downwardFiles(1))).sort(),
          resolvedPaths(
            "./file.html",
            "./files",
            "./files/file.md",
            "./files/file.html",
          ).sort(),
        );
      });
      it("should yield all the correct files with a constraint", async () => {
        assert.deepStrictEqual(
          (await allElements(downwardFiles(0))).sort(),
          resolvedPaths("./file.html", "./files").sort(),
        );
      });
      it("should not traverse symbolic cycles infinitely", async () =>
        downwardFiles("/home/user/loop", 5));
      it("should traverse symbolic cycles only once", async () => {
        assert.deepStrictEqual(
          (await allElements(downwardFiles("/home/user/loop", 5))).sort(),
          resolvedPaths(
            "/home/user/loop/file.md",
            "/home/user/loop/loop",
          ).sort(),
        );
      });
      it("should use breadth-first traversal", async () => {
        const concat = (path, segment) => join(path, segment);
        const basenames = ["1", "2", "3"];
        const parentDirectories = resolvedPaths(
          ...basenames.map((directory) =>
            concat("/home/user/breadth-first", directory),
          ),
        );
        const files = await allElements(
          downwardFiles("/home/user/breadth-first", 2),
        );
        assert.deepStrictEqual(
          files.slice(0, basenames.length).sort(),
          parentDirectories.sort(),
        );
        let j = basenames.length;
        for (let i = 0; i < basenames.length; i++) {
          const directory = files[i];
          assert.deepStrictEqual(
            basenames.map((file) => concat(directory, file)).sort(),
            files.slice(j, j + basenames.length).sort(),
          );
          j += basenames.length;
        }
      });
      it("should throw an error if the starting directory is a file", async () =>
        rejects(allElements(downwardFiles("./file.html", 5))));
      it("should throw an error if the starting directory does not exist", async () =>
        rejects(allElements(downwardFiles("./inexistant-directory", 5))));
      it("should throw an error if the constraint is negative", () =>
        assert.throws(() => downwardFiles("./inexistant-directory", -1)));
    });
  });
  describe("downwardFilesSync", () => {
    describe("unconstrained", () => {
      it("should terminate", () => downwardFilesSync());
      it("should not yield the starting directory", () => {
        const files = allElementsSync(downwardFilesSync());
        assert.isFalse(
          files.includes(resolvedPath(".")),
          `Starting directory ${resolvedPath(".")} was yielded.`,
        );
      });
      it("should yield the correct amount of files", () => {
        assert.strictEqual(
          allElementsSync(downwardFilesSync()).length,
          4,
          "Actual and expected files differ in length.",
        );
      });
      it("should only yield correct files", () => {
        const files = resolvedPaths(
          "./file.html",
          "./files",
          "./files/file.md",
          "./files/file.html",
        );
        for (const file of downwardFilesSync()) {
          assert.isTrue(files.includes(file), `Unexpected file ${file}`);
        }
      });
      it("should yield all the correct files", () => {
        assert.deepStrictEqual(
          allElementsSync(downwardFilesSync()).sort(),
          resolvedPaths(
            "./file.html",
            "./files",
            "./files/file.md",
            "./files/file.html",
          ).sort(),
        );
      });
      it("should not traverse symbolic cycles infinitely", () =>
        downwardFilesSync("/home/user/loop"));
      it("should traverse symbolic cycles only once", () => {
        assert.deepStrictEqual(
          allElementsSync(downwardFilesSync("/home/user/loop")).sort(),
          resolvedPaths(
            "/home/user/loop/file.md",
            "/home/user/loop/loop",
          ).sort(),
        );
      });
      it("should use breadth-first traversal", () => {
        const concat = (path, segment) => join(path, segment);
        const basenames = ["1", "2", "3"];
        const parentDirectories = resolvedPaths(
          ...basenames.map((directory) =>
            concat("/home/user/breadth-first", directory),
          ),
        );
        const files = allElementsSync(
          downwardFilesSync("/home/user/breadth-first"),
        );
        assert.deepStrictEqual(
          files.slice(0, basenames.length).sort(),
          parentDirectories.sort(),
        );
        let j = basenames.length;
        for (let i = 0; i < basenames.length; i++) {
          const directory = files[i];
          assert.deepStrictEqual(
            basenames.map((file) => concat(directory, file)).sort(),
            files.slice(j, j + basenames.length).sort(),
          );
          j += basenames.length;
        }
      });
      it("should throw an error if the starting directory is a file", () =>
        assert.throws(() => allElementsSync(downwardFilesSync("./file.html"))));
      it("should throw an error if the starting directory does not exist", () =>
        assert.throws(() =>
          allElementsSync(downwardFilesSync("./inexistant-directory")),
        ));
    });
    describe("constrained", () => {
      it("should terminate", () => downwardFilesSync(0));
      it("should not yield the starting directory", () => {
        const files = allElementsSync(downwardFilesSync(0));
        assert.isFalse(
          files.includes(resolvedPath(".")),
          `Starting directory ${resolvedPath(".")} was yielded.`,
        );
      });
      it("should yield the correct amount of files", () => {
        assert.strictEqual(
          allElementsSync(downwardFilesSync(1)).length,
          4,
          "Actual and expected files differ in length.",
        );
      });
      it("should yield the correct amount of files with a constraint", () => {
        assert.strictEqual(
          allElementsSync(downwardFilesSync(0)).length,
          2,
          "Actual and expected files differ in length.",
        );
      });
      it("should only yield correct files", () => {
        const files = resolvedPaths(
          "./file.html",
          "./files",
          "./files/file.md",
          "./files/file.html",
        );
        for (const file of downwardFilesSync(1)) {
          assert.isTrue(files.includes(file), `Unexpected file ${file}`);
        }
      });
      it("should only yield correct files with a constraint", () => {
        const files = resolvedPaths("./file.html", "./files");
        for (const file of downwardFilesSync(0)) {
          assert.isTrue(files.includes(file), `Unexpected file ${file}`);
        }
      });
      it("should yield all the correct files", () => {
        assert.deepStrictEqual(
          allElementsSync(downwardFilesSync(1)).sort(),
          resolvedPaths(
            "./file.html",
            "./files",
            "./files/file.md",
            "./files/file.html",
          ).sort(),
        );
      });
      it("should yield all the correct files with a constraint", () => {
        assert.deepStrictEqual(
          allElementsSync(downwardFilesSync(0)).sort(),
          resolvedPaths("./file.html", "./files").sort(),
        );
      });
      it("should not traverse symbolic cycles infinitely", () =>
        downwardFilesSync("/home/user/loop", 5));
      it("should traverse symbolic cycles only once", () => {
        assert.deepStrictEqual(
          allElementsSync(downwardFilesSync("/home/user/loop", 5)).sort(),
          resolvedPaths(
            "/home/user/loop/file.md",
            "/home/user/loop/loop",
          ).sort(),
        );
      });
      it("should use breadth-first traversal", () => {
        const concat = (path, segment) => join(path, segment);
        const basenames = ["1", "2", "3"];
        const parentDirectories = resolvedPaths(
          ...basenames.map((directory) =>
            concat("/home/user/breadth-first", directory),
          ),
        );
        const files = allElementsSync(
          downwardFilesSync("/home/user/breadth-first", 2),
        );
        assert.deepStrictEqual(
          files.slice(0, basenames.length).sort(),
          parentDirectories.sort(),
        );
        let j = basenames.length;
        for (let i = 0; i < basenames.length; i++) {
          const directory = files[i];
          assert.deepStrictEqual(
            basenames.map((file) => concat(directory, file)).sort(),
            files.slice(j, j + basenames.length).sort(),
          );
          j += basenames.length;
        }
      });
      it("should throw an error if the starting directory is a file", () =>
        assert.throws(() =>
          allElementsSync(downwardFilesSync("./file.html", 5)),
        ));
      it("should throw an error if the starting directory does not exist", () =>
        assert.throws(() =>
          allElementsSync(downwardFilesSync("./inexistant-directory", 5)),
        ));
      it("should throw an error if the constraint is negative", () =>
        assert.throws(() => downwardFilesSync("./inexistant-directory", -1)));
    });
  });
});
