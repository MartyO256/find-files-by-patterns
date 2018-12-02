import { assert } from "chai";

import {
  conjunction,
  conjunctionSync,
  disjunction,
  disjunctionSync,
  filter,
  Filter,
  FilterSync,
  filterSync,
} from "../src/filter";
import { asyncIterableToArray } from "../src/iterable";

describe("filter", () => {
  const isEvenSync: FilterSync<number> = (element: number) => element % 2 === 0;
  const isGreaterThan2Sync: FilterSync<number> = (element: number) =>
    element > 2;
  const errorSync: FilterSync<number> = (element: number) => {
    throw new Error();
  };
  const isEven: Filter<number> = (element: number) =>
    Promise.resolve(isEvenSync(element));
  const isGreaterThan2: Filter<number> = (element: number) =>
    Promise.resolve(isGreaterThan2Sync(element));
  const error: Filter<number> = (element: number) =>
    Promise.resolve(errorSync(element));
  describe("conjunction", () => {
    const filter = conjunction([isEven, isGreaterThan2]);
    it("should return `true` for elements that pass all the filters", async () => {
      for (const element of [4, 6, 8, 10]) {
        assert.isTrue(await filter(element));
      }
    });
    it("should return `false` for elements that fail any of the filters", async () => {
      for (const element of [1, 2, 3, 5]) {
        assert.isFalse(await filter(element));
      }
    });
    it("should throw an error if any of the filters throws an error", async () => {
      await assert.isRejected(conjunction([isEven, isGreaterThan2, error])(4));
    });
  });
  describe("conjunctionSync", () => {
    const filter = conjunctionSync([isEvenSync, isGreaterThan2Sync]);
    it("should return `true` for elements that pass all the filters", () => {
      for (const element of [4, 6, 8, 10]) {
        assert.isTrue(filter(element));
      }
    });
    it("should return `false` for elements that fail any of the filters", () => {
      for (const element of [1, 2, 3, 5]) {
        assert.isFalse(filter(element));
      }
    });
    it("should throw an error if any of the filters throws an error", () => {
      assert.throws(() =>
        conjunctionSync([isEvenSync, isGreaterThan2Sync, errorSync])(4),
      );
    });
  });
  describe("disjunction", () => {
    const filter = disjunction([isEven, isGreaterThan2]);
    it("should return `true` for elements that pass any of the filters", async () => {
      for (const element of [3, 4, 5, 6]) {
        assert.isTrue(await filter(element));
      }
    });
    it("should return `false` for elements that fail all of the filters", async () => {
      for (const element of [-5, -3, -1, 1]) {
        assert.isFalse(await filter(element));
      }
    });
    it("should throw an error if any of the filters throws an error", async () => {
      await assert.isRejected(disjunction([isEven, isGreaterThan2, error])(1));
    });
  });
  describe("disjunctionSync", () => {
    const filter = disjunctionSync([isEvenSync, isGreaterThan2Sync]);
    it("should return `true` for elements that pass any the filters", () => {
      for (const element of [3, 4, 5, 6]) {
        assert.isTrue(filter(element));
      }
    });
    it("should return `false` for elements that fail all of the filters", () => {
      for (const element of [-5, -3, -1, 1]) {
        assert.isFalse(filter(element));
      }
    });
    it("should throw an error if any of the filters throws an error", () => {
      assert.throws(() =>
        disjunctionSync([isEvenSync, isGreaterThan2Sync, errorSync])(1),
      );
    });
  });
  describe("filter", () => {
    const elements = [1, 2, 3, 4, 5, 6];
    const filteredElements = [4, 6];
    it("should filter in all the elements if there are no filters", async () => {
      assert.strictEqual(
        (await asyncIterableToArray(filter(elements, []))).length,
        elements.length,
      );
    });
    it("should filter in the correct amount of elements", async () => {
      assert.strictEqual(
        (await asyncIterableToArray(filter(elements, [isEven, isGreaterThan2])))
          .length,
        filteredElements.length,
      );
    });
    it("should only filter in elements that pass all of the filters", async () => {
      for (const element of await asyncIterableToArray(
        filter(elements, [isEven, isGreaterThan2]),
      )) {
        assert.isTrue(
          filteredElements.includes(element),
          `The element ${element} was unexpectedly yielded.`,
        );
      }
    });
    it("should filter in all the elements that pass all of the filters", async () => {
      assert.deepStrictEqual(
        await asyncIterableToArray(filter(elements, [isEven, isGreaterThan2])),
        filteredElements,
      );
    });
    it("should throw an error if any of the filters throws an error", async () => {
      await assert.isRejected(asyncIterableToArray(filter(elements, [error])));
    });
  });
  describe("filterSync", () => {
    const elements = [1, 2, 3, 4, 5, 6];
    const filteredElements = [4, 6];
    it("should filter in all the elements if there are no filters", () => {
      assert.strictEqual([...filterSync(elements, [])].length, elements.length);
    });
    it("should filter in the correct amount of elements", () => {
      assert.strictEqual(
        [...filterSync(elements, [isEvenSync, isGreaterThan2Sync])].length,
        filteredElements.length,
      );
    });
    it("should only filter in elements that pass all of the filters", () => {
      for (const element of filterSync(elements, [
        isEvenSync,
        isGreaterThan2Sync,
      ])) {
        assert.isTrue(
          filteredElements.includes(element),
          `The element ${element} was unexpectedly yielded.`,
        );
      }
    });
    it("should filter in all the elements that pass all of the filters", () => {
      assert.deepStrictEqual(
        [...filterSync(elements, [isEvenSync, isGreaterThan2Sync])],
        filteredElements,
      );
    });
    it("should throw an error if any of the filters throws an error", () => {
      assert.throws(() => [...filterSync(elements, [errorSync])]);
    });
  });
});
