import { assert } from "chai";

import { concatenatedIterable } from "./../src/concatenatedIterable";

describe("concatenatedIterable = <T>(...values: Array<Iterable<T>>): Iterable<T>", () => {
  it("should return an empty iterable if no values are given", () => {
    assert.isEmpty([...concatenatedIterable()]);
  });
  it("should return an empty iterable if an emptry value is given", () => {
    assert.isEmpty([...concatenatedIterable([])]);
  });
  it("should return an empty iteralbe if empty values are given", () => {
    assert.isEmpty([...concatenatedIterable([], [])]);
    assert.isEmpty([...concatenatedIterable([], [], [])]);
  });
  it("should return the values of a given iterable in the same order", () => {
    const values = [0, 1, 2, 3, 4, 5];
    assert.deepEqual([...concatenatedIterable(values)], values);
  });
  it("should return the values of given iterables in the same order", () => {
    const first = [0, 1, 2, 3, 4, 5];
    const second = [6];
    const third = [7, 8, 9];
    assert.deepEqual(
      [...concatenatedIterable(first, second, third)],
      ([] as number[]).concat(first, second, third),
    );
  });
  it("should handle empty iterables nested between sets of values", () => {
    const first = [0, 1, 2, 3, 4, 5];
    const second = [];
    const third = [6, 7, 8];
    assert.deepEqual(
      [...concatenatedIterable(first, second, third)],
      ([] as number[]).concat(first, second, third),
    );
  });
  it("should handle iterables over iterable elements", () => {
    const first = ["0", "1", "2"];
    const second = ["3"];
    const third = ["4", "5", "6"];
    assert.deepEqual(
      [...concatenatedIterable(first, second, third)],
      ([] as string[]).concat(first, second, third),
    );
  });
});
