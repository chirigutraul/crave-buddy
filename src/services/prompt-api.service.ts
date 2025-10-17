import type { Recipe, WeekMeals } from "@/types";

interface PromptApiServiceInterface {
  model: typeof window.LanguageModel;
  session: any;
}

export class PromptApiService implements PromptApiServiceInterface {
  model: typeof window.LanguageModel;
  session: any;

  constructor() {
    this.model = window.LanguageModel;
    this.session = null;
  }

  async init() {
    this.session = await this.model.create({
      initialPrompts: [
        {
          role: "system",
          content:
            "You are a skilled nutritionist/dietician who provides healthy meal suggestions.",
        },
      ],
    });
    console.log("Initialized");
  }

  async getAvailability(): Promise<
    "available" | "downloadable" | "downloading"
  > {
    const availability = await this.model.availability();
    return availability;
  }

  async prompt(input: string): Promise<string> {
    const response = await this.session.prompt(input);
    return response;
  }

  async getRecipe(cravings: string): Promise<string> {
    const clonedSession = await this.session.clone();
    const prompt = `I am craving: ${cravings}

Based on these cravings, please provide TWO recipes in JSON format:
1. A classic recipe that satisfies the craving
2. A healthier improved version with ingredient substitutions, lower in kcalories
Please categorize the recipes into the following categories: breakfast, lunch, snack, dinner.
The recipe can be in many categories. For example, some lunch recipes can also be suitable for dinner, or some snacks can also be suitable for breakfast. 
If the recipe is suitable for multiple categories, include all of them.
The nutritional values should be calculated per 100grams of the recipe.

Return the response in this exact JSON format:
{
  "clasicRecipe": {
    "name": "recipe name",
    "category": ["breakfast", "lunch", "snack", "dinner"],
    "ingredients": ["ingredient 1", "ingredient 2"],
    "instructions": ["step 1", "step 2"],
    "nutritionalValues": {
      "calories": 0,
      "protein": 0,
      "carbohydrates": 0,
      "fat": 0,
      "fiber": 0
    }
  },
  "improvedRecipe": {
    "name": "healthier recipe name",
    "category": ["breakfast", "lunch", "snack", "dinner"],
    "ingredients": ["ingredient 1", "ingredient 2"],
    "instructions": ["step 1", "step 2"],
    "nutritionalValues": {
      "calories": 0,
      "protein": 0,
      "carbohydrates": 0,
      "fat": 0,
      "fiber": 0
    }
  }
}`;

    console.log("Sending prompt to API...");
    const response = await clonedSession.prompt(prompt);
    console.log("Received response:", response);

    return response;
  }

  async generateWeeklyPlan(
    recipes: Recipe[],
    dailyCalorieLimit: number
  ): Promise<WeekMeals> {
    const clonedSession = await this.session.clone();

    // Group recipes by meal time
    const recipesByMealTime: Record<string, Record<string, string>> = {
      breakfast: {},
      lunch: {},
      snack: {},
      dinner: {},
    };

    // Create simple data structure: mealTime -> recipeName -> calories
    recipes.forEach((recipe) => {
      recipe.category.forEach((mealTime) => {
        recipesByMealTime[mealTime][
          recipe.name
        ] = `${recipe.nutritionalValues.calories}kcal`;
      });
    });

    // Format the recipes for the prompt
    let recipesText = "";
    Object.entries(recipesByMealTime).forEach(([mealTime, recipeList]) => {
      recipesText += `"${mealTime}":\n`;
      Object.entries(recipeList).forEach(([recipeName, calories]) => {
        recipesText += `    "${recipeName}": "${calories}"\n`;
      });
    });

    const prompt = `I need you to create a weekly meal plan for 7 days (Monday through Sunday) with a daily calorie limit of ${dailyCalorieLimit} kcal.

Here are the available recipes organized by meal time:

${recipesText}

Please create a meal plan where each day includes:
- breakfast
- lunch
- snack
- dinner

IMPORTANT RULES:
1. The total calories for each day should NOT exceed ${dailyCalorieLimit} kcal
2. You must use ONLY the recipe names provided above
3. Each meal should use a recipe from its corresponding meal time category
4. Try to provide variety across the week (don't repeat the same recipe too often)
5. Make sure the daily total stays under the calorie limit

Return the response in this exact JSON format (use recipe names exactly as provided):
{
  "Monday": {
    "breakfast": { "recipe": "recipe name", "quantity": 250 },
    "lunch": { "recipe": "recipe name", "quantity": 400 },
    "snack": { "recipe": "recipe name", "quantity": 150 },
    "dinner": { "recipe": "recipe name", "quantity": 450 }
  },
  "Tuesday": {
    "breakfast": { "recipe": "recipe name", "quantity": 250 },
    "lunch": { "recipe": "recipe name", "quantity": 400 },
    "snack": { "recipe": "recipe name", "quantity": 150 },
    "dinner": { "recipe": "recipe name", "quantity": 450 }
  },
  "Wednesday": {
    "breakfast": { "recipe": "recipe name", "quantity": 250 },
    "lunch": { "recipe": "recipe name", "quantity": 400 },
    "snack": { "recipe": "recipe name", "quantity": 150 },
    "dinner": { "recipe": "recipe name", "quantity": 450 }
  },
  "Thursday": {
    "breakfast": { "recipe": "recipe name", "quantity": 250 },
    "lunch": { "recipe": "recipe name", "quantity": 400 },
    "snack": { "recipe": "recipe name", "quantity": 150 },
    "dinner": { "recipe": "recipe name", "quantity": 450 }
  },
  "Friday": {
    "breakfast": { "recipe": "recipe name", "quantity": 250 },
    "lunch": { "recipe": "recipe name", "quantity": 400 },
    "snack": { "recipe": "recipe name", "quantity": 150 },
    "dinner": { "recipe": "recipe name", "quantity": 450 }
  },
  "Saturday": {
    "breakfast": { "recipe": "recipe name", "quantity": 250 },
    "lunch": { "recipe": "recipe name", "quantity": 400 },
    "snack": { "recipe": "recipe name", "quantity": 150 },
    "dinner": { "recipe": "recipe name", "quantity": 450 }
  },
  "Sunday": {
    "breakfast": { "recipe": "recipe name", "quantity": 250 },
    "lunch": { "recipe": "recipe name", "quantity": 400 },
    "snack": { "recipe": "recipe name", "quantity": 150 },
    "dinner": { "recipe": "recipe name", "quantity": 450 }
  }
}

Where quantity is measured in grams and represents an appropriate portion size for each meal.
IMPORTANT: Return ONLY the JSON object, no additional text or explanation.`;

    console.log("Generating weekly meal plan...");
    const response = await clonedSession.prompt(prompt);
    console.log("Received weekly plan response:", response);

    // Parse the AI response
    const cleanedResponse = response
      .trim()
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "");
    const aiPlan = JSON.parse(cleanedResponse);

