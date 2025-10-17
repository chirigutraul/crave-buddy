import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { RecipePair } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseRecipeResponse(response: string): RecipePair {
  let jsonString = response.trim();

  // Remove markdown code blocks
  if (jsonString.startsWith("```json")) {
    jsonString = jsonString.replace(/^```json\s*/, "");
  } else if (jsonString.startsWith("```")) {
    jsonString = jsonString.replace(/^```\s*/, "");
  }

  if (jsonString.endsWith("```")) {
    jsonString = jsonString.replace(/\s*```$/, "");
  }

  // Clean up common JSON issues
  jsonString = jsonString.trim();

  // Remove trailing commas before closing braces/brackets
  jsonString = jsonString.replace(/,(\s*[}\]])/g, "$1");

  // Remove comments (// style)
  jsonString = jsonString.replace(/\/\/.*$/gm, "");

  // Remove comments (/* */ style)
  jsonString = jsonString.replace(/\/\*[\s\S]*?\*\//g, "");

  try {
    const parsed = JSON.parse(jsonString);

    return {
      classicRecipe: parsed.classicRecipe,
      improvedRecipe: parsed.improvedRecipe,
    };
  } catch (error) {
    console.error("Failed to parse recipe JSON:", error);
    console.error("JSON string:", jsonString);
    throw new Error(
      `Failed to parse recipe response. Please try generating again. Error: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
