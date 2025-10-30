import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
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

  // Derive isLoggedIn from user state to avoid redundant state and extra re-renders
  const isLoggedIn = useMemo(() => user !== null, [user]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const fetchedUser = await userService.getUser();
        if (fetchedUser) {
          setUser(fetchedUser);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const createUser = useCallback(
    async (userData: Omit<User, "id" | "createdAt" | "updatedAt">) => {
      try {
        await userService.createUser(userData);
        const newUser = await userService.getUser();
        if (newUser) {
          setUser(newUser);
        }
      } catch (error) {
        console.error("Error creating user:", error);
        throw error;
      }
    },
    []
  );

  const updateUser = useCallback(
    async (userData: Partial<User>) => {
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
    },
    [user]
  );

  const logout = useCallback(async () => {
    try {
      if (user && user.id) {
        await userService.deleteUser(user.id);
      }
      setUser(null);
    } catch (error) {
      console.error("Error logging out:", error);
      throw error;
    }
  }, [user]);

  // Memoize the context value to prevent unnecessary re-renders of all consumers
  const contextValue = useMemo(
    () => ({
      user,
      loading,
      isLoggedIn,
      createUser,
      updateUser,
      logout,
    }),
    [user, loading, isLoggedIn, createUser, updateUser, logout]
  );

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
