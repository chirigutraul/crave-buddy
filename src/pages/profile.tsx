import { useState } from "react";
import RecipeLayout from "@/layouts/RecipeLayout";
import { useUser } from "@/contexts/User";
import { WeightChart } from "@/components/LineChart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getCurrentWeight,
  calculateBMR,
  calculateDailyCalories,
  calculateBMI,
} from "@/lib/utils";

function Profile() {
  const { user, updateUser } = useUser();
  const [newWeight, setNewWeight] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddWeight = async () => {
    if (!user || !newWeight) return;

    const weightValue = parseFloat(newWeight);
    if (isNaN(weightValue) || weightValue < 20 || weightValue > 500) {
      alert("Please enter a valid weight between 20 and 500 kg");
      return;
    }

    setIsAdding(true);
    try {
      const newWeightEntry = {
        value: weightValue,
        date: new Date().toISOString(),
      };

      const updatedWeightArray = [...(user.weight || []), newWeightEntry];

      await updateUser({
        weight: updatedWeightArray,
      });

      setNewWeight("");
    } catch (error) {
      console.error("Error adding weight:", error);
      alert("Failed to add weight. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  const currentWeight = user?.weight ? getCurrentWeight(user.weight) : 0;

  // Calculate nutritional values
  const bmr =
    user && user.activityLevel
      ? calculateBMR({
          weight: currentWeight,
          height: user.height,
          age: user.age,
          sex: user.sex,
        })
      : 0;

  const maintenanceCalories =
    user && user.activityLevel
      ? calculateDailyCalories({
          bmr,
          activityLevel: user.activityLevel,
        })
      : 0;

  const targetCaloriesDeficit =
    maintenanceCalories > 0
      ? Math.round(maintenanceCalories - maintenanceCalories * 0.1)
      : 0;

  const bmi = user
    ? calculateBMI({
        weight: currentWeight,
        height: user.height,
      })
    : 0;

  return (
    <RecipeLayout>
      <div className="h-full p-8 rounded-2xl bg-neutral-50/90 border-1 border-neutral-400 shadow-xl drop-shadow-xl">
        <h5 className="text-neutral-800 mb-4">Hello, {user?.name}!</h5>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left column - Nutritional Information */}
          <div className="lg:col-span-1">
            <h6 className="text-neutral-800 mb-4">Nutritional information</h6>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg shadow-sm border border-neutral-200 w-88">
                <p className="text-xs text-neutral-500 mb-1">
                  BMR (Basal Metabolic Rate)
                </p>
                <p className="text-2xl font-semibold text-neutral-800">
                  {Math.round(bmr)}{" "}
                  <span className="text-sm font-normal text-neutral-600">
                    kcal/day
                  </span>
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  Calories your body burns at rest
                </p>
              </div>

              <div className="p-4 bg-white rounded-lg shadow-sm border border-neutral-200 w-88">
                <p className="text-xs text-neutral-500 mb-1">
                  Maintenance Calories (TDEE)
                </p>
                <p className="text-2xl font-semibold text-neutral-800">
                  {Math.round(maintenanceCalories)}{" "}
                  <span className="text-sm font-normal text-neutral-600">
                    kcal/day
                  </span>
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  Calories to maintain current weight
                </p>
              </div>

              <div className="p-4 bg-white rounded-lg shadow-sm border border-neutral-200 w-88">
                <p className="text-xs text-neutral-500 mb-1">
                  Target Calories (10% Deficit)
                </p>
                <p className="text-2xl font-semibold text-green-700">
                  {targetCaloriesDeficit}{" "}
                  <span className="text-sm font-normal text-neutral-600">
                    kcal/day
                  </span>
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  Recommended for healthy weight loss
                </p>
              </div>

              <div className="p-4 bg-white rounded-lg shadow-sm border border-neutral-200 w-88">
                <p className="text-xs text-neutral-500 mb-1">
                  BMI (Body Mass Index)
                </p>
                <p className="text-2xl font-semibold text-neutral-800">
                  {bmi.toFixed(1)}
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  {bmi < 18.5 && "Underweight"}
                  {bmi >= 18.5 && bmi < 25 && "Normal weight"}
                  {bmi >= 25 && bmi < 30 && "Overweight"}
                  {bmi >= 30 && "Obese"}
                </p>
              </div>
            </div>
          </div>

          {/* Right column - Weight tracking */}
          <div className="lg:col-span-1">
            <div className="flex flex-col gap-4">
              <h6 className="text-neutral-800">Weight Tracking</h6>

              <div className="w-128">
                <WeightChart weightEntries={user?.weight || []} />
              </div>

              <div>
                <p className="text-sm text-neutral-600">
                  Current:{" "}
                  <span className="font-semibold">{currentWeight} kg</span>
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="weight-input"
                  className="block text-xs font-medium text-neutral-800"
                >
                  Add Weight-In (kg)
                </label>
                <div className="flex gap-2">
                  <Input
                    id="weight-input"
                    type="number"
                    placeholder="Weight"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    min="20"
                    max="500"
                    step="0.1"
                    disabled={isAdding}
                    className="text-sm bg-neutral-50 w-64"
                  />
                  <Button
                    onClick={handleAddWeight}
                    disabled={isAdding || !newWeight}
                    size="sm"
                  >
                    {isAdding ? "Adding..." : "Add"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RecipeLayout>
  );
}

export default Profile;
