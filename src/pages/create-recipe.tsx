import RecipeLayout from "../layouts/RecipeLayout";
import { Textarea } from "@/components/ui/textarea";
import RecipeComparison from "@/components/RecipeComparison";
import type { Recipe } from "@/types";
import { CheckboxList } from "@/components/CheckboxList";
import { Button } from "@/components/ui/button";

function CreateRecipe() {
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

  return (
    <RecipeLayout>
      <div className="max-w-5xl p-8 rounded-2xl bg-neutral-50/90 border-1 border-neutral-400 shadow-xl drop-shadow-xl">
        <h5 className="mb-4">Start planning your meal</h5>
        <div className="flex gap-16">
          <div className="flex flex-col gap-4">
            <div>
              <p className="mb-2">What are you craving today?</p>
              <Textarea
                placeholder="Write your cravings here.."
                className="w-96 h-32"
              />
            </div>
            <RecipeComparison
              clasicRecipe={clasicRecipe}
              improvedRecipe={improvedRecipe}
            />
            <p className="font-medium">
              Results of smart swap: you reduced the calories by 220kcal per
              portion and lowered the fats
            </p>
          </div>
          <div className="flex flex-col gap-8">
            <CheckboxList
              title="Grocery List"
              items={improvedRecipe.ingredients}
            />
            <CheckboxList
              title="Grocery List"
              items={improvedRecipe.ingredients}
            />
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
