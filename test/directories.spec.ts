import { rejects } from "assert";
import { assert } from "chai";

import * as mock from "mock-fs";
import { resolve } from "path";

import {
  downwardDirectories,
  downwardDirectoriesSync,
  upwardConstrainedPaths,
  upwardDirectories,
  upwardDirectoriesSync,
  upwardLimitedPaths,
  upwardPaths,
} from "../src/directories";
import { allElements, allElementsSync } from "../src/iterable";

const resolvedPath = (path: string): string => resolve(path);
const resolvedPaths = (...paths: string[]): string[] => paths.map(resolvedPath);

describe("directories", () => {
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
  describe("downwardDirectories", () => {
    describe("unconstrained", () => {
      it("should terminate", async () => downwardDirectories());
      it("should not yield the starting directory", async () => {
        const files = await allElements(downwardDirectories());
        assert.isFalse(
          files.includes(resolvedPath(".")),
          `Starting directory ${resolvedPath(".")} was yielded.`,
        );
      });
      it("should yield the correct amount of directories", async () => {
        assert.strictEqual(
          (await allElements(downwardDirectories())).length,
          1,
          "Actual and expected directories differ in length.",
        );
      });
      it("should only yield correct directories", async () => {
        const directories = resolvedPaths("./files");
        for await (const directory of downwardDirectories()) {
          assert.isTrue(
            directories.includes(directory),
            `Unexpected file ${directory}`,
          );
        }
      });
      it("should yield all the correct directories", async () => {
        assert.deepStrictEqual(
          (await allElements(downwardDirectories())).sort(),
          resolvedPaths("./files").sort(),
        );
      });
      it("should not traverse symbolic cycles infinitely", async () =>
        downwardDirectories("/home/user/loop"));
      it("should traverse symbolic cycles only once", async () => {
        assert.deepStrictEqual(
          (await allElements(downwardDirectories("/home/user/loop"))).sort(),
          resolvedPaths("/home/user/loop/loop").sort(),
        );
      });
      it("should use breadth-first traversal", async () => {
        const parentDirectories = resolvedPaths(
          "/home/user/breadth-first",
          "/home/user/files",
          "/home/user/loop",
          "/home/user/symbolic-files",
          "/home/user/symbolic-folder",
        );
        const subdirectories = resolvedPaths(
          "/home/user/breadth-first/1",
          "/home/user/breadth-first/2",
          "/home/user/breadth-first/3",
          "/home/user/loop/loop",
        );
        const directories = await allElements(
          downwardDirectories("/home/user"),
        );
        assert.deepStrictEqual(
          directories.slice(0, parentDirectories.length).sort(),
          parentDirectories.sort(),
          "Unexpected parent directories",
        );
        assert.deepStrictEqual(
          directories.slice(subdirectories.length + 1).sort(),
          subdirectories.sort(),
          "Unexpected subdirectories",
        );
      });
      it("should throw an error if the starting directory is a file", async () =>
        rejects(allElements(downwardDirectories("./file.html"))));
      it("should throw an error if the starting directory does not exist", async () =>
        rejects(allElements(downwardDirectories("./inexistant-directory"))));
    });
    describe("constrained", () => {
      it("should terminate", async () => downwardDirectories(0));
      it("should not yield the starting directory", async () => {
        const files = await allElements(downwardDirectories(0));
        assert.isFalse(
          files.includes(resolvedPath(".")),
          `Starting directory ${resolvedPath(".")} was yielded.`,
        );
      });
      it("should yield the correct amount of directories", async () => {
        assert.strictEqual(
          (await allElements(downwardDirectories(1))).length,
          1,
          "Actual and expected directories differ in length.",
        );
      });
      it("should yield the correct amount of directories with a constraint", async () => {
        assert.strictEqual(
          (await allElements(downwardDirectories(0))).length,
          1,
          "Actual and expected directories differ in length.",
        );
      });
      it("should only yield correct directories", async () => {
        const files = resolvedPaths("./files");
        for await (const file of downwardDirectories(1)) {
          assert.isTrue(files.includes(file), `Unexpected file ${file}`);
        }
      });
      it("should only yield correct directories with a constraint", async () => {
        const files = resolvedPaths("./files");
        for await (const file of downwardDirectories(0)) {
          assert.isTrue(files.includes(file), `Unexpected file ${file}`);
        }
      });
      it("should yield all the correct directories", async () => {
        assert.deepStrictEqual(
          (await allElements(downwardDirectories(1))).sort(),
          resolvedPaths("./files").sort(),
        );
      });
      it("should yield all the correct directories with a constraint", async () => {
        assert.deepStrictEqual(
          (await allElements(downwardDirectories(0))).sort(),
          resolvedPaths("./files").sort(),
        );
      });
      it("should not traverse symbolic cycles infinitely", async () =>
        downwardDirectories("/home/user/loop", 5));
      it("should traverse symbolic cycles only once", async () => {
        assert.deepStrictEqual(
          (await allElements(downwardDirectories("/home/user/loop", 5))).sort(),
          resolvedPaths("/home/user/loop/loop").sort(),
        );
      });
      it("should use breadth-first traversal", async () => {
        const parentDirectories = resolvedPaths(
          "/home/user/breadth-first",
          "/home/user/files",
          "/home/user/loop",
          "/home/user/symbolic-files",
          "/home/user/symbolic-folder",
        );
        const subdirectories = resolvedPaths(
          "/home/user/breadth-first/1",
          "/home/user/breadth-first/2",
          "/home/user/breadth-first/3",
          "/home/user/loop/loop",
        );
        const directories = await allElements(
          downwardDirectories("/home/user", 5),
        );
        assert.deepStrictEqual(
          directories.slice(0, parentDirectories.length).sort(),
          parentDirectories.sort(),
          "Unexpected parent directories",
        );
        assert.deepStrictEqual(
          directories.slice(subdirectories.length + 1).sort(),
          subdirectories.sort(),
          "Unexpected subdirectories",
        );
      });
      it("should throw an error if the starting directory is a file", async () =>
        rejects(allElements(downwardDirectories("./file.html", 5))));
      it("should throw an error if the starting directory does not exist", async () =>
        rejects(allElements(downwardDirectories("./inexistant-directory", 5))));
      it("should throw an error if the constraint is negative", () =>
        assert.throws(() => downwardDirectories("./inexistant-directory", -1)));
    });
  });
  describe("downwardDirectoriesSync", () => {
    describe("unconstrained", () => {
      it("should terminate", () => downwardDirectoriesSync());
      it("should not yield the starting directory", () => {
        const files = allElementsSync(downwardDirectoriesSync());
        assert.isFalse(
          files.includes(resolvedPath(".")),
          `Starting directory ${resolvedPath(".")} was yielded.`,
        );
      });
      it("should yield the correct amount of directories", () => {
        assert.strictEqual(
          allElementsSync(downwardDirectoriesSync()).length,
          1,
          "Actual and expected directories differ in length.",
        );
      });
      it("should only yield correct directories", () => {
        const directories = resolvedPaths("./files");
        for (const directory of downwardDirectoriesSync()) {
          assert.isTrue(
            directories.includes(directory),
            `Unexpected file ${directory}`,
          );
        }
      });
      it("should yield all the correct directories", () => {
        assert.deepStrictEqual(
          allElementsSync(downwardDirectoriesSync()).sort(),
          resolvedPaths("./files").sort(),
        );
      });
      it("should not traverse symbolic cycles infinitely", () =>
        downwardDirectoriesSync("/home/user/loop"));
      it("should traverse symbolic cycles only once", () => {
        assert.deepStrictEqual(
          allElementsSync(downwardDirectoriesSync("/home/user/loop")).sort(),
          resolvedPaths("/home/user/loop/loop").sort(),
        );
      });
      it("should use breadth-first traversal", () => {
        const parentDirectories = resolvedPaths(
          "/home/user/breadth-first",
          "/home/user/files",
          "/home/user/loop",
          "/home/user/symbolic-files",
          "/home/user/symbolic-folder",
        );
        const subdirectories = resolvedPaths(
          "/home/user/breadth-first/1",
          "/home/user/breadth-first/2",
          "/home/user/breadth-first/3",
          "/home/user/loop/loop",
        );
        const directories = allElementsSync(
          downwardDirectoriesSync("/home/user"),
        );
        assert.deepStrictEqual(
          directories.slice(0, parentDirectories.length).sort(),
          parentDirectories.sort(),
          "Unexpected parent directories",
        );
        assert.deepStrictEqual(
          directories.slice(subdirectories.length + 1).sort(),
          subdirectories.sort(),
          "Unexpected subdirectories",
        );
      });
      it("should throw an error if the starting directory is a file", () =>
        assert.throws(() =>
          allElementsSync(downwardDirectoriesSync("./file.html")),
        ));
      it("should throw an error if the starting directory does not exist", () =>
        assert.throws(() =>
          allElementsSync(downwardDirectoriesSync("./inexistant-directory")),
        ));
    });
    describe("constrained", () => {
      it("should terminate", () => downwardDirectoriesSync(0));
      it("should not yield the starting directory", () => {
        const directories = allElementsSync(downwardDirectoriesSync(0));
        assert.isFalse(
          directories.includes(resolvedPath(".")),
          `Starting directory ${resolvedPath(".")} was yielded.`,
        );
      });
      it("should yield the correct amount of directories", () => {
        assert.strictEqual(
          allElementsSync(downwardDirectoriesSync(1)).length,
          1,
          "Actual and expected directories differ in length.",
        );
      });
      it("should yield the correct amount of directories with a constraint", () => {
        assert.strictEqual(
          allElementsSync(downwardDirectoriesSync(0)).length,
          1,
          "Actual and expected directories differ in length.",
        );
      });
      it("should only yield correct directories", () => {
        const directories = resolvedPaths("./files");
        for (const directory of downwardDirectoriesSync(1)) {
          assert.isTrue(
            directories.includes(directory),
            `Unexpected directory ${directory}`,
          );
        }
      });
      it("should only yield correct files with a constraint", () => {
        const directories = resolvedPaths("./files");
        for (const directory of downwardDirectoriesSync(0)) {
          assert.isTrue(
            directories.includes(directory),
            `Unexpected directory ${directory}`,
          );
        }
      });
      it("should yield all the correct directories", () => {
        assert.deepStrictEqual(
          allElementsSync(downwardDirectoriesSync(1)).sort(),
          resolvedPaths("./files").sort(),
        );
      });
      it("should yield all the correct directories with a constraint", () => {
        assert.deepStrictEqual(
          allElementsSync(downwardDirectoriesSync(0)).sort(),
          resolvedPaths("./files").sort(),
        );
      });
      it("should not traverse symbolic cycles infinitely", () =>
        downwardDirectoriesSync("/home/user/loop", 5));
      it("should traverse symbolic cycles only once", () => {
        assert.deepStrictEqual(
          allElementsSync(downwardDirectoriesSync("/home/user/loop", 5)).sort(),
          resolvedPaths("/home/user/loop/loop").sort(),
        );
      });
      it("should use breadth-first traversal", () => {
        const parentDirectories = resolvedPaths(
          "/home/user/breadth-first",
          "/home/user/files",
          "/home/user/loop",
          "/home/user/symbolic-files",
          "/home/user/symbolic-folder",
        );
        const subdirectories = resolvedPaths(
          "/home/user/breadth-first/1",
          "/home/user/breadth-first/2",
          "/home/user/breadth-first/3",
          "/home/user/loop/loop",
        );
        const directories = allElementsSync(
          downwardDirectoriesSync("/home/user", 5),
        );
        assert.deepStrictEqual(
          directories.slice(0, parentDirectories.length).sort(),
          parentDirectories.sort(),
          "Unexpected parent directories",
        );
        assert.deepStrictEqual(
          directories.slice(subdirectories.length + 1).sort(),
          subdirectories.sort(),
          "Unexpected subdirectories",
        );
      });
      it("should throw an error if the starting directory is a file", () =>
        assert.throws(() =>
          allElementsSync(downwardDirectoriesSync("./file.html", 5)),
        ));
      it("should throw an error if the starting directory does not exist", () =>
        assert.throws(() =>
          allElementsSync(downwardDirectoriesSync("./inexistant-directory", 5)),
        ));
      it("should throw an error if the constraint is negative", () =>
        assert.throws(() =>
          downwardDirectoriesSync("./inexistant-directory", -1),
        ));
    });
  });
  describe("upwardPaths", () => {
    it("should terminate", () => upwardPaths(resolve(".")));
    it("should not yield the initial path", () => {
      const path = "/home/user/some/path";
      assert.isFalse(allElementsSync(upwardPaths(path)).includes(path));
    });
    it("should yield the correct amount of paths", () => {
      assert.strictEqual(
        allElementsSync(upwardPaths("/home/user/some/path")).length,
        4,
      );
    });
    it("should only yield correct paths", () => {
      const correctPaths = ["/home/user/some", "/home/user", "/home", "/"];
      for (const path of upwardPaths("/home/user/some/path")) {
        assert.isTrue(
          correctPaths.includes(path),
          `Incorrectly yielded ${path}`,
        );
      }
    });
    it("should yield all the correct paths", () => {
      const correctPaths = ["/home/user/some", "/home/user", "/home", "/"];
      assert.deepStrictEqual(
        allElementsSync(upwardPaths("/home/user/some/path")).sort(),
        correctPaths.sort(),
      );
    });
    it("should yield all the correct paths in upward order", () => {
      const correctPathsInOrder = [
        "/home/user/some",
        "/home/user",
        "/home",
        "/",
      ];
      assert.deepStrictEqual(
        allElementsSync(upwardPaths("/home/user/some/path")),
        correctPathsInOrder,
      );
    });
  });
  describe("upwardConstrainedPaths", () => {
    it("should terminate", () => upwardConstrainedPaths(resolve("."), 0));
    it("should not yield the initial path", () => {
      const path = "/home/user/some/path";
      assert.isFalse(
        allElementsSync(upwardConstrainedPaths(path, 100)).includes(path),
      );
    });
    it("should yield the correct amount of paths", () => {
      const path = "/home/user/some/path";
      for (let i = 0; i < 10; i++) {
        assert.strictEqual(
          allElementsSync(upwardConstrainedPaths(path, i)).length,
          i >= 4 ? 4 : i,
        );
      }
    });
    it("should only yield correct paths", () => {
      const correctPaths = ["/home/user/some", "/home/user", "/home", "/"];
      for (const path of upwardConstrainedPaths("/home/user/some/path", 4)) {
        assert.isTrue(
          correctPaths.includes(path),
          `Incorrectly yielded ${path}`,
        );
      }
    });
    it("should yield all the correct paths", () => {
      const correctPaths = ["/home/user/some", "/home/user", "/home"];
      assert.deepStrictEqual(
        allElementsSync(
          upwardConstrainedPaths("/home/user/some/path", 3),
        ).sort(),
        correctPaths.sort(),
      );
    });
    it("should yield all the correct paths in upward order", () => {
      const correctPathsInOrder = ["/home/user/some", "/home/user", "/home"];
      assert.deepStrictEqual(
        allElementsSync(upwardConstrainedPaths("/home/user/some/path", 3)),
        correctPathsInOrder,
      );
    });
  });
  describe("upwardLimitedPaths", () => {
    it("should terminate", () => upwardLimitedPaths(resolve("."), "/"));
    it("should not yield the initial path", () => {
      const path = "/home/user/some/path";
      assert.isFalse(
        allElementsSync(upwardLimitedPaths(path, "/home/user/some")).includes(
          path,
        ),
      );
    });
    it("should yield the correct amount of paths", () => {
      const path = "/home/user/some/path";
      const limits: Map<string, number> = new Map([
        ["/home/user/some", 1],
        ["/home/user", 2],
        ["/home", 3],
        ["/", 4],
      ]);
      for (const limit of limits) {
        assert.strictEqual(
          allElementsSync(upwardLimitedPaths(path, limit[0])).length,
          limit[1],
        );
      }
    });
    it("should only yield correct paths", () => {
      const correctPaths = ["/home/user/some", "/home/user", "/home", "/"];
      for (const path of upwardLimitedPaths("/home/user/some/path", "/")) {
        assert.isTrue(
          correctPaths.includes(path),
          `Incorrectly yielded ${path}`,
        );
      }
    });
    it("should yield all the correct paths", () => {
      const correctPaths = ["/home/user/some", "/home/user", "/home"];
      assert.deepStrictEqual(
        allElementsSync(
          upwardLimitedPaths("/home/user/some/path", "/home"),
        ).sort(),
        correctPaths.sort(),
      );
    });
    it("should yield all the correct paths in upward order", () => {
      const correctPathsInOrder = ["/home/user/some", "/home/user", "/home"];
      assert.deepStrictEqual(
        allElementsSync(upwardLimitedPaths("/home/user/some/path", "/home")),
        correctPathsInOrder,
      );
    });
  });
  describe("upwardDirectories", () => {
    it("should terminate", async () => upwardDirectories());
    it("should yield the correct amount of paths", async () => {
      assert.strictEqual(
        (await allElements(upwardDirectories("/home/user/files/inexistant")))
          .length,
        4,
      );
    });
    it("should only yield correct paths", async () => {
      const correctPaths = resolvedPaths(
        "/home/user/files",
        "/home/user",
        "/home",
        "/",
      );
      for await (const directory of upwardDirectories(
        "/home/user/files/inexistant",
      )) {
        assert.isTrue(
          correctPaths.includes(directory),
          `Unexpected file ${directory}`,
        );
      }
    });
    it("should yield all the correct paths", async () => {
      const correctPaths = resolvedPaths(
        "/home/user/files",
        "/home/user",
        "/home",
        "/",
      );
      assert.deepStrictEqual(
        (
          await allElements(upwardDirectories("/home/user/files/inexistant"))
        ).sort(),
        correctPaths.sort(),
      );
    });
    it("should yield all the correct paths in ascending order of height", async () => {
      const correctPaths = resolvedPaths(
        "/home/user/files",
        "/home/user",
        "/home",
        "/",
      );
      assert.deepStrictEqual(
        await allElements(upwardDirectories("/home/user/files/inexistant")),
        correctPaths,
      );
    });
    it("should yield paths within the maximum height", async () => {
      const correctPaths = resolvedPaths(
        "/home/user/files",
        "/home/user",
        "/home",
      );
      assert.deepStrictEqual(
        await allElements(upwardDirectories("/home/user/files/inexistant", 3)),
        correctPaths,
      );
    });
    it("should yield paths up to the end path", async () => {
      const correctPaths = resolvedPaths(
        "/home/user/files",
        "/home/user",
        "/home",
      );
      assert.deepStrictEqual(
        await allElements(
          upwardDirectories("/home/user/files/inexistant", "/home"),
        ),
        correctPaths,
      );
    });
  });
  describe("upwardDirectoriesSync", () => {
    it("should terminate", () => upwardDirectoriesSync());
    it("should yield the correct amount of paths", () => {
      assert.strictEqual(
        allElementsSync(upwardDirectoriesSync("/home/user/files/inexistant"))
          .length,
        4,
      );
    });
    it("should only yield correct paths", () => {
      const correctPaths = resolvedPaths(
        "/home/user/files",
        "/home/user",
        "/home",
        "/",
      );
      for (const directory of upwardDirectoriesSync(
        "/home/user/files/inexistant",
      )) {
        assert.isTrue(
          correctPaths.includes(directory),
          `Unexpected file ${directory}`,
        );
      }
    });
    it("should yield all the correct paths", () => {
      const correctPaths = resolvedPaths(
        "/home/user/files",
        "/home/user",
        "/home",
        "/",
      );
      assert.deepStrictEqual(
        allElementsSync(
          upwardDirectoriesSync("/home/user/files/inexistant"),
        ).sort(),
        correctPaths.sort(),
      );
    });
    it("should yield all the correct paths in ascending order of height", () => {
      const correctPaths = resolvedPaths(
        "/home/user/files",
        "/home/user",
        "/home",
        "/",
      );
      assert.deepStrictEqual(
        allElementsSync(upwardDirectoriesSync("/home/user/files/inexistant")),
        correctPaths,
      );
    });
    it("should yield paths within the maximum height", () => {
      const correctPaths = resolvedPaths(
        "/home/user/files",
        "/home/user",
        "/home",
      );
      assert.deepStrictEqual(
        allElementsSync(
          upwardDirectoriesSync("/home/user/files/inexistant", 3),
        ),
        correctPaths,
      );
    });
    it("should yield paths up to the end path", () => {
      const correctPaths = resolvedPaths(
        "/home/user/files",
        "/home/user",
        "/home",
      );
      assert.deepStrictEqual(
        allElementsSync(
          upwardDirectoriesSync("/home/user/files/inexistant", "/home"),
        ),
        correctPaths,
      );
    });
  });
});
