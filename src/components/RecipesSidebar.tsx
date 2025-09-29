import { CloudSun, Sun, Moon } from "lucide-react";

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
  const recipeCategories = [
    {
      title: "Breakfast",
      icon: <CloudSun className="!w-5 !h-5" />,
      recipes: [
        "Pancakes with Maple Syrup",
        "Avocado Toast",
        "Greek Yogurt Parfait",
        "Eggs Benedict",
        "Overnight Oats",
      ],
    },
    {
      title: "Lunch",
      icon: <Sun className="!w-5 !h-5" />,
      recipes: [
        "Caesar Salad",
        "Grilled Chicken Sandwich",
        "Quinoa Buddha Bowl",
        "Tomato Basil Soup",
        "Turkey Club Wrap",
      ],
    },
    {
      title: "Dinner",
      icon: <Moon className="!w-5 !h-5" />,
      recipes: [
        "Spaghetti Carbonara",
        "Grilled Salmon",
        "Beef Stir Fry",
        "Chicken Tikka Masala",
        "Vegetable Lasagna",
      ],
    },
  ];

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>My recipes</SidebarGroupLabel>
          <SidebarGroupContent>
            <Accordion type="multiple" className="w-full">
              {recipeCategories.map((category) => (
                <AccordionItem
                  key={category.title}
                  value={category.title}
                  className="border-none"
                >
                  <AccordionTrigger className="hover:no-underline hover:bg-sidebar-accent hover:text-sidebar-accent-foreground px-2 py-1.5 rounded-md">
                    <div className="flex items-center gap-2">
                      {category.icon}
                      <span>{category.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-0">
                    <SidebarMenu className="ml-6">
                      {category.recipes.map((recipe) => (
                        <SidebarMenuItem key={recipe}>
                          <SidebarMenuButton asChild>
                            <div className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                              {recipe}
                            </div>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
