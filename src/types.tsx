export interface Recipe {
  id: string;
  name: string;
  image: string;
  nutritionalValues: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber: number;
  };
  ingredients: string[];
  instructions: string[];
}

export interface RecipePair {
  clasicRecipe: Omit<Recipe, "id" | "image">;
  improvedRecipe: Omit<Recipe, "id" | "image">;
}

declare global {
  interface AILanguageModel {
    prompt(input: string): Promise<string>;
    promptStreaming(input: string): ReadableStream;
    countPromptTokens(input: string): Promise<number>;
    destroy(): void;
  }

  interface Window {
    LanguageModel: {
      availability(): Promise<"downloadable" | "available" | "downloading">;
      create(options?: {
        initialPrompts?: {
          role: "system" | "user" | "assistant";
          content: string;
        }[];
        temperature?: number;
        topK?: number;
      }): Promise<AILanguageModel>;
    };
  }
}
