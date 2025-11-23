import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform, Alert, Linking } from "react-native";

// Configure notification handler
// CRITICAL: Never show notifications when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    // Always return false for foreground to prevent showing
    // Notifications will ONLY appear when app is in background or closed
    return {
      shouldShowAlert: false,
      shouldShowBanner: false,
      shouldShowList: false,
      shouldPlaySound: false,
      shouldSetBadge: false,
      priority: Notifications.AndroidNotificationPriority.MAX,
    };
  },
});

export interface ScheduleNotificationParams {
  bedtime: string;
  reminderBefore: number;
  reminderType: "notification" | "fullscreen";
  userId: string;
}

export const notificationService = {
  isInitialized: false,

  /**
   * Initialize notification system once
   */
  async initialize() {
    if (this.isInitialized) return;

    if (Platform.OS === "android") {
      try {
        await Notifications.setNotificationChannelAsync("sleep-alarm", {
          name: "Sleep Alarm",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 500, 200, 500],
          sound: "default",
          enableVibrate: true,
          bypassDnd: true,
          lockscreenVisibility:
            Notifications.AndroidNotificationVisibility.PUBLIC,
        });

        this.isInitialized = true;
        console.log("✅ Notification system initialized");
      } catch (error) {
        console.error("❌ Error initializing notifications:", error);
      }
    }
  },

  /**
   * Request permissions
   */
  async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      Alert.alert("⚠️", "Notifikasi hanya bekerja di perangkat fisik");
      return false;
    }

    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        Alert.alert(
          "❌ Izin Diperlukan",
          "Silakan aktifkan izin notifikasi di:\nPengaturan > Aplikasi > BetterSleep > Notifikasi",
          [
            { text: "Batal" },
            { text: "Buka Pengaturan", onPress: () => Linking.openSettings() },
          ]
        );
        return false;
      }

      await this.initialize();
      return true;
    } catch (error) {
      console.error("❌ Permission error:", error);
      return false;
    }
  },

  /**
   * Get next alarm time from bedtime
   */
  getNextAlarmTime(bedtime: string, reminderBefore: number): Date {
    const now = new Date();
    const [bedHour, bedMinute] = bedtime.split(":").map(Number);

    console.log(`📊 Calculating alarm time:`);
    console.log(
      `   Bedtime: ${bedHour}:${bedMinute.toString().padStart(2, "0")}`
    );
    console.log(`   Reminder before: ${reminderBefore} minutes`);

    // Calculate total minutes for bedtime
    let bedtimeMinutes = bedHour * 60 + bedMinute;
    console.log(`   Bedtime in minutes: ${bedtimeMinutes}`);

    // Calculate alarm time (bedtime - reminderBefore)
    let alarmMinutes = bedtimeMinutes - reminderBefore;
    console.log(`   Alarm minutes (before adjustment): ${alarmMinutes}`);

    // Handle negative (crosses midnight)
    if (alarmMinutes < 0) {
      alarmMinutes += 24 * 60; // Add 24 hours
      console.log(`   ⚠️ Crosses midnight, adjusted to: ${alarmMinutes}`);
    }

    const alarmHour = Math.floor(alarmMinutes / 60);
    const alarmMinute = alarmMinutes % 60;

    console.log(
      `   Final alarm time: ${alarmHour}:${alarmMinute
        .toString()
        .padStart(2, "0")}`
    );

    // Create alarm time for TODAY first
    const alarmTime = new Date();
    alarmTime.setHours(alarmHour, alarmMinute, 0, 0);

    console.log(`   Alarm date (today): ${alarmTime.toLocaleString("id-ID")}`);
    console.log(`   Current time: ${now.toLocaleString("id-ID")}`);
    console.log(
      `   Time difference: ${Math.floor(
        (alarmTime.getTime() - now.getTime()) / 1000 / 60
      )} minutes`
    );

    // If alarm time has already passed today, schedule for tomorrow
    if (alarmTime <= now) {
      alarmTime.setDate(alarmTime.getDate() + 1);
      console.log(
        `   ⏭️ Time passed, moving to tomorrow: ${alarmTime.toLocaleString(
          "id-ID"
        )}`
      );
    }

    // Additional safety check: alarm must be at least 1 minute in the future
    const minutesUntilAlarm = Math.floor(
      (alarmTime.getTime() - now.getTime()) / 1000 / 60
    );
    if (minutesUntilAlarm < 1) {
      console.log(
        `   ⚠️ WARNING: Alarm is less than 1 minute away! Adding 1 day.`
      );
      alarmTime.setDate(alarmTime.getDate() + 1);
    }

    console.log(`   ✅ Final alarm time: ${alarmTime.toLocaleString("id-ID")}`);

    return alarmTime;
  },

  /**
   * Schedule sleep reminder
   */
  async scheduleSleepReminder(
    params: ScheduleNotificationParams
  ): Promise<boolean> {
    try {
      console.log("\n🔔 ===== SCHEDULING ALARM =====");
      console.log("Params:", params);

      // Request permissions
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.log("❌ No permission granted");
        return false;
      }

      // Cancel ALL existing notifications first
      await this.cancelAllNotifications();

      // Wait a bit to ensure cancellation completes
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log("✅ All previous alarms cancelled");

      // Get next alarm time
      const nextAlarm = this.getNextAlarmTime(
        params.bedtime,
        params.reminderBefore
      );
      const now = new Date();

      const minutesUntilAlarm = Math.floor(
        (nextAlarm.getTime() - now.getTime()) / 1000 / 60
      );

      console.log("📅 Current time:", now.toLocaleString("id-ID"));
      console.log("⏰ Next alarm:", nextAlarm.toLocaleString("id-ID"));
      console.log("⏱️  Time until alarm:", minutesUntilAlarm, "minutes");

      // CRITICAL: Verify alarm is in the future
      if (minutesUntilAlarm < 1) {
        console.log("❌ ERROR: Alarm time is not in the future!");
        Alert.alert(
          "❌ Error Waktu",
          `Alarm tidak dapat dijadwalkan karena waktu sudah terlewat.\n\nSekarang: ${now.toLocaleTimeString(
            "id-ID"
          )}\nAlarm: ${nextAlarm.toLocaleTimeString(
            "id-ID"
          )}\n\nSilakan atur ulang dengan waktu yang lebih lama dari sekarang.`
        );
        return false;
      }

      // Warn if alarm is too soon
      if (minutesUntilAlarm < 5) {
        const proceed = await new Promise<boolean>((resolve) => {
          Alert.alert(
            "⚠️ Peringatan",
            `Alarm akan berbunyi dalam ${minutesUntilAlarm} menit. Apakah Anda yakin?`,
            [
              { text: "Batal", onPress: () => resolve(false), style: "cancel" },
              { text: "Ya, Lanjutkan", onPress: () => resolve(true) },
            ]
          );
        });

        if (!proceed) {
          console.log("❌ User cancelled scheduling");
          return false;
        }
      }

      // Schedule alarm for the next 7 days
      const scheduledIds: string[] = [];

      for (let day = 0; day < 7; day++) {
        const alarmDate = new Date(nextAlarm);
        alarmDate.setDate(alarmDate.getDate() + day);

        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: "🌙 Waktunya Bersiap Tidur!",
            body: `Dalam ${params.reminderBefore} menit lagi, Anda harus tidur pukul ${params.bedtime}. Persiapkan diri sekarang! 😴`,
            data: {
              type: "sleep_reminder",
              userId: params.userId,
              bedtime: params.bedtime,
              scheduledFor: alarmDate.toISOString(),
              day: day,
            },
            sound: true,
            priority: Notifications.AndroidNotificationPriority.MAX,
            vibrate: [0, 500, 200, 500, 200, 500],
            badge: 1,
          },
          trigger: {
            date: alarmDate,
            channelId: "sleep-alarm",
          },
        });

        scheduledIds.push(notificationId);
        console.log(
          `  ✅ Day ${day + 1}: ${alarmDate.toLocaleString(
            "id-ID"
          )} - ID: ${notificationId}`
        );
      }

      // Verify scheduled notifications
      await new Promise((resolve) => setTimeout(resolve, 500));
      const allScheduled = await this.getScheduledNotifications();
      console.log(`\n📋 Total notifications scheduled: ${allScheduled.length}`);

      allScheduled.forEach((notif, idx) => {
        if (notif.trigger && "date" in notif.trigger) {
          const date = new Date((notif.trigger as any).value * 1000);
          console.log(`  ${idx + 1}. ${date.toLocaleString("id-ID")}`);
        }
      });

      console.log("===== ALARM SETUP COMPLETE =====\n");

      if (scheduledIds.length === 0) {
        Alert.alert("❌ Error", "Gagal menjadwalkan alarm");
        return false;
      }

      return true;
    } catch (error) {
      console.error("❌ Error scheduling alarm:", error);
      Alert.alert("Error", `Gagal menjadwalkan alarm: ${error}`);
      return false;
    }
  },

  /**
   * Cancel all notifications
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      // Cancel all scheduled
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Dismiss all displayed
      await Notifications.dismissAllNotificationsAsync();

      console.log("🗑️  All notifications cancelled and dismissed");
    } catch (error) {
      console.error("❌ Error cancelling notifications:", error);
    }
  },

  /**
   * Get scheduled notifications
   */
  async getScheduledNotifications(): Promise<
    Notifications.NotificationRequest[]
  > {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error("❌ Error getting scheduled:", error);
      return [];
    }
  },

  /**
   * Test notification (10 seconds from now)
   */
  async sendTestNotification(): Promise<void> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return;

      const testTime = new Date();
      testTime.setSeconds(testTime.getSeconds() + 10);

      console.log("\n🧪 ===== TEST ALARM =====");
      console.log("Current time:", new Date().toLocaleString("id-ID"));
      console.log("Test alarm will fire at:", testTime.toLocaleString("id-ID"));

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: "🧪 TEST ALARM BETTERSLEEP",
          body: "Jika Anda melihat ini, alarm BERFUNGSI dengan baik! 🎉🎊",
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
          vibrate: [0, 500, 200, 500],
          data: {
            type: "test",
            scheduledFor: testTime.toISOString(),
          },
        },
        trigger: {
          seconds: 10,
          channelId: "sleep-alarm",
        },
      });

      console.log("Test alarm ID:", id);
      console.log("===== TEST SCHEDULED =====\n");

      return; // Don't show alert, return immediately
    } catch (error) {
      console.error("❌ Error scheduling test:", error);
      Alert.alert("Error", "Gagal menjadwalkan test");
    }
  },

  /**
   * Check notification status
   */
  async checkNotificationStatus(): Promise<{
    enabled: boolean;
    scheduled: number;
    message: string;
    nextAlarm?: string;
  }> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      const scheduled = await this.getScheduledNotifications();

      // Find next alarm
      let nextAlarm: string | undefined;
      let nextAlarmTime: Date | null = null;

      for (const notif of scheduled) {
        if (notif.trigger && "date" in notif.trigger) {
          const triggerTimestamp = (notif.trigger as any).value;
          const date = new Date(triggerTimestamp * 1000);

          if (!nextAlarmTime || date < nextAlarmTime) {
            nextAlarmTime = date;
            nextAlarm = date.toLocaleString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              hour: "2-digit",
              minute: "2-digit",
            });
          }
        }
      }

      let message = "";
      if (status !== "granted") {
        message = "❌ Izin notifikasi belum diberikan";
      } else if (scheduled.length === 0) {
        message = "⚠️ Tidak ada alarm terjadwal";
      } else {
        message = `✅ ${scheduled.length} alarm aktif`;
      }

      return {
        enabled: status === "granted",
        scheduled: scheduled.length,
        message,
        nextAlarm,
      };
    } catch (error) {
      console.error("❌ Error checking status:", error);
      return {
        enabled: false,
        scheduled: 0,
        message: "❌ Error",
      };
    }
  },

  /**
   * Add listeners
   */
  addNotificationResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
  ) {
    return Notifications.addNotificationResponseReceivedListener(callback);
  },

  addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
  ) {
    return Notifications.addNotificationReceivedListener(callback);
  },
};
