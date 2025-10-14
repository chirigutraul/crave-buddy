import { db } from "./db";
import type { User } from "../types";

export class UserService {
  /**
   * Get the current user (assuming single user for now)
   */
  async getUser(): Promise<User | null> {
    try {
      const users = await db.users.toArray();
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error("Error getting user:", error);
      throw error;
    }
  }

  /**
   * Create or update user profile
   */
  async createUser(
    userData: Omit<User, "id" | "createdAt" | "updatedAt">
  ): Promise<number> {
    try {
      const now = new Date();
      const user: Omit<User, "id"> = {
        ...userData,
        createdAt: now,
        updatedAt: now,
      };

      const id = await db.users.add(user as User);
      return id as number;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  /**
   * Update specific user fields
   */
  async updateUser(
    id: number,
    updates: Partial<Omit<User, "id" | "createdAt">>
  ): Promise<void> {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date(),
      };

      await db.users.update(id, updateData);
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }

  /**
   * Update the current user (assuming single user)
   */
  async updateCurrentUser(
    updates: Partial<Omit<User, "id" | "createdAt">>
  ): Promise<void> {
    try {
      const currentUser = await this.getUser();
      if (!currentUser || !currentUser.id) {
        throw new Error("No user found to update");
      }

      await this.updateUser(currentUser.id, updates);
    } catch (error) {
      console.error("Error updating current user:", error);
      throw error;
    }
  }

  /**
   * Delete user data
   */
  async deleteUser(id: number): Promise<void> {
    try {
      await db.users.delete(id);
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }

  /**
   * Check if user exists
   */
  async userExists(): Promise<boolean> {
    try {
      const user = await this.getUser();
      return user !== null;
    } catch (error) {
      console.error("Error checking if user exists:", error);
      throw error;
    }
  }
}

export const userService = new UserService();
