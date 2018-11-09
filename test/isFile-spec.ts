import { assert } from "chai";

import * as mock from "mock-fs";

import { isFile } from "./../src/isFile";

describe("isFile: Matcher<string> = (path: string): boolean", () => {
  beforeEach(() => {
    mock({
      "/home/user": {
        directory: {},
        "file.html": "",
      },
    });
  });
  afterEach(() => {
    mock.restore();
  });
  it("should return `true` if a path points to a file", () => {
    assert.isTrue(isFile("/home/user/file.html"));
  });
  it("should return `false` if a path points to a directory", () => {
    assert.isFalse(isFile("/home/user/directory"));
  });
  it("should return `false` if a path does not exist", () => {
    assert.isFalse(isFile("/home/user/unexistant-path"));
  });
});
