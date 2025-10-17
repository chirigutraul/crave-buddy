export type MealTime = "breakfast" | "lunch" | "dinner" | "snack";

export interface Ingredient {
  quantity: number;
  unit: string; // e.g., "g", "ml", "cups", "pieces"
  name: string;
}

export interface Recipe {
  id?: number; // Optional for Dexie auto-increment
  name: string;
  image: string;
  category: MealTime[];
  portionSize: number; // in grams - default serving size
  nutritionalValuesPer100g: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber: number;
  };
  ingredients: Ingredient[]; // Changed from string[] to Ingredient[]
  instructions: string[];
}

export interface RecipePair {
  classicRecipe: Omit<Recipe, "id" | "image">;
  improvedRecipe: Omit<Recipe, "id" | "image">;
}

export type HungerLevel =
  | "starving"
  | "hungry"
  | "satisfied"
  | "full"
  | "veryFull";

export interface DailyCheckIn {
  id?: number; // Optional for Dexie auto-increment
  date: string; // ISO date string (YYYY-MM-DD)
  hungerLevel: HungerLevel;
}

export type DayOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export interface MealEntry {
  recipeId: number | null;
  quantity: number; // in grams
}

export interface DayMeals {
  breakfast: MealEntry;
  lunch: MealEntry;
  snack: MealEntry;
  dinner: MealEntry;
}

export type WeekMeals = {
  [key in DayOfWeek]: DayMeals;
};

export interface WeeklyPlan {
  id?: number; // Optional for Dexie auto-increment
  name: string;
  meals: WeekMeals;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";

export interface User {
  id?: number;
  name: string;
  age: number;
  height: number;
  weight: number;
  sex: "male" | "female";
  exercising: string;
  activityLevel?: ActivityLevel;
  createdAt?: Date;
  updatedAt?: Date;
}

declare global {
  interface AILanguageModel {
    prompt(input: string): Promise<string>;
    promptStreaming(input: string): ReadableStream;
    countPromptTokens(input: string): Promise<number>;
    destroy(): void;
  }

  interface Window {
    LanguageModel: {
      availability(): Promise<"downloadable" | "available" | "downloading">;
      create(options?: {
        initialPrompts?: {
          role: "system" | "user" | "assistant";
          content: string;
        }[];
        temperature?: number;
        topK?: number;
      }): Promise<AILanguageModel>;
    };
  }
}
