import { isAsyncIterable, isIterable } from "./iterable.js";

/**
 * Maps the elements of an iterable using a simple mapping function.
 * @typeparam T The type of iterated elements.
 * @typeparam U The type of mapped elements.
 * @param iterable The iterable to map.
 * @param map The simple mapping function which maps the elements of the
 * iterable onto simple elements of a certain type.
 * @throws If the mapping function throws an error for any of the iterated
 * elements.
 * @returns An iterable over the mapped elements.
 */
export async function* simpleMap<T, U>(
  iterable: Iterable<T> | AsyncIterable<T>,
  map: (element: T) => U | Promise<U>,
): AsyncIterable<U> {
  for await (const element of iterable) {
    yield await map(element);
  }
}

/**
 * Maps the elements of an iterable using a simple mapping function.
 * @typeparam T The type of iterated elements.
 * @typeparam U The type of mapped elements.
 * @param iterable The iterable to map.
 * @param map The simple mapping function which maps the elements of the
 * iterable onto simple elements of a certain type.
 * @throws If the mapping function throws an error for any of the iterated
 * elements.
 * @returns An iterable over the mapped elements.
 */
export function* simpleMapSync<T, U>(
  iterable: Iterable<T>,
  map: (element: T) => U,
): Iterable<U> {
  for (const element of iterable) {
    yield map(element);
  }
}

/**
 * Maps the elements of an iterable using a multi mapping function.
 * @typeparam T The type of iterated elements.
 * @typeparam U The type of mapped elements.
 * @param iterable The iterable to map.
 * @param map The multi mapping function which maps the elements of the iterable
 * onto either simple or multiple values of a certain type. The returned type of
 * the mapping should not be iterable, unless it is a string.
 * @throws If the mapping function throws an error for any of the iterated
 * elements.
 * @returns An iterable over the mapped elements.
 */
export async function* multiMap<T, U>(
  iterable: Iterable<T> | AsyncIterable<T>,
  map: (element: T) => Promise<U | Iterable<U> | AsyncIterable<U>>,
): AsyncIterable<U> {
  for await (const element of iterable) {
    const mapped = await map(element);
    if (
      typeof mapped !== "string" &&
      (isIterable(mapped) || isAsyncIterable(mapped))
    ) {
      yield* mapped;
    } else {
      yield mapped;
    }
  }
}

/**
 * Maps the elements of an iterable using a multi mapping function.
 * @typeparam T The type of iterated elements.
 * @typeparam U The type of mapped elements.
 * @param iterable The iterable to map.
 * @param map The multi mapping function which maps the elements of the iterable
 * onto either simple or multiple values of a certain type. The returned type of
 * the mapping should not be iterable, unless it is a string.
 * @throws If the mapping function throws an error for any of the iterated
 * elements.
 * @returns An iterable over the mapped elements.
 */
export function* multiMapSync<T, U>(
  iterable: Iterable<T>,
  map: (element: T) => U | Iterable<U>,
): Iterable<U> {
  for (const element of iterable) {
    const mapped = map(element);
    if (typeof mapped !== "string" && isIterable(mapped)) {
      yield* mapped;
    } else {
      yield mapped;
    }
  }
}
