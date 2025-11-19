export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
        };
        Update: {
          full_name?: string | null;
          avatar_url?: string | null;
        };
      };
      sleep_records: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          hours: number;
          quality: 'good' | 'average' | 'poor' | null;
          bedtime: string | null;
          wake_time: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          date: string;
          hours: number;
          quality?: 'good' | 'average' | 'poor' | null;
          bedtime?: string | null;
          wake_time?: string | null;
          notes?: string | null;
        };
        Update: {
          hours?: number;
          quality?: 'good' | 'average' | 'poor' | null;
          bedtime?: string | null;
          wake_time?: string | null;
          notes?: string | null;
        };
      };
      gratitude_notes: {
        Row: {
          id: string;
          user_id: string;
          text: string;
          date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          text: string;
          date?: string;
        };
        Update: {
          text?: string;
          date?: string;
        };
      };
      sleep_schedules: {
        Row: {
          id: string;
          user_id: string;
          bedtime: string;
          wake_time: string;
          reminder_enabled: boolean;
          reminder_type: 'notification' | 'fullscreen';
          reminder_before: number;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          bedtime: string;
          wake_time: string;
          reminder_enabled?: boolean;
          reminder_type?: 'notification' | 'fullscreen';
          reminder_before?: number;
          active?: boolean;
        };
        Update: {
          bedtime?: string;
          wake_time?: string;
          reminder_enabled?: boolean;
          reminder_type?: 'notification' | 'fullscreen';
          reminder_before?: number;
          active?: boolean;
        };
      };
    };
  };
};