import DayOfTheWeek from "@/components/DayOfTheWeek";
import RecipeLayout from "@/layouts/RecipeLayout";

function MyWeek() {
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const meals = [
    {
      day: "Monday",
      meals: {
        breakfast: "Oatmeal with fruits",
        lunch: "Salad with chicken",
        dinner: "Spaghetti with meat sauce",
      },
    },
    {
      day: "Tuesday",
      meals: {
        breakfast: "Eggs with toast",
        lunch: "Sandwich with salad",
        dinner: "Beef with mashed potatoes",
      },
    },
    {
      day: "Wednesday",
      meals: {
        breakfast: "Yogurt with honey",
        lunch: "Salad with tuna",
        dinner: "Chicken with rice and vegetables",
      },
    },
    {
      day: "Thursday",
      meals: {
        breakfast: "Fruit salad",
        lunch: "Soup with bread",
        dinner: "Pizza with salad",
      },
    },
    {
      day: "Friday",
      meals: {
        breakfast: "Omelette with cheese",
        lunch: "Salad with tuna",
        dinner: "Salad with chicken",
      },
    },
    {
      day: "Saturday",
      meals: {
        breakfast: "Pancakes with syrup",
        lunch: "Salad with chicken",
        dinner: "Pizza with salad",
      },
    },
    {
      day: "Sunday",
      meals: {
        breakfast: "Fruit salad",
        lunch: "Soup with bread",
        dinner: "Pizza with salad",
      },
    },
  ];

  return (
    <RecipeLayout>
      <div className="w-full p-8 rounded-2xl bg-neutral-50/90 border-1 border-neutral-400 shadow-xl drop-shadow-xl h-[calc(100vh-128px)]">
        <h5 className="mb-4 text-neutral-800">
          Plan your meals for the following week
        </h5>
        <div className="flex gap-8 justify-between overflow-x-auto">
          {days.map((day) => {
            const dayMeals = meals.find((m) => m.day === day);
            return <DayOfTheWeek key={day} day={day} meals={dayMeals!.meals} />;
          })}
        </div>
      </div>
    </RecipeLayout>
  );
}

export default MyWeek;
