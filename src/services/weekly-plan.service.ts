import { db } from "./db";
import { recipeService } from "./recipe.service";
import type { WeeklyPlan, WeekMeals, DayOfWeek } from "../types";

export interface WeeklyPlanWithNutrition extends WeeklyPlan {
  totalNutrition: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber: number;
  };
  dailyNutrition: {
    [key in DayOfWeek]: {
      calories: number;
      protein: number;
      carbohydrates: number;
      fat: number;
      fiber: number;
    };
  };
}

export class WeeklyPlanService {
  /**
   * Get all weekly plans
   */
  async getAllWeeklyPlans(): Promise<WeeklyPlan[]> {
    try {
      return await db.weeklyPlans.orderBy("createdAt").reverse().toArray();
    } catch (error) {
      console.error("Error getting all weekly plans:", error);
      throw error;
    }
  }

  /**
   * Get single plan with full details
   */
  async getWeeklyPlanById(id: number): Promise<WeeklyPlan | undefined> {
    try {
      return await db.weeklyPlans.get(id);
    } catch (error) {
      console.error("Error getting weekly plan by ID:", error);
      throw error;
    }
  }

  /**
   * Get weekly plan with nutrition calculation
   */
  async getWeeklyPlanWithNutrition(
    id: number
  ): Promise<WeeklyPlanWithNutrition | undefined> {
    try {
      const plan = await this.getWeeklyPlanById(id);
      if (!plan) return undefined;

      const nutrition = await this.calculateWeeklyNutrition(plan.meals);

      return {
        ...plan,
        totalNutrition: nutrition.total,
        dailyNutrition: nutrition.daily,
      };
    } catch (error) {
      console.error("Error getting weekly plan with nutrition:", error);
      throw error;
    }
  }

  /**
   * Create new weekly plan
   */
  async createWeeklyPlan(
    plan: Omit<WeeklyPlan, "id" | "createdAt" | "updatedAt">
  ): Promise<number> {
    try {
      const now = new Date();
      const weeklyPlan: Omit<WeeklyPlan, "id"> = {
        ...plan,
        createdAt: now,
        updatedAt: now,
      };

      const id = await db.weeklyPlans.add(weeklyPlan as WeeklyPlan);
      return id as number;
    } catch (error) {
      console.error("Error creating weekly plan:", error);
      throw error;
    }
  }

  /**
   * Update existing plan
   */
  async updateWeeklyPlan(
    id: number,
    updates: Partial<Omit<WeeklyPlan, "id" | "createdAt">>
  ): Promise<void> {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date(),
      };

