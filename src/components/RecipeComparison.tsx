import type { Recipe } from "@/types";
import RecipeCard from "./RecipeCard";
import { ChevronsRight } from "lucide-react";

interface RecipeComparisonProps {
  clasicRecipe: Recipe;
  improvedRecipe: Recipe;
}

function RecipeComparison({
  clasicRecipe,
  improvedRecipe,
}: RecipeComparisonProps) {
  return (
    <div className="flex gap-4 items-center">
      <RecipeCard recipe={clasicRecipe} />
      <ChevronsRight size={64} className="text-green-600" />
      <RecipeCard recipe={improvedRecipe} />
    </div>
  );
}

export default RecipeComparison;
