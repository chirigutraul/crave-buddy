// db.js
import Dexie from "dexie";

export const db = new Dexie("crave-buddy");
db.version(1).stores({
  users: "++id",
  recipes: "++id",
  weeklyPlans: "++id",
});
