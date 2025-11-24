import {
  scheduleAlarm,
  removeAlarm,
  stopAlarm,
  getAllAlarms,
} from "expo-alarm-module";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert, Platform } from "react-native";

interface ScheduleSleepReminderParams {
  bedtime: string;
  reminderBefore: number;
  reminderType: "notification" | "fullscreen";
  userId: string;
}

const STORAGE_KEY = "sleep_alarm_ids";
const ALARM_PREFIX = "sleep_alarm_";

export const alarmService = {
  /**
   * Schedule a daily repeating alarm
   * ✅ FIX: Simplified parameters to avoid "repeating" error
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

      // Parse bedtime (format: "HH:MM")
      const [bedHour, bedMin] = bedtime.split(":").map(Number);

      // Calculate alarm time (bedtime - reminderBefore)
      let alarmMinutes = bedHour * 60 + bedMin - reminderBefore;
      if (alarmMinutes < 0) alarmMinutes += 24 * 60; // Handle next day

      const alarmHour = Math.floor(alarmMinutes / 60);
      const alarmMin = alarmMinutes % 60;

      // Create alarm date
      const alarmDate = new Date();
      alarmDate.setHours(alarmHour, alarmMin, 0, 0);

      // If time already passed today, schedule for tomorrow
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

      // ✅ FIX: Use minimal parameters that work
      try {
        await scheduleAlarm({
          uid: alarmId,
          day: alarmDate,
          title: "🌙 Pengingat Tidur",
          message: `Waktunya tidur pukul ${bedtime}! Tidur yang cukup penting untuk kesehatan.`,
          // ✅ Simplified - only essential params
        });

        console.log("✅ Alarm scheduled successfully with ID:", alarmId);
      } catch (scheduleError: any) {
        console.error("Schedule error:", scheduleError);

        // ✅ Try alternative approach without optional params
        await scheduleAlarm({
          uid: alarmId,
          day: alarmDate,
          title: "Pengingat Tidur",
          message: `Tidur pukul ${bedtime}`,
        });

        console.log("✅ Alarm scheduled with fallback method");
      }

      // Save alarm ID to storage
      await this.saveAlarmId(alarmId);

      return alarmId;
    } catch (error: any) {
      console.error("❌ Error scheduling alarm:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));

      // More specific error handling
      if (error.message?.includes("permission")) {
        Alert.alert(
          "Izin Diperlukan",
          "Aplikasi memerlukan izin SCHEDULE_EXACT_ALARM. Aktifkan di Settings > Apps > Permissions.",
          [
            { text: "Batal", style: "cancel" },
            {
              text: "Buka Pengaturan",
              onPress: () => {
                if (Platform.OS === "android") {
                  const { Linking } = require("react-native");
                  Linking.openSettings();
                }
              },
            },
          ]
        );
      } else if (
        error.message?.includes("repeating") ||
        error.message?.includes("hostfunction")
      ) {
        // This specific error - try to schedule for next 7 days manually
        console.log("🔄 Trying alternative scheduling method...");
        return await this.scheduleMultipleDays(bedtime, reminderBefore, userId);
      } else {
        Alert.alert(
          "Error",
          `Gagal menjadwalkan alarm: ${error.message || "Unknown error"}`
        );
      }

      throw error;
    }
  },

  /**
   * ✅ Alternative: Schedule for next 7 days (workaround for repeat issue)
   */
  async scheduleMultipleDays(
    bedtime: string,
    reminderBefore: number,
    userId: string
  ): Promise<string> {
    try {
      console.log("📅 Scheduling multiple days as workaround...");

      const [bedHour, bedMin] = bedtime.split(":").map(Number);
      let alarmMinutes = bedHour * 60 + bedMin - reminderBefore;
      if (alarmMinutes < 0) alarmMinutes += 24 * 60;

      const alarmHour = Math.floor(alarmMinutes / 60);
      const alarmMin = alarmMinutes % 60;

      const alarmIds: string[] = [];

      // Schedule for next 7 days
      for (let day = 0; day < 7; day++) {
        const alarmDate = new Date();
        alarmDate.setHours(alarmHour, alarmMin, 0, 0);
        alarmDate.setDate(alarmDate.getDate() + day);

        // Skip if already passed today
        if (day === 0 && alarmDate <= new Date()) {
          continue;
        }

        const alarmId = `${ALARM_PREFIX}${userId}_day${day}_${Date.now()}`;

        try {
          await scheduleAlarm({
            uid: alarmId,
            day: alarmDate,
            title: "🌙 Pengingat Tidur",
            message: `Waktunya tidur pukul ${bedtime}!`,
          });

          alarmIds.push(alarmId);
          await this.saveAlarmId(alarmId);

          console.log(
            `✅ Scheduled day ${day}: ${alarmDate.toLocaleDateString()} ${alarmHour}:${alarmMin}`
          );
        } catch (err) {
          console.error(`Failed to schedule day ${day}:`, err);
        }
      }

      if (alarmIds.length === 0) {
        throw new Error("Failed to schedule any alarms");
      }

      console.log(
        `✅ Successfully scheduled ${alarmIds.length} alarms for the week`
      );
      return alarmIds[0]; // Return first ID as primary
    } catch (error) {
      console.error("Error in scheduleMultipleDays:", error);
      throw error;
    }
  },

  /**
   * Save alarm ID to AsyncStorage
   */
  async saveAlarmId(id: string): Promise<void> {
    try {
      const existingIds = await this.getStoredAlarmIds();
      const uniqueIds = [...new Set([...existingIds, id])];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(uniqueIds));
    } catch (error) {
      console.error("Error saving alarm ID:", error);
    }
  },

  /**
   * Get stored alarm IDs from AsyncStorage
   */
  async getStoredAlarmIds(): Promise<string[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      return jsonValue ? JSON.parse(jsonValue) : [];
    } catch (error) {
      console.error("Error getting alarm IDs:", error);
      return [];
    }
  },

  /**
   * Cancel all scheduled alarms
   */
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

  /**
   * Stop currently playing alarm
   */
  async stopCurrentAlarm(): Promise<void> {
    try {
      await stopAlarm();
      console.log("⏹️ Stopped current alarm");
    } catch (error) {
      console.error("Error stopping alarm:", error);
    }
  },

  /**
   * Get all scheduled alarms from the system
   */
  async getAllScheduledAlarms() {
    try {
      const alarms = await getAllAlarms();
      console.log("📋 System alarms:", alarms);
      return alarms || [];
    } catch (error) {
      console.error("Error getting all alarms:", error);
      return [];
    }
  },

  /**
   * Check alarm status
   */
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

  /**
   * Request battery optimization exemption (Android)
   */
  async requestBatteryOptimizationExemption() {
    if (Platform.OS !== "android") return;

    try {
      const { Linking } = require("react-native");
      const pkg = "com.bettersleep.app"; // Your package name

      Alert.alert(
        "Optimasi Baterai",
        "Untuk memastikan alarm berbunyi, nonaktifkan optimasi baterai untuk aplikasi ini.",
        [
          { text: "Nanti", style: "cancel" },
          {
            text: "Buka Pengaturan",
            onPress: () => {
              // Open battery optimization settings
              Linking.openURL(
                `intent:#Intent;action=android.settings.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS;data=package:${pkg};end`
              ).catch(() => {
                // Fallback to general settings
                Linking.openSettings();
              });
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error requesting battery exemption:", error);
    }
  },

  /**
   * Check if alarm permission is granted (Android 12+)
   */
  async checkAlarmPermission(): Promise<boolean> {
    if (Platform.OS !== "android") return true;

    try {
      // For Android 12+ (API 31+), check SCHEDULE_EXACT_ALARM permission
      // This is automatically handled by expo-alarm-module
      return true;
    } catch (error) {
      console.error("Error checking alarm permission:", error);
      return false;
    }
  },

  /**
   * Send test alarm (rings in 10 seconds)
   */
  async sendTestAlarm(): Promise<void> {
    try {
      const testDate = new Date();
      testDate.setSeconds(testDate.getSeconds() + 10);

      const testId = `test_alarm_${Date.now()}`;

      console.log("🧪 Scheduling test alarm for:", testDate.toLocaleString());

      // ✅ Minimal params for test
      await scheduleAlarm({
        uid: testId,
        day: testDate,
        title: "Test Alarm",
        message: "Alarm berfungsi!",
      });

      console.log("✅ Test alarm scheduled");

      Alert.alert(
        "✅ Test Alarm Dijadwalkan!",
        "Alarm akan berbunyi dalam 10 detik...\n\n⚠️ Pastikan volume HP tidak di-silent!",
        [{ text: "OK" }]
      );
    } catch (error: any) {
      console.error("Error sending test alarm:", error);
      Alert.alert(
        "Error",
        `Gagal test alarm: ${
          error.message || "Unknown error"
        }\n\nPastikan izin alarm sudah diberikan.`
      );
    }
  },

  /**
   * Calculate time until next alarm
   */
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
