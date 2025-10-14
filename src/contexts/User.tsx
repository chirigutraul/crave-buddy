import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { User as UserType } from "../types";
import { userService } from "../services/user.service";

export type User = UserType;

interface UserContextType {
  user: User | null;
  loading: boolean;
  isLoggedIn: boolean;
  createUser: (
    userData: Omit<User, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const fetchedUser = await userService.getUser();
        if (fetchedUser) {
          setUser(fetchedUser);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const createUser = async (
    userData: Omit<User, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      const userId = await userService.createUser(userData);
      const newUser = await userService.getUser();
      if (newUser) {
        setUser(newUser);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      if (!user || !user.id) {
        throw new Error("No user to update");
      }
      await userService.updateUser(user.id, userData);
      const updatedUser = await userService.getUser();
      if (updatedUser) {
        setUser(updatedUser);
      }
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (user && user.id) {
        await userService.deleteUser(user.id);
      }
      setUser(null);
      setIsLoggedIn(false);
    } catch (error) {
      console.error("Error logging out:", error);
      throw error;
    }
  };

  return (
    <UserContext.Provider
      value={{ user, loading, isLoggedIn, createUser, updateUser, logout }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
