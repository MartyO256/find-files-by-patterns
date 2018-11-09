/**
 * A concatenated iterable is an iterable over the values of the given
 * iterables, traversed and returned in order. This allows for the concatenation
 * of arrays without creating additional arrays. The returned iterable keeps
 * track of the current iterator being emptied, then goes on to the next once it
 * is depleted.
 * @param values The iterables to concatenate.
 * @returns An iterable over all the elements of the given iterables.
 */
export const concatenatedIterable = <T>(
  ...values: Array<Iterable<T>>
): Iterable<T> => {
  const valuesIterator: Iterator<Iterable<T>> = values[Symbol.iterator]();
  let valuesIteratorDone: boolean = false;
  let currentIterator: undefined | Iterator<T>;
  return {
    [Symbol.iterator]: (): Iterator<T> => {
      return {
        next: (): IteratorResult<T> => {
          let value: undefined | T;
          do {
            while (!currentIterator && !valuesIteratorDone) {
              const { value } = valuesIterator.next();
              if (value) {
                currentIterator = value[Symbol.iterator]();
              } else {
                valuesIteratorDone = true;
              }
            }
            if (currentIterator) {
              const next = currentIterator.next();
              if (next.done) {
                currentIterator = undefined;
              }
              value = next.value;
            }
          } while (!valuesIteratorDone && value === undefined);
          return {
            done: value === undefined,
            value: value as any,
          };
        },
      };
    },
  };
};
