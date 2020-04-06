import { rejects } from "assert";
import { assert } from "chai";

import { allElements } from "../src/iterable";
import { multiMap, multiMapSync, simpleMap, simpleMapSync } from "../src/map";

describe("map", () => {
  const errorSync = (): null => {
    throw new Error();
  };
  const error = async (): Promise<null> => errorSync();
  describe("simpleMap", () => {
    it("maps the values", async () => {
      assert.deepStrictEqual(
        await allElements(simpleMap([-1, 0, 1], (i) => 2 * i)),
        [-2, 0, 2],
      );
    });
    it("maps iterable values", async () => {
      assert.deepStrictEqual(
        await allElements(simpleMap(["-1", "0", "1"], (i) => `${i}0`)),
        ["-10", "00", "10"],
      );
    });
    it("throws an error if the mapping function throws an error", async () => {
      rejects(allElements(simpleMap([0, 1, 2, 3], error)));
    });
  });
  describe("simpleMapSync", () => {
    it("maps the values", () => {
      assert.deepStrictEqual(
        [...simpleMapSync([-1, 0, 1], (i) => 2 * i)],
        [-2, 0, 2],
      );
    });
    it("maps iterable values", () => {
      assert.deepStrictEqual(
        [...simpleMapSync(["-1", "0", "1"], (i) => `${i}0`)],
        ["-10", "00", "10"],
      );
    });
    it("throws an error if the mapping function throws an error", () => {
      assert.throws(() => [...simpleMapSync([0, 1, 2, 3], errorSync)]);
    });
  });
  describe("multiMap", () => {
    it("maps simple values", async () => {
      assert.deepStrictEqual(
        await allElements(multiMap([-1, 0, 1], async (i) => 2 * i)),
        [-2, 0, 2],
      );
    });
    it("maps multiple values", async () => {
      assert.deepStrictEqual(
        await allElements(multiMap([-1, 0, 1], async (i) => [i, 2 * i])),
        [-1, -2, 0, 0, 1, 2],
      );
    });
    it("maps simple and multiple values", async () => {
      assert.deepStrictEqual(
        await allElements(
          multiMap([-1, 0, 1], async (i) => (i % 2 === 0 ? i : [i, 2 * i])),
        ),
        [-1, -2, 0, 1, 2],
      );
    });
    it("maps simple string values", async () => {
      assert.deepStrictEqual(
        await allElements(multiMap(["-1", "0", "1"], async (i) => `${i}0`)),
        ["-10", "00", "10"],
      );
    });
    it("maps multiple string values", async () => {
      assert.deepStrictEqual(
        await allElements(
          multiMap(["-1", "0", "1"], async (i) => [i, `${i}0`]),
        ),
        ["-1", "-10", "0", "00", "1", "10"],
      );
    });
    it("maps simple and multiple string values", async () => {
      assert.deepStrictEqual(
        await allElements(
          multiMap(["-1", "0", "1"], async (i) =>
            i === "0" ? i : [i, `${i}0`],
          ),
        ),
        ["-1", "-10", "0", "1", "10"],
      );
    });
    it("throws an error if the mapping function throws an error", async () => {
      rejects(allElements(multiMap([0, 1, 2, 3], error)));
    });
  });
  describe("multiMapSync", () => {
    it("maps simple values", () => {
      assert.deepStrictEqual(
        [...multiMapSync([-1, 0, 1], (i) => 2 * i)],
        [-2, 0, 2],
      );
    });
    it("maps multiple values", () => {
      assert.deepStrictEqual(
        [...multiMapSync([-1, 0, 1], (i) => [i, 2 * i])],
        [-1, -2, 0, 0, 1, 2],
      );
    });
    it("maps simple and multiple values", () => {
      assert.deepStrictEqual(
        [...multiMapSync([-1, 0, 1], (i) => (i % 2 === 0 ? i : [i, 2 * i]))],
        [-1, -2, 0, 1, 2],
      );
    });
    it("maps simple string values", () => {
      assert.deepStrictEqual(
        [...multiMapSync(["-1", "0", "1"], (i) => `${i}0`)],
        ["-10", "00", "10"],
      );
    });
    it("maps multiple string values", () => {
      assert.deepStrictEqual(
        [...multiMapSync(["-1", "0", "1"], (i) => [i, `${i}0`])],
        ["-1", "-10", "0", "00", "1", "10"],
      );
    });
    it("maps simple and multiple string values", () => {
      assert.deepStrictEqual(
        [
          ...multiMapSync(["-1", "0", "1"], (i) =>
            i === "0" ? i : [i, `${i}0`],
          ),
        ],
        ["-1", "-10", "0", "1", "10"],
      );
    });
    it("throws an error if the mapping function throws an error", () => {
      assert.throws(() => [...multiMapSync([0, 1, 2, 3], errorSync)]);
    });
  });
});
