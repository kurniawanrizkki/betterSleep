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

  // Delete sleep record
  async delete(id: string) {
    const { error } = await supabase
      .from('sleep_records')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get statistics
  async getStatistics(userId: string, days = 7) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const records = await this.getByDateRange(
      userId,
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );

    const total = records.reduce((sum, r) => sum + r.hours, 0);
    const average = records.length > 0 ? total / records.length : 0;
    const max = Math.max(...records.map(r => r.hours), 0);
    const min = Math.min(...records.map(r => r.hours), 24);

    return {
      average,
      total,
      max,
      min,
      count: records.length,
      records,
    };
  },
};