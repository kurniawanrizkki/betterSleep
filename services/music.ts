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

      // Group tracks by category
      const categoriesWithTracks: MusicCategoryWithTracks[] = categories.map(
        (category) => ({
          ...category,
          tracks: tracksWithUrls.filter(
            (track) => track.category_id === category.id
          ),
        })
      );

      return categoriesWithTracks;
    } catch (error) {
      console.error("Error fetching categories with tracks:", error);
      throw error;
    }
  },

  /**
   * ADMIN: Get all categories (including inactive)
   */
  async getAllCategories(): Promise<MusicCategory[]> {
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
   * ADMIN: Get all tracks (including inactive)
   */
  async getAllTracks(): Promise<MusicTrack[]> {
    try {
      const { data, error } = await supabase
        .from("music_tracks")
        .select("*")
        .order("name", { ascending: true });

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
   * ADMIN: Create new category
   */
  async createCategory(categoryData: {
    name: string;
    description?: string | null;
    icon?: string | null;
    sort_order?: number;
    is_active?: boolean;
  }): Promise<MusicCategory> {
    try {
      const { data, error } = await supabase
        .from("music_categories")
        .insert({
          name: categoryData.name,
          description: categoryData.description || null,
          icon: categoryData.icon || "🎵",
          sort_order: categoryData.sort_order || 0,
          is_active: categoryData.is_active !== false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  },

  /**
   * ADMIN: Update category
   */
  async updateCategory(
    categoryId: string,
    updates: {
      name?: string;
      description?: string | null;
      icon?: string | null;
      sort_order?: number;
      is_active?: boolean;
    }
  ): Promise<MusicCategory> {
    try {
      const { data, error } = await supabase
        .from("music_categories")
        .update(updates)
        .eq("id", categoryId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  },

  /**
   * ADMIN: Delete category
   */
  async deleteCategory(categoryId: string): Promise<void> {
    try {
      // First check if category has tracks
      const { data: tracks } = await supabase
        .from("music_tracks")
        .select("id")
        .eq("category_id", categoryId)
        .limit(1);

      if (tracks && tracks.length > 0) {
        throw new Error(
          "Cannot delete category with tracks. Delete all tracks first."
        );
      }

      const { error } = await supabase
        .from("music_categories")
        .delete()
        .eq("id", categoryId);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  },

  /**
   * ADMIN: Create new track
   */
  async createTrack(trackData: {
    category_id: string;
    name: string;
    description?: string | null;
    duration: number;
    file_path: string;
    color?: string;
    is_premium?: boolean;
    is_active?: boolean;
  }): Promise<MusicTrack> {
    try {
      const { data, error } = await supabase
        .from("music_tracks")
        .insert({
          category_id: trackData.category_id,
          name: trackData.name,
          description: trackData.description || null,
          duration: trackData.duration,
          file_path: trackData.file_path,
          color: trackData.color || "#5B9BD5",
          is_premium: trackData.is_premium || false,
          is_active: trackData.is_active !== false,
          play_count: 0,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        public_url: this.getPublicUrl(data.file_path),
      };
    } catch (error) {
      console.error("Error creating track:", error);
      throw error;
    }
  },

  /**
   * ADMIN: Update track
   */
  async updateTrack(
    trackId: string,
    updates: Partial<MusicTrack>
  ): Promise<MusicTrack> {
    try {
      const cleanUpdates = { ...updates };
      delete cleanUpdates.id;
      delete cleanUpdates.public_url;

      const { data, error } = await supabase
        .from("music_tracks")
        .update(cleanUpdates)
        .eq("id", trackId)
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        public_url: this.getPublicUrl(data.file_path),
      };
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
      // Get track to delete file from storage
      const { data: track } = await supabase
        .from("music_tracks")
        .select("file_path")
        .eq("id", trackId)
        .single();

      // Delete from database
      const { error } = await supabase
        .from("music_tracks")
        .delete()
        .eq("id", trackId);

      if (error) throw error;

      // Delete file from storage
      if (track?.file_path) {
        const { error: storageError } = await supabase.storage
          .from("music")
          .remove([track.file_path]);
        if (storageError)
          console.warn("Could not delete file from storage:", storageError);
      }
    } catch (error) {
      console.error("Error deleting track:", error);
      throw error;
    }
  },

  /**
   * ADMIN: Upload audio file to Supabase Storage (FIXED: Using ArrayBuffer for React Native)
   */
  async uploadAudio(
    fileUri: string,
    filename: string
  ): Promise<{ filePath: string; publicUrl: string }> {
    try {
      // 1. FIX: Fetch file content as ArrayBuffer
      const response = await fetch(fileUri);
      const arrayBuffer = await response.arrayBuffer();

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

  /**
   * ADMIN: Get audio file duration (you'll need to implement this client-side)
   */
  async getAudioDuration(fileUri: string): Promise<number> {
    // This needs to be implemented using Audio.Sound
    // For now, return a default value
    return 300; // 5 minutes default
  },

  /**
   * Get single track by ID
   */
  async getTrack(trackId: string): Promise<MusicTrack | null> {
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
   * Get public URL for audio file from Supabase Storage
   */
  getPublicUrl(filePath: string): string {
    const { data } = supabase.storage.from("music").getPublicUrl(filePath);
    return data.publicUrl;
  },

  /**
   * Record when user plays a track
   */
  async recordPlay(userId: string, trackId: string): Promise<void> {
    try {
      await supabase.from("user_music_history").insert({
        user_id: userId,
        track_id: trackId,
      });

      // Increment play count
      await supabase.rpc("increment_music_play_count", {
        track_id: trackId,
      });
    } catch (error) {
      console.error("Error recording play:", error);
      // Don't throw - this shouldn't block playback
    }
  },

  /**
   * Toggle favorite status
   */
  async toggleFavorite(userId: string, trackId: string): Promise<boolean> {
    try {
      // Check if already favorited
      const { data: existing } = await supabase
        .from("user_music_favorites")
        .select("id")
        .eq("user_id", userId)
        .eq("track_id", trackId)
        .maybeSingle();

      if (existing) {
        // Remove from favorites
        await supabase
          .from("user_music_favorites")
          .delete()
          .eq("id", existing.id);
        return false; // Unfavorited
      } else {
        // Add to favorites
        await supabase.from("user_music_favorites").insert({
          user_id: userId,
          track_id: trackId,
        });
        return true; // Favorited
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      throw error;
    }
  },

  /**
   * Get user's favorite tracks
   */
  async getUserFavorites(userId: string): Promise<MusicTrack[]> {
    try {
      const { data, error } = await supabase
        .from("user_music_favorites")
        .select(
          `
          track_id,
          music_tracks (*)
        `
        )
        .eq("user_id", userId);

      if (error) throw error;

      const tracks = data
        .map((fav) => fav.music_tracks)
        .filter(Boolean)
        .map((track) => ({
          ...track,
          public_url: this.getPublicUrl(track.file_path),
        }));

      return tracks as MusicTrack[];
    } catch (error) {
      console.error("Error fetching favorites:", error);
      return [];
    }
  },

  /**
   * Check if track is favorited by user
   */
  async isFavorited(userId: string, trackId: string): Promise<boolean> {
    try {
      const { data } = await supabase
        .from("user_music_favorites")
        .select("id")
        .eq("user_id", userId)
        .eq("track_id", trackId)
        .maybeSingle();

      return !!data;
    } catch (error) {
      console.error("Error checking favorite status:", error);
      return false;
    }
  },

  /**
   * Get most played tracks
   */
  async getMostPlayed(limit = 10): Promise<MusicTrack[]> {
    try {
      const { data, error } = await supabase
        .from("music_tracks")
        .select("*")
        .eq("is_active", true)
        .order("play_count", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data.map((track) => ({
        ...track,
        public_url: this.getPublicUrl(track.file_path),
      }));
    } catch (error) {
      console.error("Error fetching most played:", error);
      return [];
    }
  },

  /**
   * Get recently played tracks for user
   */
  async getRecentlyPlayed(userId: string, limit = 10): Promise<MusicTrack[]> {
    try {
      const { data, error } = await supabase
        .from("user_music_history")
        .select(
          `
          track_id,
          played_at,
          music_tracks (*)
        `
        )
        .eq("user_id", userId)
        .order("played_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Remove duplicates (keep most recent)
      const uniqueTracks = new Map();
      data.forEach((item) => {
        if (item.music_tracks && !uniqueTracks.has(item.track_id)) {
          uniqueTracks.set(item.track_id, item.music_tracks);
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
};
