import type { Recipe } from "@/types";
import RecipeCard, { RecipeCardSkeleton } from "./RecipeCard";
import { ChevronsRight } from "lucide-react";

interface RecipeComparisonProps {
  clasicRecipe: Omit<Recipe, "id" | "image">;
  improvedRecipe: Omit<Recipe, "id" | "image">;
}

function RecipeComparison({
  clasicRecipe,
  improvedRecipe,
}: RecipeComparisonProps) {
  return (
    <div className="flex gap-4 items-center">
      <RecipeCard
        recipe={clasicRecipe}
        comparisonRecipe={improvedRecipe}
        title="Classic Recipe"
      />
      <ChevronsRight size={64} className="text-green-600" />
      <RecipeCard
        recipe={improvedRecipe}
        comparisonRecipe={clasicRecipe}
        title="Improved Recipe"
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
