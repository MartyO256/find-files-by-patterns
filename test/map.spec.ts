import { rejects } from "assert";
import { assert } from "chai";

import { asyncIterableToArray } from "../src/iterable";
import { multiMap, multiMapSync, simpleMap, simpleMapSync } from "../src/map";

describe("map", () => {
  const error = async () => errorSync();
  const errorSync = () => {
    throw new Error();
  };
  describe("simpleMap", () => {
    it("should correctly map the values", async () => {
      assert.deepStrictEqual(
        await asyncIterableToArray(simpleMap([-1, 0, 1], (i) => 2 * i)),
        [-2, 0, 2],
      );
    });
    it("should correctly map iterable values", async () => {
      assert.deepStrictEqual(
        await asyncIterableToArray(simpleMap(["-1", "0", "1"], (i) => `${i}0`)),
        ["-10", "00", "10"],
      );
    });
    it("should throw an error if the mapping function throws an error", async () => {
      rejects(asyncIterableToArray(simpleMap([0, 1, 2, 3], error)));
    });
  });
  describe("simpleMapSync", () => {
    it("should correctly map the values", () => {
      assert.deepStrictEqual(
        [...simpleMapSync([-1, 0, 1], (i) => 2 * i)],
        [-2, 0, 2],
      );
    });
    it("should correctly map iterable values", () => {
      assert.deepStrictEqual(
        [...simpleMapSync(["-1", "0", "1"], (i) => `${i}0`)],
        ["-10", "00", "10"],
      );
    });
    it("should throw an error if the mapping function throws an error", () => {
      assert.throws(() => [...simpleMapSync([0, 1, 2, 3], errorSync)]);
    });
  });
  describe("multiMap", () => {
    it("should correctly map simple values", async () => {
      assert.deepStrictEqual(
        await asyncIterableToArray(multiMap([-1, 0, 1], async (i) => 2 * i)),
        [-2, 0, 2],
      );
    });
    it("should correctly map multiple values", async () => {
      assert.deepStrictEqual(
        await asyncIterableToArray(
          multiMap([-1, 0, 1], async (i) => [i, 2 * i]),
        ),
        [-1, -2, 0, 0, 1, 2],
      );
    });
    it("should correctly map simple and multiple values", async () => {
      assert.deepStrictEqual(
        await asyncIterableToArray(
          multiMap([-1, 0, 1], async (i) => (i % 2 === 0 ? i : [i, 2 * i])),
        ),
        [-1, -2, 0, 1, 2],
      );
    });
    it("should correctly map simple string values", async () => {
      assert.deepStrictEqual(
        await asyncIterableToArray(
          multiMap(["-1", "0", "1"], async (i) => `${i}0`),
        ),
        ["-10", "00", "10"],
      );
    });
    it("should correctly map multiple string values", async () => {
      assert.deepStrictEqual(
        await asyncIterableToArray(
          multiMap(["-1", "0", "1"], async (i) => [i, `${i}0`]),
        ),
        ["-1", "-10", "0", "00", "1", "10"],
      );
    });
    it("should correctly map simple and multiple string values", async () => {
      assert.deepStrictEqual(
        await asyncIterableToArray(
          multiMap(["-1", "0", "1"], async (i) =>
            i === "0" ? i : [i, `${i}0`],
          ),
        ),
        ["-1", "-10", "0", "1", "10"],
      );
    });
    it("should throw an error if the mapping function throws an error", async () => {
      rejects(asyncIterableToArray(multiMap([0, 1, 2, 3], error)));
    });
  });
  describe("multiMapSync", () => {
    it("should correctly map simple values", () => {
      assert.deepStrictEqual(
        [...multiMapSync([-1, 0, 1], (i) => 2 * i)],
        [-2, 0, 2],
      );
    });
    it("should correctly map multiple values", () => {
      assert.deepStrictEqual(
        [...multiMapSync([-1, 0, 1], (i) => [i, 2 * i])],
        [-1, -2, 0, 0, 1, 2],
      );
    });
    it("should correctly map simple and multiple values", () => {
      assert.deepStrictEqual(
        [...multiMapSync([-1, 0, 1], (i) => (i % 2 === 0 ? i : [i, 2 * i]))],
        [-1, -2, 0, 1, 2],
      );
    });
    it("should correctly map simple string values", () => {
      assert.deepStrictEqual(
        [...multiMapSync(["-1", "0", "1"], (i) => `${i}0`)],
        ["-10", "00", "10"],
      );
    });
    it("should correctly map multiple string values", () => {
      assert.deepStrictEqual(
        [...multiMapSync(["-1", "0", "1"], (i) => [i, `${i}0`])],
        ["-1", "-10", "0", "00", "1", "10"],
      );
    });
    it("should correctly map simple and multiple string values", () => {
      assert.deepStrictEqual(
        [
          ...multiMapSync(["-1", "0", "1"], (i) =>
            i === "0" ? i : [i, `${i}0`],
          ),
        ],
        ["-1", "-10", "0", "1", "10"],
      );
    });
    it("should throw an error if the mapping function throws an error", () => {
      assert.throws(() => [...multiMapSync([0, 1, 2, 3], errorSync)]);
    });
  });
});
