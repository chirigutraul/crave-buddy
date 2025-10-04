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
