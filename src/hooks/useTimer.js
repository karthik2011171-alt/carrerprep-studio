import { useCallback, useEffect, useRef, useState } from 'react';

export default function useTimer() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const startedAt = useRef(0);
  const offset = useRef(0);

  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => setSeconds(offset.current + Math.floor((Date.now() - startedAt.current) / 1000)), 250);
    return () => clearInterval(id);
  }, [running]);

  const start = useCallback(() => {
    startedAt.current = Date.now();
    setRunning(true);
  }, []);

  const stop = useCallback(() => {
    const total = offset.current + Math.floor((Date.now() - startedAt.current) / 1000);
    offset.current = total;
    setSeconds(total);
    setRunning(false);
    return total;
  }, []);

  const reset = useCallback(() => {
    offset.current = 0;
    setSeconds(0);
    setRunning(false);
  }, []);

  return { seconds, running, start, stop, reset };
}
