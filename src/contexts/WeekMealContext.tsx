import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

// Define types
export type MealTime = "breakfast" | "lunch" | "dinner";

export type DayOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export interface Recipe {
  id: string;
  name: string;
  category: MealTime;
}

export interface DayMeals {
  breakfast: string | null;
  lunch: string | null;
  dinner: string | null;
}

export type WeekMeals = {
  [key in DayOfWeek]: DayMeals;
};

// Available recipes categorized by meal time
export const AVAILABLE_RECIPES: Recipe[] = [
  // Breakfast recipes
  {
    id: "pancakes",
    name: "Pancakes with Maple Syrup",
    category: "breakfast",
  },
  {
    id: "avocado-toast",
    name: "Avocado Toast",
    category: "breakfast",
  },
  {
    id: "yogurt-parfait",
    name: "Greek Yogurt Parfait",
    category: "breakfast",
  },
  {
    id: "eggs-benedict",
    name: "Eggs Benedict",
    category: "breakfast",
  },
  {
    id: "overnight-oats",
    name: "Overnight Oats",
    category: "breakfast",
  },
  {
    id: "omelette",
    name: "Omelette with Cheese",
    category: "breakfast",
  },
  {
    id: "fruit-salad",
    name: "Fruit Salad",
    category: "breakfast",
  },
  // Lunch recipes
  {
    id: "caesar-salad",
    name: "Caesar Salad",
    category: "lunch",
  },
  {
    id: "grilled-chicken-sandwich",
    name: "Grilled Chicken Sandwich",
    category: "lunch",
  },
  {
    id: "quinoa-bowl",
    name: "Quinoa Buddha Bowl",
    category: "lunch",
  },
  {
    id: "tomato-soup",
    name: "Tomato Basil Soup",
    category: "lunch",
  },
  {
    id: "turkey-wrap",
    name: "Turkey Club Wrap",
    category: "lunch",
  },
  {
    id: "chicken-salad",
    name: "Salad with Chicken",
    category: "lunch",
  },
  {
    id: "tuna-salad",
    name: "Salad with Tuna",
    category: "lunch",
  },
  // Dinner recipes
  {
    id: "spaghetti-carbonara",
    name: "Spaghetti Carbonara",
    category: "dinner",
  },
  {
    id: "grilled-salmon",
    name: "Grilled Salmon",
    category: "dinner",
  },
  {
    id: "beef-stir-fry",
    name: "Beef Stir Fry",
    category: "dinner",
  },
  {
    id: "chicken-tikka",
    name: "Chicken Tikka Masala",
    category: "dinner",
  },
  {
    id: "vegetable-lasagna",
    name: "Vegetable Lasagna",
    category: "dinner",
  },
  {
    id: "pizza",
    name: "Pizza with Salad",
    category: "dinner",
  },
  {
    id: "chicken-rice",
    name: "Chicken with Rice and Vegetables",
    category: "dinner",
  },
];

interface WeekMealContextType {
  weekMeals: WeekMeals;
  updateMeal: (day: DayOfWeek, mealTime: MealTime, recipeId: string) => void;
  getRecipesByCategory: (category: MealTime) => Recipe[];
  getRecipeById: (id: string) => Recipe | undefined;
}

const WeekMealContext = createContext<WeekMealContextType | undefined>(
  undefined
);

// Initial state for the week
const initialWeekMeals: WeekMeals = {
  Monday: { breakfast: null, lunch: null, dinner: null },
  Tuesday: { breakfast: null, lunch: null, dinner: null },
  Wednesday: { breakfast: null, lunch: null, dinner: null },
  Thursday: { breakfast: null, lunch: null, dinner: null },
  Friday: { breakfast: null, lunch: null, dinner: null },
  Saturday: { breakfast: null, lunch: null, dinner: null },
  Sunday: { breakfast: null, lunch: null, dinner: null },
};

export function WeekMealProvider({ children }: { children: ReactNode }) {
  const [weekMeals, setWeekMeals] = useState<WeekMeals>(initialWeekMeals);

  const updateMeal = (day: DayOfWeek, mealTime: MealTime, recipeId: string) => {
    setWeekMeals((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [mealTime]: recipeId,
      },
    }));
  };

  const getRecipesByCategory = (category: MealTime): Recipe[] => {
    return AVAILABLE_RECIPES.filter((recipe) => recipe.category === category);
  };

  const getRecipeById = (id: string): Recipe | undefined => {
    return AVAILABLE_RECIPES.find((recipe) => recipe.id === id);
  };

  return (
    <WeekMealContext.Provider
      value={{ weekMeals, updateMeal, getRecipesByCategory, getRecipeById }}
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
