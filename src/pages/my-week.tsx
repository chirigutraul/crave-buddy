import DayOfTheWeek from "@/components/DayOfTheWeek";
import RecipeLayout from "@/layouts/RecipeLayout";
import { useWeekMeal } from "@/contexts/WeekMealContext";
import type { DayOfWeek } from "@/contexts/WeekMealContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { weeklyPlanService } from "@/services/weekly-plan.service";
import { useState } from "react";

function MyWeek() {
  const { weekMeals } = useWeekMeal();
  const [weekName, setWeekName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [savedPlanId, setSavedPlanId] = useState<number | null>(null);

  const days: DayOfWeek[] = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const handleSaveWeek = async () => {
    if (!weekName.trim()) {
      alert("Please enter a name for your weekly plan");
      return;
    }

    try {
      setIsSaving(true);

      const weeklyPlan = {
        name: weekName.trim(),
        meals: weekMeals,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const planId = await weeklyPlanService.createWeeklyPlan(weeklyPlan);
      setSavedPlanId(planId);

      // Log the week meals with recipe IDs
      console.log("Week Meal Plan Saved:");
      console.log("Plan ID:", planId);
      console.log("Plan Name:", weekName);
      Object.entries(weekMeals).forEach(([day, meals]) => {
        console.log(`${day}:`);
        console.log(`  breakfast: ${meals.breakfast ?? "Not selected"}`);
        console.log(`  lunch: ${meals.lunch ?? "Not selected"}`);
        console.log(`  snack: ${meals.snack ?? "Not selected"}`);
        console.log(`  dinner: ${meals.dinner ?? "Not selected"}`);
      });

      alert(`Weekly plan "${weekName}" saved successfully!`);
    } catch (error) {
      console.error("Error saving weekly plan:", error);
      alert("Failed to save weekly plan. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <RecipeLayout>
      <div className="h-full p-8 rounded-2xl bg-neutral-50/90 border-1 border-neutral-400 shadow-xl drop-shadow-xl flex flex-col">
        <div className="flex justify-between items-center mb-4 flex-shrink-0 gap-4">
          <h5 className="text-neutral-800 whitespace-nowrap">
            Plan your meals for the following week
          </h5>
          <div className="flex items-center gap-3 flex-1 justify-end">
            <Input
              type="text"
              placeholder="Week plan name (e.g., 'Week of Jan 15')"
              value={weekName}
              onChange={(e) => {
                setWeekName(e.target.value);
                setSavedPlanId(null); // Reset saved state when user changes name
              }}
              className="max-w-xs"
            />
            <Button
              onClick={handleSaveWeek}
              variant="default"
              disabled={isSaving || !weekName.trim() || savedPlanId !== null}
            >
              {isSaving ? "Saving..." : savedPlanId ? "Saved" : "Save Week"}
            </Button>
          </div>
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
