import { assert } from "chai";

import { filteredIterable } from "./../src/filteredIterable";

describe("filteredIterable = <T>(values: Iterable<T>, tests: Array<(value: T) => boolean>): Iterable<T>", () => {
  it("should not filter any elements if no tests are given", () => {
    assert.deepEqual([...filteredIterable([1, 2, 3], [])], [1, 2, 3]);
  });
  it("should preserve the ordering of the elements", () => {
    assert.deepEqual(
      [...filteredIterable([1, 2, 0, 3, 2, 1], [(n) => n < 3])],
      [1, 2, 0, 2, 1],
    );
  });
  it("should filter out elements that don't pass a test", () => {
    assert.deepEqual(
      [...filteredIterable([0, 1, 2, 3, 4], [(n) => n < 0])],
      [],
    );
  });
  it("should not filter out elements that pass the tests", () => {
    assert.deepEqual(
      [...filteredIterable([0, 1, 2, 3, 4], [(n) => n >= 0])],
      [0, 1, 2, 3, 4],
    );
  });
  it("should filter elements correctly", () => {
    assert.deepEqual(
      [
        ...filteredIterable(
          [0, 1, 2, 3, 4, 5, 6, 7, 8],
          [(n) => n <= 6, (n) => n % 2 === 0],
        ),
      ],
      [0, 2, 4, 6],
    );
  });
});
