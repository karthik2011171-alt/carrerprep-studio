import { useCallback, useEffect, useRef, useState } from 'react';
import { read, subscribe, write } from '../utils/localStorage';

export default function useLocalStorage(key, initial) {
  const initialRef = useRef(initial);
  const [value, setValue] = useState(() => read(key, initialRef.current));

  useEffect(
    () =>
      subscribe((e) => {
        if (e.type === 'storage' || e.detail === key) setValue(read(key, initialRef.current));
      }),
    [key]
  );

  const set = useCallback(
    (next) => {
      const resolved = typeof next === 'function' ? next(read(key, initialRef.current)) : next;
      write(key, resolved);
      setValue(resolved);
    },
    [key]
  );

  return [value, set];
}
