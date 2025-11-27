import {
  scheduleAlarm,
  removeAlarm,
  stopAlarm,
  getAllAlarms,
} from "expo-alarm-module";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert, Platform, AppState } from "react-native";
import { sleepRecordsService } from "./sleepRecords"; // ✅ Import

interface ScheduleSleepReminderParams {
  bedtime: string;
  reminderBefore: number;
  reminderType: "notification" | "fullscreen";
  userId: string;
}

const STORAGE_KEY = "sleep_alarm_ids";
const ALARM_PREFIX = "sleep_alarm_";
const ALARM_METADATA_KEY = "alarm_metadata"; // ✅ Store alarm context

export const alarmService = {
  /**
   * ✅ NEW: Save alarm metadata for later record creation
   */
  async saveAlarmMetadata(userId: string, bedtime: string, wakeTime: string) {
    try {
      const metadata = {
        userId,
        bedtime,
        wakeTime,
        scheduledDate: new Date().toISOString(),
      };
      await AsyncStorage.setItem(
        `${ALARM_METADATA_KEY}_${userId}`,
        JSON.stringify(metadata)
      );
      console.log("💾 Alarm metadata saved:", metadata);
    } catch (error) {
      console.error("Error saving alarm metadata:", error);
    }
  },

  /**
   * ✅ NEW: Get alarm metadata
   */
  async getAlarmMetadata(userId: string) {
    try {
      const jsonValue = await AsyncStorage.getItem(
        `${ALARM_METADATA_KEY}_${userId}`
      );
      return jsonValue ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error("Error getting alarm metadata:", error);
      return null;
    }
  },

  /**
   * ✅ NEW: Auto-create sleep record when alarm is dismissed
   * Call this when user dismisses the alarm
   */
  async onAlarmDismissed(userId: string) {
    try {
      console.log("🛏️ Alarm dismissed, auto-creating sleep record...");

      const metadata = await this.getAlarmMetadata(userId);
      if (!metadata) {
        console.log("⚠️ No alarm metadata found");
        return;
      }

      const { bedtime, wakeTime } = metadata;

      // Calculate sleep hours
      const [bedHour, bedMin] = bedtime.split(":").map(Number);
      const [wakeHour, wakeMin] = wakeTime.split(":").map(Number);

      let totalMinutes = wakeHour * 60 + wakeMin - (bedHour * 60 + bedMin);
      if (totalMinutes < 0) totalMinutes += 24 * 60;

      const sleepHours = parseFloat((totalMinutes / 60).toFixed(1));

      // Get yesterday's date (because alarm rings in the morning)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateStr = yesterday.toISOString().split("T")[0];

      // Check if record already exists
      const existingRecord = await sleepRecordsService.getByDate(
        userId,
        dateStr
      );

      if (existingRecord) {
        console.log("ℹ️ Sleep record already exists for", dateStr);
        return existingRecord;
      }

      // Auto-create record
      const record = await sleepRecordsService.addTodayRecord(
        userId,
        sleepHours,
        bedtime,
        wakeTime,
        "📱 Auto-recorded from alarm schedule"
      );

      console.log("✅ Sleep record auto-created:", record);

      // Show success notification
      Alert.alert(
        "✅ Tidur Tercatat!",
        `Durasi tidur Anda: ${sleepHours} jam\nTidur: ${bedtime} - Bangun: ${wakeTime}\n\n💡 Data sudah tersimpan di statistik!`,
        [{ text: "OK" }]
      );

      return record;
    } catch (error) {
      console.error("❌ Error auto-creating sleep record:", error);
    }
  },

  /**
   * ✅ ENHANCED: Schedule alarm with metadata
   */
  async scheduleSleepReminder({
    bedtime,
    reminderBefore,
    reminderType,
    userId,
  }: ScheduleSleepReminderParams): Promise<string> {
    try {
      console.log("🔔 Starting alarm schedule...");

      // Cancel all previous alarms first
      await this.cancelAllAlarms();

      // Parse bedtime
      const [bedHour, bedMin] = bedtime.split(":").map(Number);

      // Calculate alarm time
      let alarmMinutes = bedHour * 60 + bedMin - reminderBefore;
      if (alarmMinutes < 0) alarmMinutes += 24 * 60;

      const alarmHour = Math.floor(alarmMinutes / 60);
      const alarmMin = alarmMinutes % 60;

      // Create alarm date
      const alarmDate = new Date();
      alarmDate.setHours(alarmHour, alarmMin, 0, 0);

      const now = new Date();
      if (alarmDate <= now) {
        alarmDate.setDate(alarmDate.getDate() + 1);
      }

      const alarmId = `${ALARM_PREFIX}${userId}_${Date.now()}`;

      console.log(`⏰ Scheduling alarm:`);
      console.log(`   - ID: ${alarmId}`);
      console.log(
        `   - Time: ${alarmHour}:${alarmMin.toString().padStart(2, "0")}`
      );
      console.log(`   - Date: ${alarmDate.toLocaleString()}`);

      // Schedule alarm
      await scheduleAlarm({
        uid: alarmId,
        day: alarmDate,
        title: "🌙 Pengingat Tidur",
        message: `Waktunya tidur pukul ${bedtime}! Tidur yang cukup penting untuk kesehatan.`,
        repeating: true,
        active: true,
        showDismiss: true,
        showSnooze: true,
        snoozeInterval: 5,
      } as any);

      console.log("✅ Alarm scheduled successfully");

      // Save alarm ID
      await this.saveAlarmId(alarmId);

      // ✅ NEW: Save metadata for auto-record
      // Note: We need wake_time from schedule, pass it from the calling function
      // For now, calculate approximate wake time (8 hours after bedtime)
      const wakeHour = (bedHour + 8) % 24;
      const wakeTime = `${wakeHour.toString().padStart(2, "0")}:${bedMin
        .toString()
        .padStart(2, "0")}`;

      await this.saveAlarmMetadata(userId, bedtime, wakeTime);

      return alarmId;
    } catch (error: any) {
      console.error("❌ Error scheduling alarm:", error);
      throw error;
    }
  },

  // ... (keep all other existing methods: saveAlarmId, getStoredAlarmIds,
  //      cancelAllAlarms, stopCurrentAlarm, etc.)

  /**
   * ✅ ENHANCED: Stop alarm and trigger record creation
   */
  async stopCurrentAlarm(userId: string): Promise<void> {
    try {
      await stopAlarm();
      console.log("⏹️ Stopped current alarm");

      // ✅ Auto-create sleep record when alarm is dismissed
      await this.onAlarmDismissed(userId);
    } catch (error) {
      console.error("Error stopping alarm:", error);
    }
  },

  // Keep all existing methods below...
  async saveAlarmId(id: string): Promise<void> {
    try {
      const existingIds = await this.getStoredAlarmIds();
      const uniqueIds = [...new Set([...existingIds, id])];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(uniqueIds));
    } catch (error) {
      console.error("Error saving alarm ID:", error);
    }
  },

  async getStoredAlarmIds(): Promise<string[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      return jsonValue ? JSON.parse(jsonValue) : [];
    } catch (error) {
      console.error("Error getting alarm IDs:", error);
      return [];
    }
  },

  async cancelAllAlarms(): Promise<void> {
    try {
      console.log("🗑️ Cancelling all alarms...");
      const storedIds = await this.getStoredAlarmIds();
      for (const id of storedIds) {
        try {
          await removeAlarm(id);
          console.log(`   ✓ Cancelled: ${id}`);
        } catch (error) {
          console.error(`   ✗ Failed to cancel ${id}:`, error);
        }
      }
      await AsyncStorage.removeItem(STORAGE_KEY);
      console.log("✅ All alarms cancelled");
    } catch (error) {
      console.error("Error cancelling alarms:", error);
    }
  },

  async getAllScheduledAlarms() {
    try {
      const alarms = await getAllAlarms();
      return alarms || [];
    } catch (error) {
      console.error("Error getting all alarms:", error);
      return [];
    }
  },

  async checkAlarmStatus() {
    try {
      const storedIds = await this.getStoredAlarmIds();
      const systemAlarms = await this.getAllScheduledAlarms();

      let nextAlarmTime = "Tidak ada";
      if (systemAlarms.length > 0) {
        const nextAlarm = systemAlarms[0];
        if (nextAlarm.day) {
          const alarmDate = new Date(nextAlarm.day);
          nextAlarmTime = alarmDate.toLocaleString("id-ID", {
            weekday: "short",
            hour: "2-digit",
            minute: "2-digit",
          });
        }
      }

      const hasAlarms = storedIds.length > 0 && systemAlarms.length > 0;

      return {
        enabled: hasAlarms,
        scheduled: systemAlarms.length,
        message: hasAlarms
          ? `✅ ${systemAlarms.length} alarm aktif! Alarm akan berbunyi otomatis.`
          : "⚠️ Belum ada alarm. Simpan jadwal untuk mengaktifkan.",
        nextAlarm: hasAlarms ? nextAlarmTime : undefined,
        storedIds,
        systemAlarms,
      };
    } catch (error) {
      console.error("Error checking alarm status:", error);
      return {
        enabled: false,
        scheduled: 0,
        message: "❌ Error memeriksa status alarm",
        storedIds: [],
        systemAlarms: [],
      };
    }
  },

  async sendTestAlarm(): Promise<void> {
    try {
      const testDate = new Date();
      testDate.setSeconds(testDate.getSeconds() + 10);
      const testId = `test_alarm_${Date.now()}`;

      await scheduleAlarm({
        uid: testId,
        day: testDate,
        title: "Test Alarm",
        message: "Alarm berfungsi!",
        repeating: false,
        active: true,
        showDismiss: true,
        showSnooze: true,
        snoozeInterval: 5,
      } as any);

      Alert.alert(
        "✅ Test Alarm Dijadwalkan!",
        "Alarm akan berbunyi dalam 10 detik...",
        [{ text: "OK" }]
      );
    } catch (error: any) {
      console.error("Error sending test alarm:", error);
      Alert.alert("Error", `Gagal test alarm: ${error.message}`);
    }
  },

  calculateTimeUntilAlarm(bedtime: string, reminderBefore: number) {
    const [bedHour, bedMin] = bedtime.split(":").map(Number);
    let alarmMinutes = bedHour * 60 + bedMin - reminderBefore;
    if (alarmMinutes < 0) alarmMinutes += 24 * 60;

    const alarmHour = Math.floor(alarmMinutes / 60);
    const alarmMin = alarmMinutes % 60;

    const now = new Date();
    const alarmTime = new Date();
    alarmTime.setHours(alarmHour, alarmMin, 0, 0);

    if (alarmTime <= now) {
      alarmTime.setDate(alarmTime.getDate() + 1);
    }

    const minutesUntil = Math.floor(
      (alarmTime.getTime() - now.getTime()) / 1000 / 60
    );
    const hoursUntil = Math.floor(minutesUntil / 60);
    const minsUntil = minutesUntil % 60;

    return {
      time: alarmTime,
      alarmTimeString: `${alarmHour.toString().padStart(2, "0")}:${alarmMin
        .toString()
        .padStart(2, "0")}`,
      minutesUntil,
      text:
        hoursUntil > 0
          ? `${hoursUntil} jam ${minsUntil} menit lagi`
          : `${minsUntil} menit lagi`,
      isPast: minutesUntil < 1,
    };
  },
};
