import { supabase } from "../lib/supabase";
import { Database } from "../types/database.types";

type SleepRecord = Database["public"]["Tables"]["sleep_records"]["Row"];
type SleepRecordInsert =
  Database["public"]["Tables"]["sleep_records"]["Insert"];
type SleepRecordUpdate =
  Database["public"]["Tables"]["sleep_records"]["Update"];

export const sleepRecordsService = {
  // Get all sleep records for user
  async getAll(userId: string, limit = 30) {
    const { data, error } = await supabase
      .from("sleep_records")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as SleepRecord[];
  },

  // Get sleep records by date range
  async getByDateRange(userId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from("sleep_records")
      .select("*")
      .eq("user_id", userId)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: false });

    if (error) throw error;
    return data as SleepRecord[];
  },

  // Get sleep record by specific date
  async getByDate(userId: string, date: string) {
    const { data, error } = await supabase
      .from("sleep_records")
      .select("*")
      .eq("user_id", userId)
      .eq("date", date)
      .maybeSingle();

    if (error) throw error;
    return data as SleepRecord | null;
  },

  // Create new sleep record
  async create(record: SleepRecordInsert) {
    const { data, error } = await supabase
      .from("sleep_records")
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    return data as SleepRecord;
  },

  // Update sleep record
  async update(id: string, updates: SleepRecordUpdate) {
    const { data, error } = await supabase
      .from("sleep_records")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as SleepRecord;
  },

  // Upsert (insert or update) sleep record by date
  async upsertByDate(
    userId: string,
    date: string,
    recordData: Omit<SleepRecordInsert, "user_id" | "date">
  ) {
    const { data, error } = await supabase
      .from("sleep_records")
      .upsert(
        {
          user_id: userId,
          date,
          ...recordData,
        },
        {
          onConflict: "user_id,date",
        }
      )
      .select()
      .single();

    if (error) throw error;
    return data as SleepRecord;
  },

  // Delete sleep record
  async delete(id: string) {
    const { error } = await supabase
      .from("sleep_records")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  // Get statistics for a period
  async getStatistics(userId: string, days = 7) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));

    const records = await this.getByDateRange(
      userId,
      startDate.toISOString().split("T")[0],
      endDate.toISOString().split("T")[0]
    );

    const total = records.reduce((sum, r) => sum + r.hours, 0);
    const average = records.length > 0 ? total / records.length : 0;
    const max =
      records.length > 0 ? Math.max(...records.map((r) => r.hours)) : 0;
    const min =
      records.length > 0 ? Math.min(...records.map((r) => r.hours)) : 0;

    // Calculate quality distribution
    const goodQuality = records.filter((r) => r.quality === "good").length;
    const averageQuality = records.filter(
      (r) => r.quality === "average"
    ).length;
    const poorQuality = records.filter((r) => r.quality === "poor").length;

    // Calculate streak (consecutive days with records)
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < days; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split("T")[0];

      const hasRecord = records.some((r) => r.date === dateStr);
      if (hasRecord) {
        currentStreak++;
      } else {
        break;
      }
    }

    return {
      average: parseFloat(average.toFixed(1)),
      total: parseFloat(total.toFixed(1)),
      max: parseFloat(max.toFixed(1)),
      min: min === Infinity ? 0 : parseFloat(min.toFixed(1)),
      count: records.length,
      records,
      qualityDistribution: {
        good: goodQuality,
        average: averageQuality,
        poor: poorQuality,
      },
      currentStreak,
    };
  },

  // Get weekly summary (for home screen)
  async getWeeklySummary(userId: string) {
    const stats = await this.getStatistics(userId, 7);

    // Get last 7 days data formatted for chart
    const weekData = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const record = stats.records.find((r) => r.date === dateStr);

      weekData.push({
        day: ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"][date.getDay()],
        date: dateStr,
        hours: record?.hours || 0,
        quality: record?.quality || null,
      });
    }

    return {
      weekData,
      average: stats.average,
      total: stats.total,
      streak: stats.currentStreak,
    };
  },

  // Calculate sleep quality based on hours
  calculateQuality(hours: number): "good" | "average" | "poor" {
    if (hours >= 7 && hours <= 9) return "good";
    if (hours >= 6 && hours < 7) return "average";
    return "poor";
  },

  // Add today's sleep record (quick add)
  async addTodayRecord(
    userId: string,
    hours: number,
    bedtime?: string,
    wakeTime?: string,
    notes?: string
  ) {
    const today = new Date().toISOString().split("T")[0];
    const quality = this.calculateQuality(hours);

    return this.upsertByDate(userId, today, {
      hours,
      quality,
      bedtime: bedtime || null,
      wake_time: wakeTime || null,
      notes: notes || null,
    });
  },
};

