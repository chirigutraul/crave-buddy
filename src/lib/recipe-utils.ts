import type { Recipe, Ingredient } from "@/types";

/**
 * Calculates nutritional values for a specific quantity of a recipe
 * @param recipe - Recipe with nutritionalValuesPer100g
 * @param quantityInGrams - Desired quantity in grams
 * @returns Calculated nutritional values for the specified quantity
 */
export function calculateNutritionalValues(
  recipe: Recipe,
  quantityInGrams: number
) {
  const multiplier = quantityInGrams / 100;

  return {
    calories: Math.round(recipe.nutritionalValuesPer100g.calories * multiplier),
    protein:
      Math.round(recipe.nutritionalValuesPer100g.protein * multiplier * 10) /
      10,
    carbohydrates:
      Math.round(
        recipe.nutritionalValuesPer100g.carbohydrates * multiplier * 10
      ) / 10,
    fat: Math.round(recipe.nutritionalValuesPer100g.fat * multiplier * 10) / 10,
    fiber:
      Math.round(recipe.nutritionalValuesPer100g.fiber * multiplier * 10) / 10,
  };
}

/**
 * Scales ingredients from one portion size to another
 * @param ingredients - Original ingredients array
 * @param fromPortion - Original portion size in grams
 * @param toPortion - Target portion size in grams
 * @returns Scaled ingredients array
 */
export function scaleIngredients(
  ingredients: Ingredient[],
  fromPortion: number,
  toPortion: number
): Ingredient[] {
  const scaleFactor = toPortion / fromPortion;

  return ingredients.map((ingredient) => ({
    ...ingredient,
    quantity: Math.round(ingredient.quantity * scaleFactor * 100) / 100, // Round to 2 decimal places
  }));
}

/**
 * Formats an Ingredient object to a display string
 * @param ingredient - Ingredient object
 * @returns Formatted string (e.g., "200ml milk")
 */
export function formatIngredient(ingredient: Ingredient): string {
  const quantity =
    ingredient.quantity % 1 === 0
      ? ingredient.quantity.toString()
      : ingredient.quantity.toFixed(1);

  return `${quantity}${ingredient.unit} ${ingredient.name}`;
}

/**
 * Aggregates ingredients from multiple recipes into a shopping list
 * @param ingredientsList - Array of ingredient arrays from multiple recipes
 * @returns Aggregated shopping list with combined quantities
 */
export interface AggregatedIngredient extends Ingredient {
  recipes: string[]; // Track which recipes use this ingredient
}

export function aggregateIngredients(
  ingredientsList: Array<{ ingredients: Ingredient[]; recipeName: string }>
): AggregatedIngredient[] {
  const aggregatedMap = new Map<string, AggregatedIngredient>();

  ingredientsList.forEach(({ ingredients, recipeName }) => {
    ingredients.forEach((ingredient) => {
      // Create a key combining name and unit for grouping
      const key = `${ingredient.name.toLowerCase()}_${ingredient.unit.toLowerCase()}`;

      if (aggregatedMap.has(key)) {
        const existing = aggregatedMap.get(key)!;
        existing.quantity += ingredient.quantity;
        if (!existing.recipes.includes(recipeName)) {
          existing.recipes.push(recipeName);
        }
      } else {
        aggregatedMap.set(key, {
          ...ingredient,
          quantity: ingredient.quantity,
          recipes: [recipeName],
        });
      }
    });
  });

  return Array.from(aggregatedMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}
