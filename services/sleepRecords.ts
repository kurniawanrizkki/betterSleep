import { supabase } from '../lib/supabase';
import { Database } from '../types/database.types';

type SleepRecord = Database['public']['Tables']['sleep_records']['Row'];
type SleepRecordInsert = Database['public']['Tables']['sleep_records']['Insert'];
type SleepRecordUpdate = Database['public']['Tables']['sleep_records']['Update'];

export const sleepRecordsService = {
  // Get all sleep records for user
  async getAll(userId: string, limit = 30) {
    const { data, error } = await supabase
      .from('sleep_records')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as SleepRecord[];
  },

  // Get sleep records by date range
  async getByDateRange(userId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('sleep_records')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (error) throw error;
    return data as SleepRecord[];
  },

  // Get sleep record by specific date
  async getByDate(userId: string, date: string) {
    const { data, error } = await supabase
      .from('sleep_records')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle();

    if (error) throw error;
    return data as SleepRecord | null;
  },

  // Create new sleep record
  async create(record: SleepRecordInsert) {
    const { data, error } = await supabase
      .from('sleep_records')
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    return data as SleepRecord;
  },

  // Update sleep record
  async update(id: string, updates: SleepRecordUpdate) {
    const { data, error } = await supabase
      .from('sleep_records')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as SleepRecord;
  },

  // Upsert (insert or update) sleep record by date
  async upsertByDate(userId: string, date: string, recordData: Omit<SleepRecordInsert, 'user_id' | 'date'>) {
    const { data, error } = await supabase
      .from('sleep_records')
      .upsert({
        user_id: userId,
        date,
        ...recordData,
      }, {
        onConflict: 'user_id,date',
      })
      .select()
      .single();

    if (error) throw error;
    return data as SleepRecord;
  },

  // Delete sleep record
  async delete(id: string) {
    const { error } = await supabase
      .from('sleep_records')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get statistics for a period
  async getStatistics(userId: string, days = 7) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));

    const records = await this.getByDateRange(
      userId,
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );

    const total = records.reduce((sum, r) => sum + r.hours, 0);
    const average = records.length > 0 ? total / records.length : 0;
    const max = records.length > 0 ? Math.max(...records.map(r => r.hours)) : 0;
    const min = records.length > 0 ? Math.min(...records.map(r => r.hours)) : 0;

    // Calculate quality distribution
    const goodQuality = records.filter(r => r.quality === 'good').length;
    const averageQuality = records.filter(r => r.quality === 'average').length;
    const poorQuality = records.filter(r => r.quality === 'poor').length;

    // Calculate streak (consecutive days with records)
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < days; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      const hasRecord = records.some(r => r.date === dateStr);
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
      const dateStr = date.toISOString().split('T')[0];
      
      const record = stats.records.find(r => r.date === dateStr);
      
      weekData.push({
        day: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][date.getDay()],
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
  calculateQuality(hours: number): 'good' | 'average' | 'poor' {
    if (hours >= 7 && hours <= 9) return 'good';
    if (hours >= 6 && hours < 7) return 'average';
    return 'poor';
  },

  // Add today's sleep record (quick add)
  async addTodayRecord(userId: string, hours: number, bedtime?: string, wakeTime?: string, notes?: string) {
    const today = new Date().toISOString().split('T')[0];
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