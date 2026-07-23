import { QueryClient, type Query } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { mmkvStorage } from '@/services/storage.service';
import { MMKV_KEYS } from '@/constants/storageKeys';

// Persisted keys: these queries survive app restarts and power offline reads
const PERSISTED_QUERY_KEYS = new Set([
  'proposals',
  'memberships',
  'scores',
  'meetings',
  'notifications',
  'auth',
]);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,          // 30s — override per query for live data
      gcTime: 1000 * 60 * 60 * 24,   // 24h — keep cache long enough for offline
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      networkMode: 'offlineFirst',   // Return cached data immediately; refetch in bg
    },
    mutations: {
      retry: 1,
      networkMode: 'offlineFirst',
    },
  },
});

const persister = createSyncStoragePersister({
  storage: mmkvStorage,
  key: MMKV_KEYS.QUERY_CACHE,
  throttleTime: 1000,
  serialize: JSON.stringify,
  deserialize: JSON.parse,
});

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 1000 * 60 * 60 * 24, // 24h cache lifetime
        buster: process.env.EXPO_PUBLIC_APP_VERSION ?? '1',
        dehydrateOptions: {
          shouldDehydrateQuery: (query: Query) => {
            if (query.state.status !== 'success') return false;
            const rootKey = query.queryKey[0] as string;
            return PERSISTED_QUERY_KEYS.has(rootKey);
          },
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
