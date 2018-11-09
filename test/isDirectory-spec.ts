import { assert } from "chai";

import * as mock from "mock-fs";

import { isDirectory } from "./../src/isDirectory";

describe("isDirectory: Matcher<string> = (path: string): boolean", () => {
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
  it("should return `true` if a path points to a directory", () => {
    assert.isTrue(isDirectory("/home/user/directory"));
  });
  it("should return `false` if a path points to a file", () => {
    assert.isFalse(isDirectory("/home/user/file.html"));
  });
  it("should return `false` if a path does not exist", () => {
    assert.isFalse(isDirectory("/home/user/unexistant-path"));
  });
});
