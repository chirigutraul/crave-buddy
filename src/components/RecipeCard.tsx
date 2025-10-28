import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Recipe } from "@/types";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { calculateNutritionalValues } from "@/lib/recipe-utils";

interface RecipeCardProps {
  recipe?: Partial<Omit<Recipe, "id" | "image">>;
  comparisonRecipe?: Partial<Omit<Recipe, "id" | "image">>;
  title?: string;
  size?: "default" | "large";
  image?: string;
  isLoading?: boolean;
}

interface NutritionalMetric {
  value: number;
  label: string;
  unit: string;
  lowerIsBetter: boolean;
}

function RecipeCard({
  recipe,
  comparisonRecipe,
  title,
  size = "default",
  image,
  isLoading = false,
}: RecipeCardProps) {
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
    recipe: Partial<Omit<Recipe, "id" | "image">>
  ): number | undefined => {
    if (!recipe.nutritionalValuesPer100g || !recipe.portionSize) {
      return undefined;
    }

    const nutritionalValues = calculateNutritionalValues(
      recipe as Recipe,
      recipe.portionSize
    );

    switch (label) {
      case "Calories":
        return nutritionalValues.calories;
      case "Protein":
        return nutritionalValues.protein;
      case "Carbs":
        return nutritionalValues.carbohydrates;
      case "Fat":
        return nutritionalValues.fat;
      case "Fiber":
        return nutritionalValues.fiber;
      default:
        return undefined;
    }
  };

  const metrics: NutritionalMetric[] =
    recipe && recipe.nutritionalValuesPer100g && recipe.portionSize
      ? (() => {
          const nutritionalValues = calculateNutritionalValues(
            recipe as Recipe,
            recipe.portionSize
          );
          return [
            {
              value: nutritionalValues.calories,
              label: "Calories",
              unit: "kcal",
              lowerIsBetter: true,
            },
            {
              value: nutritionalValues.protein,
              label: "Protein",
              unit: "g",
              lowerIsBetter: false,
            },
            {
              value: nutritionalValues.carbohydrates,
              label: "Carbs",
              unit: "g",
              lowerIsBetter: true,
            },
            {
              value: nutritionalValues.fat,
              label: "Fat",
              unit: "g",
              lowerIsBetter: true,
            },
            {
              value: nutritionalValues.fiber,
              label: "Fiber",
              unit: "g",
              lowerIsBetter: false,
            },
          ];
        })()
      : [];

  const cardClassName =
    size === "large" ? "w-full max-w-md py-6 gap-6" : "w-64 py-4 gap-4";
  const headerClassName = size === "large" ? "px-6" : "px-4";
  const contentClassName = size === "large" ? "px-6" : "px-4";
  const imageClassName =
    size === "large"
      ? "rounded-lg w-full aspect-square object-cover"
      : "rounded-lg w-full aspect-square object-cover";

  return (
    <Card className={cardClassName}>
      <CardHeader className={headerClassName}>
        {!image ? (
          <Skeleton className="w-full aspect-square rounded-lg" />
        ) : (
          <img src={image} alt={title || "Recipe"} className={imageClassName} />
        )}
      </CardHeader>
      <CardContent className={contentClassName}>
        {isLoading ? (
          <RecipeCardContentSkeleton />
        ) : (
          <>
            {title && (
              <h6
                className={`mb-3 text-neutral-800 ${
                  size === "large" ? "text-xl font-bold" : ""
                }`}
              >
                {title}
              </h6>
            )}
            <p
              className={`mb-2 font-semibold ${
                size === "large" ? "text-lg" : ""
              }`}
            >
              Nutritional values:
            </p>
            <ul
              className={`list-none font-medium text-neutral-500 ${
                size === "large" ? "space-y-2" : ""
              }`}
            >
              {metrics.map((metric) => renderNutritionalValue(metric))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function RecipeCardContentSkeleton() {
  return (
    <>
      <Skeleton className="h-[24px] w-32 mb-3" />
      <Skeleton className="h-[19.2px] w-40 mb-2" />
      <ul className="list-none space-y-2">
        <li className="flex justify-between items-center">
          <Skeleton className="h-[24px] w-20" />
          <Skeleton className="h-[24px] w-24" />
        </li>
        <li className="flex justify-between items-center">
          <Skeleton className="h-[24px] w-16" />
          <Skeleton className="h-[24px] w-20" />
        </li>
        <li className="flex justify-between items-center">
          <Skeleton className="h-[24px] w-28" />
          <Skeleton className="h-[24px] w-20" />
        </li>
        <li className="flex justify-between items-center">
          <Skeleton className="h-[24px] w-12" />
          <Skeleton className="h-[24px] w-20" />
        </li>
      </ul>
    </>
  );
}

export function RecipeCardSkeleton() {
  return (
    <Card className="w-64 py-4 gap-4">
      <CardHeader className="px-4">
        <Skeleton className="w-full aspect-square rounded-lg" />
      </CardHeader>
      <CardContent className="px-4">
        <RecipeCardContentSkeleton />
      </CardContent>
    </Card>
  );
}

export default RecipeCard;
