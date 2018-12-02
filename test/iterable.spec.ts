import { assert } from "chai";

import {
  asyncIterableToArray,
  isAsyncIterable,
  isIterable,
} from "../src/iterable";

describe("iterable", () => {
  describe("isIterable", () => {
    const iterable = (): Iterable<boolean> =>
      (function*() {
        yield true;
      })();
    const notIterable = (): any => 0;
    it("should return `true` if the object is an iterable", () => {
      assert.isTrue(isIterable(iterable()));
    });
    it("should return `false` if the object is not an iterable", () => {
      assert.isFalse(isIterable(notIterable()));
    });
  });
  describe("isAsyncIterable", () => {
    const asyncIterable = (): AsyncIterable<boolean> =>
      (async function*() {
        yield true;
      })();
    const notAsyncIterable = (): any => 0;
    it("should return `true` if the object is an asynchronous iterable", () => {
      assert.isTrue(isAsyncIterable(asyncIterable()));
    });
    it("should return `false` if the object is not an asynchronous iterable", () => {
      assert.isFalse(isAsyncIterable(notAsyncIterable()));
    });
  });
  describe("asyncIterableToArray", () => {
    const elements = [-1, 0, 1];
    const asyncIterable = (): AsyncIterable<number> =>
      (async function*() {
        yield* elements;
      })();
    it("should contain the correct amount of elements", async () => {
      assert.strictEqual(
        (await asyncIterableToArray(asyncIterable())).length,
        elements.length,
        "Actual async iterable array and elements array differ in size.",
      );
    });
    it("should contain all the elements of the iterable", async () => {
      const asyncIterableArray = await asyncIterableToArray(asyncIterable());
      for (const element of elements) {
        assert.isTrue(
          asyncIterableArray.includes(element),
          `Async iterable array did not contain the element ${element}`,
        );
      }
    });
    it("should return all the elements of the iterable in order", async () => {
      assert.deepStrictEqual(
        await asyncIterableToArray(asyncIterable()),
        elements,
      );
    });
  });
});
