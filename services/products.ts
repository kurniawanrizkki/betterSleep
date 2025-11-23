import { supabase } from "../lib/supabase";

export interface ProductCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface Product {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  image_url: string | null;
  rating: number;
  sold_count: number;
  stock: number;
  is_featured: boolean;
  is_active: boolean;
  affiliate_link: string | null;
  created_at: string;
  public_image_url?: string;
}

export interface ProductWithCategory extends Product {
  category: ProductCategory | null;
}

export const productsService = {
  /**
   * Get all active products
   */
  async getAll(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("sold_count", { ascending: false });

      if (error) throw error;

      return data.map((product) => ({
        ...product,
        public_image_url: product.image_url
          ? this.getPublicImageUrl(product.image_url)
          : null,
      }));
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  /**
   * Get featured products
   */
  async getFeatured(limit = 4): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .eq("is_featured", true)
        .order("rating", { ascending: false })
        .order("sold_count", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data.map((product) => ({
        ...product,
        public_image_url: product.image_url
          ? this.getPublicImageUrl(product.image_url)
          : null,
      }));
    } catch (error) {
      console.error("Error fetching featured products:", error);
      return [];
    }
  },

  /**
   * Get products by category
   */
  async getByCategory(categoryId: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .eq("category_id", categoryId)
        .order("rating", { ascending: false });

      if (error) throw error;

      return data.map((product) => ({
        ...product,
        public_image_url: product.image_url
          ? this.getPublicImageUrl(product.image_url)
          : null,
      }));
    } catch (error) {
      console.error("Error fetching products by category:", error);
      return [];
    }
  },

  /**
   * Get single product
   */
  async getById(productId: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .eq("is_active", true)
        .single();

      if (error) throw error;

      return {
        ...data,
        public_image_url: data.image_url
          ? this.getPublicImageUrl(data.image_url)
          : null,
      };
    } catch (error) {
      console.error("Error fetching product:", error);
      return null;
    }
  },

  /**
   * Get all categories
   */
  async getCategories(): Promise<ProductCategory[]> {
    try {
      const { data, error } = await supabase
        .from("product_categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  },

  /**
   * Toggle product favorite
   */
  async toggleFavorite(userId: string, productId: string): Promise<boolean> {
    try {
      const { data: existing } = await supabase
        .from("user_product_favorites")
        .select("id")
        .eq("user_id", userId)
        .eq("product_id", productId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("user_product_favorites")
          .delete()
          .eq("id", existing.id);
        return false;
      } else {
        await supabase
          .from("user_product_favorites")
          .insert({ user_id: userId, product_id: productId });
        return true;
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      throw error;
    }
  },

  /**
   * Get user favorites
   */
  async getUserFavorites(userId: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from("user_product_favorites")
        .select(
          `
          product_id,
          products (*)
        `
        )
        .eq("user_id", userId);

      if (error) throw error;

      return data
        .map((fav) => fav.products)
        .filter(Boolean)
        .map((product) => ({
          ...product,
          public_image_url: product.image_url
            ? this.getPublicImageUrl(product.image_url)
            : null,
        })) as Product[];
    } catch (error) {
      console.error("Error fetching favorites:", error);
      return [];
    }
  },

  /**
   * Check if product is favorited
   */
  async isFavorited(userId: string, productId: string): Promise<boolean> {
    try {
      const { data } = await supabase
        .from("user_product_favorites")
        .select("id")
        .eq("user_id", userId)
        .eq("product_id", productId)
        .maybeSingle();

      return !!data;
    } catch (error) {
      console.error("Error checking favorite:", error);
      return false;
    }
  },

  /**
   * Search products
   */
  async search(query: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(20);

      if (error) throw error;

      return data.map((product) => ({
        ...product,
        public_image_url: product.image_url
          ? this.getPublicImageUrl(product.image_url)
          : null,
      }));
    } catch (error) {
      console.error("Error searching products:", error);
      return [];
    }
  },

  /**
   * Get public URL for product image
   */
  getPublicImageUrl(imagePath: string): string {
    const { data } = supabase.storage.from("products").getPublicUrl(imagePath);

    return data.publicUrl;
  },

  /**
   * Format price to IDR
   */
  formatPrice(price: number, currency = "IDR"): string {
    if (currency === "IDR") {
      return `Rp ${price.toLocaleString("id-ID")}`;
    }
    return `${currency} ${price.toLocaleString()}`;
  },

  /**
   * Format sold count
   */
  formatSoldCount(count: number): string {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  },

  // =====================================================
  // ADMIN FUNCTIONS
  // =====================================================

  /**
   * Check if user is admin
   */
  async isAdmin(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("is_admin")
        .eq("id", userId)
        .single();

      if (error) throw error;
      return data.is_admin || false;
    } catch (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
  },

  /**
   * Create product (Admin only)
   */
  async create(product: Partial<Product>): Promise<Product> {
    try {
      const { data, error } = await supabase
        .from("products")
        .insert(product)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  },

  /**
   * Update product (Admin only)
   */
  async update(productId: string, updates: Partial<Product>): Promise<Product> {
    try {
      const { data, error } = await supabase
        .from("products")
        .update(updates)
        .eq("id", productId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  },

  /**
   * Delete product (Admin only)
   */
  async delete(productId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  },

  /**
   * Upload product image (Admin only)
   */
  async uploadProductImage(
    productId: string,
    fileUri: string
  ): Promise<string> {
    // FIX: Accepts fileUri (string)
    try {
      // FIX: Use fetch to get ArrayBuffer and MIME type, avoiding unreliable Blob implementation
      const response = await fetch(fileUri);
      const arrayBuffer = await response.arrayBuffer();

      // Attempt to get Content-Type from headers, default to common types
      const mimeType = response.headers.get("Content-Type") || "image/jpeg";
      const fileExt = mimeType.split("/").pop() || "jpg";

      const filePath = `products/${productId}-${Date.now()}.${fileExt}`;

      // Upload ArrayBuffer to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(filePath, arrayBuffer, {
          contentType: mimeType, // Explicitly set content type
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Update the product's image_url field in the database
      const { error: updateError } = await supabase
        .from("products")
        .update({ image_url: filePath })
        .eq("id", productId);

      if (updateError) throw updateError;

      // Return the public URL
      return this.getPublicImageUrl(filePath);
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  },

  /**
   * Get all products (Admin - includes inactive)
   */
  async getAllAdmin(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data.map((product) => ({
        ...product,
        public_image_url: product.image_url
          ? this.getPublicImageUrl(product.image_url)
          : null,
      }));
    } catch (error) {
      console.error("Error fetching all products:", error);
      throw error;
    }
  },
};
