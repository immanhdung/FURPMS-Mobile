import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { httpClient } from './http.client';

const PROPOSAL_SYNC_TASK = 'FURPMS_PROPOSAL_SYNC';
const NOTIFICATION_SYNC_TASK = 'FURPMS_NOTIFICATION_SYNC';

// Tasks MUST be defined at module level (top-level), not inside functions
TaskManager.defineTask(PROPOSAL_SYNC_TASK, async () => {
  try {
    await httpClient.get('/proposals?limit=5&sort=updatedAt:desc');
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

TaskManager.defineTask(NOTIFICATION_SYNC_TASK, async () => {
  try {
    const { data } = await httpClient.get<{ count: number }>('/notifications/unread-count');
    // Badge count update is handled by the main app when it foregrounds
    return data.count > 0
      ? BackgroundFetch.BackgroundFetchResult.NewData
      : BackgroundFetch.BackgroundFetchResult.NoData;
  } catch {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export const backgroundSyncService = {
  async register(): Promise<void> {
    const status = await BackgroundFetch.getStatusAsync();

    if (
      status === BackgroundFetch.BackgroundFetchStatus.Restricted ||
      status === BackgroundFetch.BackgroundFetchStatus.Denied
    ) {
      console.warn('[BackgroundSync] Background fetch is restricted or denied');
      return;
    }

    await registerTask(PROPOSAL_SYNC_TASK, 60 * 20); // every 20 min
    await registerTask(NOTIFICATION_SYNC_TASK, 60 * 5); // every 5 min
  },

  async unregister(): Promise<void> {
    await unregisterTask(PROPOSAL_SYNC_TASK);
    await unregisterTask(NOTIFICATION_SYNC_TASK);
  },

  async getStatus(): Promise<BackgroundFetch.BackgroundFetchStatus | null> {
    return BackgroundFetch.getStatusAsync();
  },
};

async function registerTask(taskName: string, intervalSeconds: number): Promise<void> {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(taskName);
    if (!isRegistered) {
      await BackgroundFetch.registerTaskAsync(taskName, {
        minimumInterval: intervalSeconds,
        stopOnTerminate: false,
        startOnBoot: true,
      });
    }
  } catch (err) {
    console.warn(`[BackgroundSync] Failed to register ${taskName}:`, err);
  }
}

async function unregisterTask(taskName: string): Promise<void> {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(taskName);
    if (isRegistered) {
      await BackgroundFetch.unregisterTaskAsync(taskName);
    }
  } catch (err) {
    console.warn(`[BackgroundSync] Failed to unregister ${taskName}:`, err);
  }
}
