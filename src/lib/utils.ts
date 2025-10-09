import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { RecipePair } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseRecipeResponse(response: string): RecipePair {
  let jsonString = response.trim();

  if (jsonString.startsWith("```json")) {
    jsonString = jsonString.replace(/^```json\s*/, "");
  } else if (jsonString.startsWith("```")) {
    jsonString = jsonString.replace(/^```\s*/, "");
  }

  if (jsonString.endsWith("```")) {
    jsonString = jsonString.replace(/\s*```$/, "");
  }

  const parsed = JSON.parse(jsonString.trim());

  return {
    clasicRecipe: parsed.clasicRecipe,
    improvedRecipe: parsed.improvedRecipe,
  };
}
