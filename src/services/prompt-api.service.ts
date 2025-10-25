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

IMPORTANT INSTRUCTIONS:
- Provide ingredients as structured objects with quantity, unit, and name
- Use DECIMAL numbers for quantities (e.g., 0.5, 0.25, 0.75), NOT fractions (not 1/2, 1/4, 3/4)
- Provide portionSize as the total weight in grams for ONE serving
- Provide nutritionalValuesPer100g (not per portion)
- Make sure the ingredients match the portion size
- Return VALID JSON ONLY - no trailing commas, no comments, no extra text
- DO NOT include any text before or after the JSON object

Return the response in this exact JSON format:
{
  "classicRecipe": {
    "name": "recipe name",
    "category": ["breakfast", "lunch", "snack", "dinner"],
    "portionSize": 350,
    "ingredients": [
      { "quantity": 200, "unit": "ml", "name": "milk" },
      { "quantity": 50, "unit": "g", "name": "oats" },
      { "quantity": 0.5, "unit": "cup", "name": "blueberries" },
      { "quantity": 1, "unit": "piece", "name": "banana" }
    ],
    "instructions": ["step 1", "step 2"],
    "nutritionalValuesPer100g": {
      "calories": 120,
      "protein": 5,
      "carbohydrates": 15,
      "fat": 3,
      "fiber": 2
    }
  },
  "improvedRecipe": {
    "name": "healthier recipe name",
    "category": ["breakfast", "lunch", "snack", "dinner"],
    "portionSize": 350,
    "ingredients": [
      { "quantity": 200, "unit": "ml", "name": "almond milk" },
      { "quantity": 60, "unit": "g", "name": "steel-cut oats" },
      { "quantity": 0.25, "unit": "cup", "name": "chia seeds" },
      { "quantity": 1, "unit": "piece", "name": "banana" }
    ],
    "instructions": ["step 1", "step 2"],
    "nutritionalValuesPer100g": {
      "calories": 95,
      "protein": 4,
      "carbohydrates": 12,
      "fat": 2,
      "fiber": 3
    }
  }
}

IMPORTANT: Return ONLY the JSON object above. No additional text, explanations, or markdown formatting.`;

    console.log("Sending prompt to API...");
    const response = await clonedSession.prompt(prompt);
    console.log("Received response:", response);

    return response;
  }

  async generateWeeklyPlan(
    recipes: Recipe[],
    dailyCalorieLimit: number
  ): Promise<WeekMeals> {
    const weeklyPlanSession = await window.LanguageModel.create({
      initialPrompts: [
        {
          role: "system",
          content:
            "You are a meal planner AI. Your job is to select meals from the provided lists to create a balanced and varied 7-day meal plan.",
        },
      ],
    });

    // Group recipes by meal time with id, name, and calories
    const recipesByMealTime: Record<
      string,
      Record<string, { name: string; kcal: number }>
    > = {
      breakfast: {},
      lunch: {},
      snack: {},
      dinner: {},
    };

    // Create simple data structure: mealTime -> recipeId -> {name, kcal per 100g}
    recipes.forEach((recipe) => {
      recipe.category.forEach((mealTime) => {
        recipesByMealTime[mealTime][recipe.id] = {
          name: recipe.name,
          kcal: recipe.nutritionalValuesPer100g.calories,
        };
      });
    });

    // Get the keys (recipe IDs) for each category
    const breakfastIds = Object.keys(recipesByMealTime.breakfast);
    const lunchIds = Object.keys(recipesByMealTime.lunch);
    const snackIds = Object.keys(recipesByMealTime.snack);
    const dinnerIds = Object.keys(recipesByMealTime.dinner);

    const prompt = `
Your task is to create a 7-day meal plan (Monday through Sunday).

CRITICAL RULE: You MUST ONLY select recipe IDs from the lists below. Each meal time has its OWN list.

═══════════════════════════════════════════════════════════════
BREAKFAST RECIPES (use ONLY these IDs for breakfast):
${JSON.stringify(recipesByMealTime.breakfast, null, 2)}
Valid breakfast IDs: [${breakfastIds.join(", ")}]

LUNCH RECIPES (use ONLY these IDs for lunch):
${JSON.stringify(recipesByMealTime.lunch, null, 2)}
Valid lunch IDs: [${lunchIds.join(", ")}]

SNACK RECIPES (use ONLY these IDs for snack):
${JSON.stringify(recipesByMealTime.snack, null, 2)}
Valid snack IDs: [${snackIds.join(", ")}]

DINNER RECIPES (use ONLY these IDs for dinner):
${JSON.stringify(recipesByMealTime.dinner, null, 2)}
Valid dinner IDs: [${dinnerIds.join(", ")}]
═══════════════════════════════════════════════════════════════

