import { rejects } from "assert";
import { assert } from "chai";

import {
  allElements,
  allElementsSync,
  firstElement,
  firstElementSync,
  isAsyncIterable,
  isIterable,
  onlyElement,
  onlyElementSync,
} from "../src/iterable.js";

describe("iterable", () => {
  describe("isIterable", () => {
    const iterable = (): Iterable<boolean> =>
      (function* (): Iterable<boolean> {
        yield true;
      })();
    const notIterable = (): unknown => 0;
    it("returns `true` if the object is an iterable", () => {
      assert.isTrue(isIterable(iterable()));
    });
    it("returns `false` if the object is not an iterable", () => {
      assert.isFalse(isIterable(notIterable()));
    });
  });
  describe("isAsyncIterable", () => {
    const asyncIterable = (): AsyncIterable<boolean> =>
      (async function* (): AsyncIterable<boolean> {
        yield true;
      })();
    const notAsyncIterable = (): unknown => 0;
    it("returns `true` if the object is an asynchronous iterable", () => {
      assert.isTrue(isAsyncIterable(asyncIterable()));
    });
    it("returns `false` if the object is not an asynchronous iterable", () => {
      assert.isFalse(isAsyncIterable(notAsyncIterable()));
    });
  });
  describe("firstElement", () => {
    const asyncIterable = (): AsyncIterable<string> =>
      (async function* (): AsyncIterable<string> {
        yield* ["first", "second", "third"];
      })();
    it("returns the first element of the iterable", async () => {
      assert.strictEqual(await firstElement(asyncIterable()), "first");
    });
    it("returns `null` if the iterable is depleted", async () => {
      assert.isNull(await firstElement([]));
    });
  });
  describe("firstElementSync", () => {
    it("returns the first element of the iterable", () => {
      assert.strictEqual(
        firstElementSync(["first", "second", "third"]),
        "first",
      );
    });
    it("returns `null` if the iterable is depleted", () => {
      assert.isNull(firstElementSync([]));
    });
  });
  describe("onlyElement", () => {
    const element = (async function* (): AsyncIterable<string> {
      yield "element";
    })();
    const elements = (async function* (): AsyncIterable<string> {
      yield* ["first", "second", "third"];
    })();
    it("returns the only element of the iterable", async () => {
      assert.strictEqual(await onlyElement(element), "element");
    });
    it("throws an error if there is more than one element in the iterable", async () => {
      rejects(onlyElement(elements));
    });
    it("throws a conflict error if there is more than one element in the iterable", async () => {
      try {
        await onlyElement(elements);
      } catch (error) {
        assert.deepStrictEqual(error.conflicts, ["first", "second"]);
      }
    });
  });
  describe("onlyElementSync", () => {
    const element = ["element"];
    const elements = ["first", "second", "third"];
    it("returns the only element of the iterable", () => {
      assert.strictEqual(onlyElementSync(element), "element");
    });
    it("throws an error if there is more than one element in the iterable", () => {
      assert.throws(() => onlyElementSync(elements));
    });
    it("throws a conflict error if there is more than one element in the iterable", () => {
      try {
        onlyElementSync(elements);
      } catch (error) {
        assert.deepStrictEqual(error.conflicts, ["first", "second"]);
      }
    });
  });
  describe("allElements", () => {
    const elements = [-1, 0, 1];
    const asyncIterable = (): AsyncIterable<number> =>
      (async function* (): AsyncIterable<number> {
        yield* elements;
      })();
    it("contains the correct amount of elements", async () => {
      assert.strictEqual(
        (await allElements(asyncIterable())).length,
        elements.length,
        "Actual async iterable array and elements array differ in size.",
      );
    });
    it("contains all the elements of the iterable", async () => {
      const asyncIterableArray = await allElements(asyncIterable());
      for (const element of elements) {
        assert.isTrue(
          asyncIterableArray.includes(element),
          `Async iterable array did not contain the element ${element}`,
        );
      }
    });
    it("returns all the elements of the iterable in order", async () => {
      assert.deepStrictEqual(await allElements(asyncIterable()), elements);
    });
  });
  describe("allElementsSync", () => {
    const elements = [-1, 0, 1];
    it("contains the correct amount of elements", () => {
      assert.strictEqual(
        allElementsSync(elements).length,
        elements.length,
        "Actual async iterable array and elements array differ in size.",
      );
    });
    it("contains all the elements of the iterable", () => {
      const syncIterableArray = allElementsSync(elements);
      for (const element of elements) {
        assert.isTrue(
          syncIterableArray.includes(element),
          `Async iterable array did not contain the element ${element}`,
        );
      }
    });
    it("returns all the elements of the iterable in order", () => {
      assert.deepStrictEqual(allElementsSync(elements), elements);
    });
  });
});
