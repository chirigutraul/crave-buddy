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

  async getClassicRecipeNutrition(
    cravings: string,
    signal?: AbortSignal
  ): Promise<string> {
    const clonedSession = await this.session.clone({ signal });

    try {
      const prompt = `I am craving: ${cravings}

Provide the nutritional values per 100g for a CLASSIC version of this recipe (traditional, not healthy).

Return ONLY valid JSON (no markdown, no code blocks, no explanation) matching this exact structure:
{
  "portionSize": 250,
  "nutritionalValuesPer100g": {
    "calories": 150,
    "protein": 8,
    "carbohydrates": 20,
    "fat": 5,
    "fiber": 3
  }
}

Requirements:
- Provide portionSize as the typical weight in grams for ONE serving of the classic version
- Provide nutritionalValuesPer100g (not per portion)
- Use typical classic ingredients (not healthy substitutions)`;

      console.log("Fetching classic recipe nutritional values...");
      const response = await clonedSession.prompt(prompt, { signal });
      console.log("Received classic nutritional values");

      // Clean up response (remove markdown code blocks if present)
      let cleanedResponse = response.trim();
      if (cleanedResponse.startsWith("```")) {
        cleanedResponse = cleanedResponse
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "");
      }

      // Parse and validate
      const parsed = JSON.parse(cleanedResponse);

      if (!parsed.portionSize || !parsed.nutritionalValuesPer100g) {
        throw new Error("Invalid nutrition structure: missing required fields");
      }

      return JSON.stringify(parsed);
    } catch (error) {
      console.error("Failed to generate/parse classic nutrition:", error);
      throw error;
    } finally {
      await clonedSession.destroy();
    }
  }

  async getImprovedRecipe(
    cravings: string,
    signal?: AbortSignal
  ): Promise<string> {
    const clonedSession = await this.session.clone({ signal });

    try {
      const prompt = `I am craving: ${cravings}

Provide ONE improved healthy recipe with ingredient substitutions (lower in kcalories).

Return ONLY valid JSON (no markdown, no code blocks, no explanation) matching this exact structure:
{
  "name": "Recipe Name",
  "category": ["breakfast", "lunch", "snack", "dinner"],
  "portionSize": 250,
  "ingredients": [
    {"quantity": 1.5, "unit": "cups", "name": "ingredient name"}
  ],
  "instructions": [
    {"instruction": "Step description", "time": 120}
  ],
  "nutritionalValuesPer100g": {
    "calories": 150,
    "protein": 8,
    "carbohydrates": 20,
    "fat": 5,
    "fiber": 3
  }
}

Requirements:
- Categorize the recipe into: breakfast, lunch, snack, dinner (can be multiple categories)
- Use DECIMAL numbers for quantities (0.5, 0.25, 0.75), NOT fractions
- Provide portionSize as the total weight in grams for ONE serving
- Provide nutritionalValuesPer100g (not per portion)
- Ensure ingredients match the portion size
- For each instruction, provide an approximate time in seconds for completing that step
- Time estimates should be realistic and based on typical cooking/prep times`;

      console.log("Generating improved recipe...");
      const response = await clonedSession.prompt(prompt, { signal });
      console.log("Received improved recipe");

      // Clean up response (remove markdown code blocks if present)
      let cleanedResponse = response.trim();
      if (cleanedResponse.startsWith("```")) {
        cleanedResponse = cleanedResponse
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "");
      }

      // Parse and validate
      const parsed = JSON.parse(cleanedResponse);

      // Validate required fields
      if (
        !parsed.name ||
        !Array.isArray(parsed.category) ||
        !parsed.portionSize ||
        !Array.isArray(parsed.ingredients) ||
        !Array.isArray(parsed.instructions) ||
        !parsed.nutritionalValuesPer100g
      ) {
        throw new Error("Invalid recipe structure: missing required fields");
      }

      return JSON.stringify(parsed);
    } catch (error) {
      console.error("Failed to generate/parse improved recipe:", error);
      throw error;
    } finally {
      await clonedSession.destroy();
    }
  }

  async getRecipe(cravings: string, signal?: AbortSignal): Promise<string> {
    // Run both prompts in parallel for faster generation
    const [classicNutritionResponse, improvedRecipeResponse] =
      await Promise.all([
        this.getClassicRecipeNutrition(cravings, signal),
        this.getImprovedRecipe(cravings, signal),
      ]);

    // Parse responses
    const classicNutrition = JSON.parse(classicNutritionResponse);
    const improvedRecipe = JSON.parse(improvedRecipeResponse);

    // Combine into GeneratedRecipe structure
    const combinedRecipe = {
      ...improvedRecipe,
      classicRecipeNutritionalValues: classicNutrition.nutritionalValuesPer100g,
    };

    return JSON.stringify(combinedRecipe);
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

      // Reverted: no JSON schema for weekly plan

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

RESPONSE RULES:
- Return ONLY valid JSON. No prose, no markdown fences.
- Each value MUST be a NUMBER recipe ID. Do NOT include names, grams, or kcal.
- Use every day from Monday to Sunday and include all four meals (breakfast, lunch, snack, dinner).
- Prefer variety across the week.

EXAMPLE OUTPUT (IDs only):
{
  "Monday":   { "breakfast": 11, "lunch": 24, "snack": 7,  "dinner": 35 },
  "Tuesday":  { "breakfast": 12, "lunch": 25, "snack": 9,  "dinner": 36 },
  "Wednesday":{ "breakfast": 13, "lunch": 26, "snack": 10, "dinner": 37 },
  "Thursday": { "breakfast": 11, "lunch": 27, "snack": 8,  "dinner": 38 },
  "Friday":   { "breakfast": 12, "lunch": 24, "snack": 9,  "dinner": 39 },
  "Saturday": { "breakfast": 13, "lunch": 25, "snack": 7,  "dinner": 35 },
  "Sunday":   { "breakfast": 11, "lunch": 26, "snack": 10, "dinner": 36 }
}`;

      console.log("Generating weekly meal plan...");
      const response = await weeklyPlanSession.prompt(prompt, { signal });
      console.log("Received weekly plan response");

      // Minimal cleanup to guard against accidental prose
      let cleaned = response.trim();
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/```json\n?/g, "").replace(/```\n?/g, "");
      }
      if (!cleaned.startsWith("{")) {
        const s = cleaned.indexOf("{");
        const e = cleaned.lastIndexOf("}");
        if (s !== -1 && e !== -1 && e > s) cleaned = cleaned.slice(s, e + 1);
      }
      const aiPlan = JSON.parse(cleaned);

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
            const raw = meals[mealTime];
            const recipeId = typeof raw === "number" ? raw : parseInt(raw, 10);
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

  async getClassicLeftoverNutrition(
    leftoverIngredients: string,
    signal?: AbortSignal
  ): Promise<string> {
    const clonedSession = await this.session.clone({ signal });

    try {
      const prompt = `I have the following leftover ingredients: ${leftoverIngredients}

Provide the nutritional values per 100g for a CLASSIC recipe using these ingredients (traditional cooking method, not healthy).

Return ONLY valid JSON (no markdown, no code blocks, no explanation) matching this exact structure:
{
  "portionSize": 250,
  "nutritionalValuesPer100g": {
    "calories": 150,
    "protein": 8,
    "carbohydrates": 20,
    "fat": 5,
    "fiber": 3
  }
}

Requirements:
- Provide portionSize as the typical weight in grams for ONE serving
- Provide nutritionalValuesPer100g (not per portion)`;

      console.log("Fetching classic leftover recipe nutritional values...");
      const response = await clonedSession.prompt(prompt, { signal });
      console.log("Received classic leftover nutritional values");

      // Clean up response (remove markdown code blocks if present)
      let cleanedResponse = response.trim();
      if (cleanedResponse.startsWith("```")) {
        cleanedResponse = cleanedResponse
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "");
      }

      // Parse and validate
      const parsed = JSON.parse(cleanedResponse);

      if (!parsed.portionSize || !parsed.nutritionalValuesPer100g) {
        throw new Error("Invalid nutrition structure: missing required fields");
      }

      return JSON.stringify(parsed);
    } catch (error) {
      console.error(
        "Failed to generate/parse classic leftover nutrition:",
        error
      );
      throw error;
    } finally {
      await clonedSession.destroy();
    }
  }

  async getImprovedLeftoverRecipe(
    leftoverIngredients: string,
    signal?: AbortSignal
  ): Promise<string> {
    const clonedSession = await this.session.clone({ signal });

    try {
      const prompt = `I have the following leftover ingredients: ${leftoverIngredients}

Provide ONE improved healthy recipe that uses as many of these ingredients as possible, with additional healthy ingredient suggestions (lower in kcalories).

Return ONLY valid JSON (no markdown, no code blocks, no explanation) matching this exact structure:
{
  "name": "Recipe Name",
  "category": ["breakfast", "lunch", "snack", "dinner"],
  "portionSize": 250,
  "ingredients": [
    {"quantity": 1.5, "unit": "cups", "name": "ingredient name"}
  ],
  "instructions": [
    {"instruction": "Step description", "time": 120}
  ],
  "nutritionalValuesPer100g": {
    "calories": 150,
    "protein": 8,
    "carbohydrates": 20,
    "fat": 5,
    "fiber": 3
  }
}

Requirements:
- Try to use as many of the provided leftover ingredients as possible
- You can suggest additional ingredients to complete the recipe, but prioritize using the leftovers
- Categorize the recipe into: breakfast, lunch, snack, dinner (can be multiple categories)
- Use DECIMAL numbers for quantities (0.5, 0.25, 0.75), NOT fractions
- Provide portionSize as the total weight in grams for ONE serving
- Provide nutritionalValuesPer100g (not per portion)
- Ensure ingredients match the portion size
- For each instruction, provide time in seconds`;

      console.log("Generating improved leftover recipe...");
      const response = await clonedSession.prompt(prompt, { signal });
      console.log("Received improved leftover recipe");

      // Clean up response (remove markdown code blocks if present)
      let cleanedResponse = response.trim();
      if (cleanedResponse.startsWith("```")) {
        cleanedResponse = cleanedResponse
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "");
      }

      // Parse and validate
      const parsed = JSON.parse(cleanedResponse);

      // Validate required fields
      if (
        !parsed.name ||
        !Array.isArray(parsed.category) ||
        !parsed.portionSize ||
        !Array.isArray(parsed.ingredients) ||
        !Array.isArray(parsed.instructions) ||
        !parsed.nutritionalValuesPer100g
      ) {
        throw new Error(
          "Invalid leftover recipe structure: missing required fields"
        );
      }

      return JSON.stringify(parsed);
    } catch (error) {
      console.error("Failed to generate/parse leftover recipe:", error);
      throw error;
    } finally {
      await clonedSession.destroy();
    }
  }

  async getRecipeFromLeftovers(
    leftoverIngredients: string,
    signal?: AbortSignal
  ): Promise<string> {
    // Run both prompts in parallel for faster generation
    const [classicNutritionResponse, improvedRecipeResponse] =
      await Promise.all([
        this.getClassicLeftoverNutrition(leftoverIngredients, signal),
        this.getImprovedLeftoverRecipe(leftoverIngredients, signal),
      ]);

    // Parse responses
    const classicNutrition = JSON.parse(classicNutritionResponse);
    const improvedRecipe = JSON.parse(improvedRecipeResponse);

    // Combine into GeneratedRecipe structure
    const combinedRecipe = {
      ...improvedRecipe,
      classicRecipeNutritionalValues: classicNutrition.nutritionalValuesPer100g,
    };

    return JSON.stringify(combinedRecipe);
  }
}
