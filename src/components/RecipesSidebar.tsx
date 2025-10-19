import { CloudSun, Sun, Moon, Cookie, Calendar } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/services/db";
import type { Recipe, MealTime } from "@/types";
import { useViewTransition } from "@/hooks/use-view-transition";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function RecipesSidebar() {
  const navigate = useViewTransition();

  // Use useLiveQuery to observe recipe changes in real-time
  const recipes = useLiveQuery(
    () => db.recipes.toArray(),
    [] // No dependencies - always observe all recipes
  );

  // Use useLiveQuery to observe weekly plans in real-time
  const weeklyPlans = useLiveQuery(
    () => db.weeklyPlans.orderBy("createdAt").reverse().toArray(),
    [] // No dependencies - always observe all weekly plans
  );

  const getRecipesByCategory = (category: MealTime): Recipe[] => {
    if (!recipes) return [];
    return recipes.filter((recipe) => recipe.category.includes(category));
  };

  const recipeCategories = [
    {
      title: "Breakfast",
      icon: <CloudSun className="!w-5 !h-5" />,
      mealType: "breakfast" as MealTime,
    },
    {
      title: "Lunch",
      icon: <Sun className="!w-5 !h-5" />,
      mealType: "lunch" as MealTime,
    },
    {
      title: "Snack",
      icon: <Cookie className="!w-5 !h-5" />,
      mealType: "snack" as MealTime,
    },
    {
      title: "Dinner",
      icon: <Moon className="!w-5 !h-5" />,
      mealType: "dinner" as MealTime,
    },
  ];

  return (
    <Sidebar variant="translucent">
      <SidebarContent>
        {/* My Recipes Section */}
        <SidebarGroup>
          <SidebarGroupLabel>My recipes</SidebarGroupLabel>
          <SidebarGroupContent>
            {!recipes ? (
              <div className="text-sm text-muted-foreground px-2 py-4">
                Loading recipes...
              </div>
            ) : (
              <Accordion type="multiple" className="w-full">
                {recipeCategories.map((category) => {
                  const categoryRecipes = getRecipesByCategory(
                    category.mealType
                  );

                  return (
                    <AccordionItem
                      key={category.title}
                      value={category.title}
                      className="border-none"
                    >
                      <AccordionTrigger className="hover:no-underline hover:bg-sidebar-accent hover:text-sidebar-accent-foreground px-2 py-1.5 rounded-md">
                        <div className="flex items-center gap-2">
                          {category.icon}
                          <span>{category.title}</span>
                          <span className="text-xs text-muted-foreground">
                            ({categoryRecipes.length})
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-0">
                        <SidebarMenu className="ml-6">
                          {categoryRecipes.length > 0 ? (
                            categoryRecipes.map((recipe) => (
                              <SidebarMenuItem
                                key={`${category.mealType}-${recipe.id}`}
                              >
                                <SidebarMenuButton asChild>
                                  <div
                                    className="cursor-pointer text-sm text-muted-foreground hover:text-foreground"
                                    onClick={() =>
                                      navigate(`/recipe/${recipe.id}`)
                                    }
                                  >
                                    {recipe.name}
                                  </div>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            ))
                          ) : (
                            <div className="text-xs text-muted-foreground px-2 py-2">
                              No recipes yet
                            </div>
                          )}
                        </SidebarMenu>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            )}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* My Weekly Plans Section */}
        <SidebarGroup>
          <SidebarGroupLabel>My weekly plans</SidebarGroupLabel>
          <SidebarGroupContent>
            {!weeklyPlans ? (
              <div className="text-sm text-muted-foreground px-2 py-4">
                Loading plans...
              </div>
            ) : weeklyPlans.length > 0 ? (
              <SidebarMenu>
                {weeklyPlans.map((plan) => (
                  <SidebarMenuItem key={plan.id}>
                    <SidebarMenuButton asChild>
                      <div
                        className="cursor-pointer"
                        onClick={() => navigate(`/weekly-plan/${plan.id}`)}
                      >
                        <Calendar />
                        <span>{plan.name}</span>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            ) : (
              <div className="text-xs text-muted-foreground px-2 py-2">
                No weekly plans yet
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
