// db.ts
import Dexie, { type Table } from "dexie";
import type { User, Recipe, WeeklyPlan, DailyCheckIn } from "../types";

export class CraveBuddyDB extends Dexie {
  users!: Table<User>;
  recipes!: Table<Recipe>;
  weeklyPlans!: Table<WeeklyPlan>;
  dailyCheckIns!: Table<DailyCheckIn>;

  constructor() {
    super("crave-buddy");
    this.version(1).stores({
      users:
        "++id, name, age, height, weight, sex, exercising, createdAt, updatedAt",
      recipes:
        "++id, name, image, ingredients, instructions, nutritionalValues",
      weeklyPlans: "++id, name, meals, createdAt, updatedAt",
      dailyCheckIns: "++id, date, hungerLevel",
    });

    // Version 2: Updated recipe structure with portions and structured ingredients
    this.version(2).stores({
      users:
        "++id, name, age, height, weight, sex, exercising, createdAt, updatedAt",
      recipes: "++id, name, image, portionSize, createdAt, updatedAt",
      weeklyPlans: "++id, name, meals, createdAt, updatedAt",
      dailyCheckIns: "++id, date, hungerLevel",
    });

    // Version 3: Updated weight to be an array of weight entries
    this.version(3)
      .stores({
        users: "++id, name, age, height, sex, exercising, createdAt, updatedAt",
        recipes: "++id, name, image, portionSize, createdAt, updatedAt",
        weeklyPlans: "++id, name, meals, createdAt, updatedAt",
        dailyCheckIns: "++id, date, hungerLevel",
      })
      .upgrade((tx) => {
        // Migrate existing users to have weight as an array
        return tx
          .table("users")
          .toCollection()
          .modify((user) => {
            if (user.weight && typeof user.weight === "number") {
              user.weight = [
                {
                  value: user.weight,
                  date: user.createdAt
                    ? new Date(user.createdAt).toISOString()
                    : new Date().toISOString(),
                },
              ];
            }
          });
      });
  }
}

export const db = new CraveBuddyDB();
