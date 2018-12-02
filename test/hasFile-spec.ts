import { assert } from "chai";

import * as mock from "mock-fs";

import { ofExtname } from "../src";
import { hasFile } from "./../src/hasFile";

describe("hasFile = (...tests: Array<Matcher<string>>): Matcher<string> => (path: string): boolean", () => {
  beforeEach(() => {
    mock({
      "/home/user": {
        directory: {},
        "file1.html": "",
        "file2.html": "",
        "file3.html": "",
      },
    });
  });
  afterEach(() => {
    mock.restore();
  });
  it("should return `true` for a path that is a directory and has a matching file", () => {
    assert.isTrue(hasFile(ofExtname(".html"))("/home/user"));
  });
  it("should return `false` for a path that does not exist", () => {
    assert.isFalse(
      hasFile(ofExtname(".html"))("/home/user/inexistant-directory"),
    );
  });
  it("should return `false` for a path that is not a directory", () => {
    assert.isFalse(hasFile(ofExtname(".html"))("/home/user/file1.html"));
  });
  it("should return `false` for a path that is a directory and doesn't have any matching file", () => {
    assert.isFalse(hasFile(ofExtname(".html"))("/home/user/directory"));
  });
  it("should return `false` for a path that is an empty directory and no tests are given", () => {
    assert.isFalse(hasFile()("/home/user/directory"));
  });
  it("should throw an error if any of the tests throws an error", () => {
    assert.isFalse(
      hasFile(() => {
        throw new Error();
      })("/home/user/directory"),
    );
  });
});
