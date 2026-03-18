import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [csrfToken, setCsrfToken] = useState(null);

  // ✅ Axios global config
  axios.defaults.withCredentials = true;

  // 1️⃣ Fetch CSRF token
  const fetchCsrf = async () => {
    try {
      const res = await axios.get("http://localhost:5000/csrf-token");
      setCsrfToken(res.data.csrfToken);
    } catch (err) {
      console.error("CSRF fetch error:", err);
    }
  };

  // 2️⃣ Fetch profile
  const fetchProfile = async () => {
    try {
      const res = await axios.get("http://localhost:5000/profile");
      setProfile(res.data.user);
    } catch (err) {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  // 3️⃣ LOGIN (❌ NO CSRF HERE)
  const login = async (username, password) => {
    try {
      const res = await axios.post("http://localhost:5000/login", {
        username,
        password,
      });

      // ✅ important
      await fetchProfile();

      // ✅ refresh CSRF after login
      await fetchCsrf();

      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Login failed",
      };
    }
  };

  // 4️⃣ LOGOUT (✅ CSRF REQUIRED)
  const logout = async () => {
    try {
      await axios.post(
        "http://localhost:5000/logout",
        {},
        {
          headers: {
            "X-CSRF-Token": csrfToken,
          },
        }
      );

      // ✅ clear state
      setProfile(null);

      // ✅ refresh csrf again
      await fetchCsrf();

    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // 5️⃣ INIT
  useEffect(() => {
    const init = async () => {
      await fetchCsrf();   // FIRST
      await fetchProfile();// SECOND
    };
    init();
  }, []);

  // 6️⃣ AXIOS INTERCEPTOR
  useEffect(() => {
    const interceptor = axios.interceptors.request.use((config) => {
      if (csrfToken && config.method !== "get") {
        config.headers["X-CSRF-Token"] = csrfToken;
      }
      return config;
    });

    return () => axios.interceptors.request.eject(interceptor);
  }, [csrfToken]);

  return (
    <AuthContext.Provider
      value={{
        profile,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};