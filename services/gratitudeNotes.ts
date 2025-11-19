import { supabase } from '../lib/supabase';
import { Database } from '../types/database.types';

type GratitudeNote = Database['public']['Tables']['gratitude_notes']['Row'];
type GratitudeNoteInsert = Database['public']['Tables']['gratitude_notes']['Insert'];
type GratitudeNoteUpdate = Database['public']['Tables']['gratitude_notes']['Update'];

export const gratitudeNotesService = {
  // Get all gratitude notes
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('gratitude_notes')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data as GratitudeNote[];
  },

  // Create new note
  async create(note: GratitudeNoteInsert) {
    const { data, error } = await supabase
      .from('gratitude_notes')
      .insert(note)
      .select()
      .single();

    if (error) throw error;
    return data as GratitudeNote;
  },

  // Update note
  async update(id: string, updates: GratitudeNoteUpdate) {
    const { data, error } = await supabase
      .from('gratitude_notes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as GratitudeNote;
  },

  // Delete note
  async delete(id: string) {
    const { error } = await supabase
      .from('gratitude_notes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};