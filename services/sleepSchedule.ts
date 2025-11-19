import { supabase } from '../lib/supabase';
import { Database } from '../types/database.types';

type SleepSchedule = Database['public']['Tables']['sleep_schedules']['Row'];
type SleepScheduleInsert = Database['public']['Tables']['sleep_schedules']['Insert'];
type SleepScheduleUpdate = Database['public']['Tables']['sleep_schedules']['Update'];

export const sleepScheduleService = {
  // Get active schedule
  async getActive(userId: string) {
    const { data, error } = await supabase
      .from('sleep_schedules')
      .select('*')
      .eq('user_id', userId)
      .eq('active', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return data as SleepSchedule | null;
  },

  // Create or update schedule
  async upsert(schedule: SleepScheduleInsert | (SleepScheduleUpdate & { user_id: string })) {
    // Deactivate all existing schedules first
    await supabase
      .from('sleep_schedules')
      .update({ active: false })
      .eq('user_id', schedule.user_id);

    // Insert new active schedule
    const { data, error } = await supabase
      .from('sleep_schedules')
      .insert({ ...schedule, active: true } as SleepScheduleInsert)
      .select()
      .single();

    if (error) throw error;
    return data as SleepSchedule;
  },

  // Update schedule
  async update(id: string, updates: SleepScheduleUpdate) {
    const { data, error } = await supabase
      .from('sleep_schedules')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as SleepSchedule;
  },

  // Delete schedule
  async delete(id: string) {
    const { error } = await supabase
      .from('sleep_schedules')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};