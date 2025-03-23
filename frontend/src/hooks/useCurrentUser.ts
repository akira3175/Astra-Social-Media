import { useState, useEffect } from "react";
import { getCurrentUser } from "../services/authService";

export const useCurrentUser = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    getCurrentUser().then(user => {
      setCurrentUser(user);
    }).catch(error => {
      console.error("Error fetching user:", error);
    });
  }, []);

  return currentUser;
};