      await db.weeklyPlans.update(id, updateData);
    } catch (error) {
      console.error("Error updating weekly plan:", error);
      throw error;
    }
  }

  /**
   * Remove plan
   */
  async deleteWeeklyPlan(id: number): Promise<void> {
    try {
      await db.weeklyPlans.delete(id);
    } catch (error) {
      console.error("Error deleting weekly plan:", error);
      throw error;
    }
  }

  /**
   * Search weekly plans by name
   */
  async searchWeeklyPlansByName(query: string): Promise<WeeklyPlan[]> {
    try {
      return await db.weeklyPlans
        .where("name")
        .startsWithIgnoreCase(query)
        .toArray();
    } catch (error) {
      console.error("Error searching weekly plans by name:", error);
      throw error;
    }
  }

  /**
   * Calculate nutrition for a week's meals
   */
  async calculateWeeklyNutrition(meals: WeekMeals): Promise<{
    total: {
      calories: number;
      protein: number;
      carbohydrates: number;
      fat: number;
      fiber: number;
    };
    daily: {
      [key in DayOfWeek]: {
        calories: number;
        protein: number;
        carbohydrates: number;
        fat: number;
        fiber: number;
      };
    };
  }> {
    try {
      // Collect all unique recipe IDs from the week
      const recipeIds = new Set<number>();
      Object.values(meals).forEach((dayMeals) => {
        Object.values(dayMeals).forEach((recipeId) => {
          if (recipeId !== null) {
            recipeIds.add(recipeId);
          }
        });
      });

      // Fetch all recipes
      const recipes = await recipeService.getRecipesByIds(
        Array.from(recipeIds)
      );
      const recipeMap = new Map(recipes.map((recipe) => [recipe.id!, recipe]));

      // Calculate daily nutrition
      const dailyNutrition: {
        [key in DayOfWeek]: {
          calories: number;
          protein: number;
          carbohydrates: number;
          fat: number;
          fiber: number;
        };
      } = {
        Monday: { calories: 0, protein: 0, carbohydrates: 0, fat: 0, fiber: 0 },
        Tuesday: {
          calories: 0,
          protein: 0,
          carbohydrates: 0,
          fat: 0,
          fiber: 0,
        },
        Wednesday: {
          calories: 0,
          protein: 0,
          carbohydrates: 0,
          fat: 0,
          fiber: 0,
        },
        Thursday: {
          calories: 0,
          protein: 0,
          carbohydrates: 0,
          fat: 0,
          fiber: 0,
        },
        Friday: { calories: 0, protein: 0, carbohydrates: 0, fat: 0, fiber: 0 },
        Saturday: {
          calories: 0,
          protein: 0,
          carbohydrates: 0,
          fat: 0,
          fiber: 0,
        },
        Sunday: { calories: 0, protein: 0, carbohydrates: 0, fat: 0, fiber: 0 },
      };

      // Calculate nutrition for each day
      (Object.keys(meals) as DayOfWeek[]).forEach((day) => {
        const dayMeals = meals[day];
        const dayNutrition = dailyNutrition[day];

        // Add nutrition for each meal
        Object.values(dayMeals).forEach((recipeId) => {
          if (recipeId !== null) {
            const recipe = recipeMap.get(recipeId);
            if (recipe) {
              dayNutrition.calories += recipe.nutritionalValues.calories;
              dayNutrition.protein += recipe.nutritionalValues.protein;
              dayNutrition.carbohydrates +=
                recipe.nutritionalValues.carbohydrates;
              dayNutrition.fat += recipe.nutritionalValues.fat;
              dayNutrition.fiber += recipe.nutritionalValues.fiber;
            }
          }
        });
      });

      // Calculate total weekly nutrition
      const totalNutrition = {
        calories: 0,
        protein: 0,
        carbohydrates: 0,
        fat: 0,
        fiber: 0,
      };

      Object.values(dailyNutrition).forEach((dayNutrition) => {
        totalNutrition.calories += dayNutrition.calories;
        totalNutrition.protein += dayNutrition.protein;
        totalNutrition.carbohydrates += dayNutrition.carbohydrates;
        totalNutrition.fat += dayNutrition.fat;
        totalNutrition.fiber += dayNutrition.fiber;
      });

      return { total: totalNutrition, daily: dailyNutrition };
    } catch (error) {
      console.error("Error calculating weekly nutrition:", error);
      throw error;
    }
  }

  /**
   * Get all weekly plans with nutrition calculation
   */
  async getAllWeeklyPlansWithNutrition(): Promise<WeeklyPlanWithNutrition[]> {
    try {
      const plans = await this.getAllWeeklyPlans();
      const plansWithNutrition: WeeklyPlanWithNutrition[] = [];

      for (const plan of plans) {
        if (plan.id) {
          const planWithNutrition = await this.getWeeklyPlanWithNutrition(
            plan.id
          );
          if (planWithNutrition) {
            plansWithNutrition.push(planWithNutrition);
          }
        }
      }

      return plansWithNutrition;
    } catch (error) {
      console.error("Error getting all weekly plans with nutrition:", error);
      throw error;
    }
  }

  /**
   * Duplicate an existing weekly plan
   */
  async duplicateWeeklyPlan(id: number, newName: string): Promise<number> {
    try {
      const originalPlan = await this.getWeeklyPlanById(id);
      if (!originalPlan) {
        throw new Error("Weekly plan not found");
      }

      const duplicatedPlan: Omit<WeeklyPlan, "id" | "createdAt" | "updatedAt"> =
        {
          name: newName,
          meals: originalPlan.meals,
        };

      return await this.createWeeklyPlan(duplicatedPlan);
    } catch (error) {
      console.error("Error duplicating weekly plan:", error);
      throw error;
    }
  }
}

export const weeklyPlanService = new WeeklyPlanService();
