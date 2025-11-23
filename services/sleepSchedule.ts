import { supabase } from "../lib/supabase";
import { Database } from "../types/database.types";
import { notificationService } from "./notificationService";

type SleepSchedule = Database["public"]["Tables"]["sleep_schedules"]["Row"];
type SleepScheduleInsert =
  Database["public"]["Tables"]["sleep_schedules"]["Insert"];
type SleepScheduleUpdate =
  Database["public"]["Tables"]["sleep_schedules"]["Update"];

export const sleepScheduleService = {
  // Get active schedule
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

  // Create or update schedule WITH notification scheduling
  async upsert(
    schedule: SleepScheduleInsert | (SleepScheduleUpdate & { user_id: string })
  ) {
    try {
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

      // Schedule notification if reminder is enabled
      if (schedule.reminder_enabled && schedule.bedtime) {
        const notificationId = await notificationService.scheduleSleepReminder({
          bedtime: schedule.bedtime,
          reminderBefore: schedule.reminder_before || 30,
          reminderType: schedule.reminder_type || "notification",
          userId: schedule.user_id,
        });

        // Optionally save notification ID to database
        if (notificationId && data) {
          await supabase
            .from("sleep_schedules")
            .update({
              notification_id: notificationId,
            } as any)
            .eq("id", data.id);
        }
      } else {
        // Cancel notifications if reminder is disabled
        await notificationService.cancelAllNotifications();
      }

      return data as SleepSchedule;
    } catch (error) {
      console.error("Error in upsert:", error);
      throw error;
    }
  },

  // Update schedule WITH notification rescheduling
  async update(
    id: string,
    updates: SleepScheduleUpdate & { user_id?: string }
  ) {
    try {
      const { data, error } = await supabase
        .from("sleep_schedules")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Reschedule notification if reminder settings changed
      if (data && updates.reminder_enabled !== undefined) {
        if (updates.reminder_enabled && data.bedtime) {
          const notificationId =
            await notificationService.scheduleSleepReminder({
              bedtime: data.bedtime,
              reminderBefore: data.reminder_before || 30,
              reminderType: data.reminder_type || "notification",
              userId: data.user_id,
            });

          if (notificationId) {
            await supabase
              .from("sleep_schedules")
              .update({
                notification_id: notificationId,
              } as any)
              .eq("id", id);
          }
        } else {
          // Cancel notifications if reminder is disabled
          await notificationService.cancelAllNotifications();
        }
      }

      return data as SleepSchedule;
    } catch (error) {
      console.error("Error in update:", error);
      throw error;
    }
  },

  // Delete schedule and cancel notifications
  async delete(id: string) {
    try {
      // Cancel all notifications
      await notificationService.cancelAllNotifications();

      const { error } = await supabase
        .from("sleep_schedules")
        .delete()
        .eq("id", id);

      if (error) throw error;
    } catch (error) {
      console.error("Error in delete:", error);
      throw error;
    }
  },
};
