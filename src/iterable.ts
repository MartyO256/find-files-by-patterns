/**
 * Determines whether or not a given non-null object is of type iterable. It
 * cannot however determine the type of values that are iterated by the object's
 * iterator.
 * @param object The non-null object to check.
 * @returns Whether or not the given object is of type iterable.
 */
export const isIterable = <T>(object): object is Iterable<T> =>
  typeof object[Symbol.iterator] === "function";

/**
 * Determines whether or not a given non-null object is of type asynchronous
 * iterable. It cannot however determine the type of values that are iterated by
 * the object's asynchronous iterator.
 * @param object The non-null object to check.
 * @returns Whether or not the given object is of type asynchronous iterable.
 */
export const isAsyncIterable = <T>(object): object is AsyncIterable<T> =>
  typeof object[Symbol.asyncIterator] === "function";

/**
 * Converts an asynchronous iterable to an array. The given iterable should be
 * finite.
 * @param iterable The finite iterable to convert.
 * @returns The array consisting of the elements asynchronously iterated over by
 * the given iterable.
 */
export const asyncIterableToArray = async <T>(
  iterable: AsyncIterable<T>,
): Promise<T[]> => {
  const array: T[] = [];
  for await (const element of iterable) {
    array.push(element);
  }
  return array;
};
