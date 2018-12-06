import { assert } from "chai";
import { ofBasename, ofDirname, ofExtname } from "../src/path";

describe("path", () => {
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
});
