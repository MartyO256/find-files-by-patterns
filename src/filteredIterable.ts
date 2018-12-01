import { matches } from "./matcher";

/**
 * Constructs an iterable over the elements of a given iterable that pass a
 * given sequence of tests.
 * @param values The values to filter.
 * @param tests The sequence of tests a value must pass in order to be iterated
 * over by the returned iterable.
 * @returns An iterable over the filtered values of the given iterable.
 */
export const filteredIterable = <T>(
  values: Iterable<T>,
  tests: Array<(value: T) => boolean>,
): Iterable<T> => {
  if (tests.length === 0) {
    return values;
  }
  const iterator = values[Symbol.iterator]();
  return {
    [Symbol.iterator]: (): Iterator<T> => {
      return {
        next: (): IteratorResult<T> => {
          let value: undefined | T;
          do {
            value = iterator.next().value;
          } while (value !== undefined && !matches<T>(value, tests));
          return {
            done: value === undefined,
            value,
          };
        },
      };
    },
  };
};
