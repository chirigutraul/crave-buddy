import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import RecipeLayout from "@/layouts/RecipeLayout";
import RecipeCard from "@/components/RecipeCard";
import { Button } from "@/components/ui/button";
import { CheckboxListCard } from "@/components/CheckboxListCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { db } from "@/services/db";
import { ImageService } from "@/services/image.service";
import type { Recipe } from "@/types";
import { formatIngredient, downloadMarkdownFile } from "@/lib/recipe-utils";
import { Share, FileDown } from "lucide-react";
import { useViewTransition } from "@/hooks/use-view-transition";

const ViewRecipe = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useViewTransition();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  const handleExportMarkdown = () => {
    if (recipe) {
      downloadMarkdownFile(recipe);
    }
  };

  useEffect(() => {
    const loadRecipe = async () => {
      if (!id) {
        navigate("/create-recipe");
        return;
      }

      try {
        const recipeId = parseInt(id, 10);
        const foundRecipe = await db.recipes.get(recipeId);

        if (!foundRecipe) {
          navigate("/create-recipe");
          return;
        }

        setRecipe(foundRecipe);
      } catch (error) {
        console.error("Error loading recipe:", error);
        navigate("/create-recipe");
      } finally {
        setLoading(false);
      }
    };

    loadRecipe();
  }, [id, navigate]);

  if (loading) {
    return (
      <RecipeLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-neutral-800 text-lg">Loading recipe...</p>
        </div>
      </RecipeLayout>
    );
  }

  if (!recipe) {
    return null;
  }

  return (
    <RecipeLayout>
      <div className="h-full w-full p-8 rounded-2xl bg-neutral-50/90 border-1 border-neutral-400 shadow-xl drop-shadow-xl">
        {/* Header with Share Button */}
        <div className="flex justify-end items-center mb-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Share className="h-4 w-4" />
                Share
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={handleExportMarkdown}
                className="gap-2 cursor-pointer"
              >
                <FileDown className="h-4 w-4" />
                Export as Markdown
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left column - Recipe Card */}
          <div>
            <RecipeCard
              recipe={recipe}
              title={recipe.name}
              size="large"
              image={
                recipe.image && !recipe.image.includes("placeholder-image.png")
                  ? recipe.image
                  : ImageService.getFallbackImage()
              }
            />
          </div>

          {/* Right column - Grocery list and Preparation steps */}
          <div className="space-y-6">
            <CheckboxListCard
              title="Grocery list"
              items={recipe.ingredients.map(formatIngredient)}
            />
            <CheckboxListCard
              title="Preparation steps"
              items={recipe.instructions}
            />
            <Button
              size="lg"
              className="w-full bg-[#9ACD32] hover:bg-[#8AB622] text-white font-semibold py-6 text-lg"
            >
              Start cooking
            </Button>
          </div>
        </div>
      </div>
    </RecipeLayout>
  );
};

export default ViewRecipe;
