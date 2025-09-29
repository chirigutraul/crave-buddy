function Sidebar() {
  const recipeCategories = ["Breakfast", "Lunch", "Dinner"];
  return (
    <aside className="border-r-2 w-64 p-0">
      <nav>
        <ul className="mt-2">
          {recipeCategories.map((category) => (
            <li
              key={category}
              className="px-4 py-2 hover:bg-neutral-200 cursor-pointer"
            >
              {category}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;
