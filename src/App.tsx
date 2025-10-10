import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import CreateRecipe from "./pages/create-recipe";
import MyWeek from "./pages/my-week";
import { WeekMealProvider } from "./contexts/WeekMealContext";

function App() {
  return (
    <WeekMealProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create-recipe" element={<CreateRecipe />} />
          <Route path="/my-week" element={<MyWeek />} />
        </Routes>
      </BrowserRouter>
    </WeekMealProvider>
  );
}

export default App;
