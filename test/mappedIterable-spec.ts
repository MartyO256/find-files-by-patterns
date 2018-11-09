import { assert } from "chai";

import { mappedIterable } from "./../src/mappedIterable";

describe("mappedIterable = <T, K>(values: Iterable<T>, by: (value: T) => undefined | K | K[]): Iterable<K>", () => {
  it("should support mappings to undefined values", () => {
    assert.deepEqual([...mappedIterable([1, 2, 3], (n) => undefined)], []);
  });
  it("should support mappings to defined values", () => {
    assert.deepEqual([...mappedIterable([1, 2, 3], (n) => 2 * n)], [2, 4, 6]);
  });
  it("should support mappings to undefined and defined values", () => {
    assert.deepEqual(
      [...mappedIterable([1, 2, 3], (n) => (n % 2 === 0 ? undefined : 2 * n))],
      [2, 6],
    );
  });
  it("should support mappings to multiple defined values", () => {
    assert.deepEqual(
      [...mappedIterable([1, 2, 3], (n) => [2 * n, 3 * n])],
      [2 * 1, 3 * 1, 2 * 2, 2 * 3, 3 * 2, 3 * 3],
    );
  });
  it("should support mappings to multiple defined values and undefined values", () => {
    assert.deepEqual(
      [
        ...mappedIterable(
          [1, 2, 3],
          (n) => (n % 2 === 0 ? undefined : [2 * n, 3 * n]),
        ),
      ],
      [2 * 1, 3 * 1, 3 * 2, 3 * 3],
    );
  });
  it("should support mappings to multiple defined values and single values", () => {
    assert.deepEqual(
      [...mappedIterable([1, 2, 3], (n) => (n % 2 === 0 ? 0 : [2 * n, 3 * n]))],
      [2 * 1, 3 * 1, 0, 3 * 2, 3 * 3],
    );
  });
  it("should support mappings to multiple and simply defined or undefined values", () => {
    assert.deepEqual(
      [
        ...mappedIterable(
          [1, 2, 3],
          (n) => (n === 1 ? n : n === 2 ? [2 * n, 3 * n] : undefined),
        ),
      ],
      [1, 2 * 2, 2 * 3],
    );
  });
  it("shoudl support mappings to iterable elements", () => {
    assert.deepEqual(
      [...mappedIterable(["0", "1"], (value) => "0" + value)],
      ["00", "01"],
    );
  });
});
