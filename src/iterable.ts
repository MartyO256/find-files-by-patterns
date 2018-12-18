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

/**
 * Retrieves the first element of an iterable.
 * @param iterable The iterable from which to retrieve the first element.
 * @return The first element of the given iterable.
 */
export const firstElement = async <T>(
  iterable: AsyncIterable<T>,
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
 * Constructs an error for conflicting elements.
 * @param firstElement The first conflicting element.
 * @param secondElement The second conflicting element.
 * @returns The error to throw in case of conflicting elements.
 */
const conflictingElementsError = <T>(firstElement: T, secondElement: T) =>
  new Error(`${firstElement} is conflicting with ${secondElement}`);

/**
 * Retrieves the first and only element of an iterable.
 * @param iterable The iterable from which to retrieve the first and only
 * element.
 * @throws If there is more than one element in the iterable.
 * @return The first and only element of the given iterable.
 */
export const strictFirstElement = async <T>(
  iterable: AsyncIterable<T>,
): Promise<T | null> => {
  let retainedElement: T;
  for await (const element of iterable) {
    if (retainedElement === undefined) {
      retainedElement = element;
    } else {
      throw conflictingElementsError(element, retainedElement);
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
export const strictFirstElementSync = <T>(iterable: Iterable<T>): T | null => {
  let retainedElement: T;
  for (const element of iterable) {
    if (retainedElement === undefined) {
      retainedElement = element;
    } else {
      throw conflictingElementsError(element, retainedElement);
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
  iterable: AsyncIterable<T>,
): Promise<T[]> => asyncIterableToArray(iterable);

/**
 * Retrieves all the elements of an iterable. The iterable should be finite.
 * @param iterable The iterable from which to retrieve all the elements.
 * @return The array of all the elements of the given iterable in sequential
 * order.
 */
export const allElementsSync = <T>(iterable: Iterable<T>): T[] => [...iterable];
