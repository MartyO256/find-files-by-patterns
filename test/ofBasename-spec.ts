import { assert } from "chai";

import { ofBasename } from "../src";

describe("ofBasename", () => {
  it("should arbitrarily return `false` if no base names are given", () => {
    assert.isFalse(ofBasename()(""));
  });
  describe("(...basenames: string[]): Matcher", () => {
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
  describe("(...basenames: RegExp[]): Matcher", () => {
    it("should arbitrarily return `false` if no base names are given", () => {
      const basenames: RegExp[] = [];
      assert.isFalse(ofBasename(...basenames)(""));
    });
    it("should return `true` if a path's base name matches a regular expression pattern", () => {
      const matcher = ofBasename(/^file\..*$/);
      assert.isTrue(matcher("/home/user/file.md"));
      assert.isTrue(matcher("/home/user/file.html"));
    });
    it("should return `false` if a path's base name does not match a regular expression pattern", () => {
      const matcher = ofBasename(/^data\..*$/);
      assert.isFalse(matcher("/home/user/file.md"));
      assert.isFalse(matcher("/home/user/file.html"));
    });
  });
  describe("(...basenames: Array<((basename: string) => boolean)>): Matcher", () => {
    it("should arbitrarily return `false` if no base names are given", () => {
      const basenames: Array<((basename: string) => boolean)> = [];
      assert.isFalse(ofBasename(...basenames)(""));
    });
    it("should return `true` if a path's base name matches a function", () => {
      const matcher = ofBasename(() => true);
      assert.isTrue(matcher("/home/user/file.md"));
    });
    it("should return `false` if a path's base name does not match a function", () => {
      const matcher = ofBasename(() => false);
      assert.isFalse(matcher("/home/user/file.md"));
    });
    it("should throw an error if a test function throws an error", () => {
      const matcher = ofBasename(() => {
        throw new Error();
      });
      assert.throws(() => matcher("/home/user/file.md"));
    });
  });
  describe("(...basenames: Array<string | RegExp | ((basename: string) => boolean)>): Matcher", () => {
    const basenames = [
      "file.md",
      /^[0-9]+/,
      (basename) => basename.startsWith("f"),
    ];
    const matcher = ofBasename(...basenames);
    it("should arbitrarily return `false` if no base names are given", () => {
      const basenames: Array<
        string | RegExp | ((basename: string) => boolean)
      > = [];
      assert.isFalse(ofBasename(...basenames)(""));
    });
    it("should return `true` if a path's base name matches", () => {
      assert.isTrue(matcher("/home/user/file.md"));
    });
    it("should return `false` if a path's base name does not match", () => {
      assert.isFalse(matcher("/home/user/no-file.md"));
    });
    it("should throw an error if a test function throws an error", () => {
      assert.throws(() =>
        ofBasename(() => {
          throw new Error();
        }, ...basenames)("/home/user/file.md"),
      );
    });
  });
});
