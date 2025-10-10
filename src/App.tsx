import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import CreateRecipe from "./pages/create-recipe";
import MyWeek from "./pages/my-week";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create-recipe" element={<CreateRecipe />} />
        <Route path="/my-week" element={<MyWeek />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
