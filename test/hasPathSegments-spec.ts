import { assert } from "chai";

import {
  doesNotHaveAnyPathSegment,
  hasPathSegments,
} from "./../src/hasPathSegments";

describe("hasPathSegments = (tests: Array<Matcher<string>>): Matcher<string>", () => {
  it("should be true if all path segments pass the tests", () => {
    assert.isTrue(
      hasPathSegments((segment) => !segment.startsWith("_"))(
        "./folder/file.html",
      ),
    );
  });
  it("should be false if any path segment fails the tests", () => {
    assert.isFalse(
      hasPathSegments((segment) => !segment.startsWith("_"))(
        "./_folder/file.html",
      ),
    );
  });
  it("should normalize and trim paths to extract the path segments to test", () => {
    assert.isTrue(
      hasPathSegments((segment) => !segment.startsWith("_"))(
        "./../folder/./file.html/././//",
      ),
    );
  });
  it("should throw an error if any of the tests throws an error", () => {
    assert.throws(() =>
      hasPathSegments(() => {
        throw new Error();
      })(""),
    );
  });
});

describe("doesNotHaveAnyPathSegment = (tests: Array<Matcher<string>>): Matcher<string>", () => {
  it("should be true if all path segments fail the tests", () => {
    assert.isTrue(
      doesNotHaveAnyPathSegment((segment) => segment.startsWith("_"))(
        "./folder/file.html",
      ),
    );
  });
  it("should be false if any path segment passes the tests", () => {
    assert.isFalse(
      doesNotHaveAnyPathSegment((segment) => segment.startsWith("_"))(
        "./_folder/file.html",
      ),
    );
  });
  it("should normalize and trim paths to extract the path segments to test", () => {
    assert.isTrue(
      doesNotHaveAnyPathSegment((segment) => segment.startsWith("_"))(
        "./../folder/./file.html/././//",
      ),
    );
  });
  it("should throw an error if any of the tests throws an error", () => {
    assert.throws(() =>
      doesNotHaveAnyPathSegment(() => {
        throw new Error();
      })(""),
    );
  });
});
