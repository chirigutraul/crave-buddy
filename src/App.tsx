import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import CreateRecipe from "./pages/create-recipe";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create-recipe" element={<CreateRecipe />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
