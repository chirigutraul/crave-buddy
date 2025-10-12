import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

// Define User type
export interface User {
  name: string;
  age: number;
  height: number; // in cm
  exercising: boolean;
  weight: number; // in kg
  sex: "male" | "female";
}

interface UserContextType {
  user: User | null;
  isLoggedIn: boolean;
  updateUser: (userData: Partial<User>) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Mock user data for testing
const mockUser: User = {
  name: "John Doe",
  age: 28,
  height: 175,
  exercising: true,
  weight: 75,
  sex: "male",
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(mockUser);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);

  const updateUser = (userData: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...userData } : null));
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <UserContext.Provider value={{ user, isLoggedIn, updateUser, logout }}>
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
