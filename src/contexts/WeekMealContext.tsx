import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/services/db";
import type { Recipe as RecipeType, MealTime as MealTimeType } from "@/types";

// Re-export types from types.tsx
export type MealTime = MealTimeType;
export type Recipe = RecipeType;

export type DayOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export interface DayMeals {
  breakfast: number | null;
  lunch: number | null;
  snack: number | null;
  dinner: number | null;
}

export type WeekMeals = {
  [key in DayOfWeek]: DayMeals;
};

interface WeekMealContextType {
  weekMeals: WeekMeals;
  updateMeal: (day: DayOfWeek, mealTime: MealTime, recipeId: number) => void;
  getRecipesByCategory: (category: MealTime) => Recipe[];
  getRecipeById: (id: number) => Recipe | undefined;
  recipes: Recipe[];
}

const WeekMealContext = createContext<WeekMealContextType | undefined>(
  undefined
);

// Initial state for the week
const initialWeekMeals: WeekMeals = {
  Monday: { breakfast: null, lunch: null, snack: null, dinner: null },
  Tuesday: { breakfast: null, lunch: null, snack: null, dinner: null },
  Wednesday: { breakfast: null, lunch: null, snack: null, dinner: null },
  Thursday: { breakfast: null, lunch: null, snack: null, dinner: null },
  Friday: { breakfast: null, lunch: null, snack: null, dinner: null },
  Saturday: { breakfast: null, lunch: null, snack: null, dinner: null },
  Sunday: { breakfast: null, lunch: null, snack: null, dinner: null },
};

export function WeekMealProvider({ children }: { children: ReactNode }) {
  const [weekMeals, setWeekMeals] = useState<WeekMeals>(initialWeekMeals);

  // Fetch recipes from Dexie.js using useLiveQuery
  const recipes = useLiveQuery(() => db.recipes.toArray(), []) || [];

  const updateMeal = (day: DayOfWeek, mealTime: MealTime, recipeId: number) => {
    setWeekMeals((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [mealTime]: recipeId,
      },
    }));
  };

  const getRecipesByCategory = (category: MealTime): Recipe[] => {
    return recipes.filter((recipe) => recipe.category.includes(category));
  };

  const getRecipeById = (id: number): Recipe | undefined => {
    return recipes.find((recipe) => recipe.id === id);
  };

  return (
    <WeekMealContext.Provider
      value={{
        weekMeals,
        updateMeal,
        getRecipesByCategory,
        getRecipeById,
        recipes,
      }}
    >
      {children}
    </WeekMealContext.Provider>
  );
}

export function useWeekMeal() {
  const context = useContext(WeekMealContext);
  if (context === undefined) {
    throw new Error("useWeekMeal must be used within a WeekMealProvider");
  }
  return context;
}
