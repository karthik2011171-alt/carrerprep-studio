import { useCallback } from 'react';
import useLocalStorage from './useLocalStorage';
import { DEFAULT_SETTINGS, KEYS } from '../utils/localStorage';

export default function useSettings() {
  const [stored, setStored] = useLocalStorage(KEYS.settings, {});
  const settings = { ...DEFAULT_SETTINGS, ...stored };
  const update = useCallback((patch) => setStored((cur) => ({ ...cur, ...patch })), [setStored]);
  return [settings, update];
}
