import { useCallback } from 'react';
import useLocalStorage from './useLocalStorage';
import { KEYS } from '../utils/localStorage';

// Bookmark ids are stable: `${type}:${itemId}` (e.g. "question:py-1", "flashcard:fc-3")
export default function useBookmarks() {
  const [items, setItems] = useLocalStorage(KEYS.bookmarks, []);

  const isBookmarked = useCallback((id) => items.some((b) => b.id === id), [items]);

  const toggle = useCallback(
    (item) => {
      const exists = items.some((b) => b.id === item.id);
      const now = new Date().toISOString();
      setItems((cur) =>
        exists ? cur.filter((b) => b.id !== item.id) : [{ ...item, note: '', done: false, createdAt: now, updatedAt: now }, ...cur]
      );
      return !exists;
    },
    [items, setItems]
  );

  const update = useCallback(
    (id, patch) => setItems((cur) => cur.map((b) => (b.id === id ? { ...b, ...patch, updatedAt: new Date().toISOString() } : b))),
    [setItems]
  );

  const remove = useCallback((id) => setItems((cur) => cur.filter((b) => b.id !== id)), [setItems]);

  return { items, isBookmarked, toggle, update, remove };
}
