import { Card, CardContent, CardHeader } from "@/components/ui/card";
import fruitSalad from "../assets/fruit-salad.jpg";
import type { Recipe } from "@/types";
import { ArrowDown, ArrowUp } from "lucide-react";

interface RecipeCardProps {
  recipe?: Recipe;
  comparisonRecipe?: Recipe;
  title?: string;
}

interface NutritionalMetric {
  value: number;
  label: string;
  unit: string;
  lowerIsBetter: boolean;
}

function RecipeCard({ recipe, comparisonRecipe, title }: RecipeCardProps) {
  const getImprovementIndicator = (
    currentValue: number,
    previousValue: number,
    lowerIsBetter: boolean
  ) => {
    if (currentValue === previousValue) return null;

    const isDecreased = currentValue < previousValue;
    const isImproved = lowerIsBetter ? isDecreased : !isDecreased;
    const ArrowIcon = isDecreased ? ArrowDown : ArrowUp;
    const colorClass = isImproved ? "text-green-600" : "text-red-600";

    // Calculate percentage change
    const percentageChange =
      ((currentValue - previousValue) / previousValue) * 100;
    const formattedPercentage = `${
      percentageChange > 0 ? "+" : ""
    }${percentageChange.toFixed(0)}%`;

    return (
      <span className={`inline-flex items-center ml-1 ${colorClass}`}>
        <span className="text-sm">({formattedPercentage})</span>
        <ArrowIcon className="inline-block ml-0.5" size={16} />
      </span>
    );
  };

  const renderNutritionalValue = (metric: NutritionalMetric) => {
    const { value, label, unit, lowerIsBetter } = metric;

    let indicator = null;
    if (comparisonRecipe) {
      const comparisonValue = getComparisonValue(label, comparisonRecipe);
      if (comparisonValue !== undefined) {
        indicator = getImprovementIndicator(
          value,
          comparisonValue,
          lowerIsBetter
        );
      }
    }

    return (
      <li key={label} className="flex justify-between items-center">
        <span>{label}:</span>
        <span className="flex items-center">
          {value} {unit}
          {indicator}
        </span>
      </li>
    );
  };

  const getComparisonValue = (
    label: string,
    recipe: Recipe
  ): number | undefined => {
    switch (label) {
      case "Calories":
        return recipe.nutritionalValues.calories;
      case "Protein":
        return recipe.nutritionalValues.protein;
      case "Carbohydrates":
        return recipe.nutritionalValues.carbohydrates;
      case "Fat":
        return recipe.nutritionalValues.fat;
      case "Fiber":
        return recipe.nutritionalValues.fiber;
      default:
        return undefined;
    }
  };

  const metrics: NutritionalMetric[] = recipe
    ? [
        {
          value: recipe.nutritionalValues.calories,
          label: "Calories",
          unit: "kcal",
          lowerIsBetter: true,
        },
        {
          value: recipe.nutritionalValues.protein,
          label: "Protein",
          unit: "g",
          lowerIsBetter: false,
        },
        {
          value: recipe.nutritionalValues.carbohydrates,
          label: "Carbohydrates",
          unit: "g",
          lowerIsBetter: true,
        },
        {
          value: recipe.nutritionalValues.fat,
          label: "Fat",
          unit: "g",
          lowerIsBetter: true,
        },
        {
          value: recipe.nutritionalValues.fiber,
          label: "Fiber",
          unit: "g",
          lowerIsBetter: false,
        },
      ]
    : [];

  return (
    <Card className="w-64 py-4 gap-4">
      <CardHeader className="px-4">
        <img src={fruitSalad} alt="Fruit Salad" className="rounded-lg" />
      </CardHeader>
      <CardContent className="px-4">
        {title && <h6 className="mb-3 text-neutral-800">{title}</h6>}
        <p className="mb-2 font-semibold">Nutritional values:</p>
        <ul className="list-none font-medium text-neutral-500">
          {metrics.map(renderNutritionalValue)}
        </ul>
      </CardContent>
    </Card>
  );
}

export default RecipeCard;
