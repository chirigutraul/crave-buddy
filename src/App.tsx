import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import CreateRecipe from "./pages/create-recipe";
import MyWeek from "./pages/my-week";
import Profile from "./pages/profile";
import Register from "./pages/register";
import ViewRecipe from "./pages/view-recipe";
import ViewWeeklyPlan from "./pages/view-weekly-plan";
import { WeekMealProvider } from "./contexts/WeekMealContext";
import { UserProvider } from "./contexts/User";

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <WeekMealProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/create-recipe" element={<CreateRecipe />} />
            <Route path="/recipe/:id" element={<ViewRecipe />} />
            <Route path="/my-week" element={<MyWeek />} />
            <Route path="/weekly-plan/:id" element={<ViewWeeklyPlan />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </WeekMealProvider>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;
