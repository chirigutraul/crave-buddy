import RecipeLayout from "../layouts/RecipeLayout";
import { Textarea } from "@/components/ui/textarea";
import RecipeComparison, {
  RecipeComparisonSkeleton,
} from "@/components/RecipeComparison";
import type { Recipe, RecipePair } from "@/types";
import { CheckboxList, CheckboxListSkeleton } from "@/components/CheckboxList";
import { Button } from "@/components/ui/button";
import { PromptApiService } from "@/services/prompt-api.service";
import { recipeService } from "@/services/recipe.service";
import { ImageService } from "@/services/image.service";
import { useEffect, useState, useRef } from "react";
import { parseRecipeResponse } from "@/lib/utils";
import { formatIngredient } from "@/lib/recipe-utils";
import placeHolderImage from "@/assets/placeholder-image.jpg";

function CreateRecipe() {
  const promptApiServiceRef = useRef<PromptApiService | null>(null);
  const [cravings, setCravings] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecipes, setGeneratedRecipes] = useState<RecipePair | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [savedRecipeId, setSavedRecipeId] = useState<number | null>(null);

  const classicRecipe: Recipe = {
    id: 1,
    image: placeHolderImage,
    name: "Classic Spaghetti Bolognese",
    category: ["lunch", "dinner"],
    portionSize: 400,
    ingredients: [
      { quantity: 200, unit: "g", name: "spaghetti" },
      { quantity: 100, unit: "g", name: "ground beef" },
      { quantity: 1, unit: "piece", name: "onion, chopped" },
      { quantity: 2, unit: "cloves", name: "garlic, minced" },
      { quantity: 400, unit: "g", name: "canned tomatoes" },
    ],
    instructions: [
      "Cook spaghetti according to package instructions.",
      "In a pan, sauté onion and garlic until translucent.",
      "Add ground beef and cook until browned.",
      "Pour in canned tomatoes and simmer for 20 minutes.",
      "Serve sauce over spaghetti.",
    ],
    nutritionalValuesPer100g: {
      calories: 150,
      protein: 6,
      fat: 5,
      carbohydrates: 20,
      fiber: 1,
    },
  };

  const improvedRecipe: Recipe = {
    id: 2,
    image: placeHolderImage,
    name: "Healthy Spaghetti Bolognese",
    category: ["lunch", "dinner"],
    portionSize: 450,
    ingredients: [
      { quantity: 200, unit: "g", name: "whole grain spaghetti" },
      { quantity: 100, unit: "g", name: "lean ground turkey" },
      { quantity: 1, unit: "piece", name: "onion, chopped" },
      { quantity: 2, unit: "cloves", name: "garlic, minced" },
      { quantity: 400, unit: "g", name: "canned tomatoes" },
      { quantity: 1, unit: "piece", name: "carrot, grated" },
      { quantity: 1, unit: "piece", name: "zucchini, grated" },
    ],
    instructions: [
      "Cook whole grain spaghetti according to package instructions.",
      "In a pan, sauté onion and garlic until translucent.",
      "Add ground turkey and cook until browned.",
      "Stir in grated carrot and zucchini, cook for 5 minutes.",
      "Pour in canned tomatoes and simmer for 20 minutes.",
      "Serve sauce over whole grain spaghetti.",
    ],
    nutritionalValuesPer100g: {
      calories: 100,
      protein: 7,
      fat: 2,
      carbohydrates: 13,
      fiber: 2,
    },
  };

  const generateMeal = async () => {
    if (!cravings || !promptApiServiceRef.current) return;

    try {
      setIsGenerating(true);
      setSavedRecipeId(null); // Reset saved state when generating new recipe
      const response = await promptApiServiceRef.current.getRecipe(cravings);
      console.log("AI Response (raw):", response);

      const recipes = parseRecipeResponse(response);
      console.log("Parsed recipes:", recipes);
      console.log("Classic Recipe:", recipes.classicRecipe);
      console.log("Improved Recipe:", recipes.improvedRecipe);

      // Fetch image from Pexels for the improved recipe
      console.log("Fetching image for:", recipes.improvedRecipe.name);
      const imageUrl = await ImageService.searchRecipeImage(
        recipes.improvedRecipe.name
      );

      // Use fetched image or fallback to placeholder
      const finalImageUrl = imageUrl || ImageService.getFallbackImage();
      console.log("Using image URL:", finalImageUrl);

      // Add image URL to both recipes
      recipes.improvedRecipe.image = finalImageUrl;
      recipes.classicRecipe.image = finalImageUrl;

      setGeneratedRecipes(recipes);
    } catch (error) {
      console.error("Error generating meal:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const saveRecipe = async () => {
    if (!generatedRecipes) return;

    try {
      setIsSaving(true);
      const recipeToSave: Omit<Recipe, "id"> = {
        name: generatedRecipes.improvedRecipe.name,
        image:
          generatedRecipes.improvedRecipe.image ||
          ImageService.getFallbackImage(),
        category: generatedRecipes.improvedRecipe.category,
        portionSize: generatedRecipes.improvedRecipe.portionSize,
        ingredients: generatedRecipes.improvedRecipe.ingredients,
        instructions: generatedRecipes.improvedRecipe.instructions,
        nutritionalValuesPer100g:
          generatedRecipes.improvedRecipe.nutritionalValuesPer100g,
      };

      const recipeId = await recipeService.createRecipe(recipeToSave);
      setSavedRecipeId(recipeId);
      console.log("Recipe saved successfully with ID:", recipeId);
    } catch (error) {
      console.error("Error saving recipe:", error);
      alert("Failed to save recipe. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const initializeService = async () => {
      try {
        promptApiServiceRef.current = new PromptApiService();
        const availability =
          await promptApiServiceRef.current.getAvailability();
        if (availability !== "available") {
          console.log(`Prompt API is ${availability}. Please wait...`);
        }

        await promptApiServiceRef.current.init();
        setIsReady(true);
      } catch (error) {
        console.error("Failed to initialize Prompt API:", error);
      }
    };

    initializeService();
  }, []);

  return (
    <RecipeLayout>
      <div className="h-full w-full p-8 rounded-2xl bg-neutral-50/90 border-1 border-neutral-400 shadow-xl drop-shadow-xl">
        <h5 className="mb-4">Start planning your meal</h5>
        <div className="flex gap-16 justify-between">
          <div className="flex flex-col gap-4">
            <div className="w-96">
              <p className="mb-2">What are you craving today?</p>
              <Textarea
                value={cravings}
                onChange={(e) => setCravings(e.target.value)}
                placeholder="Write your cravings here.."
                className="h-32 mb-2"
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={() => generateMeal()}
                  disabled={!isReady || !cravings || isGenerating}
                >
                  {isGenerating ? "Generating..." : "Generate meal"}
                </Button>
              </div>
            </div>
            {isGenerating ? (
              <RecipeComparisonSkeleton />
            ) : (
              <RecipeComparison
                classicRecipe={generatedRecipes?.classicRecipe || classicRecipe}
                improvedRecipe={
                  generatedRecipes?.improvedRecipe || improvedRecipe
                }
              />
            )}
            {generatedRecipes && (
              <p className="font-medium">
                Results of smart swap: you reduced the calories by{" "}
                {Math.round(
                  (generatedRecipes.classicRecipe.nutritionalValuesPer100g
                    .calories *
                    generatedRecipes.classicRecipe.portionSize) /
                    100 -
                    (generatedRecipes.improvedRecipe.nutritionalValuesPer100g
                      .calories *
                      generatedRecipes.improvedRecipe.portionSize) /
                      100
                )}
                kcal per portion and lowered the fats
              </p>
            )}
          </div>
          <div className="flex flex-col gap-8">
            {isGenerating ? (
              <>
                <CheckboxListSkeleton title="Grocery List" />
                <CheckboxListSkeleton title="Preparation Steps" />
              </>
            ) : (
              <>
                <CheckboxList
                  title="Grocery List"
                  items={(
                    generatedRecipes?.improvedRecipe.ingredients ||
                    improvedRecipe.ingredients
                  ).map(formatIngredient)}
                />
                <CheckboxList
                  title="Preparation Steps"
                  items={
                    generatedRecipes?.improvedRecipe.instructions ||
                    improvedRecipe.instructions
                  }
                />
              </>
            )}
          </div>
        </div>
        <div className="flex justify-end w-full items-center gap-4">
          {savedRecipeId && (
            <p className="text-green-600 font-medium">
              Recipe saved successfully!
            </p>
          )}
          <Button
            onClick={saveRecipe}
            disabled={!generatedRecipes || isSaving || savedRecipeId !== null}
          >
            {isSaving ? "Saving..." : savedRecipeId ? "Saved" : "Save recipe"}
          </Button>
        </div>
      </div>
    </RecipeLayout>
  );
}

export default CreateRecipe;
