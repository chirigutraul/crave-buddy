import { useState } from "react";
import RecipeLayout from "@/layouts/RecipeLayout";
import { useUser } from "@/contexts/User";
import DailyCheckIn from "@/components/DailyCheckIn";
import { WeightChart } from "@/components/LineChart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCurrentWeight } from "@/lib/utils";

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

  return (
    <RecipeLayout>
      <div className="h-full p-8 rounded-2xl bg-neutral-50/90 border-1 border-neutral-400 shadow-xl drop-shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left column - Main content */}

          {/* Right column - Weight tracking */}
          <div className="lg:col-span-1">
            <h5 className="text-neutral-800 mb-4">Hello, {user?.name}!</h5>

            <div className="flex flex-col gap-4">
              <div>
                <h6 className="text-neutral-800 mb-2">Weight Tracking</h6>
                <p className="text-sm text-neutral-600 mb-3">
                  Current:{" "}
                  <span className="font-semibold">{currentWeight} kg</span>
                </p>
              </div>

              <div className="w-full">
                <WeightChart weightEntries={user?.weight || []} compact />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="weight-input"
                  className="block text-xs font-medium text-neutral-700"
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
                    className="text-sm"
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
