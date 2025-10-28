import type { Recipe, WeekMeals } from "@/types";

interface PromptApiServiceInterface {
  model: typeof window.LanguageModel;
  session: any;
}

export class PromptApiService implements PromptApiServiceInterface {
  model: typeof window.LanguageModel;
  session: any;

  // Reusable JSON schemas for structured output
  private readonly recipeSchema = {
    type: "object",
    properties: {
      classicRecipe: {
        type: "object",
        properties: {
          name: { type: "string" },
          category: {
            type: "array",
            items: {
              type: "string",
              enum: ["breakfast", "lunch", "snack", "dinner"],
            },
          },
          portionSize: { type: "number" },
          ingredients: {
            type: "array",
            items: {
              type: "object",
              properties: {
                quantity: { type: "number" },
                unit: { type: "string" },
                name: { type: "string" },
              },
              required: ["quantity", "unit", "name"],
            },
          },
          instructions: {
            type: "array",
            items: { type: "string" },
          },
          nutritionalValuesPer100g: {
            type: "object",
            properties: {
              calories: { type: "number" },
              protein: { type: "number" },
              carbohydrates: { type: "number" },
              fat: { type: "number" },
              fiber: { type: "number" },
            },
            required: ["calories", "protein", "carbohydrates", "fat", "fiber"],
          },
        },
        required: [
          "name",
          "category",
          "portionSize",
          "ingredients",
          "instructions",
          "nutritionalValuesPer100g",
        ],
      },
      improvedRecipe: {
        type: "object",
        properties: {
          name: { type: "string" },
          category: {
            type: "array",
            items: {
              type: "string",
              enum: ["breakfast", "lunch", "snack", "dinner"],
            },
          },
          portionSize: { type: "number" },
          ingredients: {
            type: "array",
            items: {
              type: "object",
              properties: {
                quantity: { type: "number" },
                unit: { type: "string" },
                name: { type: "string" },
              },
              required: ["quantity", "unit", "name"],
            },
          },
          instructions: {
            type: "array",
            items: { type: "string" },
          },
          nutritionalValuesPer100g: {
            type: "object",
            properties: {
              calories: { type: "number" },
              protein: { type: "number" },
              carbohydrates: { type: "number" },
              fat: { type: "number" },
              fiber: { type: "number" },
            },
            required: ["calories", "protein", "carbohydrates", "fat", "fiber"],
          },
        },
        required: [
          "name",
          "category",
          "portionSize",
          "ingredients",
          "instructions",
          "nutritionalValuesPer100g",
        ],
      },
    },
    required: ["classicRecipe", "improvedRecipe"],
  };

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
    console.log("Prompt API initialized");
    this.logTokenUsage();
  }

  async getAvailability(): Promise<
    "available" | "downloadable" | "downloading"
  > {
    const availability = await this.model.availability();
    return availability;
  }

  async prompt(input: string): Promise<string> {
    this.logTokenUsage("Before prompt");
    const response = await this.session.prompt(input);
    this.logTokenUsage("After prompt");
    return response;
  }

  private logTokenUsage(label: string = "Token usage") {
    if (this.session) {
      console.log(
        `${label}: ${this.session.inputUsage}/${this.session.inputQuota}`
      );
    }
  }

  async getRecipe(cravings: string, signal?: AbortSignal): Promise<string> {
    const clonedSession = await this.session.clone({ signal });

    try {
      const prompt = `I am craving: ${cravings}

Based on these cravings, provide TWO recipes:
1. A classic recipe that satisfies the craving
2. A healthier improved version with ingredient substitutions, lower in kcalories

Requirements:
- Categorize recipes into: breakfast, lunch, snack, dinner (can be multiple categories)
- Use DECIMAL numbers for quantities (0.5, 0.25, 0.75), NOT fractions
- Provide portionSize as the total weight in grams for ONE serving
- Provide nutritionalValuesPer100g (not per portion)
- Ensure ingredients match the portion size`;

      console.log("Sending recipe prompt to API with structured output...");
      const response = await clonedSession.prompt(prompt, {
        responseConstraint: this.recipeSchema,
        omitResponseConstraintInput: true,
        signal,
      });
      console.log("Received structured recipe response");

      return response; // Already valid JSON!
    } finally {
      await clonedSession.destroy();
    }
  }

  async generateWeeklyPlan(
    recipes: Recipe[],
    dailyCalorieLimit: number,
    signal?: AbortSignal
  ): Promise<WeekMeals> {
    const weeklyPlanSession: AILanguageModel =
      await window.LanguageModel.create({
        initialPrompts: [
          {
            role: "system",
            content:
              "You are a meal planner AI. Your job is to select meals from the provided lists to create a balanced and varied 7-day meal plan.",
          },
        ],
      });

    try {
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

      // Define schema for weekly plan structure
      const weeklyPlanSchema = {
        type: "object",
        properties: {
          Monday: {
            type: "object",
            properties: {
              breakfast: { type: "string" },
              lunch: { type: "string" },
              snack: { type: "string" },
              dinner: { type: "string" },
            },
            required: ["breakfast", "lunch", "snack", "dinner"],
          },
          Tuesday: {
            type: "object",
            properties: {
              breakfast: { type: "string" },
              lunch: { type: "string" },
              snack: { type: "string" },
              dinner: { type: "string" },
            },
            required: ["breakfast", "lunch", "snack", "dinner"],
          },
          Wednesday: {
            type: "object",
            properties: {
              breakfast: { type: "string" },
              lunch: { type: "string" },
              snack: { type: "string" },
              dinner: { type: "string" },
            },
            required: ["breakfast", "lunch", "snack", "dinner"],
          },
          Thursday: {
            type: "object",
            properties: {
              breakfast: { type: "string" },
              lunch: { type: "string" },
              snack: { type: "string" },
              dinner: { type: "string" },
            },
            required: ["breakfast", "lunch", "snack", "dinner"],
          },
          Friday: {
            type: "object",
            properties: {
              breakfast: { type: "string" },
              lunch: { type: "string" },
              snack: { type: "string" },
              dinner: { type: "string" },
            },
            required: ["breakfast", "lunch", "snack", "dinner"],
          },
          Saturday: {
            type: "object",
            properties: {
              breakfast: { type: "string" },
              lunch: { type: "string" },
              snack: { type: "string" },
              dinner: { type: "string" },
            },
            required: ["breakfast", "lunch", "snack", "dinner"],
          },
          Sunday: {
            type: "object",
            properties: {
              breakfast: { type: "string" },
              lunch: { type: "string" },
              snack: { type: "string" },
              dinner: { type: "string" },
            },
            required: ["breakfast", "lunch", "snack", "dinner"],
          },
        },
        required: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
      };

      const prompt = `Create a 7-day meal plan (Monday through Sunday).

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

Try to create variety across the week when possible.`;

      console.log("Generating weekly meal plan with structured output...");
      const response = await weeklyPlanSession.prompt(prompt, {
        responseConstraint: weeklyPlanSchema,
        omitResponseConstraintInput: true,
        signal,
      });
      console.log("Received structured weekly plan response");

      // Parse the AI response - no need for manual cleanup!
      const aiPlan = JSON.parse(response);

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
        const allocatedCalories =
          dailyCalorieLimit * calorieAllocation[mealTime];
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
    } finally {
      await weeklyPlanSession.destroy();
    }
  }

  async generateHealthAdvice(
    params: {
      bmr: number;
      bmi: number;
      maintenanceCalories: number;
      targetCalories: number;
    },
    signal?: AbortSignal
  ): Promise<string> {
    const adviceSession = await this.session.clone({ signal });

    try {
      const prompt = `Based on the following health metrics, provide a single, concise one-liner advice (maximum 20 words) for healthy living:
- BMR: ${Math.round(params.bmr)} kcal/day
- BMI: ${params.bmi.toFixed(1)}
- Maintenance Calories: ${Math.round(params.maintenanceCalories)} kcal/day
- Target Calories (10% deficit): ${params.targetCalories} kcal/day

Provide ONLY the advice text, no introductions or explanations.`;

      console.log("Generating health advice...");
      const response = await adviceSession.prompt(prompt, { signal });
      console.log("Received advice:", response);

      return response.trim();
    } finally {
      await adviceSession.destroy();
    }
  }

  async getRecipeFromLeftovers(
    leftoverIngredients: string,
    signal?: AbortSignal
  ): Promise<string> {
    const clonedSession = await this.session.clone({ signal });

    try {
      const prompt = `I have the following leftover ingredients: ${leftoverIngredients}

Based on these leftover ingredients, provide TWO recipes:
1. A classic recipe that uses as many of these ingredients as possible
2. A healthier improved version with additional healthy ingredient suggestions, lower in kcalories

Requirements:
- Try to use as many of the provided leftover ingredients as possible
- You can suggest additional ingredients to complete the recipe, but prioritize using the leftovers
- Categorize recipes into: breakfast, lunch, snack, dinner (can be multiple categories)
- Use DECIMAL numbers for quantities (0.5, 0.25, 0.75), NOT fractions
- Provide portionSize as the total weight in grams for ONE serving
- Provide nutritionalValuesPer100g (not per portion)
- Ensure ingredients match the portion size`;

      console.log(
        "Sending leftover ingredients prompt to API with structured output..."
      );
      const response = await clonedSession.prompt(prompt, {
        responseConstraint: this.recipeSchema,
        omitResponseConstraintInput: true,
        signal,
      });
      console.log("Received structured leftover recipe response");

      return response; // Already valid JSON!
    } finally {
      await clonedSession.destroy();
    }
  }
}
