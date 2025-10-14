import { db } from "./db";
import type { Recipe } from "../types";

export class RecipeService {
  /**
   * Get all stored recipes
   */
  async getAllRecipes(): Promise<Recipe[]> {
    try {
      return await db.recipes.toArray();
    } catch (error) {
      console.error("Error getting all recipes:", error);
      throw error;
    }
  }

  /**
   * Get single recipe by ID
   */
  async getRecipeById(id: number): Promise<Recipe | undefined> {
    try {
      return await db.recipes.get(id);
    } catch (error) {
      console.error("Error getting recipe by ID:", error);
      throw error;
    }
  }

  /**
   * Get multiple recipes by IDs
   */
  async getRecipesByIds(ids: number[]): Promise<Recipe[]> {
    try {
      return await db.recipes.where("id").anyOf(ids).toArray();
    } catch (error) {
      console.error("Error getting recipes by IDs:", error);
      throw error;
    }
  }

  /**
   * Add new recipe
   */
  async createRecipe(recipe: Omit<Recipe, "id">): Promise<number> {
    try {
      const id = await db.recipes.add(recipe as Recipe);
      return id as number;
    } catch (error) {
      console.error("Error creating recipe:", error);
      throw error;
    }
  }

  /**
   * Update existing recipe
   */
  async updateRecipe(
    id: number,
    updates: Partial<Omit<Recipe, "id">>
  ): Promise<void> {
    try {
      await db.recipes.update(id, updates);
    } catch (error) {
      console.error("Error updating recipe:", error);
      throw error;
    }
  }

  /**
   * Remove recipe
   */
  async deleteRecipe(id: number): Promise<void> {
    try {
      await db.recipes.delete(id);
    } catch (error) {
      console.error("Error deleting recipe:", error);
      throw error;
    }
  }

  /**
   * Add multiple recipes at once
   */
  async bulkCreateRecipes(recipes: Omit<Recipe, "id">[]): Promise<number[]> {
    try {
      const ids = await db.recipes.bulkAdd(recipes as Recipe[]);
      return ids as number[];
    } catch (error) {
      console.error("Error bulk creating recipes:", error);
      throw error;
    }
  }

  /**
   * Search recipes by name
   */
  async searchRecipesByName(query: string): Promise<Recipe[]> {
    try {
      return await db.recipes
        .where("name")
        .startsWithIgnoreCase(query)
        .toArray();
    } catch (error) {
      console.error("Error searching recipes by name:", error);
      throw error;
    }
  }

  /**
   * Get recipes by nutritional range
   */
  async getRecipesByCalorieRange(
    minCalories: number,
    maxCalories: number
  ): Promise<Recipe[]> {
    try {
      return await db.recipes
        .where("nutritionalValues.calories")
        .between(minCalories, maxCalories, true, true)
        .toArray();
    } catch (error) {
      console.error("Error getting recipes by calorie range:", error);
      throw error;
    }
  }

  /**
   * Get total count of recipes
   */
  async getRecipeCount(): Promise<number> {
    try {
      return await db.recipes.count();
    } catch (error) {
      console.error("Error getting recipe count:", error);
      throw error;
    }
  }
}

export const recipeService = new RecipeService();
