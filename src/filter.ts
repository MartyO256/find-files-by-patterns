/**
 * A filter is a test function which determines whether or not a given element
 * should be kept.
 * @param element The element to filter in or out.
 */
export type Filter<T> = (element: T) => Promise<boolean>;

/**
 * A filter is a test function which determines whether or not a given element
 * should be kept.
 * @param element The element to filter in or out.
 */
export type FilterSync<T> = (element: T) => boolean;

/**
 * A filter compounder is a test function which combines a sequence of filters.
 * @typeparam T The type of elements to filter.
 * @param filters The sequence of filters to combine into one.
 */
export type FilterCompounder = <T>(
  filters: Array<Filter<T> | FilterSync<T>>,
) => Filter<T>;

/**
 * A filter compounder is a test function which combines a sequence of filters.
 * @typeparam T The type of elements to filter.
 * @param filters The sequence of filters to combine into one.
 */
export type FilterCompounderSync = <T>(
  filters: Array<FilterSync<T>>,
) => FilterSync<T>;

/**
 * A conjunction is a filter which combines a given array of filters using
 * logical conjunction. This means that any element that passes the combined
 * test has passed all of the filters.
 * @typeparam T The type of elements to filter.
 * @param filters The filters to combine in conjunction.
 * @returns The logical conjunction of the given tests.
 */
export const conjunction: FilterCompounder =
  <T>(filters: Array<Filter<T> | FilterSync<T>>): Filter<T> =>
  async (element: T): Promise<boolean> => {
    for (const filter of filters) {
      if (!(await filter(element))) {
        return false;
      }
    }
    return true;
  };

/**
 * A conjunction is a filter which combines a given array of filters using
 * logical conjunction. This means that any element that passes the combined
 * test has passed all of the filters.
 * @typeparam T The type of elements to filter.
 * @param filters The filters to combine in conjunction.
 * @returns The logical conjunction of the given tests.
 */
export const conjunctionSync: FilterCompounderSync =
  <T>(filters: Array<FilterSync<T>>): FilterSync<T> =>
  (element: T): boolean => {
    for (const filter of filters) {
      if (!filter(element)) {
        return false;
      }
    }
    return true;
  };

/**
 * A disjunction is a filter which combines a given array of filters using
 * logical disjunction. This means that any element that passes the combined
 * test has passed at least one of the filters.
 * @typeparam T The type of elements to filter.
 * @param filters The filters to combine in disjunction.
 * @returns The logical disjunction of the given tests.
 */
export const disjunction: FilterCompounder =
  <T>(filters: Array<Filter<T> | FilterSync<T>>): Filter<T> =>
  async (element: T): Promise<boolean> => {
    for (const filter of filters) {
      if (await filter(element)) {
        return true;
      }
    }
    return false;
  };

/**
 * A disjunction is a filter which combines a given array of filters using
 * logical disjunction. This means that any element that passes the combined
 * test has passed at least one of the filters.
 * @typeparam T The type of elements to filter.
 * @param filters The filters to combine in disjunction.
 * @returns The logical disjunction of the given tests.
 */

export const disjunctionSync: FilterCompounderSync =
  <T>(filters: Array<FilterSync<T>>): FilterSync<T> =>
  (element: T): boolean => {
    for (const filter of filters) {
      if (filter(element)) {
        return true;
      }
    }
    return false;
  };

/**
 * Filters out elements of an iterable which don't pass a given filter.
 * @typeparam T The type of elements to filter.
 * @param iterable The iterable to filter.
 * @param filter The filter an element must pass in order to be filtered in.
 * @throws If the filter throws an error for any of the elements of the
 * iterable.
 * @returns An iterable over the filtered elements.
 */
export async function* filter<T>(
  iterable: Iterable<T> | AsyncIterable<T>,
  filter: Filter<T> | FilterSync<T>,
): AsyncIterable<T> {
  for await (const element of iterable) {
    if (await filter(element)) {
      yield element;
    }
  }
}

/**
 * Filters out elements of an iterable which don't pass a given filter.
 * @typeparam T The type of elements to filter.
 * @param iterable The iterable to filter.
 * @param filter The filter an element must pass in order to be filtered in.
 * @throws If the filter throws an error for any of the elements of the
 * iterable.
 * @returns An iterable over the filtered elements.
 */
export function* filterSync<T>(
  iterable: Iterable<T>,
  filter: FilterSync<T>,
): Iterable<T> {
  for (const element of iterable) {
    if (filter(element)) {
      yield element;
    }
  }
}
