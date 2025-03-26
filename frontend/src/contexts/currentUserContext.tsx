import { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUser } from "../services/authService";

// Tạo Context
const CurrentUserContext = createContext<any>(null);

// Tạo Provider component
export const CurrentUserProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    getCurrentUser()
      .then(user => {
        setCurrentUser(user);
      })
      .catch(error => {
        console.error("Error fetching user:", error);
      });
  }, []);

  return (
    <CurrentUserContext.Provider value={{currentUser, setCurrentUser}}>
      {children}
    </CurrentUserContext.Provider>
  );
};

// Hook để sử dụng Context (giữ tên `useCurrentUser` cho tương thích)
export const useCurrentUser = () => {
  const context = useContext(CurrentUserContext);
  if (!context) {
    throw new Error("useCurrentUser must be used within a CurrentUserProvider");
  }
  return context;
};
