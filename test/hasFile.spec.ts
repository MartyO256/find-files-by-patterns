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
  it("should return `true` for a path that is a directory and has a matching file", async () => {
    assert.isTrue(await hasFile(ofExtname(".html"))("/home/user"));
  });
  it("should return `false` for a path that does not exist", async () => {
    assert.isFalse(
      await hasFile(ofExtname(".html"))("/home/user/inexistant-directory"),
    );
  });
  it("should return `false` for a path that is not a directory", async () => {
    assert.isFalse(await hasFile(ofExtname(".html"))("/home/user/file1.html"));
  });
  it("should return `false` for a path that is a directory and doesn't have any matching file", async () => {
    assert.isFalse(await hasFile(ofExtname(".html"))("/home/user/directory"));
  });
  it("should return `false` for a path that is an empty directory and no tests are given", async () => {
    assert.isFalse(await hasFile()("/home/user/directory"));
  });
  it("should throw an error if any of the tests throws an error", async () => {
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
  it("should return `true` for a path that is a directory and has a matching file", () => {
    assert.isTrue(hasFileSync(ofExtname(".html"))("/home/user"));
  });
  it("should return `false` for a path that does not exist", () => {
    assert.isFalse(
      hasFileSync(ofExtname(".html"))("/home/user/inexistant-directory"),
    );
  });
  it("should return `false` for a path that is not a directory", () => {
    assert.isFalse(hasFileSync(ofExtname(".html"))("/home/user/file1.html"));
  });
  it("should return `false` for a path that is a directory and doesn't have any matching file", () => {
    assert.isFalse(hasFileSync(ofExtname(".html"))("/home/user/directory"));
  });
  it("should return `false` for a path that is an empty directory and no tests are given", () => {
    assert.isFalse(hasFileSync()("/home/user/directory"));
  });
  it("should throw an error if any of the tests throws an error", () => {
    assert.isFalse(hasFileSync(errorSync)("/home/user/directory"));
  });
});
