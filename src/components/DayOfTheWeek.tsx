import { useWeekMeal } from "@/contexts/WeekMealContext";
import type { DayOfWeek as DayType } from "@/contexts/WeekMealContext";
import { Combobox } from "@/components/ui/combo-box";
import type { ComboboxOption } from "@/components/ui/combo-box";

interface DayOfTheWeekProps {
  day: DayType;
}

function DayOfTheWeek({ day }: DayOfTheWeekProps) {
  const { weekMeals, updateMeal, getRecipesByCategory } = useWeekMeal();

  // Get the current meals for this day
  const currentMeals = weekMeals[day];

  // Get recipes categorized by meal time
  const breakfastOptions: ComboboxOption[] = getRecipesByCategory(
    "breakfast"
  ).map((recipe) => ({
    value: recipe.id,
    label: recipe.name,
  }));

  const lunchOptions: ComboboxOption[] = getRecipesByCategory("lunch").map(
    (recipe) => ({
      value: recipe.id,
      label: recipe.name,
    })
  );

  const dinnerOptions: ComboboxOption[] = getRecipesByCategory("dinner").map(
    (recipe) => ({
      value: recipe.id,
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
          <Combobox
            options={breakfastOptions}
            value={currentMeals.breakfast || ""}
            onValueChange={(value) => updateMeal(day, "breakfast", value)}
            placeholder="Select breakfast..."
            searchPlaceholder="Search breakfast..."
            emptyMessage="No breakfast found."
            className="w-full"
          />
        </div>
        <div>
          <h6 className="mb-2 text-sm font-semibold text-neutral-800">
            Lunch:
          </h6>
          <Combobox
            options={lunchOptions}
            value={currentMeals.lunch || ""}
            onValueChange={(value) => updateMeal(day, "lunch", value)}
            placeholder="Select lunch..."
            searchPlaceholder="Search lunch..."
            emptyMessage="No lunch found."
            className="w-full"
          />
        </div>
        <div>
          <h6 className="mb-2 text-sm font-semibold text-neutral-800">
            Dinner:
          </h6>
          <Combobox
            options={dinnerOptions}
            value={currentMeals.dinner || ""}
            onValueChange={(value) => updateMeal(day, "dinner", value)}
            placeholder="Select dinner..."
            searchPlaceholder="Search dinner..."
            emptyMessage="No dinner found."
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}

export default DayOfTheWeek;
