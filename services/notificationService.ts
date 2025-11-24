import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ✅ CRITICAL: Set notification handler (seperti di kode YouTube)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true, // ✅ Aktifkan suara
    shouldShowAlert: true,
    shouldSetBadge: true,
  }),
});

interface ScheduleSleepReminderParams {
  bedtime: string;
  reminderBefore: number;
  reminderType: "notification" | "fullscreen";
  userId: string;
}

const STORAGE_KEY = "sleep_alarm_ids";

export const notificationService = {
  // Request permissions
  async requestPermissions() {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      throw new Error("Izin notifikasi tidak diberikan");
    }

    // Android: Set notification channel
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("sleep-reminders", {
        name: "Sleep Reminders",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        sound: "default",
        enableLights: true,
        enableVibrate: true,
        lockscreenVisibility:
          Notifications.AndroidNotificationVisibility.PUBLIC,
      });
    }

    return finalStatus === "granted";
  },

  // ✅ Schedule daily repeating alarm (seperti kode YouTube)
  async scheduleSleepReminder({
    bedtime,
    reminderBefore,
    reminderType,
    userId,
  }: ScheduleSleepReminderParams) {
    try {
      // Cancel previous alarms first
      await this.cancelAllNotifications();

      // Request permissions
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error("Notification permission denied");
      }

      // Parse bedtime
      const [bedHour, bedMin] = bedtime.split(":").map(Number);

      // Calculate alarm time (bedtime - reminderBefore)
      let alarmMinutes = bedHour * 60 + bedMin - reminderBefore;
      if (alarmMinutes < 0) alarmMinutes += 24 * 60;

      const alarmHour = Math.floor(alarmMinutes / 60);
      const alarmMin = alarmMinutes % 60;

      console.log(
        `🔔 Scheduling alarm for ${alarmHour}:${alarmMin
          .toString()
          .padStart(2, "0")}`
      );

      // ✅ Schedule notification with DAILY REPEAT (seperti kode YouTube)
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: "🌙 Pengingat Tidur",
          body: `Waktunya mempersiapkan diri untuk tidur pukul ${bedtime}! Tidur yang cukup penting untuk kesehatan Anda.`,
          data: {
            type: "sleep_reminder",
            bedtime,
            userId,
          },
          sound: "default",
          priority:
            reminderType === "fullscreen"
              ? Notifications.AndroidNotificationPriority.MAX
              : Notifications.AndroidNotificationPriority.HIGH,
          vibrate:
            reminderType === "fullscreen"
              ? [0, 500, 500, 500]
              : [0, 250, 250, 250],
        },
        trigger: {
          hour: alarmHour,
          minute: alarmMin,
          repeats: true, // ✅ PENTING: Daily repeat
        },
      });

      // ✅ Save notification ID to AsyncStorage (seperti kode YouTube)
      await this.saveNotificationId(identifier);

      console.log("✅ Alarm scheduled with ID:", identifier);
      return identifier;
    } catch (error) {
      console.error("❌ Error scheduling notification:", error);
      throw error;
    }
  },

  // ✅ Save notification ID (seperti kode YouTube)
  async saveNotificationId(id: string) {
    try {
      const existingIds = await this.getStoredNotificationIds();
      const updatedIds = [...existingIds, id];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedIds));
      console.log("💾 Saved notification IDs:", updatedIds);
    } catch (error) {
      console.error("Error saving notification ID:", error);
    }
  },

  // ✅ Get stored notification IDs
  async getStoredNotificationIds(): Promise<string[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      return jsonValue ? JSON.parse(jsonValue) : [];
    } catch (error) {
      console.error("Error getting notification IDs:", error);
      return [];
    }
  },

  // Cancel all notifications
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await AsyncStorage.removeItem(STORAGE_KEY);
      console.log("🗑️ All alarms cancelled");
    } catch (error) {
      console.error("Error cancelling notifications:", error);
    }
  },

  // Check notification status
  async checkNotificationStatus() {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      const scheduledNotifications =
        await Notifications.getAllScheduledNotificationsAsync();
      const storedIds = await this.getStoredNotificationIds();

      let nextAlarm = "Tidak ada";
      if (scheduledNotifications.length > 0) {
        const next = scheduledNotifications[0];
        if (
          next.trigger &&
          "hour" in next.trigger &&
          "minute" in next.trigger
        ) {
          nextAlarm = `${next.trigger.hour
            .toString()
            .padStart(2, "0")}:${next.trigger.minute
            .toString()
            .padStart(2, "0")}`;
        }
      }

      return {
        enabled: status === "granted",
        scheduled: scheduledNotifications.length,
        message:
          status === "granted"
            ? scheduledNotifications.length > 0
              ? `✅ ${scheduledNotifications.length} alarm terjadwal dan aktif!`
              : "⚠️ Belum ada alarm yang dijadwalkan. Simpan jadwal untuk mengaktifkan alarm."
            : "❌ Izin notifikasi belum diberikan. Buka pengaturan untuk mengaktifkan.",
        nextAlarm: scheduledNotifications.length > 0 ? nextAlarm : undefined,
      };
    } catch (error) {
      console.error("Error checking notification status:", error);
      return {
        enabled: false,
        scheduled: 0,
        message: "Error memeriksa status notifikasi",
      };
    }
  },

  // Send test notification (10 seconds from now)
  async sendTestNotification() {
    try {
      await this.requestPermissions();

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "✅ Test Alarm",
          body: "Alarm berfungsi dengan baik! Notifikasi dapat muncul saat aplikasi tertutup.",
          data: { type: "test" },
          sound: "default",
        },
        trigger: {
          seconds: 10, // 10 detik dari sekarang
        },
      });

      console.log("🧪 Test notification scheduled for 10 seconds from now");
    } catch (error) {
      console.error("Error sending test notification:", error);
      throw error;
    }
  },

  // Notification listeners
  addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
  ) {
    return Notifications.addNotificationReceivedListener(callback);
  },

  addNotificationResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
  ) {
    return Notifications.addNotificationResponseReceivedListener(callback);
  },
};
