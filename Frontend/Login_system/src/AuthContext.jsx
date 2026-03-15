import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [csrfToken, setCsrfToken] = useState(null);

  // 1️⃣ Fetch CSRF token from backend
  const fetchCsrf = async () => {
    try {
      const res = await axios.get("http://localhost:5000/csrf-token", {
        withCredentials: true,
      });
      setCsrfToken(res.data.csrfToken);
      // console.log("CSRF token fetched:", res.data.csrfToken);
    } catch (err) {
      console.error("CSRF fetch error:", err);
    }
  };

  // 2️⃣ Fetch user profile
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/profile", {
        withCredentials: true,
      });
      setProfile(res.data.user || null);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setProfile(null);
      } else {
        console.error("Profile fetch error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  // 3️⃣ Login function
  const login = async (username, password) => {
    if (!csrfToken) {
      console.error("CSRF token not ready yet!");
      return { success: false, message: "Try again in a moment" };
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/login",
        { username, password },
        {
          withCredentials: true,
          headers: {
            "X-CSRF-Token": csrfToken, // attach CSRF token
          },
        }
      );

      if (res.data.success) {
        await fetchProfile(); // fetch profile after login
      }

      return res.data;
    } catch (err) {
      console.error("Login error:", err);
      return { success: false, message: err.response?.data?.message || "Login failed" };
    }
  };

  // 4️⃣ Logout function
  const logout = async () => {
    try {
      await axios.post(
        "http://localhost:5000/logout",
        {},
        {
          withCredentials: true,
          headers: {
            "X-CSRF-Token": csrfToken,
          },
        }
      );
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setProfile(null);
    }
  };

  // 5️⃣ On mount, fetch CSRF token and profile
  useEffect(() => {
    const init = async () => {
      await fetchCsrf();
      await fetchProfile();
    };
    init();
  }, []);

  // 6️⃣ Optional: Axios interceptor to automatically attach CSRF token
  useEffect(() => {
    const interceptor = axios.interceptors.request.use((config) => {
      if (csrfToken) {
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
        setProfile,
        fetchProfile,
        login,
        logout,
        loading,
        csrfToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};