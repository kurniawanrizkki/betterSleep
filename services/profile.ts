import { supabase } from '../lib/supabase';
import { Database } from '../types/database.types';

type UserProfile = Database['public']['Tables']['users']['Row'];
type UserProfileUpdate = Database['public']['Tables']['users']['Update'];

export interface UserStats {
  totalSleepRecords: number;
  totalGratitudeNotes: number;
  averageSleepHours: number;
  totalSleepHours: number;
  bestSleepQuality: number;
  currentStreak: number;
}

export const profileService = {
  // Get user profile
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data as UserProfile;
  },

  // Update user profile
  async updateProfile(userId: string, updates: UserProfileUpdate) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as UserProfile;
  },

  // Get user statistics
  async getUserStats(userId: string): Promise<UserStats> {
    try {
      // Get sleep records count and data
      const { data: sleepRecords, count: sleepCount } = await supabase
        .from('sleep_records')
        .select('hours, quality, date', { count: 'exact' })
        .eq('user_id', userId)
        .order('date', { ascending: false });

      // Get gratitude notes count
      const { count: notesCount } = await supabase
        .from('gratitude_notes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Calculate average sleep hours
      const totalHours = sleepRecords?.reduce((sum, r) => sum + r.hours, 0) || 0;
      const avgHours = sleepRecords && sleepRecords.length > 0 
        ? totalHours / sleepRecords.length 
        : 0;

      // Calculate best quality (count of 'good' quality sleeps)
      const goodSleeps = sleepRecords?.filter(r => r.quality === 'good').length || 0;

      // Calculate current streak (consecutive days with sleep records)
      let currentStreak = 0;
      if (sleepRecords && sleepRecords.length > 0) {
        const today = new Date();
        const sortedRecords = [...sleepRecords].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        for (let i = 0; i < sortedRecords.length; i++) {
          const recordDate = new Date(sortedRecords[i].date);
          const expectedDate = new Date(today);
          expectedDate.setDate(today.getDate() - i);
          
          if (recordDate.toDateString() === expectedDate.toDateString()) {
            currentStreak++;
          } else {
            break;
          }
        }
      }

      return {
        totalSleepRecords: sleepCount || 0,
        totalGratitudeNotes: notesCount || 0,
        averageSleepHours: parseFloat(avgHours.toFixed(1)),
        totalSleepHours: parseFloat(totalHours.toFixed(1)),
        bestSleepQuality: goodSleeps,
        currentStreak,
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        totalSleepRecords: 0,
        totalGratitudeNotes: 0,
        averageSleepHours: 0,
        totalSleepHours: 0,
        bestSleepQuality: 0,
        currentStreak: 0,
      };
    }
  },

  // Delete user account (cascade delete all related data)
  async deleteAccount(userId: string) {
    // First delete from users table (cascade will delete related records)
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) throw error;

    // Then delete auth user
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    
    if (authError) throw authError;
  },

  // Upload avatar (if you want to implement file upload)
  async uploadAvatar(userId: string, file: File | Blob) {
    const fileExt = file.type.split('/')[1];
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // Update user profile with avatar URL
    await this.updateProfile(userId, {
      avatar_url: data.publicUrl,
    });

    return data.publicUrl;
  },
};