
import axios from "axios";
import { z } from "zod";
import { clearAccessTokens, clearTokens, getAccessToken, getRefreshToken, saveTokens } from "./Tokenmanager";
import qs from "qs";
import { isTokenExpired } from "./JwtUtils";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const login = async (
  username: string,
  password: string
): Promise<boolean> => {
  try {
    loginSchema.parse({ username, password });
    const data = qs.stringify({
      email: username,
      password: password,
    });
    const response = await axios.post(
      `${process.env.REACT_APP_API_BASE_URL}/login`,
      data,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    saveTokens(response.data.accessToken, response.data.refreshToken);
    return true;
  } catch (error) {
    console.error("Login failed:", error);
    return false;
  }
};

// Function to handle signup
export const signup = async (
  name: string,
  email: string,
  password: string
): Promise<boolean> => {
  try {
    signupSchema.parse({ name, email, password });
    const data = qs.stringify({
      name,
      email,
      password,
    });
    const response = await axios.post(
      `${process.env.REACT_APP_API_BASE_URL}/signup`,
      data,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    if (response.data.accessToken && response.data.refreshToken) {
      saveTokens(response.data.accessToken, response.data.refreshToken);
    }
    return true;
  } catch (error) {
    console.error("Signup failed:", error);
    return false;
  }
};

// Function to handle logout
export const logout = (): boolean => {
  clearTokens();

  return true;
};

// Function to check if user is logged in
export const isLoggedIn = (): boolean => {
  const token: string | undefined = getAccessToken();

  if (token && !isTokenExpired()) {
    return true;
  }
  return false;
};

// function to check auth at landing page
export const checkAuth = async (
  setLoading: (loading: boolean) => void,
  router: any
): Promise<void> => {
  const refreshToken = getRefreshToken();
  if (isLoggedIn()) {
    setLoading(true);
    router.push("/trip");
    clearAccessTokens();
    setLoading(false);
  } else if (refreshToken) {
    try {
      const { data } = await axios.post<{
        accessToken: string;
        refreshToken: string;
      }>(`${process.env.NEXT_PUBLIC_BACKENDURL}/refresh `, {
        refreshToken: refreshToken.toString(),
      });
      saveTokens(data.accessToken, refreshToken);

      router.push("/trip");
    } catch (error) {
      clearTokens();
      router.push("/login");
    } finally {
      setLoading(false);
    }
  } else {
    setLoading(false);
    router.push("/login");
  }
};