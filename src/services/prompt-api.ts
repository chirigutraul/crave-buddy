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
}
