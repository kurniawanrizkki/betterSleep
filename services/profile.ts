import { supabase } from "../lib/supabase";

export interface MusicCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface MusicTrack {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  duration: number; // in seconds
  file_path: string;
  thumbnail_url: string | null;
  color: string;
  is_premium: boolean;
  play_count: number;
  is_active: boolean;
  public_url?: string; // Generated URL for playback
}

export interface MusicCategoryWithTracks extends MusicCategory {
  tracks: MusicTrack[];
}

export const musicService = {
  /**
   * Get all active music categories with their tracks
   */
  async getCategoriesWithTracks(): Promise<MusicCategoryWithTracks[]> {
    try {
      // Get categories
      const { data: categories, error: categoriesError } = await supabase
        .from("music_categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (categoriesError) throw categoriesError;

      // Get all tracks
      const { data: tracks, error: tracksError } = await supabase
        .from("music_tracks")
        .select("*")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (tracksError) throw tracksError;

      // Generate public URLs for tracks
      const tracksWithUrls = tracks.map((track) => ({
        ...track,
        public_url: this.getPublicUrl(track.file_path),
      }));

      // Map tracks to categories
      return categories.map((category) => ({
        ...category,
        tracks: tracksWithUrls.filter(
          (track) => track.category_id === category.id
        ),
      }));
    } catch (error) {
      console.error("Error fetching categories with tracks:", error);
      throw error;
    }
  },

  /**
   * Get a single track by ID
   */
  async getTrackById(trackId: string): Promise<MusicTrack | null> {
    try {
      const { data, error } = await supabase
        .from("music_tracks")
        .select("*")
        .eq("id", trackId)
        .eq("is_active", true)
        .single();

      if (error) throw error;

      return {
        ...data,
        public_url: this.getPublicUrl(data.file_path),
      };
    } catch (error) {
      console.error("Error fetching track:", error);
      return null;
    }
  },

  /**
   * Get public URL for a file path
   */
  getPublicUrl(filePath: string): string {
    const { data } = supabase.storage.from("music").getPublicUrl(filePath);
    return data.publicUrl;
  },

  /**
   * Record a track play event (for history/analytics)
   */
  async recordPlay(userId: string, trackId: string): Promise<void> {
    try {
      // 1. Record the play event
      const { error: playError } = await supabase
        .from("user_music_history")
        .insert({ user_id: userId, track_id: trackId, played_at: new Date() });

      if (playError) throw playError;

      // 2. Increment play count on the track
      const { error: updateError } = await supabase.rpc(
        "increment_play_count",
        {
          row_id: trackId,
        }
      ); // Assumes you have an SQL function named 'increment_play_count'

      if (updateError) throw updateError;
    } catch (error) {
      console.error("Error recording track play:", error);
    }
  },

  /**
   * Get user's recently played tracks
   */
  async getRecentlyPlayed(
    userId: string,
    limit: number = 10
  ): Promise<MusicTrack[]> {
    try {
      const { data, error } = await supabase
        .from("user_music_history")
        .select(
          `
          track_id,
          music_tracks (*)
        `
        )
        .eq("user_id", userId)
        .order("played_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Remove duplicates (keep most recent) and format
      const uniqueTracks = new Map<string, MusicTrack>();
      data.forEach((item) => {
        if (item.music_tracks && !uniqueTracks.has(item.track_id)) {
          uniqueTracks.set(item.track_id, item.music_tracks as MusicTrack);
        }
      });

      return Array.from(uniqueTracks.values()).map((track) => ({
        ...track,
        public_url: this.getPublicUrl(track.file_path),
      }));
    } catch (error) {
      console.error("Error fetching recently played:", error);
      return [];
    }
  },

  /**
   * Format duration from seconds to MM:SS
   */
  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  },

  /**
   * Search tracks by name
   */
  async searchTracks(query: string): Promise<MusicTrack[]> {
    try {
      const { data, error } = await supabase
        .from("music_tracks")
        .select("*")
        .eq("is_active", true)
        .ilike("name", `%${query}%`)
        .limit(20);

      if (error) throw error;

      return data.map((track) => ({
        ...track,
        public_url: this.getPublicUrl(track.file_path),
      }));
    } catch (error) {
      console.error("Error searching tracks:", error);
      return [];
    }
  },

  // =====================================================
  // ADMIN FUNCTIONS
  // =====================================================

  /**
   * ADMIN: Get all tracks (includes inactive)
   */
  async getAllTracksAdmin(): Promise<MusicTrack[]> {
    try {
      const { data, error } = await supabase
        .from("music_tracks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data.map((track) => ({
        ...track,
        public_url: this.getPublicUrl(track.file_path),
      }));
    } catch (error) {
      console.error("Error fetching all tracks:", error);
      throw error;
    }
  },

  /**
   * ADMIN: Get all categories (includes inactive)
   */
  async getAllCategoriesAdmin(): Promise<MusicCategory[]> {
    try {
      const { data, error } = await supabase
        .from("music_categories")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching all categories:", error);
      throw error;
    }
  },

  /**
   * ADMIN: Create new track
   */
  async createTrack(track: Partial<MusicTrack>): Promise<MusicTrack> {
    try {
      const { data, error } = await supabase
        .from("music_tracks")
        .insert(track)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating track:", error);
      throw error;
    }
  },

  /**
   * ADMIN: Update existing track
   */
  async updateTrack(
    trackId: string,
    updates: Partial<MusicTrack>
  ): Promise<MusicTrack> {
    try {
      const { data, error } = await supabase
        .from("music_tracks")
        .update(updates)
        .eq("id", trackId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating track:", error);
      throw error;
    }
  },

  /**
   * ADMIN: Delete track
   */
  async deleteTrack(trackId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("music_tracks")
        .delete()
        .eq("id", trackId);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting track:", error);
      throw error;
    }
  },

  /**
   * ADMIN: Upload audio file to Supabase Storage
   *
   * @param fileUri Local file URI (e.g., from DocumentPicker)
   * @param filename Original filename
   * @returns { filePath: string; publicUrl: string }
   */
  async uploadAudio(
    fileUri: string, // FIX: Accepts URI string
    filename: string
  ): Promise<{ filePath: string; publicUrl: string }> {
    try {
      // 1. FIX: Fetch file content as ArrayBuffer to bypass the problematic Blob issue in React Native
      const response = await fetch(fileUri);
      const arrayBuffer = await response.arrayBuffer(); // <--- BARIS KRITIS, MENGGUNAKAN arrayBuffer()

      // 2. Determine MIME type (Content-Type)
      const mimeType =
        response.headers.get("Content-Type") ||
        `audio/${filename.split(".").pop()}`;
      const fileExt =
        mimeType.split("/").pop() || filename.split(".").pop() || "mp3";

      // 3. Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);
      const uniqueFilename = `${timestamp}-${randomString}.${fileExt}`;
      const filePath = `tracks/${uniqueFilename}`;

      console.log("Uploading audio file:", filePath);

      // 4. Upload ArrayBuffer with explicit contentType
      const { data, error } = await supabase.storage
        .from("music")
        .upload(filePath, arrayBuffer, {
          // Upload arrayBuffer
          contentType: mimeType,
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Upload error:", error);
        throw error;
      }

      console.log("Upload successful:", data);

      // Get public URL
      const publicUrl = this.getPublicUrl(filePath);

      return {
        filePath,
        publicUrl,
      };
    } catch (error) {
      console.error("Error uploading audio:", error);
      throw error;
    }
  },
};
