import { assert } from "chai";

import * as mock from "mock-fs";
import { dirname, parse, resolve } from "path";

import { upwards } from "../src";

/**
 * Constructs the set of upward directories from the given directory included.
 * @param directory The initial directory.
 * @returns The set of upward directories from the given directory included.
 */
const upwardDirectories = (directory: string = process.cwd()): string[] => {
  const { root } = parse(directory);
  const upwardDirectories: string[] = [directory];
  do {
    directory = dirname(directory);
    upwardDirectories.push(directory);
  } while (directory !== root);
  return upwardDirectories;
};

describe("upwards", () => {
  beforeEach(() => {
    mock(
      {
        "/home/user": {
          first: {
            "1": {
              "2": {
                "3": {
                  "file.html": "",
                },
              },
            },
          },
          second: { "1": { "2": { "3": {} } } },
        },
        [process.cwd()]: {
          "file.html": "",
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
  describe("(...tests: Matcher[]): Iterable<string>", () => {
    it("should return by default the directories upwards from the current working directory to the root", () => {
      assert.deepEqual([...upwards()], upwardDirectories());
    });
    it("should filter out directories that don't match the tests", () => {
      const filter = (path: string): boolean => path === process.cwd();
      assert.deepEqual(
        [...upwards(filter)],
        upwardDirectories().filter(filter),
      );
    });
    it("the iterable should throw an error if a test function throws an error", () => {
      assert.throws(() => [
        ...upwards(() => {
          throw new Error();
        }),
      ]);
    });
  });
  describe("(from: string, ...tests: Matcher[]): Iterable<string>", () => {
    it("should resolve a `from` path relative to the current working directory", () => {
      assert.deepEqual([...upwards("")], upwardDirectories());
    });
    it("should start from the directory of a `from` file path given relative to the current working directory", () => {
      assert.deepEqual([...upwards("file.html")], upwardDirectories());
    });
    it("should return the directories upwards from the given directory up to the root", () => {
      assert.deepEqual(
        [...upwards("/home/user/first/1/2/3")],
        upwardDirectories("/home/user/first/1/2/3"),
      );
    });
    it("should filter unexistant upward directories from the given directory up to the root", () => {
      assert.deepEqual(
        [...upwards("/home/user/first/1/2/3/unexistant/also-unexistant")],
        upwardDirectories("/home/user/first/1/2/3"),
      );
    });
    it("should not iterate over directory paths that don't match the tests", () => {
      assert.deepEqual(
        [
          ...upwards(
            "/home/user/first/1/2/3",
            (path) => path.search(/[0-9]/g) === -1,
          ),
        ],
        ["/home/user/first", "/home/user", "/home", "/"],
      );
    });
    it("should filter out directories that don't match the tests", () => {
      const filter = (path: string): boolean => path === process.cwd();
      assert.deepEqual(
        [...upwards("", filter)],
        upwardDirectories().filter(filter),
      );
    });
    it("the iterable should throw an error if a test function throws an error", () => {
      assert.throws(() => [
        ...upwards("", () => {
          throw new Error();
        }),
      ]);
    });
  });
  describe("(from: string, levels: number, ...tests: Matcher[]): Iterable<string>", () => {
    it("should return only the `from` path if the given amount of directories upwards is zero", () => {
      assert.deepEqual(
        [...upwards("/home/user/first/1/2/3", 0)],
        ["/home/user/first/1/2/3"],
      );
    });
    it("should return an empty set if there are no existing upwards paths with the given amount of directories", () => {
      assert.deepEqual(
        [...upwards("/home/user/first/1/2/3/unexistant", 0)],
        [],
      );
    });
    {
      const directories = upwardDirectories("/home/user/first/1/2/3");
      for (let i = 0; i <= 6; i++) {
        it(`should return the given amount (${i}) of directories upwards from the given directory, plus the initial directory, if each of them exists`, () => {
          assert.deepEqual(
            [...upwards("/home/user/first/1/2/3", i)],
            directories.slice(0, i + 1),
          );
        });
      }
    }
    {
      const directories = upwardDirectories("/home/user/first/1/2/3");
      for (let i = 0; i <= 7; i++) {
        it(`should return the given amount (${i}) of upward directories from the given path to a file starting from its dirname`, () => {
          assert.deepEqual(
            [...upwards("/home/user/first/1/2/3/file.html", i)],
            directories.slice(0, i),
          );
        });
      }
    }
    it("should filter out unexistant upward directories from the given amount of directories upwards from the given directory", () => {
      assert.deepEqual(
        [...upwards("/home/user/first/1/2/3/unexistant", 3)],
        [
          "/home/user/first/1/2/3",
          "/home/user/first/1/2",
          "/home/user/first/1",
        ],
      );
    });
    it("should filter out directories that don't match the tests", () => {
      const filter = (path: string): boolean => path === process.cwd();
      assert.deepEqual(
        [...upwards("", 1, filter)],
        upwardDirectories().filter(filter),
      );
    });
    it("should throw if the amount of directories to traverse upwards is negative", () => {
      assert.throws(() => [...upwards("", -1)]);
    });
    it("the iterable should throw an error if a test function throws an error", () => {
      assert.throws(() => [
        ...upwards("", 1, () => {
          throw new Error();
        }),
      ]);
    });
  });
  describe("(from: string, to: string, ...tests: Matcher[]): Iterable<string>", () => {
    it("should resolve the `from` path relative to the `to` path if the former is not absolute", () => {
      assert.deepEqual(
        [...upwards("first/1/2/3", "/home/user")],
        [
          "/home/user/first/1/2/3",
          "/home/user/first/1/2",
          "/home/user/first/1",
          "/home/user/first",
          "/home/user",
        ],
      );
    });
    it("should filter out directories that don't match the tests", () => {
      const filter = (path: string): boolean => path === process.cwd();
      assert.deepEqual(
        [...upwards(resolve(), resolve("../"), filter)],
        upwardDirectories().filter(filter),
      );
    });
    it("should use the dirname of the `to` path before resolving the `from` path relative to it", () => {
      assert.deepEqual(
        [...upwards("./unexistant", "/home/user/first/1/2/3/file.html")],
        ["/home/user/first/1/2/3"],
      );
    });
    it("should throw if the path from which traverse directory paths is not relative to the path up to which the traversal takes place", () => {
      assert.throws(() => upwards(resolve("../"), resolve()));
    });
    if (process.platform === "win32") {
      it("should throw an error if the two given paths do not share the same root", () => {
        assert.throws(() => upwards("C:\\", "D:\\"));
      });
    }
    it("should throw if the path up to which the traversal takes place does not exist", () => {
      assert.throws(() =>
        upwards("./also-unexistant", "/home/user/first/1/2/3/unexistant"),
      );
    });
    it("the iterable should throw an error if a test function throws an error", () => {
      assert.throws(() => [
        ...upwards(resolve(), resolve(), () => {
          throw new Error();
        }),
      ]);
    });
  });
});