STEP-BY-STEP PROCESS FOR EACH DAY:
1. Pick a breakfast ID from ONLY the "Valid breakfast IDs" list
2. Pick a lunch ID from ONLY the "Valid lunch IDs" list  
3. Pick a snack ID from ONLY the "Valid snack IDs" list
4. Pick a dinner ID from ONLY the "Valid dinner IDs" list

VALIDATION CHECKLIST:
- Every breakfast ID must be in [${breakfastIds.join(", ")}]
- Every lunch ID must be in [${lunchIds.join(", ")}]
- Every snack ID must be in [${snackIds.join(", ")}]
- Every dinner ID must be in [${dinnerIds.join(", ")}]

Try to create variety across the week when possible.

REQUIRED OUTPUT FORMAT:
{
  "Monday": {
    "breakfast": "ID_from_breakfast_list",
    "lunch": "ID_from_lunch_list",
    "snack": "ID_from_snack_list",
    "dinner": "ID_from_dinner_list"
  },
  "Tuesday": {
    "breakfast": "ID_from_breakfast_list",
    "lunch": "ID_from_lunch_list",
    "snack": "ID_from_snack_list",
    "dinner": "ID_from_dinner_list"
  },
  "Wednesday": {
    "breakfast": "ID_from_breakfast_list",
    "lunch": "ID_from_lunch_list",
    "snack": "ID_from_snack_list",
    "dinner": "ID_from_dinner_list"
  },
  "Thursday": {
    "breakfast": "ID_from_breakfast_list",
    "lunch": "ID_from_lunch_list",
    "snack": "ID_from_snack_list",
    "dinner": "ID_from_dinner_list"
  },
  "Friday": {
    "breakfast": "ID_from_breakfast_list",
    "lunch": "ID_from_lunch_list",
    "snack": "ID_from_snack_list",
    "dinner": "ID_from_dinner_list"
  },
  "Saturday": {
    "breakfast": "ID_from_breakfast_list",
    "lunch": "ID_from_lunch_list",
    "snack": "ID_from_snack_list",
    "dinner": "ID_from_dinner_list"
  },
  "Sunday": {
    "breakfast": "ID_from_breakfast_list",
    "lunch": "ID_from_lunch_list",
    "snack": "ID_from_snack_list",
    "dinner": "ID_from_dinner_list"
  }
}

Return ONLY the JSON object. No markdown, no code blocks, no explanations.
`;

    console.log("Generating weekly meal plan...");
    const response = await weeklyPlanSession.prompt(prompt);
    console.log("Received weekly plan response:", response);

    await weeklyPlanSession.destroy();

    // Parse the AI response
    const cleanedResponse = response
      .trim()
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "");
    const aiPlan = JSON.parse(cleanedResponse);

    // Create maps for quick lookup
    const recipeIdMap = new Map<number, Recipe>();
    recipes.forEach((recipe) => {
      if (recipe.id !== undefined) {
        recipeIdMap.set(recipe.id, recipe);
      }
    });

    // Calorie allocation percentages
    const calorieAllocation = {
      breakfast: 0.3, // 30%
      lunch: 0.4, // 40%
      snack: 0.1, // 10%
      dinner: 0.2, // 20%
    };

    // Helper function to calculate quantity for a meal
    const calculateQuantity = (
      recipe: Recipe,
      mealTime: "breakfast" | "lunch" | "snack" | "dinner"
    ): number => {
      const allocatedCalories = dailyCalorieLimit * calorieAllocation[mealTime];
      const caloriesPer100g = recipe.nutritionalValuesPer100g.calories;
      // quantity (in grams) = (allocated calories / calories per 100g) * 100
      const quantity = (allocatedCalories / caloriesPer100g) * 100;
      return Math.round(quantity);
    };

    // Convert AI response (recipe IDs) to WeekMeals structure with calculated quantities
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

    // Create validation maps for each meal category
    const validRecipeIds = {
      breakfast: new Set(breakfastIds.map((id) => parseInt(id, 10))),
      lunch: new Set(lunchIds.map((id) => parseInt(id, 10))),
      snack: new Set(snackIds.map((id) => parseInt(id, 10))),
      dinner: new Set(dinnerIds.map((id) => parseInt(id, 10))),
    };

    // Process AI selections and calculate quantities
    Object.entries(aiPlan).forEach(([day, meals]: [string, any]) => {
      const dayKey = day as keyof WeekMeals;

      // Process each meal time
      (["breakfast", "lunch", "snack", "dinner"] as const).forEach(
        (mealTime) => {
          const recipeIdStr = meals[mealTime];
          const recipeId = parseInt(recipeIdStr, 10);
          const recipe = recipeIdMap.get(recipeId);

          // Validate that the recipe exists and belongs to the correct category
          if (!recipe) {
            console.warn(
              `❌ Recipe ID ${recipeId} not found for ${day} ${mealTime}`
            );
            weekMeals[dayKey][mealTime] = {
              recipeId: null,
              quantity: 0,
            };
          } else if (!validRecipeIds[mealTime].has(recipeId)) {
            console.error(
              `❌ VALIDATION ERROR: Recipe ID ${recipeId} (${recipe.name}) is NOT in the ${mealTime} category!`
            );
            console.error(
              `   Valid ${mealTime} IDs are: [${Array.from(
                validRecipeIds[mealTime]
              ).join(", ")}]`
            );
            console.error(
              `   This recipe belongs to categories: [${recipe.category.join(
                ", "
              )}]`
            );
            // Still assign it but log the error prominently
            const quantity = calculateQuantity(recipe, mealTime);
            weekMeals[dayKey][mealTime] = {
              recipeId: recipeId,
              quantity: quantity,
            };
          } else {
            // Valid recipe for this meal time
            const quantity = calculateQuantity(recipe, mealTime);
            weekMeals[dayKey][mealTime] = {
              recipeId: recipeId,
              quantity: quantity,
            };
          }
        }
      );
    });

    return weekMeals;
  }

  async generateHealthAdvice(params: {
    bmr: number;
    bmi: number;
    maintenanceCalories: number;
    targetCalories: number;
  }): Promise<string> {
    const adviceSession = await this.session.clone();

    const prompt = `Based on the following health metrics, provide a single, concise one-liner advice (maximum 20 words) for healthy living:
