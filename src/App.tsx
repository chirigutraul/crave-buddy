import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import CreateRecipe from "./pages/create-recipe";
import MyWeek from "./pages/my-week";
import Profile from "./pages/profile";
import Register from "./pages/register";
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
            <Route path="/my-week" element={<MyWeek />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </WeekMealProvider>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;
