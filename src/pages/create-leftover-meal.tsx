import RecipeLayout from "@/layouts/RecipeLayout";
import { Textarea } from "@/components/ui/textarea";
import RecipeComparison, {
  RecipeComparisonSkeleton,
} from "@/components/RecipeComparison";
import type { Recipe, GeneratedRecipe } from "@/types";
import { CheckboxList, CheckboxListSkeleton } from "@/components/CheckboxList";
import { Button } from "@/components/ui/button";
import { PromptApiService } from "@/services/prompt-api.service";
import { recipeService } from "@/services/recipe.service";
import { ImageService } from "@/services/image.service";
import { useEffect, useState, useRef } from "react";
import { parseGeneratedRecipe } from "@/lib/utils";
import { formatIngredient } from "@/lib/recipe-utils";
import placeHolderImage from "@/assets/placeholder-image.jpg";

function CreateLeftoverMeal() {
  const promptApiServiceRef = useRef<PromptApiService | null>(null);
  const [leftoverIngredients, setLeftoverIngredients] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] =
    useState<GeneratedRecipe | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedRecipeId, setSavedRecipeId] = useState<number | null>(null);

  // Mock/placeholder recipe for initial display (prevents layout jumps)
  const placeholderRecipe: GeneratedRecipe = {
    image: placeHolderImage,
    name: "Healthy Leftover Bowl",
    category: ["lunch", "dinner"],
    portionSize: 350,
    ingredients: [
      { quantity: 150, unit: "g", name: "mixed vegetables" },
      { quantity: 100, unit: "g", name: "brown rice" },
      { quantity: 50, unit: "g", name: "lean protein" },
      { quantity: 1, unit: "tbsp", name: "low-sodium soy sauce" },
      { quantity: 1, unit: "tsp", name: "sesame oil" },
    ],
    instructions: [
      "Heat a wok or large pan over medium-high heat.",
      "Add vegetables and stir-fry for 3-4 minutes.",
      "Add protein and brown rice, stir well.",
      "Add low-sodium soy sauce and sesame oil.",
      "Cook for another 2 minutes and serve hot.",
    ],
    nutritionalValuesPer100g: {
      calories: 110,
      protein: 7,
      fat: 3,
      carbohydrates: 15,
      fiber: 3,
    },
    classicRecipeNutritionalValues: {
      calories: 130,
      protein: 6,
      fat: 4,
      carbohydrates: 18,
      fiber: 2,
    },
  };

  const generateMealFromLeftovers = async () => {
    if (!leftoverIngredients || !promptApiServiceRef.current) return;

    try {
      setIsGenerating(true);
      setSavedRecipeId(null);
      console.time("⏱️ Total leftover meal generation time");

      // Run recipe generation and image generation in parallel using leftover ingredients
      const [response, finalImageUrl] = await Promise.all([
        promptApiServiceRef.current.getRecipeFromLeftovers(leftoverIngredients),
        ImageService.getRecipeImage(leftoverIngredients),
      ]);

      console.timeEnd("⏱️ Total leftover meal generation time");
      console.log("✅ AI Response (raw):", response);

      const recipe = parseGeneratedRecipe(response);
      console.log("Parsed recipe:", recipe);
      console.log(
        "Classic Recipe Nutritional Values:",
        recipe.classicRecipeNutritionalValues
      );
      console.log("Improved Recipe:", recipe);

      // Add image URL to recipe
      recipe.image = finalImageUrl;

      setGeneratedRecipe(recipe);
    } catch (error) {
      console.error("Error generating meal from leftovers:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const saveRecipe = async () => {
    if (!generatedRecipe) return;

    try {
      setIsSaving(true);
      const recipeToSave: Omit<Recipe, "id"> = {
        name: generatedRecipe.name,
        image: generatedRecipe.image || ImageService.getFallbackImage(),
        category: generatedRecipe.category,
        portionSize: generatedRecipe.portionSize,
        ingredients: generatedRecipe.ingredients,
        instructions: generatedRecipe.instructions,
        nutritionalValuesPer100g: generatedRecipe.nutritionalValuesPer100g,
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
        <h5 className="mb-4">Create a meal from leftover ingredients</h5>
        <div className="flex gap-16 justify-between">
          <div className="flex flex-col gap-4">
            <div className="w-96">
              <p className="mb-2">What ingredients do you have left?</p>
              <Textarea
                value={leftoverIngredients}
                onChange={(e) => setLeftoverIngredients(e.target.value)}
                placeholder="E.g., chicken breast, rice, broccoli, carrots, soy sauce..."
                className="h-32 mb-2"
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={() => generateMealFromLeftovers()}
                  disabled={!isReady || !leftoverIngredients || isGenerating}
                >
                  {isGenerating ? "Generating..." : "Generate meal"}
                </Button>
              </div>
            </div>
            {isGenerating ? (
              <RecipeComparisonSkeleton />
            ) : (
              <RecipeComparison recipe={generatedRecipe || placeholderRecipe} />
            )}
            <p className="font-medium">
              Results of smart swap: you reduced the calories by{" "}
              {Math.round(
                ((generatedRecipe || placeholderRecipe)
                  .classicRecipeNutritionalValues.calories *
                  (generatedRecipe || placeholderRecipe).portionSize) /
                  100 -
                  ((generatedRecipe || placeholderRecipe)
                    .nutritionalValuesPer100g.calories *
                    (generatedRecipe || placeholderRecipe).portionSize) /
                    100
              )}
              kcal per portion and lowered the fats
            </p>
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
                  items={(generatedRecipe || placeholderRecipe).ingredients.map(
                    formatIngredient
                  )}
                />
                <CheckboxList
                  title="Preparation Steps"
                  items={(generatedRecipe || placeholderRecipe).instructions}
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
            disabled={!generatedRecipe || isSaving || savedRecipeId !== null}
          >
            {isSaving ? "Saving..." : savedRecipeId ? "Saved" : "Save recipe"}
          </Button>
        </div>
      </div>
    </RecipeLayout>
  );
}

export default CreateLeftoverMeal;
