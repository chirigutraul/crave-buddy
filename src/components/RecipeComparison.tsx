import type { Recipe, PartialGeneratedRecipe } from "@/types";
import RecipeCard, { RecipeCardSkeleton } from "./RecipeCard";
import { ChevronsRight } from "lucide-react";

interface RecipeComparisonProps {
  recipe: PartialGeneratedRecipe;
}

function RecipeComparison({ recipe }: RecipeComparisonProps) {
  // Create a minimal classic recipe object for comparison purposes
  // We only need portionSize and nutritionalValuesPer100g for the RecipeCard comparison
  const classicRecipeForComparison: Partial<Omit<Recipe, "id" | "image">> = {
    name: "Classic Version",
    category: recipe.category,
    portionSize: recipe.portionSize,
    ingredients: [],
    instructions: [],
    nutritionalValuesPer100g: recipe.classicRecipeNutritionalValues,
  };

  const improvedRecipe: Partial<Omit<Recipe, "id" | "image">> = {
    name: recipe.name,
    category: recipe.category,
    portionSize: recipe.portionSize,
    ingredients: recipe.ingredients,
    instructions: recipe.instructions,
    nutritionalValuesPer100g: recipe.nutritionalValuesPer100g,
  };

  // Determine if classic card should show loading (only if nutritional values not available)
  const isClassicLoading =
    !recipe.classicRecipeNutritionalValues || !recipe.portionSize;

  // Determine if improved card should show loading (only if nutritional values not available)
  const isImprovedLoading =
    !recipe.nutritionalValuesPer100g || !recipe.portionSize;

  return (
    <div className="flex gap-4 items-center">
      <RecipeCard
        recipe={classicRecipeForComparison}
        comparisonRecipe={improvedRecipe}
        title="Classic Recipe"
        image={recipe.image}
        isLoading={isClassicLoading}
      />
      <ChevronsRight size={64} className="text-green-600" />
      <RecipeCard
        recipe={improvedRecipe}
        comparisonRecipe={classicRecipeForComparison}
        title="Improved Recipe"
        image={recipe.image}
        isLoading={isImprovedLoading}
      />
    </div>
  );
}

export function RecipeComparisonSkeleton() {
  return (
    <div className="flex gap-4 items-center">
      <RecipeCardSkeleton />
      <ChevronsRight size={64} className="text-green-600" />
      <RecipeCardSkeleton />
    </div>
  );
}

export default RecipeComparison;
