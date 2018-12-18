import { assert } from "chai";

import * as mock from "mock-fs";
import { basename, resolve } from "path";

import { downwards } from "../src/downwards";

describe.skip("downwards", () => {
  beforeEach(() => {
    mock(
      {
        "/home/user": {
          directory: {
            "1": { "12": { "13": {} } },
            "2": { "22": { "23": {} } },
            "3": { "32": { "33": {} } },
          },
          looping: {
            directory: {
              loop: mock.symlink({
                path: "/home/user/looping",
              }),
            },
          },
          "file.html": "",
        },
        [process.cwd()]: mock.symlink({
          path: "/home/user",
        }),
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
  describe("(...tests: Array<Matcher<string>>): Iterable<string>", () => {
    it("should return only and all the downward directories from the current working directory", () => {
      const actualDirectories = [...downwards()];
      const expectedDirectories = [
        resolve("./"),
        resolve("./directory"),
        resolve("./looping"),
        resolve("./directory/1"),
        resolve("./directory/2"),
        resolve("./directory/3"),
        resolve("./looping/directory"),
        resolve("./directory/1/12"),
        resolve("./directory/2/22"),
        resolve("./directory/3/32"),
        resolve("./directory/1/12/13"),
        resolve("./directory/2/22/23"),
        resolve("./directory/3/32/33"),
      ];
      assert.isTrue(
        actualDirectories.length === expectedDirectories.length,
        "Actual and expected directories differ in length.",
      );
      for (const expectedDirectory of expectedDirectories) {
        assert.isTrue(
          actualDirectories.includes(expectedDirectory),
          `${expectedDirectory} is missing from the actual directories.`,
        );
      }
    });
    it("should return all the downward directories in order of breadth-directory traversal", () => {
      assert.deepEqual(
        [...downwards()],
        [
          resolve("./"),
          resolve("./directory"),
          resolve("./looping"),
          resolve("./directory/1"),
          resolve("./directory/2"),
          resolve("./directory/3"),
          resolve("./looping/directory"),
          resolve("./directory/1/12"),
          resolve("./directory/2/22"),
          resolve("./directory/3/32"),
          resolve("./directory/1/12/13"),
          resolve("./directory/2/22/23"),
          resolve("./directory/3/32/33"),
        ],
      );
    });
    it("should handle loops in the traversal", () => {
      assert.deepEqual(
        [...downwards()],
        [
          resolve("./"),
          resolve("./directory"),
          resolve("./looping"),
          resolve("./directory/1"),
          resolve("./directory/2"),
          resolve("./directory/3"),
          resolve("./looping/directory"),
          resolve("./directory/1/12"),
          resolve("./directory/2/22"),
          resolve("./directory/3/32"),
          resolve("./directory/1/12/13"),
          resolve("./directory/2/22/23"),
          resolve("./directory/3/32/33"),
        ],
      );
    });
    it("should filter out directories that don't pass the tests", () => {
      const actualDirectories = [
        ...downwards((directory) => !basename(directory).startsWith("1")),
      ];
      const filteredOutDirectories = [
        resolve("./directory/1"),
        resolve("./directory/1/12"),
        resolve("./directory/1/12/13"),
      ];
      for (const filteredOutDirectory of filteredOutDirectories) {
        assert.isFalse(
          actualDirectories.includes(filteredOutDirectory),
          `Actual directories did not filter out ${filteredOutDirectory}.`,
        );
      }
    });
    it("should not filter out directories that pass the tests", () => {
      const actualDirectories = [
        ...downwards((directory) => !basename(directory).startsWith("1")),
      ];
      const includedDirectories = [
        resolve("./"),
        resolve("./directory"),
        resolve("./looping"),
        resolve("./directory/2"),
        resolve("./directory/3"),
        resolve("./looping/directory"),
        resolve("./directory/2/22"),
        resolve("./directory/3/32"),
        resolve("./directory/2/22/23"),
        resolve("./directory/3/32/33"),
      ];
      for (const includedDirectory of includedDirectories) {
        assert.isTrue(
          actualDirectories.includes(includedDirectory),
          `Actual directories did not include ${includedDirectory}.`,
        );
      }
    });
    it("should preserve the breadth-directory ordering while filtering", () => {
      assert.deepEqual(
        [...downwards((directory) => !basename(directory).startsWith("1"))],
        [
          resolve("./"),
          resolve("./directory"),
          resolve("./looping"),
          resolve("./directory/2"),
          resolve("./directory/3"),
          resolve("./looping/directory"),
          resolve("./directory/2/22"),
          resolve("./directory/3/32"),
          resolve("./directory/2/22/23"),
          resolve("./directory/3/32/33"),
        ],
      );
    });
    it("should throw an error if any of the tests throws an error", () => {
      assert.throws(() => [
        ...downwards(() => {
          throw new Error();
        }),
      ]);
    });
  });
  describe("(from: string, ...tests: Array<Matcher<string>>): Iterable<string>", () => {
    it("should throw an error if the given starting path is a file", () => {
      assert.throws(() => [...downwards("/home/user/file.html")]);
    });
    it("should throw an error if the given starting path does not exist", () => {
      assert.throws(() => [...downwards("/home/user/unexistant")]);
    });
    it("should return only and all the downward directories from the current working directory", () => {
      const actualDirectories = [...downwards("/home/user/directory")];
      const expectedDirectories = [
        resolve("/home/user/directory"),
        resolve("/home/user/directory/1"),
        resolve("/home/user/directory/2"),
        resolve("/home/user/directory/3"),
        resolve("/home/user/directory/1/12"),
        resolve("/home/user/directory/2/22"),
        resolve("/home/user/directory/3/32"),
        resolve("/home/user/directory/1/12/13"),
        resolve("/home/user/directory/2/22/23"),
        resolve("/home/user/directory/3/32/33"),
      ];
      assert.isTrue(
        actualDirectories.length === expectedDirectories.length,
        "Actual and expected directories differ in length.",
      );
      for (const expectedDirectory of expectedDirectories) {
        assert.isTrue(
          actualDirectories.includes(expectedDirectory),
          `${expectedDirectory} is missing from the actual directories.`,
        );
      }
    });
    it("should return all the downward directories in order of breadth-directory traversal", () => {
      assert.deepEqual(
        [...downwards("/home/user/directory")],
        [
          resolve("/home/user/directory"),
          resolve("/home/user/directory/1"),
          resolve("/home/user/directory/2"),
          resolve("/home/user/directory/3"),
          resolve("/home/user/directory/1/12"),
          resolve("/home/user/directory/2/22"),
          resolve("/home/user/directory/3/32"),
          resolve("/home/user/directory/1/12/13"),
          resolve("/home/user/directory/2/22/23"),
          resolve("/home/user/directory/3/32/33"),
        ],
      );
    });
    it("should handle loops in the traversal", () => {
      assert.deepEqual(
        [...downwards("/home/user/looping")],
        [
          resolve("/home/user/looping"),
          resolve("/home/user/looping/directory"),
        ],
      );
    });
    it("should filter out directories that don't pass the tests", () => {
      const actualDirectories = [
        ...downwards(
          "/home/user/directory",
          (directory) => !basename(directory).startsWith("1"),
        ),
      ];
      const filteredOutDirectories = [
        resolve("/home/user/directory/1"),
        resolve("/home/user/directory/1/12"),
        resolve("/home/user/directory/1/12/13"),
      ];
      for (const filteredOutDirectory of filteredOutDirectories) {
        assert.isFalse(
          actualDirectories.includes(filteredOutDirectory),
          `Actual directories did not filter out ${filteredOutDirectory}.`,
        );
      }
    });
    it("should not filter out directories that pass the tests", () => {
      const actualDirectories = [
        ...downwards(
          "/home/user/directory",
          (directory) => !basename(directory).startsWith("1"),
        ),
      ];
      const includedDirectories = [
        resolve("/home/user/directory"),
        resolve("/home/user/directory/2"),
        resolve("/home/user/directory/3"),
        resolve("/home/user/directory/2/22"),
        resolve("/home/user/directory/3/32"),
        resolve("/home/user/directory/2/22/23"),
        resolve("/home/user/directory/3/32/33"),
      ];
      for (const includedDirectory of includedDirectories) {
        assert.isTrue(
          actualDirectories.includes(includedDirectory),
          `Actual directories did not include ${includedDirectory}.`,
        );
      }
    });
    it("should preserve the breadth-directory ordering while filtering", () => {
      assert.deepEqual(
        [
          ...downwards(
            "/home/user/directory",
            (directory) => !basename(directory).startsWith("1"),
          ),
        ],
        [
          resolve("/home/user/directory"),
          resolve("/home/user/directory/2"),
          resolve("/home/user/directory/3"),
          resolve("/home/user/directory/2/22"),
          resolve("/home/user/directory/3/32"),
          resolve("/home/user/directory/2/22/23"),
          resolve("/home/user/directory/3/32/33"),
        ],
      );
    });
    it("should resolve the given starting directory path", () => {
      assert.deepEqual(
        [...downwards("./directory")],
        [
          resolve("./directory"),
          resolve("./directory/1"),
          resolve("./directory/2"),
          resolve("./directory/3"),
          resolve("./directory/1/12"),
          resolve("./directory/2/22"),
          resolve("./directory/3/32"),
          resolve("./directory/1/12/13"),
          resolve("./directory/2/22/23"),
          resolve("./directory/3/32/33"),
        ],
      );
    });
    it("should throw an error if any of the tests throws an error", () => {
      assert.throws(() => [
        ...downwards("/home/user/directory", () => {
          throw new Error();
        }),
      ]);
    });
  });
  describe("(from: string, depth: number, ...tests: Array<Matcher<string>>): Iterable<string>", () => {
    it("should throw an error if the given starting path is a file", () => {
      assert.throws(() => [...downwards("/home/user/file.html", 0)]);
    });
    it("should throw an error if the given starting path does not exist", () => {
      assert.throws(() => [...downwards("/home/user/unexistant", 0)]);
    });
    it("should throw an error if the given depth is negative", () => {
      assert.throws(() => [...downwards("/home/user/directory", -1)]);
    });
    it("should return only and all the downward directories from the current working directory down to the given depth", () => {
      const actualDirectories = [...downwards("/home/user/directory", 2)];
      const expectedDirectories = [
        resolve("/home/user/directory"),
        resolve("/home/user/directory/1"),
        resolve("/home/user/directory/2"),
        resolve("/home/user/directory/3"),
        resolve("/home/user/directory/1/12"),
        resolve("/home/user/directory/2/22"),
        resolve("/home/user/directory/3/32"),
      ];
      assert.isTrue(
        actualDirectories.length === expectedDirectories.length,
        "Actual and expected directories differ in length.",
      );
      for (const expectedDirectory of expectedDirectories) {
        assert.isTrue(
          actualDirectories.includes(expectedDirectory),
          `${expectedDirectory} is missing from the actual directories.`,
        );
      }
    });
    it("should return all the downward directories in order of breadth-directory traversal down to the given depth", () => {
      assert.deepEqual(
        [...downwards("/home/user/directory", 2)],
        [
          resolve("/home/user/directory"),
          resolve("/home/user/directory/1"),
          resolve("/home/user/directory/2"),
          resolve("/home/user/directory/3"),
          resolve("/home/user/directory/1/12"),
          resolve("/home/user/directory/2/22"),
          resolve("/home/user/directory/3/32"),
        ],
      );
    });
    it("should handle loops in the traversal", () => {
      assert.deepEqual(
        [...downwards("/home/user/looping", 3)],
        [
          resolve("/home/user/looping"),
          resolve("/home/user/looping/directory"),
        ],
      );
    });
    {
      const directories = [
        [0, resolve("/home/user/directory")],
        [1, resolve("/home/user/directory/1")],
        [1, resolve("/home/user/directory/2")],
        [1, resolve("/home/user/directory/3")],
        [2, resolve("/home/user/directory/1/12")],
        [2, resolve("/home/user/directory/2/22")],
        [2, resolve("/home/user/directory/3/32")],
        [3, resolve("/home/user/directory/1/12/13")],
        [3, resolve("/home/user/directory/2/22/23")],
        [3, resolve("/home/user/directory/3/32/33")],
      ];
      for (let depth = 0; depth <= 3; depth++) {
        const expectedDirectories: string[] = [];
        for (const [dirDepth, dir] of directories) {
          if (dirDepth <= depth) {
            expectedDirectories.push(dir as string);
          }
        }
        it(`should support a maximum depth of ${depth}`, () => {
          assert.deepEqual(
            [...downwards("/home/user/directory", depth)],
            expectedDirectories,
          );
        });
      }
    }
    it("should filter out directories down to the given depth that don't pass the tests", () => {
      const actualDirectories = [
        ...downwards(
          "/home/user/directory",
          2,
          (directory) => !basename(directory).startsWith("1"),
        ),
      ];
      const filteredOutDirectories = [
        resolve("/home/user/directory/1"),
        resolve("/home/user/directory/1/12"),
      ];
      for (const filteredOutDirectory of filteredOutDirectories) {
        assert.isFalse(
          actualDirectories.includes(filteredOutDirectory),
          `Actual directories did not filter out ${filteredOutDirectory}.`,
        );
      }
    });
    it("should not filter out directories down to the given depth that pass the tests", () => {
      const actualDirectories = [
        ...downwards(
          "/home/user/directory",
          2,
          (directory) => !basename(directory).startsWith("1"),
        ),
      ];
      const includedDirectories = [
        resolve("/home/user/directory"),
        resolve("/home/user/directory/2"),
        resolve("/home/user/directory/3"),
        resolve("/home/user/directory/2/22"),
        resolve("/home/user/directory/3/32"),
      ];
      for (const includedDirectory of includedDirectories) {
        assert.isTrue(
          actualDirectories.includes(includedDirectory),
          `Actual directories did not include ${includedDirectory}.`,
        );
      }
    });
    it("should preserve the breadth-directory ordering while filtering down to the given depth", () => {
      assert.deepEqual(
        [
          ...downwards(
            "/home/user/directory",
            2,
            (directory) => !basename(directory).startsWith("1"),
          ),
        ],
        [
          resolve("/home/user/directory"),
          resolve("/home/user/directory/2"),
          resolve("/home/user/directory/3"),
          resolve("/home/user/directory/2/22"),
          resolve("/home/user/directory/3/32"),
        ],
      );
    });
    it("should resolve the given starting directory path", () => {
      assert.deepEqual(
        [...downwards("./directory", 2)],
        [
          resolve("./directory"),
          resolve("./directory/1"),
          resolve("./directory/2"),
          resolve("./directory/3"),
          resolve("./directory/1/12"),
          resolve("./directory/2/22"),
          resolve("./directory/3/32"),
        ],
      );
    });
    it("should throw an error if any of the tests throws an error", () => {
      assert.throws(() => [
        ...downwards("/home/user/directory", 0, () => {
          throw new Error();
        }),
      ]);
    });
  });
});
