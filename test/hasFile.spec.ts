import { assert } from "chai";

import * as mock from "mock-fs";

import { Filter, FilterSync } from "../src/filter";
import { ofExtname } from "../src/path";
import { hasFile, hasFileSync } from "./../src/hasFile";

const error: Filter<string> = async () => {
  throw new Error();
};
const errorSync: FilterSync<string> = () => {
  throw new Error();
};

describe("hasFile", () => {
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
  it("returns `true` for a path that is a directory and has a matching file", async () => {
    assert.isTrue(await hasFile(ofExtname(".html"))("/home/user"));
  });
  it("returns `false` for a path that does not exist", async () => {
    assert.isFalse(
      await hasFile(ofExtname(".html"))("/home/user/inexistant-directory"),
    );
  });
  it("returns `false` for a path that is not a directory", async () => {
    assert.isFalse(await hasFile(ofExtname(".html"))("/home/user/file1.html"));
  });
  it("returns `false` for a path that is a directory and doesn't have any matching file", async () => {
    assert.isFalse(await hasFile(ofExtname(".html"))("/home/user/directory"));
  });
  it("throws an error if any of the tests throws an error", async () => {
    assert.isFalse(await hasFile(error)("/home/user/directory"));
  });
});

describe("hasFileSync", () => {
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
  it("returns `true` for a path that is a directory and has a matching file", () => {
    assert.isTrue(hasFileSync(ofExtname(".html"))("/home/user"));
  });
  it("returns `false` for a path that does not exist", () => {
    assert.isFalse(
      hasFileSync(ofExtname(".html"))("/home/user/inexistant-directory"),
    );
  });
  it("returns `false` for a path that is not a directory", () => {
    assert.isFalse(hasFileSync(ofExtname(".html"))("/home/user/file1.html"));
  });
  it("returns `false` for a path that is a directory and doesn't have any matching file", () => {
    assert.isFalse(hasFileSync(ofExtname(".html"))("/home/user/directory"));
  });
  it("throws an error if any of the tests throws an error", () => {
    assert.isFalse(hasFileSync(errorSync)("/home/user/directory"));
  });
});
