import type { Recipe } from "@/types";
import RecipeCard, { RecipeCardSkeleton } from "./RecipeCard";
import { ChevronsRight } from "lucide-react";

interface RecipeComparisonProps {
  classicRecipe: Omit<Recipe, "id">;
  improvedRecipe: Omit<Recipe, "id">;
}

function RecipeComparison({
  classicRecipe,
  improvedRecipe,
}: RecipeComparisonProps) {
  return (
    <div className="flex gap-4 items-center">
      <RecipeCard
        recipe={classicRecipe}
        comparisonRecipe={improvedRecipe}
        title="Classic Recipe"
        image={classicRecipe.image}
      />
      <ChevronsRight size={64} className="text-green-600" />
      <RecipeCard
        recipe={improvedRecipe}
        comparisonRecipe={classicRecipe}
        title="Improved Recipe"
        image={improvedRecipe.image}
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
