import RecipeLayout from "../layouts/RecipeLayout";
import { Textarea } from "@/components/ui/textarea";
import RecipeComparison, {
  RecipeComparisonSkeleton,
} from "@/components/RecipeComparison";
import type { Recipe, RecipePair } from "@/types";
import { CheckboxList, CheckboxListSkeleton } from "@/components/CheckboxList";
import { Button } from "@/components/ui/button";
import { PromptApiService } from "@/services/prompt-api";
import { useEffect, useState, useRef } from "react";
import { parseRecipeResponse } from "@/lib/utils";

function CreateRecipe() {
  const promptApiServiceRef = useRef<PromptApiService | null>(null);
  const [cravings, setCravings] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecipes, setGeneratedRecipes] = useState<RecipePair | null>(
    null
  );

  const clasicRecipe: Recipe = {
    id: "1",
    image: "/placeholder-image.png",
    name: "Classic Spaghetti Bolognese",
    ingredients: [
      "200g spaghetti",
      "100g ground beef",
      "1 onion, chopped",
      "2 cloves garlic, minced",
      "400g canned tomatoes",
    ],
    instructions: [
      "Cook spaghetti according to package instructions.",
      "In a pan, sauté onion and garlic until translucent.",
      "Add ground beef and cook until browned.",
      "Pour in canned tomatoes and simmer for 20 minutes.",
      "Serve sauce over spaghetti.",
    ],
    nutritionalValues: {
      calories: 600,
      protein: 25,
      fat: 20,
      carbohydrates: 80,
      fiber: 5,
    },
  };

  const improvedRecipe: Recipe = {
    id: "2",
    image: "/placeholder-image.png",
    name: "Healthy Spaghetti Bolognese",
    ingredients: [
      "200g whole grain spaghetti",
      "100g lean ground turkey",
      "1 onion, chopped",
      "2 cloves garlic, minced",
      "400g canned tomatoes",
      "1 carrot, grated",
      "1 zucchini, grated",
    ],
    instructions: [
      "Cook whole grain spaghetti according to package instructions.",
      "In a pan, sauté onion and garlic until translucent.",
      "Add ground turkey and cook until browned.",
      "Stir in grated carrot and zucchini, cook for 5 minutes.",
      "Pour in canned tomatoes and simmer for 20 minutes.",
      "Serve sauce over whole grain spaghetti.",
    ],
    nutritionalValues: {
      calories: 450,
      protein: 30,
      fat: 10,
      carbohydrates: 60,
      fiber: 10,
    },
  };

  const generateMeal = async () => {
    if (!cravings || !promptApiServiceRef.current) return;

    try {
      setIsGenerating(true);
      const response = await promptApiServiceRef.current.getRecipe(cravings);
      console.log("AI Response (raw):", response);

      const recipes = parseRecipeResponse(response);
      console.log("Parsed recipes:", recipes);
      console.log("Classic Recipe:", recipes.clasicRecipe);
      console.log("Improved Recipe:", recipes.improvedRecipe);

      setGeneratedRecipes(recipes);
    } catch (error) {
      console.error("Error generating meal:", error);
    } finally {
      setIsGenerating(false);
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
      <div className="w-full p-8 rounded-2xl bg-neutral-50/90 border-1 border-neutral-400 shadow-xl drop-shadow-xl">
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
                clasicRecipe={generatedRecipes?.clasicRecipe || clasicRecipe}
                improvedRecipe={
                  generatedRecipes?.improvedRecipe || improvedRecipe
                }
              />
            )}
            {generatedRecipes && (
              <p className="font-medium">
                Results of smart swap: you reduced the calories by{" "}
                {generatedRecipes.clasicRecipe.nutritionalValues.calories -
                  generatedRecipes.improvedRecipe.nutritionalValues.calories}
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
                  items={
                    generatedRecipes?.improvedRecipe.ingredients ||
                    improvedRecipe.ingredients
                  }
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
        <div className="flex justify-end w-full">
          <Button>Save recipe</Button>
        </div>
      </div>
    </RecipeLayout>
  );
}

export default CreateRecipe;
