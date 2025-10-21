import { useWeekMeal } from "@/contexts/WeekMealContext";
import type { DayOfWeek as DayType } from "@/contexts/WeekMealContext";
import { Combobox } from "@/components/ui/combo-box";
import type { ComboboxOption } from "@/components/ui/combo-box";
import { Input } from "@/components/ui/input";
import { calculateNutritionalValues } from "@/lib/recipe-utils";
import type { MealTime } from "@/types";

interface DayOfTheWeekProps {
  day: DayType;
}

function DayOfTheWeek({ day }: DayOfTheWeekProps) {
  const { weekMeals, updateMeal, updateQuantity, getRecipesByCategory } =
    useWeekMeal();

  // Get the current meals for this day
  const currentMeals = weekMeals[day];

  // Get recipes categorized by meal time
  const breakfastOptions: ComboboxOption[] = getRecipesByCategory(
    "breakfast"
  ).map((recipe) => ({
    value: recipe.id?.toString() || "",
    label: recipe.name,
  }));

  const lunchOptions: ComboboxOption[] = getRecipesByCategory("lunch").map(
    (recipe) => ({
      value: recipe.id?.toString() || "",
      label: recipe.name,
    })
  );

  const snackOptions: ComboboxOption[] = getRecipesByCategory("snack").map(
    (recipe) => ({
      value: recipe.id?.toString() || "",
      label: recipe.name,
    })
  );

  const dinnerOptions: ComboboxOption[] = getRecipesByCategory("dinner").map(
    (recipe) => ({
      value: recipe.id?.toString() || "",
      label: recipe.name,
    })
  );

  // Calculate daily totals
  const calculateDailyTotals = () => {
    const mealTimes: MealTime[] = ["breakfast", "lunch", "snack", "dinner"];
    let totals = {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: 0,
    };

    mealTimes.forEach((mealTime) => {
      const meal = currentMeals[mealTime];
      if (meal.recipeId && meal.quantity > 0) {
        const recipe = getRecipesByCategory(mealTime).find(
          (r) => r.id === meal.recipeId
        );
        if (recipe) {
          const nutritionalValues = calculateNutritionalValues(
            recipe,
            meal.quantity
          );
          totals.calories += nutritionalValues.calories;
          totals.protein += nutritionalValues.protein;
          totals.carbohydrates += nutritionalValues.carbohydrates;
          totals.fat += nutritionalValues.fat;
          totals.fiber += nutritionalValues.fiber;
        }
      }
    });

    return {
      calories: Math.round(totals.calories),
      protein: Math.round(totals.protein * 10) / 10,
      carbohydrates: Math.round(totals.carbohydrates * 10) / 10,
      fat: Math.round(totals.fat * 10) / 10,
      fiber: Math.round(totals.fiber * 10) / 10,
    };
  };

  const dailyTotals = calculateDailyTotals();

  return (
    <div className="py-4 min-w-[250px] flex-shrink-0">
      <h5 className="mb-4">{day}</h5>
      <div className="flex flex-col gap-4">
        <div>
          <p className="mb-1 text-sm font-semibold text-neutral-800">
            Breakfast:
          </p>
          <div className="flex items-center">
            <Combobox
              options={breakfastOptions}
              value={currentMeals.breakfast.recipeId?.toString() || ""}
              onValueChange={(value) =>
                updateMeal(day, "breakfast", parseInt(value, 10))
              }
              placeholder="Select breakfast..."
              searchPlaceholder="Search breakfast..."
              emptyMessage="No breakfast found."
              className="w-[200px]"
              unified={true}
            />
            <div className="relative w-16">
              <Input
                type="number"
                value={currentMeals.breakfast.quantity || ""}
                onChange={(e) =>
                  updateQuantity(
                    day,
                    "breakfast",
                    parseInt(e.target.value) || 0
                  )
                }
                placeholder="0"
                className="pr-5 text-sm rounded-l-none bg-background w-20"
              />
              <span className="absolute right-0 top-1/2 -translate-y-1/2 text-xs text-neutral-500 pointer-events-none">
                g
              </span>
            </div>
          </div>
        </div>
        <div>
          <p className="mb-1 text-sm font-semibold text-neutral-800">Lunch:</p>
          <div className="flex items-center">
            <Combobox
              options={lunchOptions}
              value={currentMeals.lunch.recipeId?.toString() || ""}
              onValueChange={(value) =>
                updateMeal(day, "lunch", parseInt(value, 10))
              }
              placeholder="Select lunch..."
              searchPlaceholder="Search lunch..."
              emptyMessage="No lunch found."
              className="w-[200px]"
              unified={true}
            />
            <div className="relative w-16">
              <Input
                type="number"
                value={currentMeals.lunch.quantity || ""}
                onChange={(e) =>
                  updateQuantity(day, "lunch", parseInt(e.target.value) || 0)
                }
                placeholder="0"
                className="pr-5 text-sm rounded-l-none bg-background w-20"
              />
              <span className="absolute right-0 top-1/2 -translate-y-1/2 text-xs text-neutral-500 pointer-events-none">
                g
              </span>
            </div>
          </div>
        </div>
        <div>
          <p className="mb-1 text-sm font-semibold text-neutral-800">Snack:</p>
          <div className="flex items-center">
            <Combobox
              options={snackOptions}
              value={currentMeals.snack.recipeId?.toString() || ""}
              onValueChange={(value) =>
                updateMeal(day, "snack", parseInt(value, 10))
              }
              placeholder="Select snack..."
              searchPlaceholder="Search snack..."
              emptyMessage="No snack found."
              className="w-[200px]"
              unified={true}
            />
            <div className="relative w-16">
              <Input
                type="number"
                value={currentMeals.snack.quantity || ""}
                onChange={(e) =>
                  updateQuantity(day, "snack", parseInt(e.target.value) || 0)
                }
                placeholder="0"
                className="pr-5 text-sm rounded-l-none bg-background w-20"
              />
              <span className="absolute right-0 top-1/2 -translate-y-1/2 text-xs text-neutral-500 pointer-events-none">
                g
              </span>
            </div>
          </div>
        </div>
        <div>
          <p className="mb-1 text-sm font-semibold text-neutral-800">Dinner:</p>
          <div className="flex items-center">
            <Combobox
              options={dinnerOptions}
              value={currentMeals.dinner.recipeId?.toString() || ""}
              onValueChange={(value) =>
                updateMeal(day, "dinner", parseInt(value, 10))
              }
              placeholder="Select dinner..."
              searchPlaceholder="Search dinner..."
              emptyMessage="No dinner found."
              className="w-[200px]"
              unified={true}
            />
            <div className="relative w-16">
              <Input
                type="number"
                value={currentMeals.dinner.quantity || ""}
                onChange={(e) =>
                  updateQuantity(day, "dinner", parseInt(e.target.value) || 0)
                }
                placeholder="0"
                className="pr-5 text-sm rounded-l-none bg-background w-20"
              />
              <span className="absolute right-0 top-1/2 -translate-y-1/2 text-xs text-neutral-500 pointer-events-none">
                g
              </span>
            </div>
          </div>
        </div>

        {/* Daily Totals Summary */}
        <div className="mt-4 pt-4 border-t border-neutral-300">
          <h6 className="mb-2 text-sm font-bold text-neutral-800">
            Daily Totals
          </h6>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-neutral-600">Calories:</span>
              <span className="font-semibold text-neutral-800">
                {dailyTotals.calories} kcal
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Protein:</span>
              <span className="font-semibold text-neutral-800">
                {dailyTotals.protein}g
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Carbs:</span>
              <span className="font-semibold text-neutral-800">
                {dailyTotals.carbohydrates}g
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Fat:</span>
              <span className="font-semibold text-neutral-800">
                {dailyTotals.fat}g
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Fiber:</span>
              <span className="font-semibold text-neutral-800">
                {dailyTotals.fiber}g
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DayOfTheWeek;
