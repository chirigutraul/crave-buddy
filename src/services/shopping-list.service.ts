import type { WeekMeals, Recipe, Ingredient } from "@/types";
import {
  scaleIngredients,
  aggregateIngredients,
  type AggregatedIngredient,
} from "@/lib/recipe-utils";

export class ShoppingListService {
  /**
   * Generates a weekly shopping list from a week's meal plan
   * @param weekMeals - The weekly meal plan with recipe IDs and quantities
   * @param getRecipeById - Function to fetch a recipe by ID
   * @returns Aggregated shopping list with all ingredients
   */
  generateWeeklyShoppingList(
    weekMeals: WeekMeals,
    getRecipeById: (id: number) => Recipe | undefined
  ): AggregatedIngredient[] {
    const ingredientsList: Array<{
      ingredients: Ingredient[];
      recipeName: string;
    }> = [];

    // Iterate through all days and meals
    Object.entries(weekMeals).forEach(([day, dayMeals]) => {
      Object.entries(dayMeals).forEach(([mealTime, mealEntry]) => {
        if (mealEntry.recipeId !== null && mealEntry.quantity > 0) {
          const recipe = getRecipeById(mealEntry.recipeId);

          if (recipe) {
            // Scale ingredients based on the desired quantity vs portion size
            const scaledIngredients = scaleIngredients(
              recipe.ingredients,
              recipe.portionSize,
              mealEntry.quantity
            );

            ingredientsList.push({
              ingredients: scaledIngredients,
              recipeName: `${recipe.name} (${day} ${mealTime})`,
            });
          }
        }
      });
    });

    // Aggregate all ingredients
    return aggregateIngredients(ingredientsList);
  }

  /**
   * Formats the shopping list for display
   * @param shoppingList - Aggregated shopping list
   * @returns Formatted string array
   */
  formatShoppingList(shoppingList: AggregatedIngredient[]): string[] {
    return shoppingList.map((item) => {
      const quantity =
        item.quantity % 1 === 0
          ? item.quantity.toString()
          : item.quantity.toFixed(1);
      return `${quantity}${item.unit} ${item.name}`;
    });
  }

  /**
   * Groups shopping list by category (for future enhancement)
   * This is a foundation for categorizing ingredients by type
   * (e.g., "Produce", "Dairy", "Meat", etc.)
   */
  groupByCategory(
    shoppingList: AggregatedIngredient[]
  ): Record<string, AggregatedIngredient[]> {
    // For now, return a simple "All Items" category
    // In the future, you could add logic to categorize ingredients
    return {
      "All Items": shoppingList,
    };
  }
}

export const shoppingListService = new ShoppingListService();
