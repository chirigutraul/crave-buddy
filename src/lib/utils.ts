import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { RecipePair, ActivityLevel } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculates Basal Metabolic Rate (BMR) using the Mifflin-St Jeor Equation
 * @param params.weight - Weight in kilograms
 * @param params.height - Height in centimeters
 * @param params.age - Age in years
 * @param params.sex - Biological sex ("male" or "female")
 * @returns BMR in calories per day
 * Formula:
 * - Men: (10 * weight in kg) + (6.25 * height in cm) - (5 * age in years) + 5
 * - Women: (10 * weight in kg) + (6.25 * height in cm) - (5 * age in years) - 161
 */
export function calculateBMR({
  weight,
  height,
  age,
  sex,
}: {
  weight: number;
  height: number;
  age: number;
  sex: "male" | "female";
}): number {
  const baseBMR = 10 * weight + 6.25 * height - 5 * age;

  if (sex === "male") {
    return baseBMR + 5;
  } else {
    return baseBMR - 161;
  }
}

/**
 * Calculates Total Daily Energy Expenditure (TDEE) based on BMR and activity level
 *
 * @param params.bmr - Basal Metabolic Rate in calories per day
 * @param params.activityLevel - Activity level of the user
 * @returns TDEE in calories per day
 *
 * Activity level multipliers:
 * - Sedentary: BMR × 1.2 (little to no exercise)
 * - Lightly Active: BMR × 1.375 (1-3 times per week)
 * - Moderately Active: BMR × 1.55 (4-5 times per week)
 * - Very Active: BMR × 1.725 (daily exercise or intense exercise 3-4 times per week)
 * - Extra Active: BMR × 1.9 (intense exercise 6-7 times per week)
 */
export function calculateDailyCalories({
  bmr,
  activityLevel,
}: {
  bmr: number;
  activityLevel: ActivityLevel;
}): number {
  const activityMultipliers: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    very_active: 1.725,
    extra_active: 1.9,
  };

  return bmr * activityMultipliers[activityLevel];
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