- BMR: ${Math.round(params.bmr)} kcal/day
- BMI: ${params.bmi.toFixed(1)}
- Maintenance Calories: ${Math.round(params.maintenanceCalories)} kcal/day
- Target Calories (10% deficit): ${params.targetCalories} kcal/day

Provide ONLY the advice text, no introductions or explanations.`;

    console.log("Generating health advice...");
    const response = await adviceSession.prompt(prompt);
    console.log("Received advice:", response);

    return response.trim();
  }

  async getRecipeFromLeftovers(leftoverIngredients: string): Promise<string> {
    const clonedSession = await this.session.clone();
    const prompt = `I have the following leftover ingredients: ${leftoverIngredients}

Based on these leftover ingredients, please provide TWO recipes in JSON format:
1. A classic recipe that uses as many of these ingredients as possible
2. A healthier improved version with additional healthy ingredient suggestions, lower in kcalories

Please categorize the recipes into the following categories: breakfast, lunch, snack, dinner.
The recipe can be in many categories. For example, some lunch recipes can also be suitable for dinner, or some snacks can also be suitable for breakfast. 
If the recipe is suitable for multiple categories, include all of them.

IMPORTANT INSTRUCTIONS:
- Try to use as many of the provided leftover ingredients as possible
- You can suggest additional ingredients to complete the recipe, but prioritize using the leftovers
- Provide ingredients as structured objects with quantity, unit, and name
- Use DECIMAL numbers for quantities (e.g., 0.5, 0.25, 0.75), NOT fractions (not 1/2, 1/4, 3/4)
- Provide portionSize as the total weight in grams for ONE serving
- Provide nutritionalValuesPer100g (not per portion)
- Make sure the ingredients match the portion size
- Return VALID JSON ONLY - no trailing commas, no comments, no extra text
- DO NOT include any text before or after the JSON object

Return the response in this exact JSON format:
{
  "classicRecipe": {
    "name": "recipe name",
    "category": ["breakfast", "lunch", "snack", "dinner"],
    "portionSize": 350,
    "ingredients": [
      { "quantity": 200, "unit": "ml", "name": "milk" },
      { "quantity": 50, "unit": "g", "name": "oats" },
      { "quantity": 0.5, "unit": "cup", "name": "blueberries" },
      { "quantity": 1, "unit": "piece", "name": "banana" }
    ],
    "instructions": ["step 1", "step 2"],
    "nutritionalValuesPer100g": {
      "calories": 120,
      "protein": 5,
      "carbohydrates": 15,
      "fat": 3,
      "fiber": 2
    }
  },
  "improvedRecipe": {
    "name": "healthier recipe name",
    "category": ["breakfast", "lunch", "snack", "dinner"],
    "portionSize": 350,
    "ingredients": [
      { "quantity": 200, "unit": "ml", "name": "almond milk" },
      { "quantity": 60, "unit": "g", "name": "steel-cut oats" },
      { "quantity": 0.25, "unit": "cup", "name": "chia seeds" },
      { "quantity": 1, "unit": "piece", "name": "banana" }
    ],
    "instructions": ["step 1", "step 2"],
    "nutritionalValuesPer100g": {
      "calories": 95,
      "protein": 4,
      "carbohydrates": 12,
      "fat": 2,
      "fiber": 3
    }
  }
}

IMPORTANT: Return ONLY the JSON object above. No additional text, explanations, or markdown formatting.`;

    console.log("Sending leftover ingredients prompt to API...");
    const response = await clonedSession.prompt(prompt);
    console.log("Received leftover recipe response:", response);

    return response;
  }
}
