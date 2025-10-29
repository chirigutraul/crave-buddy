export type MealTime = "breakfast" | "lunch" | "dinner" | "snack";

export interface Ingredient {
  quantity: number;
  unit: string; // e.g., "g", "ml", "cups", "pieces"
  name: string;
}

export interface PreparationStep {
  instruction: string;
  time: number; // time in seconds
}

export interface Recipe {
  id: number;
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
  instructions: PreparationStep[]; // Changed from string[] to PreparationStep[]
}

export interface RecipePair {
  classicRecipe: Omit<Recipe, "id">;
  improvedRecipe: Omit<Recipe, "id">;
}

export interface GeneratedRecipe extends Omit<Recipe, "id"> {
  classicRecipeNutritionalValues: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber: number;
  };
}

export interface PartialGeneratedRecipe {
  name?: string;
  image?: string;
  category?: MealTime[];
  portionSize?: number;
  ingredients?: Ingredient[];
  instructions?: PreparationStep[];
  nutritionalValuesPer100g?: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber: number;
  };
  classicRecipeNutritionalValues?: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber: number;
  };
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
  | "very_active"
  | "extra_active";

export interface WeightEntry {
  value: number;
  date: string; // ISO date string
}

export interface User {
  id?: number;
  name: string;
  age: number;
  height: number;
  weight: WeightEntry[];
  sex: "male" | "female";
  exercising: string;
  activityLevel?: ActivityLevel;
  createdAt?: Date;
  updatedAt?: Date;
}

declare global {
  interface AILanguageModelPromptOptions {
    signal?: AbortSignal;
    responseConstraint?: any; // JSON Schema or RegExp
    omitResponseConstraintInput?: boolean;
  }

  interface AILanguageModelCloneOptions {
    signal?: AbortSignal;
  }

  interface AILanguageModel {
    prompt(
      input: string,
      options?: AILanguageModelPromptOptions
    ): Promise<string>;
    promptStreaming(
      input: string,
      options?: AILanguageModelPromptOptions
    ): ReadableStream;
    countPromptTokens(input: string): Promise<number>;
    clone(options?: AILanguageModelCloneOptions): Promise<AILanguageModel>;
    destroy(): Promise<void>;
    inputUsage: number;
    inputQuota: number;
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
      params(): Promise<{
        defaultTemperature: number;
        maxTemperature: number;
        defaultTopK: number;
        maxTopK: number;
      }>;
    };
  }
}
