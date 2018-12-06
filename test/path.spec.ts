import { assert } from "chai";

import { join } from "path";
import { FilterSync } from "../src/filter";
import {
  firstSegmentPosition,
  ofBasename,
  ofDirname,
  ofExtname,
  segments,
} from "../src/path";

const errorSync: FilterSync<string> = () => {
  throw new Error();
};

describe("path", () => {
  describe("ofBasename", () => {
    it("should arbitrarily return `false` if no base names are given", () => {
      assert.isFalse(ofBasename()(""));
    });
    describe("(...basenames: string[]): FilterSync<string>", () => {
      it("should arbitrarily return `false` if no base names are given", () => {
        const basenames: string[] = [];
        assert.isFalse(ofBasename(...basenames)(""));
      });
      it("should return `true` if a path's base name matches a string base name", () => {
        assert.isTrue(ofBasename("file.md")("/home/user/file.md"));
      });
      it("should return `false` if a path's base name does not match a string base name", () => {
        assert.isFalse(ofBasename("file.md")("/home/user/file.html"));
      });
    });
    describe("(...basenames: RegExp[]): FilterSync<string>", () => {
      it("should arbitrarily return `false` if no base names are given", () => {
        const basenames: RegExp[] = [];
        assert.isFalse(ofBasename(...basenames)(""));
      });
      it("should return `true` if a path's base name matches a regular expression pattern", () => {
        const filter = ofBasename(/^file\..*$/);
        assert.isTrue(filter("/home/user/file.md"));
        assert.isTrue(filter("/home/user/file.html"));
      });
      it("should return `false` if a path's base name does not match a regular expression pattern", () => {
        const filter = ofBasename(/^data\..*$/);
        assert.isFalse(filter("/home/user/file.md"));
        assert.isFalse(filter("/home/user/file.html"));
      });
    });
    describe("(...basenames: Array<((basename: string) => boolean)>): FilterSync<string>", () => {
      it("should arbitrarily return `false` if no base names are given", () => {
        const basenames: Array<((basename: string) => boolean)> = [];
        assert.isFalse(ofBasename(...basenames)(""));
      });
      it("should return `true` if a path's base name matches a function", () => {
        const filter = ofBasename(() => true);
        assert.isTrue(filter("/home/user/file.md"));
      });
      it("should return `false` if a path's base name does not match a function", () => {
        const filter = ofBasename(() => false);
        assert.isFalse(filter("/home/user/file.md"));
      });
      it("should throw an error if a test function throws an error", () => {
        const filter = ofBasename(errorSync);
        assert.throws(() => filter("/home/user/file.md"));
      });
    });
    describe("(...basenames: Array<string | RegExp | ((basename: string) => boolean)>): FilterSync<string>", () => {
      const basenames = [
        "file.md",
        /^[0-9]+/,
        (basename) => basename.startsWith("f"),
      ];
      const filter = ofBasename(...basenames);
      it("should arbitrarily return `false` if no base names are given", () => {
        const basenames: Array<
          string | RegExp | ((basename: string) => boolean)
        > = [];
        assert.isFalse(ofBasename(...basenames)(""));
      });
      it("should return `true` if a path's base name matches", () => {
        assert.isTrue(filter("/home/user/file.md"));
      });
      it("should return `false` if a path's base name does not match", () => {
        assert.isFalse(filter("/home/user/no-file.md"));
      });
      it("should throw an error if a test function throws an error", () => {
        assert.throws(() =>
          ofBasename(errorSync, ...basenames)("/home/user/file.md"),
        );
      });
    });
  });
  describe("ofDirname", () => {
    it("should arbitrarily return `false` if no directory names are given", () => {
      assert.isFalse(ofDirname()(""));
    });
    describe("(...dirnames: string[]): FilterSync<string>", () => {
      it("should arbitrarily return `false` if no directory names are given", () => {
        const dirnames: string[] = [];
        assert.isFalse(ofDirname(...dirnames)(""));
      });
      it("should return `true` if a path's directory name matches a string directory name", () => {
        assert.isTrue(
          ofDirname("/home/user/directory")("/home/user/directory/file.md"),
        );
      });
      it("should return `false` if a path's directory name does not match a string directory name", () => {
        assert.isFalse(
          ofDirname("/home/user/directory")("/home/user/folder/file.html"),
        );
      });
    });
    describe("(...dirnames: RegExp[]): FilterSync<string>", () => {
      it("should arbitrarily return `false` if no directory names are given", () => {
        const dirnames: RegExp[] = [];
        assert.isFalse(ofDirname(...dirnames)(""));
      });
      it("should return `true` if a path's directory name matches a regular expression pattern", () => {
        const filter = ofDirname(/^\/home.*$/);
        assert.isTrue(filter("/home/user/directory/file.md"));
        assert.isTrue(filter("/home/user/directory/file.html"));
      });
      it("should return `false` if a path's directory name does not match a regular expression pattern", () => {
        const filter = ofDirname(/^\/bin.*$/);
        assert.isFalse(filter("/home/user/directory/file.md"));
        assert.isFalse(filter("/home/user/directory/file.html"));
      });
    });
    describe("(...dirnames: Array<((dirname: string) => boolean)>): FilterSync<string>", () => {
      it("should arbitrarily return `false` if no directory names are given", () => {
        const dirnames: Array<((dirname: string) => boolean)> = [];
        assert.isFalse(ofDirname(...dirnames)(""));
      });
      it("should return `true` if a path's dirname name matches a function", () => {
        const filter = ofDirname(() => true);
        assert.isTrue(filter("/home/user/directory/file.md"));
      });
      it("should return `false` if a path's directory name does not match a function", () => {
        const filter = ofDirname(() => false);
        assert.isFalse(filter("/home/user/directory/file.md"));
      });
      it("should throw an error if a test function throws an error", () => {
        const filter = ofDirname(errorSync);
        assert.throws(() => filter("/home/user/directory/file.md"));
      });
    });
    describe("(...dirnames: Array<string | RegExp | ((dirname: string) => boolean)>): FilterSync<string>", () => {
      const dirnames = [
        "/home/user/directory",
        /^[0-9].$/,
        (dirname) => dirname.startsWith("/bin"),
      ];
      const filter = ofDirname(...dirnames);
      it("should arbitrarily return `false` if no directory names are given", () => {
        const dirnames: Array<
          string | RegExp | ((dirname: string) => boolean)
        > = [];
        assert.isFalse(ofDirname(...dirnames)(""));
      });
      it("should return `true` if a path's directory name matches", () => {
        assert.isTrue(filter("/home/user/directory/file.md"));
      });
      it("should return `false` if a path's directory name does not match", () => {
        assert.isFalse(filter("/home/user/no-directory/no-file.md"));
      });
      it("should throw an error if a test function throws an error", () => {
        assert.throws(() =>
          ofDirname(errorSync, ...dirnames)("/home/user/directory/file.md"),
        );
      });
    });
  });
  describe("ofExtname", () => {
    it("should arbitrarily return `false` if no extension names are given", () => {
      assert.isFalse(ofExtname()(""));
    });
    describe("(...extnames: string[]): FilterSync<string>", () => {
      it("should arbitrarily return `false` if no extension names are given", () => {
        const extnames: string[] = [];
        assert.isFalse(ofExtname(...extnames)(""));
      });
      it("should return `true` if a path's extension name matches a string extension name", () => {
        assert.isTrue(ofExtname(".md")("/home/user/file.md"));
      });
      it("should return `false` if a path's extension name does not match a string extension name", () => {
        assert.isFalse(ofExtname(".md")("/home/user/file.html"));
      });
    });
    describe("(...extnames: RegExp[]): FilterSync<string>", () => {
      it("should arbitrarily return `false` if no extension names are given", () => {
        const extnames: RegExp[] = [];
        assert.isFalse(ofExtname(...extnames)(""));
      });
      it("should return `true` if a path's extension name matches a regular expression pattern", () => {
        const filter = ofExtname(/^\.md$/);
        assert.isTrue(filter("/home/user/file.md"));
      });
      it("should return `false` if a path's extension name does not match a regular expression pattern", () => {
        const filter = ofExtname(/^\.csv$/);
        assert.isFalse(filter("/home/user/file.md"));
        assert.isFalse(filter("/home/user/file.html"));
      });
    });
    describe("(...extnames: Array<((extname: string) => boolean)>): FilterSync<string>", () => {
      it("should arbitrarily return `false` if no extension names are given", () => {
        const extnames: Array<((extname: string) => boolean)> = [];
        assert.isFalse(ofExtname(...extnames)(""));
      });
      it("should return `true` if a path's extension name matches a function", () => {
        const filter = ofExtname(() => true);
        assert.isTrue(filter("/home/user/file.md"));
      });
      it("should return `false` if a path's extension name does not match a function", () => {
        const filter = ofExtname(() => false);
        assert.isFalse(filter("/home/user/file.md"));
      });
      it("should throw an error if a test function throws an error", () => {
        const filter = ofExtname(errorSync);
        assert.throws(() => filter("/home/user/file.md"));
      });
    });
    describe("(...extnames: Array<string | RegExp | ((extname: string) => boolean)>): FilterSync<string>", () => {
      const extnames = [
        ".md",
        /^\.(md|html|json)$/,
        (extname) => extname.startsWith(".md"),
      ];
      const filter = ofExtname(...extnames);
      it("should arbitrarily return `false` if no extension names are given", () => {
        const extnames: Array<
          string | RegExp | ((extname: string) => boolean)
        > = [];
        assert.isFalse(ofExtname(...extnames)(""));
      });
      it("should return `true` if a path's extension name matches", () => {
        assert.isTrue(filter("/home/user/file.md"));
      });
      it("should return `false` if a path's extension name does not match", () => {
        assert.isFalse(filter("/home/user/no-file.csv"));
      });
      it("should throw an error if a test function throws an error", () => {
        assert.throws(() =>
          ofExtname(errorSync, ...extnames)("/home/user/file.md"),
        );
      });
    });
  });
  describe("firstSegmentPosition", () => {
    it("should ignore the root", () => {
      const firstPositions = new Map<string, number>([
        process.platform === "win32" ? ["C:\\", -1] : ["/", -1],
        process.platform === "win32"
          ? ["C:\\a", "C:\\".length]
          : ["/a", "/".length],
      ]);
      for (const [path, firstPosition] of firstPositions) {
        assert.strictEqual(firstSegmentPosition(path), firstPosition);
      }
    });
    it("should skip segments consisting of special characters only", () => {
      const firstPositions = new Map<string, number>([
        [join("."), -1],
        [join(".."), -1],
        [join("..", ".."), -1],
        [join("a"), 0],
        [join("..", "a"), "../".length],
        [join("..", "..", "a"), "../../".length],
        [join(".a"), 0],
        [join("..", ".a"), "../".length],
        [join("..", "..", ".a"), "../../".length],
      ]);
      for (const [path, firstPosition] of firstPositions) {
        assert.strictEqual(firstSegmentPosition(path), firstPosition);
      }
    });
  });
  describe("segments", () => {
    it("should yield the correct segments", () => {
      const expectedSegmentsSet = new Map<string, string[]>([
        ["./..", []],
        ["./../../", []],
        ["./../a", ["a"]],
        ["./../a/b/c/", ["a", "b", "c"]],
        ["./.a/b./..c../", [".a", "b.", "..c.."]],
      ]);
      for (const [path, expectedSegments] of expectedSegmentsSet) {
        assert.deepStrictEqual([...segments(path)], expectedSegments);
      }
    });
  });
});
