import RecipeLayout from "../layouts/RecipeLayout";
import { Textarea } from "@/components/ui/textarea";
import RecipeComparison, {
  RecipeComparisonSkeleton,
} from "@/components/RecipeComparison";
import type { Recipe, GeneratedRecipe, PartialGeneratedRecipe } from "@/types";
import { CheckboxList, CheckboxListSkeleton } from "@/components/CheckboxList";
import { Button } from "@/components/ui/button";
import { PromptApiService } from "@/services/prompt-api.service";
import { recipeService } from "@/services/recipe.service";
import { ImageService } from "@/services/image.service";
import { useEffect, useState, useRef } from "react";
import { formatIngredient } from "@/lib/recipe-utils";
import placeHolderImage from "@/assets/placeholder-image.jpg";
import { showError, showInfo, showSuccess } from "@/lib/toast";
import { toast } from "react-toastify";

function CreateRecipe() {
  const promptApiServiceRef = useRef<PromptApiService | null>(null);
  const [cravings, setCravings] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] =
    useState<GeneratedRecipe | null>(null);
  const [partialRecipe, setPartialRecipe] =
    useState<PartialGeneratedRecipe | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedRecipeId, setSavedRecipeId] = useState<number | null>(null);

  // Mock/placeholder recipe for initial display (prevents layout jumps)
  const placeholderRecipe: GeneratedRecipe = {
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
      {
        instruction:
          "Cook whole grain spaghetti according to package instructions.",
        time: 600,
      },
      {
        instruction: "In a pan, sauté onion and garlic until translucent.",
        time: 180,
      },
      {
        instruction: "Add ground turkey and cook until browned.",
        time: 300,
      },
      {
        instruction: "Stir in grated carrot and zucchini, cook for 5 minutes.",
        time: 300,
      },
      {
        instruction: "Pour in canned tomatoes and simmer for 20 minutes.",
        time: 1200,
      },
      {
        instruction: "Serve sauce over whole grain spaghetti.",
        time: 60,
      },
    ],
    nutritionalValuesPer100g: {
      calories: 100,
      protein: 7,
      fat: 2,
      carbohydrates: 13,
      fiber: 2,
    },
    classicRecipeNutritionalValues: {
      calories: 150,
      protein: 6,
      fat: 5,
      carbohydrates: 20,
      fiber: 1,
    },
  };

  // Helper function to add timeout to promises
  const withTimeout = <T,>(
    promise: Promise<T>,
    timeoutMs: number,
    errorMessage: string
  ): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
      ),
    ]);
  };

  const generateMeal = async () => {
    if (!cravings || !promptApiServiceRef.current) return;

    let generatingToastId: string | number | null = null;

    try {
      setIsGenerating(true);
      setSavedRecipeId(null); // Reset saved state when generating new recipe
      setPartialRecipe({}); // Start with empty partial recipe
      setGeneratedRecipe(null); // Clear previous recipe
      console.time("⏱️ Total meal generation time");

      showInfo("Starting meal generation...");

      // Start all three requests in parallel with timeouts
      const imagePromise = withTimeout(
        ImageService.getRecipeImage(cravings),
        30000, // 30 second timeout
        "Image generation timed out"
      );
      const classicNutritionPromise = withTimeout(
        promptApiServiceRef.current.getClassicRecipeNutrition(cravings),
        60000, // 60 second timeout
        "Classic nutrition calculation timed out"
      );
      const improvedRecipePromise = withTimeout(
        promptApiServiceRef.current.getImprovedRecipe(cravings),
        120000, // 120 second timeout (2 minutes) - this is the longest operation
        "Recipe generation timed out. The AI might be overloaded. Please try again."
      );

      // Handle image completion first (usually fastest)
      imagePromise
        .then((imageUrl) => {
          console.log("✅ Image loaded");
          setPartialRecipe((prev) => ({
            ...prev,
            image: imageUrl,
          }));
        })
        .catch((error) => {
          console.warn("Image loading failed:", error);
          // Continue without image - use fallback
        });

      // Handle classic nutritional values (lightweight, completes second)
      classicNutritionPromise
        .then((response) => {
          console.log("✅ Classic nutritional values loaded");
          const classicNutrition = JSON.parse(response);
          setPartialRecipe((prev) => ({
            ...prev,
            portionSize: classicNutrition.portionSize,
            classicRecipeNutritionalValues:
              classicNutrition.nutritionalValuesPer100g,
          }));
        })
        .catch((error) => {
          console.warn("Classic nutrition loading failed:", error);
        });

      // Wait a bit before showing the next toast for sequential feel
      await new Promise((resolve) => setTimeout(resolve, 2000));
      showInfo("Getting classic recipe nutritional values...");

      // Wait a bit more before showing the generating toast
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Show persistent toast for improved recipe generation
      generatingToastId = showInfo("Generating improved recipe...", {
        autoClose: false,
      });

      // Handle improved recipe (heaviest, completes last)
      console.log("🔄 Waiting for improved recipe generation...");
      const improvedRecipeResponse = await improvedRecipePromise;
      console.log("✅ Improved recipe loaded");

      // Dismiss the generating toast
      if (generatingToastId) {
        toast.dismiss(generatingToastId);
      }

      showInfo("Calculating nutritional values...");
      const improvedRecipe = JSON.parse(improvedRecipeResponse);

      // Update partial recipe with improved recipe data
      setPartialRecipe((prev) => ({
        ...prev,
        ...improvedRecipe,
      }));

      // Wait for all to complete
      const [finalImageUrl, classicNutritionResponse] =
        await Promise.allSettled([imagePromise, classicNutritionPromise]);

      console.timeEnd("⏱️ Total meal generation time");

      // Parse final responses with fallbacks
      const imageUrl =
        finalImageUrl.status === "fulfilled"
          ? finalImageUrl.value
          : ImageService.getFallbackImage();

      let classicNutrition;
      if (classicNutritionResponse.status === "fulfilled") {
        classicNutrition = JSON.parse(classicNutritionResponse.value);
      } else {
        // Use default values if classic nutrition failed
        classicNutrition = {
          portionSize: improvedRecipe.portionSize || 400,
          nutritionalValuesPer100g: {
            calories: 150,
            protein: 10,
            carbohydrates: 20,
            fat: 5,
            fiber: 2,
          },
        };
        console.warn("Using fallback classic nutrition values");
      }

      // Combine into final recipe
      const finalRecipe: GeneratedRecipe = {
        ...improvedRecipe,
        image: imageUrl,
        classicRecipeNutritionalValues:
          classicNutrition.nutritionalValuesPer100g,
      };

      console.log("Parsed recipe:", finalRecipe);
      console.log(
        "Classic Recipe Nutritional Values:",
        finalRecipe.classicRecipeNutritionalValues
      );

      setGeneratedRecipe(finalRecipe);
      setPartialRecipe(null); // Clear partial recipe once complete
      showSuccess("Meal generated successfully!");
    } catch (error) {
      console.error("Error generating meal:", error);
      // Dismiss the generating toast if it's still showing
      if (generatingToastId) {
        toast.dismiss(generatingToastId);
      }

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to generate meal. Please try again.";
      showError(errorMessage);

      // If it's a timeout, suggest reloading to reinitialize AI
      if (errorMessage.includes("timed out")) {
        setTimeout(() => {
          showInfo("Try refreshing the page to restart the AI session.", {
            autoClose: 7000,
          });
        }, 1000);
      }
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
      showSuccess("Recipe saved successfully!");
    } catch (error) {
      console.error("Error saving recipe:", error);
      showError("Failed to save recipe. Please try again.");
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
            {isGenerating && !partialRecipe ? (
              <RecipeComparisonSkeleton />
            ) : (
              <RecipeComparison
                recipe={partialRecipe || generatedRecipe || placeholderRecipe}
              />
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
                  items={(
                    generatedRecipe || placeholderRecipe
                  ).instructions.map((step) => step.instruction)}
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

export default CreateRecipe;
