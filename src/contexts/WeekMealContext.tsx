import { createContext, useContext, useState, useCallback } from "react";
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

interface WeekMealContextType {
  weekMeals: WeekMeals;
  updateMeal: (day: DayOfWeek, mealTime: MealTime, recipeId: number) => void;
  updateQuantity: (
    day: DayOfWeek,
    mealTime: MealTime,
    quantity: number
  ) => void;
  loadWeekMeals: (meals: WeekMeals) => void;
  resetWeekMeals: () => void;
  getRecipesByCategory: (category: MealTime) => Recipe[];
  getRecipeById: (id: number) => Recipe | undefined;
  recipes: Recipe[];
}

const WeekMealContext = createContext<WeekMealContextType | undefined>(
  undefined
);

// Initial state for the week
const initialMealEntry: MealEntry = { recipeId: null, quantity: 0 };

const initialWeekMeals: WeekMeals = {
  Monday: {
    breakfast: { ...initialMealEntry },
    lunch: { ...initialMealEntry },
    snack: { ...initialMealEntry },
    dinner: { ...initialMealEntry },
  },
  Tuesday: {
    breakfast: { ...initialMealEntry },
    lunch: { ...initialMealEntry },
    snack: { ...initialMealEntry },
    dinner: { ...initialMealEntry },
  },
  Wednesday: {
    breakfast: { ...initialMealEntry },
    lunch: { ...initialMealEntry },
    snack: { ...initialMealEntry },
    dinner: { ...initialMealEntry },
  },
  Thursday: {
    breakfast: { ...initialMealEntry },
    lunch: { ...initialMealEntry },
    snack: { ...initialMealEntry },
    dinner: { ...initialMealEntry },
  },
  Friday: {
    breakfast: { ...initialMealEntry },
    lunch: { ...initialMealEntry },
    snack: { ...initialMealEntry },
    dinner: { ...initialMealEntry },
  },
  Saturday: {
    breakfast: { ...initialMealEntry },
    lunch: { ...initialMealEntry },
    snack: { ...initialMealEntry },
    dinner: { ...initialMealEntry },
  },
  Sunday: {
    breakfast: { ...initialMealEntry },
    lunch: { ...initialMealEntry },
    snack: { ...initialMealEntry },
    dinner: { ...initialMealEntry },
  },
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
        [mealTime]: {
          ...prev[day][mealTime],
          recipeId,
        },
      },
    }));
  };

  const updateQuantity = (
    day: DayOfWeek,
    mealTime: MealTime,
    quantity: number
  ) => {
    setWeekMeals((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [mealTime]: {
          ...prev[day][mealTime],
          quantity,
        },
      },
    }));
  };

  const getRecipesByCategory = (category: MealTime): Recipe[] => {
    return recipes.filter((recipe) => recipe.category.includes(category));
  };

  const getRecipeById = (id: number): Recipe | undefined => {
    return recipes.find((recipe) => recipe.id === id);
  };

  const loadWeekMeals = useCallback((meals: WeekMeals) => {
    setWeekMeals(meals);
  }, []);

  const resetWeekMeals = useCallback(() => {
    setWeekMeals(initialWeekMeals);
  }, []);

  return (
    <WeekMealContext.Provider
      value={{
        weekMeals,
        updateMeal,
        updateQuantity,
        loadWeekMeals,
        resetWeekMeals,
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
