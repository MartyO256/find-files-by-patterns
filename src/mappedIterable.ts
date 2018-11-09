/**
 * Constructs an iterable over mapped elements of the given iterable.
 * @param values The values to map.
 * @param map The mapping function to execute on each iterated values.
 * @returns An iterable over al the defined mappings of iterated values.
 */
export const mappedIterable = <T, K>(
  values: Iterable<T>,
  map: (value: T) => undefined | K | K[],
): Iterable<K> => {
  let buffer: undefined | K | K[];
  const iterator = values[Symbol.iterator]();
  let iteratorDone: boolean = false;
  return {
    [Symbol.iterator]: (): Iterator<K> => {
      return {
        next: (): IteratorResult<K> => {
          while (buffer === undefined && !iteratorDone) {
            const { done, value } = iterator.next();
            iteratorDone = done;
            if (value !== undefined) {
              const values: undefined | K | K[] = map(value);
              if (values !== undefined) {
                buffer = values;
              }
            }
          }
          if (buffer === undefined) {
            return {
              done: true,
              value: undefined as any,
            };
          } else {
            let value: undefined | K;
            if (Array.isArray(buffer)) {
              value = buffer.shift();
              if (buffer.length === 0) {
                buffer = undefined;
              }
            } else {
              value = buffer;
              buffer = undefined;
            }
            return {
              done: value === undefined,
              value: value as any,
            };
          }
        },
      };
    },
  };
};
