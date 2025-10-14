import RecipeLayout from "@/layouts/RecipeLayout";
import { useUser } from "@/contexts/User";
import DailyCheckIn from "@/components/DailyCheckIn";

function Profile() {
  const { user } = useUser();

  return (
    <RecipeLayout>
      <div className="h-full p-8 rounded-2xl bg-neutral-50/90 border-1 border-neutral-400 shadow-xl drop-shadow-xl flex flex-col">
        <div className="mb-4">
          <h5 className="text-neutral-800 mb-4">Hello, {user?.name}!</h5>
          <DailyCheckIn />
        </div>

        <div className="mt-6">
          <h6 className="text-neutral-800 mb-2">Mood Summary</h6>
          <div className="rounded-lg">
            <p className="text-sm text-neutral-600">
              Based on your check-ins, you have been feeling:
            </p>
          </div>
        </div>
      </div>
    </RecipeLayout>
  );
}

export default Profile;