    // Create a map of recipe names to IDs for quick lookup
    const recipeNameToId = new Map<string, number>();
    recipes.forEach((recipe) => {
      if (recipe.id !== undefined) {
        recipeNameToId.set(recipe.name, recipe.id);
      }
    });

    // Convert AI response (recipe names + quantities) to WeekMeals structure (recipe IDs + quantities)
    const initialMealEntry = { recipeId: null, quantity: 0 };
    const weekMeals: WeekMeals = {
      Monday: {
        breakfast: { ...initialMealEntry },
        lunch: { ...initialMealEntry },
        snack: { ...initialMealEntry },
        dinner: { ...initialMealEntry },
      },
      Tuesday: {
        breakfast: { ...initialMealEntry },
        lunch: { ...initialMealEntry },
        snack: { ...initialMealEntry },
        dinner: { ...initialMealEntry },
      },
      Wednesday: {
        breakfast: { ...initialMealEntry },
        lunch: { ...initialMealEntry },
        snack: { ...initialMealEntry },
        dinner: { ...initialMealEntry },
      },
      Thursday: {
        breakfast: { ...initialMealEntry },
        lunch: { ...initialMealEntry },
        snack: { ...initialMealEntry },
        dinner: { ...initialMealEntry },
      },
      Friday: {
        breakfast: { ...initialMealEntry },
        lunch: { ...initialMealEntry },
        snack: { ...initialMealEntry },
        dinner: { ...initialMealEntry },
      },
      Saturday: {
        breakfast: { ...initialMealEntry },
        lunch: { ...initialMealEntry },
        snack: { ...initialMealEntry },
        dinner: { ...initialMealEntry },
      },
      Sunday: {
        breakfast: { ...initialMealEntry },
        lunch: { ...initialMealEntry },
        snack: { ...initialMealEntry },
        dinner: { ...initialMealEntry },
      },
    };

    // Map recipe names and quantities to IDs and quantities
    Object.entries(aiPlan).forEach(([day, meals]: [string, any]) => {
      const dayKey = day as keyof WeekMeals;
      weekMeals[dayKey] = {
        breakfast: {
          recipeId: recipeNameToId.get(meals.breakfast.recipe) ?? null,
          quantity: meals.breakfast.quantity ?? 0,
        },
        lunch: {
          recipeId: recipeNameToId.get(meals.lunch.recipe) ?? null,
          quantity: meals.lunch.quantity ?? 0,
        },
        snack: {
          recipeId: recipeNameToId.get(meals.snack.recipe) ?? null,
          quantity: meals.snack.quantity ?? 0,
        },
        dinner: {
          recipeId: recipeNameToId.get(meals.dinner.recipe) ?? null,
          quantity: meals.dinner.quantity ?? 0,
        },
      };
    });

    return weekMeals;
  }
}
