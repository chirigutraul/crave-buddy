import { useWeekMeal } from "@/contexts/WeekMealContext";
import type { DayOfWeek as DayType } from "@/contexts/WeekMealContext";
import { Combobox } from "@/components/ui/combo-box";
import type { ComboboxOption } from "@/components/ui/combo-box";
import { Input } from "@/components/ui/input";

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

  return (
    <div className="py-4 min-w-[250px] flex-shrink-0">
      <h5 className="mb-4">{day}</h5>
      <div className="flex flex-col gap-4">
        <div>
          <h6 className="mb-2 text-sm font-semibold text-neutral-800">
            Breakfast:
          </h6>
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
              className="flex-1 rounded-r-none"
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
                className="pr-5 text-sm rounded-l-none bg-background"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-neutral-500 pointer-events-none">
                g
              </span>
            </div>
          </div>
        </div>
        <div>
          <h6 className="mb-2 text-sm font-semibold text-neutral-800">
            Lunch:
          </h6>
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
              className="flex-1 rounded-r-none"
            />
            <div className="relative w-16">
              <Input
                type="number"
                value={currentMeals.lunch.quantity || ""}
                onChange={(e) =>
                  updateQuantity(day, "lunch", parseInt(e.target.value) || 0)
                }
                placeholder="0"
                className="pr-5 text-sm rounded-l-none bg-background"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-neutral-500 pointer-events-none">
                g
              </span>
            </div>
          </div>
        </div>
        <div>
          <h6 className="mb-2 text-sm font-semibold text-neutral-800">
            Snack:
          </h6>
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
              className="flex-1 rounded-r-none"
            />
            <div className="relative w-16">
              <Input
                type="number"
                value={currentMeals.snack.quantity || ""}
                onChange={(e) =>
                  updateQuantity(day, "snack", parseInt(e.target.value) || 0)
                }
                placeholder="0"
                className="pr-5 text-sm rounded-l-none bg-background"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-neutral-500 pointer-events-none">
                g
              </span>
            </div>
          </div>
        </div>
        <div>
          <h6 className="mb-2 text-sm font-semibold text-neutral-800">
            Dinner:
          </h6>
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
              className="flex-1 rounded-r-none"
            />
            <div className="relative w-16">
              <Input
                type="number"
                value={currentMeals.dinner.quantity || ""}
                onChange={(e) =>
                  updateQuantity(day, "dinner", parseInt(e.target.value) || 0)
                }
                placeholder="0"
                className="pr-5 text-sm rounded-l-none bg-background"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-neutral-500 pointer-events-none">
                g
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DayOfTheWeek;
