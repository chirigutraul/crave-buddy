import DayOfTheWeek from "@/components/DayOfTheWeek";
import RecipeLayout from "@/layouts/RecipeLayout";
import { useWeekMeal } from "@/contexts/WeekMealContext";
import type { DayOfWeek } from "@/contexts/WeekMealContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { weeklyPlanService } from "@/services/weekly-plan.service";
import type { MealTime } from "@/types";
import { useState, useEffect } from "react";
import { calculateNutritionalValues } from "@/lib/recipe-utils";
import { useParams } from "react-router-dom";
import { useViewTransition } from "@/hooks/use-view-transition";
import { Loader2 } from "lucide-react";

function ViewWeeklyPlan() {
  const { id } = useParams<{ id: string }>();
  const navigate = useViewTransition();
  const { weekMeals, getRecipeById, loadWeekMeals } = useWeekMeal();
  const [weekName, setWeekName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const days: DayOfWeek[] = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // Load the weekly plan from database
  useEffect(() => {
    const loadPlan = async () => {
      if (!id) {
        alert("Invalid weekly plan ID");
        navigate("/my-week");
        return;
      }

      try {
        setIsLoading(true);
        const plan = await weeklyPlanService.getWeeklyPlanById(Number(id));

        if (!plan) {
          alert("Weekly plan not found");
          navigate("/my-week");
          return;
        }

        setWeekName(plan.name);
        loadWeekMeals(plan.meals);
      } catch (error) {
        console.error("Error loading weekly plan:", error);
        alert("Failed to load weekly plan");
        navigate("/my-week");
      } finally {
        setIsLoading(false);
      }
    };

    loadPlan();
  }, [id, navigate, loadWeekMeals]);

  // Track changes
  useEffect(() => {
    if (!isLoading) {
      setHasUnsavedChanges(true);
    }
  }, [weekMeals, isLoading]);

  // Calculate weekly totals
  const calculateWeeklyTotals = () => {
    const mealTimes: MealTime[] = ["breakfast", "lunch", "snack", "dinner"];
    let totals = {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: 0,
    };

    days.forEach((day) => {
      mealTimes.forEach((mealTime) => {
        const meal = weekMeals[day][mealTime];
        if (meal.recipeId && meal.quantity > 0) {
          const recipe = getRecipeById(meal.recipeId);
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
    });

    return {
      calories: Math.round(totals.calories),
      protein: Math.round(totals.protein * 10) / 10,
      carbohydrates: Math.round(totals.carbohydrates * 10) / 10,
      fat: Math.round(totals.fat * 10) / 10,
      fiber: Math.round(totals.fiber * 10) / 10,
    };
  };

  const weeklyTotals = calculateWeeklyTotals();
  const averageDailyCalories = Math.round(weeklyTotals.calories / 7);

  // Mock values - will be replaced with actual user data later
  const mockDailyCalorieTarget = 2200; // This should come from user profile
  const mockWeeklyCalorieTarget = mockDailyCalorieTarget * 7;
  const calorieDeficit = mockWeeklyCalorieTarget - weeklyTotals.calories;

  const handleUpdateWeek = async () => {
    if (!weekName.trim()) {
      alert("Please enter a name for your weekly plan");
      return;
    }

    if (!id) {
      alert("Invalid weekly plan ID");
      return;
    }

    try {
      setIsSaving(true);

      await weeklyPlanService.updateWeeklyPlan(Number(id), {
        name: weekName.trim(),
        meals: weekMeals,
      });

      setHasUnsavedChanges(false);

      // Log the updated week meals with recipe IDs and calories
      console.log("\n=== Week Meal Plan Updated ===");
      console.log("Plan ID:", id);
      console.log("Plan Name:", weekName);
      Object.entries(weekMeals).forEach(([day, meals]) => {
        console.log(`\n${day}:`);
        let dayTotal = 0;
        Object.entries(meals).forEach(([mealTime, mealEntry]) => {
          const entry = mealEntry as {
            recipeId: number | null;
            quantity: number;
          };
          if (entry.recipeId !== null) {
            const recipe = getRecipeById(entry.recipeId);
            if (recipe) {
              const nutritionalValues = calculateNutritionalValues(
                recipe,
                entry.quantity
              );
              console.log(
                `  ${mealTime}: ${recipe.name} - ${entry.quantity}g (${nutritionalValues.calories} kcal)`
              );
              dayTotal += nutritionalValues.calories;
            } else {
              console.log(`  ${mealTime}: Recipe ID ${entry.recipeId}`);
            }
          } else {
            console.log(`  ${mealTime}: Not selected`);
          }
        });
        console.log(`  ➜ TOTAL: ${dayTotal} kcal`);
      });
      console.log("==============================\n");

      alert(`Weekly plan "${weekName}" updated successfully!`);
    } catch (error) {
      console.error("Error updating weekly plan:", error);
      alert("Failed to update weekly plan. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <RecipeLayout>
        <div className="h-full flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-neutral-600" />
            <p className="text-neutral-600">Loading weekly plan...</p>
          </div>
        </div>
      </RecipeLayout>
    );
  }

  return (
    <RecipeLayout>
      <div className="h-full p-8 rounded-2xl bg-neutral-50/90 border-1 border-neutral-400 shadow-xl drop-shadow-xl flex flex-col">
        <div className="flex justify-between items-center mb-4 flex-shrink-0 gap-4">
          <h5 className="text-neutral-800 whitespace-nowrap">
            View and edit your weekly plan
          </h5>
          <div className="flex items-center gap-3 flex-1 justify-end">
            <Button onClick={() => navigate("/my-week")} variant="outline">
              Back to Create
            </Button>
            <Input
              type="text"
              placeholder="Week plan name (e.g., 'Week of Jan 15')"
              value={weekName}
              onChange={(e) => {
                setWeekName(e.target.value);
                setHasUnsavedChanges(true);
              }}
              className="max-w-xs"
            />
            <Button
              onClick={handleUpdateWeek}
              variant="default"
              disabled={isSaving || !weekName.trim() || !hasUnsavedChanges}
            >
              {isSaving
                ? "Updating..."
                : hasUnsavedChanges
                ? "Update"
                : "Up to date"}
            </Button>
          </div>
        </div>
        <div className="flex gap-8 overflow-x-auto overflow-y-hidden max-h-[800px] pb-4">
          {days.map((day) => (
            <DayOfTheWeek key={day} day={day} />
          ))}
        </div>

        {/* Summary Section */}
        <div className="mt-6 flex-shrink-0">
          <h6 className="text-neutral-800 mb-3">Week Summary</h6>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Weekly Totals Card */}
            <div className="bg-white rounded-lg p-4 border border-neutral-300 shadow-sm">
              <h6 className="text-sm font-bold text-neutral-800 mb-3">
                Weekly Totals
              </h6>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Calories:</span>
                  <span className="font-semibold text-neutral-800">
                    {weeklyTotals.calories.toLocaleString()} kcal
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Protein:</span>
                  <span className="font-semibold text-neutral-800">
                    {weeklyTotals.protein}g
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Carbs:</span>
                  <span className="font-semibold text-neutral-800">
                    {weeklyTotals.carbohydrates}g
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Fat:</span>
                  <span className="font-semibold text-neutral-800">
                    {weeklyTotals.fat}g
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Fiber:</span>
                  <span className="font-semibold text-neutral-800">
                    {weeklyTotals.fiber}g
                  </span>
                </div>
              </div>
            </div>

            {/* Daily Averages Card */}
            <div className="bg-white rounded-lg p-4 border border-neutral-300 shadow-sm">
              <h6 className="text-sm font-bold text-neutral-800 mb-3">
                Daily Averages
              </h6>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Calories:</span>
                  <span className="font-semibold text-neutral-800">
                    {averageDailyCalories.toLocaleString()} kcal
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Protein:</span>
                  <span className="font-semibold text-neutral-800">
                    {Math.round((weeklyTotals.protein / 7) * 10) / 10}g
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Carbs:</span>
                  <span className="font-semibold text-neutral-800">
                    {Math.round((weeklyTotals.carbohydrates / 7) * 10) / 10}g
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Fat:</span>
                  <span className="font-semibold text-neutral-800">
                    {Math.round((weeklyTotals.fat / 7) * 10) / 10}g
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Fiber:</span>
                  <span className="font-semibold text-neutral-800">
                    {Math.round((weeklyTotals.fiber / 7) * 10) / 10}g
                  </span>
                </div>
              </div>
            </div>

            {/* Calorie Deficit/Surplus Card */}
            <div className="bg-white rounded-lg p-4 border border-neutral-300 shadow-sm">
              <h6 className="text-sm font-bold text-neutral-800 mb-3">
                Calorie Balance
              </h6>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Target (week):</span>
                  <span className="font-semibold text-neutral-800">
                    {mockWeeklyCalorieTarget.toLocaleString()} kcal
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Planned (week):</span>
                  <span className="font-semibold text-neutral-800">
                    {weeklyTotals.calories.toLocaleString()} kcal
                  </span>
                </div>
                <div className="pt-2 border-t border-neutral-200">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600 font-medium">
                      {calorieDeficit >= 0 ? "Deficit:" : "Surplus:"}
                    </span>
                    <span
                      className={`font-bold text-lg ${
                        calorieDeficit >= 0
                          ? "text-green-600"
                          : "text-orange-600"
                      }`}
                    >
                      {Math.abs(calorieDeficit).toLocaleString()} kcal
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-2">
                    {calorieDeficit >= 0
                      ? "You're on track for weight loss"
                      : "You're exceeding your calorie target"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RecipeLayout>
  );
}

export default ViewWeeklyPlan;
