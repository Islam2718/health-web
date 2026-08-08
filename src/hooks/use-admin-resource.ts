"use client";

import { useCallback, useEffect, useState } from "react";

export function useAdminResource<T extends { id: string }>(storageKey: string, seedData: T[]) {
  const [items, setItems] = useState<T[]>(seedData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      setItems(raw ? (JSON.parse(raw) as T[]) : seedData);
    } catch {
      setItems(seedData);
    }
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const persist = useCallback(
    (next: T[]) => {
      setItems(next);
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // localStorage unavailable — demo state still works for this session
      }
    },
    [storageKey]
  );

  const getById = useCallback((id: string) => items.find((item) => item.id === id), [items]);

  const create = useCallback((item: T) => persist([item, ...items]), [items, persist]);

  const update = useCallback(
    (id: string, changes: Partial<T>) =>
      persist(items.map((item) => (item.id === id ? { ...item, ...changes } : item))),
    [items, persist]
  );

  const remove = useCallback(
    (id: string) => persist(items.filter((item) => item.id !== id)),
    [items, persist]
  );

  return { items, isLoading, getById, create, update, remove };
}