export const enhancedSleepRecordsService = {
  ...sleepRecordsService, // Keep all existing methods

  /**
   * ✅ NEW: Get statistics with schedule fallback
   * If no records exist, use schedule data for visualization
   */
  async getStatisticsWithSchedule(userId: string, days = 7) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (days - 1));

      // Get actual records
      const records = await sleepRecordsService.getByDateRange(
        userId,
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0]
      );

      // Get active schedule
      const schedule = await sleepScheduleService.getActive(userId);

      // ✅ Fill missing dates with schedule data
      const filledRecords = [];
      const recordMap = new Map(records.map((r) => [r.date, r]));

      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const dateStr = date.toISOString().split("T")[0];

        if (recordMap.has(dateStr)) {
          // Use actual record
          filledRecords.push(recordMap.get(dateStr)!);
        } else if (schedule && schedule.active) {
          // Use schedule as fallback
          const [bedHour, bedMin] = schedule.bedtime.split(":").map(Number);
          const [wakeHour, wakeMin] = schedule.wake_time.split(":").map(Number);

          let totalMinutes = wakeHour * 60 + wakeMin - (bedHour * 60 + bedMin);
          if (totalMinutes < 0) totalMinutes += 24 * 60;

          const sleepHours = parseFloat((totalMinutes / 60).toFixed(1));
          const quality = sleepRecordsService.calculateQuality(sleepHours);

          // Create virtual record (not saved to DB)
          filledRecords.push({
            id: `schedule_${dateStr}`,
            user_id: userId,
            date: dateStr,
            hours: sleepHours,
            quality,
            bedtime: schedule.bedtime,
            wake_time: schedule.wake_time,
            notes: "📅 From schedule (not recorded)",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            isFromSchedule: true, // ✅ Flag to identify virtual records
          } as any);
        }
      }

      // Calculate statistics
      const total = filledRecords.reduce((sum, r) => sum + r.hours, 0);
      const average =
        filledRecords.length > 0 ? total / filledRecords.length : 0;
      const max =
        filledRecords.length > 0
          ? Math.max(...filledRecords.map((r) => r.hours))
          : 0;
      const min =
        filledRecords.length > 0
          ? Math.min(...filledRecords.map((r) => r.hours))
          : 0;

      const goodQuality = filledRecords.filter(
        (r) => r.quality === "good"
      ).length;
      const averageQuality = filledRecords.filter(
        (r) => r.quality === "average"
      ).length;
      const poorQuality = filledRecords.filter(
        (r) => r.quality === "poor"
      ).length;

      // Calculate streak (only actual records)
      const actualRecords = filledRecords.filter(
        (r) => !(r as any).isFromSchedule
      );
      let currentStreak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < days; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const dateStr = checkDate.toISOString().split("T")[0];

        const hasActualRecord = actualRecords.some((r) => r.date === dateStr);
        if (hasActualRecord) {
          currentStreak++;
        } else {
          break;
        }
      }

      return {
        average: parseFloat(average.toFixed(1)),
        total: parseFloat(total.toFixed(1)),
        max: parseFloat(max.toFixed(1)),
        min: min === Infinity ? 0 : parseFloat(min.toFixed(1)),
        count: filledRecords.length,
        actualCount: actualRecords.length, // ✅ Count of real records
        records: filledRecords,
        qualityDistribution: {
          good: goodQuality,
          average: averageQuality,
          poor: poorQuality,
        },
        currentStreak,
        hasScheduleFallback: schedule?.active || false,
      };
    } catch (error) {
      console.error("Error getting statistics with schedule:", error);
      throw error;
    }
  },

  /**
   * ✅ NEW: Get weekly summary with schedule fallback
   */
  async getWeeklySummaryWithSchedule(userId: string) {
    const stats = await this.getStatisticsWithSchedule(userId, 7);

    // Get last 7 days data
    const weekData = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const record = stats.records.find((r) => r.date === dateStr);

      weekData.push({
        day: ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"][date.getDay()],
        date: dateStr,
        hours: record?.hours || 0,
        quality: record?.quality || null,
        isFromSchedule: (record as any)?.isFromSchedule || false, // ✅ Flag
      });
    }

    return {
      weekData,
      average: stats.average,
      total: stats.total,
      streak: stats.currentStreak,
      hasScheduleFallback: stats.hasScheduleFallback,
    };
  },
};
