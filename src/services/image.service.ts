import placeholderImage from "@/assets/placeholder-image.jpg";

const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY || "";
const PEXELS_BASE_URL = "https://api.pexels.com/v1";
const IMAGE_GEN_API = import.meta.env.VITE_IMAGE_GEN_API || "";

interface PexelsPhoto {
  id: number;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
  };
  photographer: string;
  photographer_url: string;
}

interface PexelsSearchResponse {
  photos: PexelsPhoto[];
  total_results: number;
  page: number;
  per_page: number;
}

export class ImageService {
  /**
   * Get a recipe image with automatic fallback chain:
   * 1. Try AI generation (if configured)
   * 2. Fall back to Pexels search
   * 3. Fall back to placeholder image
   *
   * @param recipeName - Name of the recipe
   * @returns Image URL (always returns a valid URL)
   */
  static async getRecipeImage(recipeName: string): Promise<string> {
    // Try AI generation first
    const aiImageUrl = await this.generateRecipeImage(recipeName);
    if (aiImageUrl) {
      console.log("Using AI-generated image:", aiImageUrl);
      return aiImageUrl;
    }

    // Fall back to Pexels search
    console.log("AI generation unavailable/failed, falling back to Pexels");
    const pexelsImageUrl = await this.searchRecipeImage(recipeName);
    if (pexelsImageUrl) {
      console.log("Using Pexels image:", pexelsImageUrl);
      return pexelsImageUrl;
    }

    // Final fallback to placeholder
    console.log("Using placeholder image");
    return this.getFallbackImage();
  }

  /**
   * Generate an image for a recipe using AI image generation API
   * @param recipeName - Name of the recipe to generate image for
   * @returns Image URL from cloud storage or null if generation fails
   */
  static async generateRecipeImage(recipeName: string): Promise<string | null> {
    if (!IMAGE_GEN_API) {
      console.warn(
        "Image generation API URL is not configured. Skipping AI image generation."
      );
      return null;
    }

    try {
      console.log("Generating AI image for:", recipeName);

      const response = await fetch(IMAGE_GEN_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: recipeName,
        }),
      });

      if (!response.ok) {
        console.error(
          "Image generation API error:",
          response.status,
          response.statusText
        );
        return null;
      }

      // Parse JSON response
      const data = await response.json();

      if (data.url) {
        console.log("Received AI image URL from cloud storage:", data.url);
        return data.url;
      } else {
        console.error("Response missing 'url' field:", data);
        return null;
      }
    } catch (error) {
      console.error("Error generating AI image:", error);
      return null;
    }
  }

  /**
   * Search for a recipe image on Pexels
   * @param recipeName - Name of the recipe to search for
   * @returns Image URL or null if not found
   */
  static async searchRecipeImage(recipeName: string): Promise<string | null> {
    if (!PEXELS_API_KEY) {
      console.warn("Pexels API key is not configured. Skipping image fetch.");
      return null;
    }

    try {
      // Clean up recipe name and add 'food' for better results
      console.log("Searching Pexels for image for:", recipeName);
      const query = `${recipeName} food dish`;
      const response = await fetch(
        `${PEXELS_BASE_URL}/search?query=${encodeURIComponent(
          query
        )}&per_page=1&orientation=square`,
        {
          headers: {
            Authorization: PEXELS_API_KEY,
          },
        }
      );

      if (!response.ok) {
        console.error(
          "Pexels API error:",
          response.status,
          response.statusText
        );
        return null;
      }

      const data: PexelsSearchResponse = await response.json();

      if (data.photos && data.photos.length > 0) {
        // Return large size image URL for better quality
        return data.photos[0].src.large;
      }

      console.warn(`No images found for "${recipeName}"`);
      return null;
    } catch (error) {
      console.error("Error fetching image from Pexels:", error);
      return null;
    }
  }

  /**
   * Get a fallback placeholder image URL
   * @returns Placeholder image URL
   */
  static getFallbackImage(): string {
    return placeholderImage;
  }

  /**
   * Convert an image URL to base64 data URL
   * @param url - Image URL to convert
   * @returns Base64 data URL or null if conversion fails
   */
  static async urlToBase64(url: string): Promise<string | null> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error("Failed to fetch image from URL:", url);
        return null;
      }

      const blob = await response.blob();
      return await this.blobToBase64(blob);
    } catch (error) {
      console.error("Error converting URL to base64:", error);
      return null;
    }
  }

  /**
   * Convert a Blob to base64 data URL
   * @param blob - Blob to convert
   * @returns Promise that resolves to base64 data URL
   */
  static blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("Failed to convert blob to base64"));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}
