import type { Recipe, GeneratedRecipe } from "@/types";
import RecipeCard, { RecipeCardSkeleton } from "./RecipeCard";
import { ChevronsRight } from "lucide-react";

interface RecipeComparisonProps {
  recipe: GeneratedRecipe;
}

function RecipeComparison({ recipe }: RecipeComparisonProps) {
  // Create a minimal classic recipe object for comparison purposes
  // We only need portionSize and nutritionalValuesPer100g for the RecipeCard comparison
  const classicRecipeForComparison: Omit<Recipe, "id" | "image"> = {
    name: "Classic Version",
    category: recipe.category,
    portionSize: recipe.portionSize, // Use same portion size for fair comparison
    ingredients: [],
    instructions: [],
    nutritionalValuesPer100g: recipe.classicRecipeNutritionalValues,
  };

  const improvedRecipe: Omit<Recipe, "id" | "image"> = {
    name: recipe.name,
    category: recipe.category,
    portionSize: recipe.portionSize,
    ingredients: recipe.ingredients,
    instructions: recipe.instructions,
    nutritionalValuesPer100g: recipe.nutritionalValuesPer100g,
  };

  return (
    <div className="flex gap-4 items-center">
      <RecipeCard
        recipe={classicRecipeForComparison}
        comparisonRecipe={improvedRecipe}
        title="Classic Recipe"
        image={recipe.image}
      />
      <ChevronsRight size={64} className="text-green-600" />
      <RecipeCard
        recipe={improvedRecipe}
        comparisonRecipe={classicRecipeForComparison}
        title="Improved Recipe"
        image={recipe.image}
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
