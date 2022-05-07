import { rejects } from "assert";
import { assert } from "chai";

import mock from "mock-fs";

import { resolve } from "path";

import { allElements } from "../src/iterable.js";
import {
  readdir,
  readdirs,
  readdirsSync,
  readdirSync,
} from "../src/readdirs.js";

describe("readdirs", () => {
  const resolvedPaths = (...paths: string[]): string[] =>
    paths.map((path) => resolve(path));
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
  describe("readdir", () => {
    it("terminates", async () => allElements(readdir(".")));
    it("yields the correct amount of files", async () => {
      assert.strictEqual(
        (await allElements(readdir("."))).length,
        2,
        "Yielded files and expected files differ in length.",
      );
    });
    it("yields full paths", async () => {
      const directory = resolve(".");
      for await (const file of readdir(".")) {
        assert.isTrue(
          file.startsWith(directory),
          `The file ${file} was not resolved relative to the directory ${directory}`,
        );
      }
    });
    it("only yields correct file paths", async () => {
      const files = resolvedPaths("./file.html", "./files");
      for await (const file of readdir(".")) {
        assert.isTrue(
          files.includes(file),
          `The yielded file ${file} is not included in the expected files ${files}`,
        );
      }
    });
    it("yields all the correct file paths", async () => {
      assert.deepStrictEqual(
        (await allElements(readdir("."))).sort(),
        resolvedPaths("file.html", "files").sort(),
      );
    });
    it("throws an error if the given directory path is a file", async () => {
      rejects(allElements(readdir("./file.html")));
    });
    it("throws an error if the given directory path does not exist", async () => {
      rejects(allElements(readdir("./inexistant-directory")));
    });
  });
  describe("readdirSync", () => {
    it("terminates", () => [...readdirSync(".")]);
    it("yields the correct amount of files", () => {
      assert.strictEqual([...readdirSync(".")].length, 2);
    });
    it("yields full paths", () => {
      const directory = resolve(".");
      for (const file of readdirSync(".")) {
        assert.isTrue(
          file.startsWith(directory),
          `The file ${file} was not resolved relative to the directory ${directory}`,
        );
      }
    });
    it("only yields correct file paths", () => {
      const files = resolvedPaths("./file.html", "./files");
      for (const file of readdirSync(".")) {
        assert.isTrue(
          files.includes(file),
          `The yielded file ${file} is not included in the expected files ${files}`,
        );
      }
    });
    it("yields all the correct file paths", () => {
      assert.deepEqual(
        [...readdirSync(".")].sort(),
        resolvedPaths("./file.html", "./files").sort(),
      );
    });
    it("throws an error if the given directory path is a file", () => {
      assert.throws(() => [...readdirSync("./file.html")]);
    });
    it("throws an error if the given directory path does not exist", () => {
      assert.throws(() => [...readdirSync("./inexistant-directory")]);
    });
  });
  describe("readdirs", () => {
    it("terminates", async () => allElements(readdirs([".", "./files"])));
    it("yields the correct amount of files", async () => {
      assert.strictEqual(
        (
          await allElements(
            readdirs([
              ".",
              "./files",
              "/home/user/symbolic-files",
              "/home/user/symbolic-folder",
            ]),
          )
        ).length,
        8,
      );
    });
    it("only yields correct files", async () => {
      const files = resolvedPaths(
        "./file.html",
        "./files",
        "./files/file.md",
        "./files/file.html",
        "/home/user/symbolic-files/file.json",
        "/home/user/symbolic-files/file.html",
        "/home/user/symbolic-folder/file.md",
        "/home/user/symbolic-folder/file.html",
      );
      for await (const file of readdirs([
        ".",
        "./files",
        "/home/user/symbolic-files",
        "/home/user/symbolic-folder",
      ])) {
        assert.isTrue(
          files.includes(file),
          `The yielded file ${file} is not included in the expected files ${files}`,
        );
      }
    });
    it("yields all the correct file paths", async () => {
      assert.deepStrictEqual(
        (
          await allElements(
            readdirs([
              ".",
              "./files",
              "/home/user/symbolic-files",
              "/home/user/symbolic-folder",
            ]),
          )
        ).sort(),
        resolvedPaths(
          "./file.html",
          "./files",
          "./files/file.md",
          "./files/file.html",
          "/home/user/symbolic-files/file.json",
          "/home/user/symbolic-files/file.html",
          "/home/user/symbolic-folder/file.md",
          "/home/user/symbolic-folder/file.html",
        ).sort(),
      );
    });
    it("throws an error if any of the given directory paths is a file", async () => {
      rejects(allElements(readdirs([".", "./file.html"])));
    });
    it("throws an error if any of the given directory paths does not exist", async () => {
      rejects(allElements(readdirs([".", "./inexistant-directory"])));
    });
  });
  describe("readdirsSync", () => {
    it("terminates", () => [...readdirsSync([".", "./files"])]);
    it("yields the correct amount of files", () => {
      assert.strictEqual(
        [
          ...readdirsSync([
            ".",
            "./files",
            "/home/user/symbolic-files",
            "/home/user/symbolic-folder",
          ]),
        ].length,
        8,
      );
    });
    it("only yields correct files", () => {
      const files = resolvedPaths(
        "./file.html",
        "./files",
        "./files/file.md",
        "./files/file.html",
        "/home/user/symbolic-files/file.json",
        "/home/user/symbolic-files/file.html",
        "/home/user/symbolic-folder/file.md",
        "/home/user/symbolic-folder/file.html",
      );
      for (const file of readdirsSync([
        ".",
        "./files",
        "/home/user/symbolic-files",
        "/home/user/symbolic-folder",
      ])) {
        assert.isTrue(
          files.includes(file),
          `The yielded file ${file} is not included in the expected files ${files}`,
        );
      }
    });
    it("yields all the correct file paths", () => {
      assert.deepStrictEqual(
        [
          ...readdirsSync([
            ".",
            "./files",
            "/home/user/symbolic-files",
            "/home/user/symbolic-folder",
          ]),
        ].sort(),
        resolvedPaths(
          "./file.html",
          "./files",
          "./files/file.md",
          "./files/file.html",
          "/home/user/symbolic-files/file.json",
          "/home/user/symbolic-files/file.html",
          "/home/user/symbolic-folder/file.md",
          "/home/user/symbolic-folder/file.html",
        ).sort(),
      );
    });
    it("throws an error if any of the given directory paths is a file", () => {
      assert.throws(() => [...readdirsSync([".", "./file.html"])]);
    });
    it("throws an error if any of the given directory paths does not exist", () => {
      assert.throws(() => [...readdirsSync([".", "./inexistant-directory"])]);
    });
  });
});
