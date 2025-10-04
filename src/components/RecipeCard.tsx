import { Card, CardContent, CardHeader } from "@/components/ui/card";
import fruitSalad from "../assets/fruit-salad.jpg";
import type { Recipe } from "@/types";

interface RecipeCardProps {
  recipe?: Recipe;
}

function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Card className="w-64 py-4 gap-4">
      <CardHeader className="px-4">
        <img src={fruitSalad} alt="Fruit Salad" className="rounded-lg" />
      </CardHeader>
      <CardContent className="px-4">
        <p className="mb-2">Nutritional values:</p>
        <ul className="list-none font-medium text-neutral-500">
          <li>Calories: {recipe?.nutritionalValues.calories} kcal</li>
          <li>Protein: {recipe?.nutritionalValues.protein} g</li>
          <li>Carbohydrates: {recipe?.nutritionalValues.carbohydrates} g</li>
          <li>Fat: {recipe?.nutritionalValues.fat} g</li>
          <li>Fiber: {recipe?.nutritionalValues.fiber} g</li>
        </ul>
      </CardContent>
    </Card>
  );
}

export default RecipeCard;
