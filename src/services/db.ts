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
  }
}

export const db = new CraveBuddyDB();
