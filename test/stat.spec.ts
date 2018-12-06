import { assert } from "chai";

import * as mock from "mock-fs";

import {
  isDirectory,
  isDirectorySync,
  isFile,
  isFileSync,
  isSafeStat,
  isSafeStatSync,
} from "../src/stat";

describe("stat", () => {
  describe("isSafeStat", () => {
    beforeEach(() => {
      mock({
        "/home/user": {
          directory: {},
          "file.html": "",
          "non-searchable-directory": mock.directory({
            items: { "unreadable-file": "" },
            mode: 0,
          }),
        },
      });
    });
    afterEach(() => {
      mock.restore();
    });
    it("should not throw an error if there is no file at the given path", async () => {
      assert.isFalse(
        await isSafeStat("/home/user/inexistant-path", () => true),
      );
    });
    it("should throw an error if there is an I/O error different from a file not found exception", async () => {
      assert.isRejected(
        isSafeStat(
          "/home/user/non-searchable-directory/unreadable-file",
          () => true,
        ),
      );
    });
  });
  describe("isSafeStatSync", () => {
    beforeEach(() => {
      mock({
        "/home/user": {
          directory: {},
          "file.html": "",
          "non-searchable-directory": mock.directory({
            items: { "unreadable-file": "" },
            mode: 0,
          }),
        },
      });
    });
    afterEach(() => {
      mock.restore();
    });
    it("should not throw an error if there is no file at the given path", () => {
      assert.isFalse(isSafeStatSync("/home/user/inexistant-path", () => true));
    });
    it("should throw an error if there is an I/O error different from a file not found exception", () => {
      assert.throws(() =>
        isSafeStatSync(
          "/home/user/non-searchable-directory/unreadable-file",
          () => true,
        ),
      );
    });
  });
  describe("isFile", () => {
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
    it("should return `true` if a path points to a file", async () => {
      assert.isTrue(await isFile("/home/user/file.html"));
    });
    it("should return `false` if a path points to a directory", async () => {
      assert.isFalse(await isFile("/home/user/directory"));
    });
    it("should return `false` if a path does not exist", async () => {
      assert.isFalse(await isFile("/home/user/inexistant-path"));
    });
  });
  describe("isFileSync", () => {
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
      assert.isTrue(isFileSync("/home/user/file.html"));
    });
    it("should return `false` if a path points to a directory", () => {
      assert.isFalse(isFileSync("/home/user/directory"));
    });
    it("should return `false` if a path does not exist", () => {
      assert.isFalse(isFileSync("/home/user/inexistant-path"));
    });
  });
  describe("isDirectory", () => {
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
    it("should return `true` if a path points to a directory", async () => {
      assert.isTrue(await isDirectory("/home/user/directory"));
    });
    it("should return `false` if a path points to a file", async () => {
      assert.isFalse(await isDirectory("/home/user/file.html"));
    });
    it("should return `false` if a path does not exist", async () => {
      assert.isFalse(await isDirectory("/home/user/inexistant-path"));
    });
  });
  describe("isDirectorySync", () => {
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
      assert.isTrue(isDirectorySync("/home/user/directory"));
    });
    it("should return `false` if a path points to a file", () => {
      assert.isFalse(isDirectorySync("/home/user/file.html"));
    });
    it("should return `false` if a path does not exist", () => {
      assert.isFalse(isDirectorySync("/home/user/inexistant-path"));
    });
  });
});
