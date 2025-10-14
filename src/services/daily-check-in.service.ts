import { db } from "./db";
import type { DailyCheckIn, HungerLevel } from "../types";

export class DailyCheckInService {
  /**
   * Get all check-ins
   */
  async getAllCheckIns(): Promise<DailyCheckIn[]> {
    try {
      return await db.dailyCheckIns.orderBy("date").reverse().toArray();
    } catch (error) {
      console.error("Error getting all check-ins:", error);
      throw error;
    }
  }

  /**
   * Get check-ins within date range
   */
  async getCheckInsByDateRange(
    startDate: string,
    endDate: string
  ): Promise<DailyCheckIn[]> {
    try {
      return await db.dailyCheckIns
        .where("date")
        .between(startDate, endDate, true, true)
        .toArray();
    } catch (error) {
      console.error("Error getting check-ins by date range:", error);
      throw error;
    }
  }

  /**
   * Get specific day's check-in
   */
  async getCheckInByDate(date: string): Promise<DailyCheckIn | undefined> {
    try {
      return await db.dailyCheckIns.where("date").equals(date).first();
    } catch (error) {
      console.error("Error getting check-in by date:", error);
      throw error;
    }
  }

  /**
   * Add new check-in
   */
  async createCheckIn(checkIn: Omit<DailyCheckIn, "id">): Promise<number> {
    try {
      // Check if check-in already exists for this date
      const existingCheckIn = await this.getCheckInByDate(checkIn.date);
      if (existingCheckIn) {
        throw new Error(`Check-in already exists for date: ${checkIn.date}`);
      }

      const id = await db.dailyCheckIns.add(checkIn as DailyCheckIn);
      return id as number;
    } catch (error) {
      console.error("Error creating check-in:", error);
      throw error;
    }
  }

  /**
   * Update existing check-in
   */
  async updateCheckIn(
    id: number,
    updates: Partial<Omit<DailyCheckIn, "id">>
  ): Promise<void> {
    try {
      await db.dailyCheckIns.update(id, updates);
    } catch (error) {
      console.error("Error updating check-in:", error);
      throw error;
    }
  }

  /**
   * Update or create check-in for a specific date
   */
  async upsertCheckInByDate(
    date: string,
    hungerLevel: HungerLevel
  ): Promise<number> {
    try {
      const existingCheckIn = await this.getCheckInByDate(date);

      if (existingCheckIn && existingCheckIn.id) {
        await this.updateCheckIn(existingCheckIn.id, { hungerLevel });
        return existingCheckIn.id;
      } else {
        return await this.createCheckIn({ date, hungerLevel });
      }
    } catch (error) {
      console.error("Error upserting check-in by date:", error);
      throw error;
    }
  }

  /**
   * Remove check-in
   */
  async deleteCheckIn(id: number): Promise<void> {
    try {
      await db.dailyCheckIns.delete(id);
    } catch (error) {
      console.error("Error deleting check-in:", error);
      throw error;
    }
  }

  /**
   * Remove check-in by date
   */
  async deleteCheckInByDate(date: string): Promise<void> {
    try {
      const checkIn = await this.getCheckInByDate(date);
      if (checkIn && checkIn.id) {
        await this.deleteCheckIn(checkIn.id);
      }
    } catch (error) {
      console.error("Error deleting check-in by date:", error);
      throw error;
    }
  }

  /**
   * Get check-ins by hunger level
   */
  async getCheckInsByHungerLevel(
    hungerLevel: HungerLevel
  ): Promise<DailyCheckIn[]> {
    try {
      return await db.dailyCheckIns
        .where("hungerLevel")
        .equals(hungerLevel)
        .toArray();
    } catch (error) {
      console.error("Error getting check-ins by hunger level:", error);
      throw error;
    }
  }

  /**
   * Get recent check-ins (last N days)
   */
  async getRecentCheckIns(days: number = 7): Promise<DailyCheckIn[]> {
    try {
      const endDate = new Date().toISOString().split("T")[0];
      const startDate = new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      return await this.getCheckInsByDateRange(startDate, endDate);
    } catch (error) {
      console.error("Error getting recent check-ins:", error);
      throw error;
    }
  }

  /**
   * Get hunger level statistics for a date range
   */
  async getHungerLevelStats(
    startDate: string,
    endDate: string
  ): Promise<Record<HungerLevel, number>> {
    try {
      const checkIns = await this.getCheckInsByDateRange(startDate, endDate);

      const stats: Record<HungerLevel, number> = {
        starving: 0,
        hungry: 0,
        satisfied: 0,
        full: 0,
        veryFull: 0,
      };

      checkIns.forEach((checkIn) => {
        stats[checkIn.hungerLevel]++;
      });

      return stats;
    } catch (error) {
      console.error("Error getting hunger level stats:", error);
      throw error;
    }
  }
}

export const dailyCheckInService = new DailyCheckInService();
