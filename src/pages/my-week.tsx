import DayOfTheWeek from "@/components/DayOfTheWeek";
import RecipeLayout from "@/layouts/RecipeLayout";
import { useWeekMeal } from "@/contexts/WeekMealContext";
import type { DayOfWeek } from "@/contexts/WeekMealContext";
import { Button } from "@/components/ui/button";

function MyWeek() {
  const { weekMeals, getRecipeById } = useWeekMeal();

  const days: DayOfWeek[] = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const handleSaveWeek = () => {
    // Transform the weekMeals to show recipe names instead of IDs
    const weekPlan = Object.entries(weekMeals).reduce((acc, [day, meals]) => {
      acc[day] = {
        breakfast: meals.breakfast
          ? getRecipeById(meals.breakfast)?.name || meals.breakfast
          : "Not selected",
        lunch: meals.lunch
          ? getRecipeById(meals.lunch)?.name || meals.lunch
          : "Not selected",
        dinner: meals.dinner
          ? getRecipeById(meals.dinner)?.name || meals.dinner
          : "Not selected",
      };
      return acc;
    }, {} as Record<string, { breakfast: string; lunch: string; dinner: string }>);

    console.log("Week Meal Plan:", weekPlan);
    console.log("Raw Week Meals (with IDs):", weekMeals);
  };

  return (
    <RecipeLayout>
      <div className="h-full p-8 rounded-2xl bg-neutral-50/90 border-1 border-neutral-400 shadow-xl drop-shadow-xl flex flex-col">
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h5 className="text-neutral-800">
            Plan your meals for the following week
          </h5>
          <Button onClick={handleSaveWeek} variant="default">
            Save Week
          </Button>
        </div>
        <div className="flex gap-8 overflow-x-auto overflow-y-hidden max-h-[400px] pb-4">
          {days.map((day) => (
            <DayOfTheWeek key={day} day={day} />
          ))}
        </div>

        {/* Summary Section - Space for future week summary */}
        <div className="mt-6 flex-shrink-0">
          <h6 className="text-neutral-800 mb-2">Week Summary</h6>
          <div className="rounded-lg">
            <p className="text-sm text-neutral-600">
              Your week summary will appear here
            </p>
          </div>
        </div>
      </div>
    </RecipeLayout>
  );
}

export default MyWeek;
