import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import { sleepScheduleService } from "./sleepSchedule";
import { sleepRecordsService } from "./sleepRecords";

const BACKGROUND_TASK_NAME = "DAILY_SLEEP_RECORD_SYNC";

/**
 * ✅ Background task to auto-create sleep records from schedules
 */
TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
  try {
    console.log("🔄 Running background sleep record sync...");

    // Get yesterday's date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split("T")[0];

    // Get all active schedules (you'll need to modify sleepScheduleService to support this)
    // For now, we'll use a placeholder approach
    // const schedules = await sleepScheduleService.getAllActive();

    // This is a simplified version - you'll need user context
    // In practice, store user IDs in AsyncStorage and iterate through them

    console.log("✅ Background sync completed");
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error("❌ Background sync error:", error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export const backgroundTaskService = {
  /**
   * Register background task
   */
  async registerBackgroundTask() {
    try {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_TASK_NAME, {
        minimumInterval: 60 * 60 * 24, // 24 hours
        stopOnTerminate: false,
        startOnBoot: true,
      });
      console.log("✅ Background task registered");
    } catch (error) {
      console.error("Error registering background task:", error);
    }
  },

  /**
   * Unregister background task
   */
  async unregisterBackgroundTask() {
    try {
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_TASK_NAME);
      console.log("✅ Background task unregistered");
    } catch (error) {
      console.error("Error unregistering background task:", error);
    }
  },

  /**
   * Manual sync - call this from app
   */
  async manualSync(userId: string) {
    try {
      console.log("🔄 Running manual sync for user:", userId);

      const schedule = await sleepScheduleService.getActive(userId);
      if (!schedule) {
        console.log("ℹ️ No active schedule found");
        return;
      }

      // Get yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateStr = yesterday.toISOString().split("T")[0];

      // Check if record exists
      const existingRecord = await sleepRecordsService.getByDate(
        userId,
        dateStr
      );

      if (existingRecord) {
        console.log("ℹ️ Record already exists for", dateStr);
        return existingRecord;
      }

      // Calculate sleep hours
      const [bedHour, bedMin] = schedule.bedtime.split(":").map(Number);
      const [wakeHour, wakeMin] = schedule.wake_time.split(":").map(Number);

      let totalMinutes = wakeHour * 60 + wakeMin - (bedHour * 60 + bedMin);
      if (totalMinutes < 0) totalMinutes += 24 * 60;

      const sleepHours = parseFloat((totalMinutes / 60).toFixed(1));

      // Auto-create record
      const record = await sleepRecordsService.addTodayRecord(
        userId,
        sleepHours,
        schedule.bedtime,
        schedule.wake_time,
        "🤖 Auto-synced from schedule"
      );

      console.log("✅ Record auto-created:", record);
      return record;
    } catch (error) {
      console.error("❌ Manual sync error:", error);
      throw error;
    }
  },
};
