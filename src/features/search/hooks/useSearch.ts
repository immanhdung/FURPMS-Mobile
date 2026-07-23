import { useState, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { mmkv } from '@/services/storage.service';
import { MMKV_KEYS } from '@/constants/storageKeys';
import { searchService } from '../services/search.service';
import type { SearchResult } from '../types/search.types';

const MAX_HISTORY = 10;
const DEBOUNCE_MS = 350;

function loadHistory(): string[] {
  try {
    const raw = mmkv.getString(MMKV_KEYS.SEARCH_HISTORY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(history: string[]) {
  mmkv.set(MMKV_KEYS.SEARCH_HISTORY, JSON.stringify(history));
}

export function useSearch() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [history, setHistory] = useState<string[]>(loadHistory);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data, isFetching, error } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => searchService.search(debouncedQuery),
    enabled: debouncedQuery.trim().length >= 2,
    staleTime: 30_000,
    gcTime: 2 * 60_000,
  });

  const handleQueryChange = useCallback((text: string) => {
    setQuery(text);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(text);
    }, DEBOUNCE_MS);
  }, []);

  const commitToHistory = useCallback((term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setHistory((prev) => {
      const updated = [trimmed, ...prev.filter((h) => h !== trimmed)].slice(0, MAX_HISTORY);
      saveHistory(updated);
      return updated;
    });
  }, []);

  const handleResultSelect = useCallback(
    (result: SearchResult) => {
      commitToHistory(query);
    },
    [query, commitToHistory],
  );

  const handleHistorySelect = useCallback(
    (term: string) => {
      setQuery(term);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      setDebouncedQuery(term);
    },
    [],
  );

  const removeHistoryItem = useCallback((term: string) => {
    setHistory((prev) => {
      const updated = prev.filter((h) => h !== term);
      saveHistory(updated);
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    saveHistory([]);
  }, []);

  const clearQuery = useCallback(() => {
    setQuery('');
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    setDebouncedQuery('');
  }, []);

  const results = data?.results ?? [];
  const total = data?.total ?? 0;
  const isSearching = debouncedQuery.trim().length >= 2 && isFetching;
  const showHistory = !debouncedQuery.trim() && history.length > 0;
  const showEmpty = debouncedQuery.trim().length >= 2 && !isFetching && results.length === 0;

  return {
    query,
    results,
    total,
    history,
    isSearching,
    showHistory,
    showEmpty,
    error: error as Error | null,
    handleQueryChange,
    handleResultSelect,
    handleHistorySelect,
    removeHistoryItem,
    clearHistory,
    clearQuery,
  };
}
