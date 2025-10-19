const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY || "";
const PEXELS_BASE_URL = "https://api.pexels.com/v1";

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
      console.log("Image service. Searching for image for:", recipeName);
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
    return "/placeholder-image.png";
  }
}
