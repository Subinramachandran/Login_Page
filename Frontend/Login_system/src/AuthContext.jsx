// AuthContext.jsx
import { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [profile, setProfile] = useState(null); // null means not logged in
  const [loading, setLoading] = useState(false); // no fetch on start

  // Call this after successful login
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/profile", {
        credentials: "include",
      });

      if (res.status === 401) {
        setProfile(null); // still not logged in
        return;
      }

      if (!res.ok) throw new Error("Failed to fetch profile");

      const data = await res.json();
      setProfile(data.user || null);
    } catch (err) {
      console.error("Profile fetch error:", err);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch("http://localhost:5000/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setProfile(null);
    }
  };

  return (
    <AuthContext.Provider value={{ profile, setProfile, fetchProfile, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};