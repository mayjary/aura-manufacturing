import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    
    if (token && role) {
      setIsAuthenticated(true);
      setUserRole(role);
    } else {
      setIsAuthenticated(false);
      setUserRole(null);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("project_id");
    setIsAuthenticated(false);
    setUserRole(null);
    navigate("/");
  };

  return {
    isAuthenticated,
    userRole,
    logout,
  };
};

