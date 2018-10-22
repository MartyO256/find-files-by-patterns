import { assert } from "chai";

import { ofDirname } from "../src";

describe("ofDirname", () => {
  it("should arbitrarily return `false` if no directory names are given", () => {
    assert.isFalse(ofDirname()(""));
  });
  describe("(...dirnames: string[]): Matcher", () => {
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
  describe("(...dirnames: RegExp[]): Matcher", () => {
    it("should arbitrarily return `false` if no directory names are given", () => {
      const dirnames: RegExp[] = [];
      assert.isFalse(ofDirname(...dirnames)(""));
    });
    it("should return `true` if a path's directory name matches a regular expression pattern", () => {
      const matcher = ofDirname(/^\/home.*$/);
      assert.isTrue(matcher("/home/user/directory/file.md"));
      assert.isTrue(matcher("/home/user/directory/file.html"));
    });
    it("should return `false` if a path's directory name does not match a regular expression pattern", () => {
      const matcher = ofDirname(/^\/bin.*$/);
      assert.isFalse(matcher("/home/user/directory/file.md"));
      assert.isFalse(matcher("/home/user/directory/file.html"));
    });
  });
  describe("(...dirnames: Array<((dirname: string) => boolean)>): Matcher", () => {
    it("should arbitrarily return `false` if no directory names are given", () => {
      const dirnames: Array<((dirname: string) => boolean)> = [];
      assert.isFalse(ofDirname(...dirnames)(""));
    });
    it("should return `true` if a path's dirname name matches a function", () => {
      const matcher = ofDirname(() => true);
      assert.isTrue(matcher("/home/user/directory/file.md"));
    });
    it("should return `false` if a path's directory name does not match a function", () => {
      const matcher = ofDirname(() => false);
      assert.isFalse(matcher("/home/user/directory/file.md"));
    });
    it("should throw an error if a test function throws an error", () => {
      const matcher = ofDirname(() => {
        throw new Error();
      });
      assert.throws(() => matcher("/home/user/directory/file.md"));
    });
  });
  describe("(...dirnames: Array<string | RegExp | ((dirname: string) => boolean)>): Matcher", () => {
    const dirnames = [
      "/home/user/directory",
      /^[0-9].$/,
      (dirname) => dirname.startsWith("/bin"),
    ];
    const matcher = ofDirname(...dirnames);
    it("should arbitrarily return `false` if no directory names are given", () => {
      const dirnames: Array<
        string | RegExp | ((dirname: string) => boolean)
      > = [];
      assert.isFalse(ofDirname(...dirnames)(""));
    });
    it("should return `true` if a path's directory name matches", () => {
      assert.isTrue(matcher("/home/user/directory/file.md"));
    });
    it("should return `false` if a path's directory name does not match", () => {
      assert.isFalse(matcher("/home/user/no-directory/no-file.md"));
    });
    it("should throw an error if a test function throws an error", () => {
      assert.throws(() =>
        ofDirname(() => {
          throw new Error();
        }, ...dirnames)("/home/user/directory/file.md"),
      );
    });
  });
});
