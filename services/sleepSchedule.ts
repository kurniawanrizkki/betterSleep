import { supabase } from "../lib/supabase";
import { Database } from "../types/database.types";
import { alarmService } from "./alarmService"; // ✅ Changed from notificationService

type SleepSchedule = Database["public"]["Tables"]["sleep_schedules"]["Row"];
type SleepScheduleInsert =
  Database["public"]["Tables"]["sleep_schedules"]["Insert"];
type SleepScheduleUpdate =
  Database["public"]["Tables"]["sleep_schedules"]["Update"];

export const sleepScheduleService = {
  /**
   * Get active schedule for user
   */
  async getActive(userId: string) {
    const { data, error } = await supabase
      .from("sleep_schedules")
      .select("*")
      .eq("user_id", userId)
      .eq("active", true)
      .single();

    if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows
    return data as SleepSchedule | null;
  },

  /**
   * Create or update schedule WITH alarm scheduling
   */
  async upsert(
    schedule: SleepScheduleInsert | (SleepScheduleUpdate & { user_id: string })
  ) {
    try {
      console.log("📝 Upserting sleep schedule...");

      // Deactivate all existing schedules first
      await supabase
        .from("sleep_schedules")
        .update({ active: false })
        .eq("user_id", schedule.user_id);

      // Insert new active schedule
      const { data, error } = await supabase
        .from("sleep_schedules")
        .insert({ ...schedule, active: true } as SleepScheduleInsert)
        .select()
        .single();

      if (error) throw error;

      console.log("✅ Schedule saved to database:", data);

      // ✅ Schedule REAL alarm if reminder is enabled
      if (schedule.reminder_enabled && schedule.bedtime) {
        console.log("🔔 Scheduling alarm...");

        const alarmId = await alarmService.scheduleSleepReminder({
          bedtime: schedule.bedtime,
          reminderBefore: schedule.reminder_before || 30,
          reminderType: schedule.reminder_type || "notification",
          userId: schedule.user_id,
        });

        console.log("✅ Alarm scheduled with ID:", alarmId);

        // Save alarm ID to database
        if (alarmId && data) {
          await supabase
            .from("sleep_schedules")
            .update({
              notification_id: alarmId,
            } as any)
            .eq("id", data.id);

          console.log("✅ Alarm ID saved to database");
        }
      } else {
        // Cancel alarms if reminder is disabled
        console.log("❌ Reminder disabled, cancelling all alarms...");
        await alarmService.cancelAllAlarms();
      }

      return data as SleepSchedule;
    } catch (error) {
      console.error("❌ Error in upsert:", error);
      throw error;
    }
  },

  /**
   * Update schedule WITH alarm rescheduling
   */
  async update(
    id: string,
    updates: SleepScheduleUpdate & { user_id?: string }
  ) {
    try {
      console.log("📝 Updating sleep schedule...");

      const { data, error } = await supabase
        .from("sleep_schedules")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      console.log("✅ Schedule updated in database:", data);

      // ✅ Reschedule alarm if reminder settings changed
      if (data && updates.reminder_enabled !== undefined) {
        if (updates.reminder_enabled && data.bedtime) {
          console.log("🔔 Rescheduling alarm...");

          const alarmId = await alarmService.scheduleSleepReminder({
            bedtime: data.bedtime,
            reminderBefore: data.reminder_before || 30,
            reminderType: data.reminder_type || "notification",
            userId: data.user_id,
          });

          console.log("✅ Alarm rescheduled with ID:", alarmId);

          if (alarmId) {
            await supabase
              .from("sleep_schedules")
              .update({
                notification_id: alarmId,
              } as any)
              .eq("id", id);
          }
        } else {
          // Cancel alarms if reminder is disabled
          console.log("❌ Reminder disabled, cancelling all alarms...");
          await alarmService.cancelAllAlarms();
        }
      }

      return data as SleepSchedule;
    } catch (error) {
      console.error("❌ Error in update:", error);
      throw error;
    }
  },

  /**
   * Delete schedule and cancel alarms
   */
  async delete(id: string) {
    try {
      console.log("🗑️ Deleting schedule...");

      // Cancel all alarms
      await alarmService.cancelAllAlarms();

      const { error } = await supabase
        .from("sleep_schedules")
        .delete()
        .eq("id", id);

      if (error) throw error;

      console.log("✅ Schedule deleted");
    } catch (error) {
      console.error("❌ Error in delete:", error);
      throw error;
    }
  },
};
