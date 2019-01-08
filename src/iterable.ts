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
 * Retrieves the first element of an iterable.
 * @param iterable The iterable from which to retrieve the first element.
 * @return The first element of the given iterable.
 */
export const firstElement = async <T>(
  iterable: Iterable<T> | AsyncIterable<T>,
): Promise<T | null> => {
  for await (const element of iterable) {
    return element;
  }
  return null;
};

/**
 * Retrieves the first element of an iterable.
 * @param iterable The iterable from which to retrieve the first element.
 * @return The first element of the given iterable.
 */
export const firstElementSync = <T>(iterable: Iterable<T>): T | null => {
  for (const element of iterable) {
    return element;
  }
  return null;
};

/**
 * A conflict error occurs when multiple elements should not be yielded by an
 * iterable.
 */
export interface ConflictError<T> extends Error {
  /**
   * The conflicting elements which are the cause of the error.
   */
  conflicts: T[];
}

/**
 * Constructs an error for conflicting elements.
 * @param conflicts The conflicting elements.
 * @returns The error to throw in case of conflicting elements.
 */
const conflictingElementsError = <T>(...conflicts: T[]): ConflictError<T> => ({
  ...new Error(`The following elements are conflicting: ${conflicts}`),
  conflicts,
});

/**
 * Retrieves the first and only element of an iterable.
 * @param iterable The iterable from which to retrieve the first and only
 * element.
 * @throws If there is more than one element in the iterable.
 * @return The first and only element of the given iterable.
 */
export const onlyElement = async <T>(
  iterable: Iterable<T> | AsyncIterable<T>,
): Promise<T | null> => {
  let retainedElement: T;
  for await (const element of iterable) {
    if (retainedElement === undefined) {
      retainedElement = element;
    } else {
      throw conflictingElementsError(retainedElement, element);
    }
  }
  return retainedElement;
};

/**
 * Retrieves the first and only element of an iterable.
 * @param iterable The iterable from which to retrieve the first and only
 * element.
 * @throws If there is more than one element in the iterable.
 * @return The first and only element of the given iterable.
 */
export const onlyElementSync = <T>(iterable: Iterable<T>): T | null => {
  let retainedElement: T;
  for (const element of iterable) {
    if (retainedElement === undefined) {
      retainedElement = element;
    } else {
      throw conflictingElementsError(retainedElement, element);
    }
  }
  return retainedElement;
};

/**
 * Retrieves all the elements of an iterable. The iterable should be finite.
 * @param iterable The iterable from which to retrieve all the elements.
 * @return The array of all the elements of the given iterable in sequential
 * order.
 */
export const allElements = async <T>(
  iterable: Iterable<T> | AsyncIterable<T>,
): Promise<T[]> => {
  const array: T[] = [];
  for await (const element of iterable) {
    array.push(element);
  }
  return array;
};

/**
 * Retrieves all the elements of an iterable. The iterable should be finite.
 * @param iterable The iterable from which to retrieve all the elements.
 * @return The array of all the elements of the given iterable in sequential
 * order.
 */
export const allElementsSync = <T>(iterable: Iterable<T>): T[] => [...iterable];
