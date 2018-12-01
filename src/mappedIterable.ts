/**
 * Constructs an iterable over mapped elements of the given iterable.
 * @param values The values to map.
 * @param map The mapping function to execute on each iterated values.
 * @returns An iterable over all the defined mappings of iterated values.
 */
export const mappedIterable = <T, K>(
  values: Iterable<T>,
  map: (value: T) => undefined | null | K | K[],
): Iterable<K> => {
  let buffer: null | K | K[] = null;
  const iterator = values[Symbol.iterator]();
  let iteratorDone: boolean = false;
  return {
    [Symbol.iterator]: (): Iterator<K> => {
      return {
        next: (): IteratorResult<K> => {
          while (buffer === null && !iteratorDone) {
            const { done, value } = iterator.next();
            iteratorDone = done;
            if (value !== undefined) {
              const values: undefined | null | K | K[] = map(value);
              if (values !== undefined && values !== null) {
                buffer = values;
              }
            }
          }
          if (buffer === null) {
            return {
              done: true,
              value: undefined,
            };
          } else {
            let value: undefined | K;
            if (Array.isArray(buffer)) {
              value = buffer.shift();
              if (buffer.length === 0) {
                buffer = null;
              }
            } else {
              value = buffer;
              buffer = null;
            }
            return {
              done: value === null,
              value,
            };
          }
        },
      };
    },
  };
};

/**
 * Constructs an asynchronous iterable over asynchronously mapped elements of
 * the given iterable.
 * @param values The values to map.
 * @param map The asynchronous mapping function to execute on each iterated
 * values.
 * @returns An iterable over all the defined mappings of iterated values.
 */
export const asyncMappedIterable = <T, K>(
  values: Iterable<T> | AsyncIterable<T>,
  map: (value: T) => Promise<undefined | null | K | K[]>,
): AsyncIterable<K> => {
  let buffer: null | K | K[] = null;
  const iterator: Iterator<T> | AsyncIterator<T> = values[Symbol.asyncIterator]
    ? values[Symbol.asyncIterator]()
    : values[Symbol.iterator]();
  let iteratorDone: boolean = false;
  return {
    [Symbol.asyncIterator]: (): AsyncIterator<K> => {
      return {
        next: (): Promise<IteratorResult<K>> =>
          new Promise<IteratorResult<K>>(async (resolve, reject) => {
            while (buffer === null && !iteratorDone) {
              try {
                const { done, value } = await iterator.next();
                iteratorDone = done;
                if (value !== undefined) {
                  const values: undefined | null | K | K[] = await map(value);
                  if (values !== undefined && values !== null) {
                    buffer = values;
                  }
                }
              } catch (error) {
                reject(error);
              }
            }
            if (buffer === null) {
              resolve({
                done: true,
                value: undefined,
              });
            } else {
              let value: undefined | K;
              if (Array.isArray(buffer)) {
                value = buffer.shift();
                if (buffer.length === 0) {
                  buffer = null;
                }
              } else {
                value = buffer;
                buffer = null;
              }
              resolve({
                done: value === null,
                value,
              });
            }
          }),
      };
    },
  };
};
