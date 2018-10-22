import { assert } from "chai";

import { ofExtname } from "../src";

describe("ofExtname", () => {
  it("should arbitrarily return `false` if no extension names are given", () => {
    assert.isFalse(ofExtname()(""));
  });
  describe("(...extnames: string[]): Matcher", () => {
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
  describe("(...extnames: RegExp[]): Matcher", () => {
    it("should arbitrarily return `false` if no extension names are given", () => {
      const extnames: RegExp[] = [];
      assert.isFalse(ofExtname(...extnames)(""));
    });
    it("should return `true` if a path's extension name matches a regular expression pattern", () => {
      const matcher = ofExtname(/^\.md$/);
      assert.isTrue(matcher("/home/user/file.md"));
    });
    it("should return `false` if a path's extension name does not match a regular expression pattern", () => {
      const matcher = ofExtname(/^\.csv$/);
      assert.isFalse(matcher("/home/user/file.md"));
      assert.isFalse(matcher("/home/user/file.html"));
    });
  });
  describe("(...extnames: Array<((extname: string) => boolean)>): Matcher", () => {
    it("should arbitrarily return `false` if no extension names are given", () => {
      const extnames: Array<((extname: string) => boolean)> = [];
      assert.isFalse(ofExtname(...extnames)(""));
    });
    it("should return `true` if a path's extension name matches a function", () => {
      const matcher = ofExtname(() => true);
      assert.isTrue(matcher("/home/user/file.md"));
    });
    it("should return `false` if a path's extension name does not match a function", () => {
      const matcher = ofExtname(() => false);
      assert.isFalse(matcher("/home/user/file.md"));
    });
    it("should throw an error if a test function throws an error", () => {
      const matcher = ofExtname(() => {
        throw new Error();
      });
      assert.throws(() => matcher("/home/user/file.md"));
    });
  });
  describe("(...extnames: Array<string | RegExp | ((extname: string) => boolean)>): Matcher", () => {
    const extnames = [
      ".md",
      /^\.(md|html|json)$/,
      (extname) => extname.startsWith(".md"),
    ];
    const matcher = ofExtname(...extnames);
    it("should arbitrarily return `false` if no extension names are given", () => {
      const extnames: Array<
        string | RegExp | ((extname: string) => boolean)
      > = [];
      assert.isFalse(ofExtname(...extnames)(""));
    });
    it("should return `true` if a path's extension name matches", () => {
      assert.isTrue(matcher("/home/user/file.md"));
    });
    it("should return `false` if a path's extension name does not match", () => {
      assert.isFalse(matcher("/home/user/no-file.csv"));
    });
    it("should throw an error if a test function throws an error", () => {
      assert.throws(() =>
        ofExtname(() => {
          throw new Error();
        }, ...extnames)("/home/user/file.md"),
      );
    });
  });
});
