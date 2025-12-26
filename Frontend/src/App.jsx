
import React, { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import UserLayout from "layouts/user";
import AdminLayout from "layouts/admin";
import AuthLayout from "layouts/auth";
import Landing from "layouts/Landing/index.jsx";
import ProtectedRoute from "./ProtectedRoutes"; // Your ProtectedRoute component
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FormComponent from "views/admin/details/FormComponent";
import axios from "axios";

const App = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Setup axios interceptor to handle 401 responses (deactivated users)
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Check if it's a deactivation
          if (error.response?.data?.deactivated) {
            toast.error(error.response.data.message || "Your account has been deactivated");
            // Clear any local storage or session data
            localStorage.clear();
            sessionStorage.clear();
            // Redirect to login
            setTimeout(() => {
              navigate("/auth/sign-in");
            }, 1500);
          } else if (error.response?.data?.message?.includes("expired") ||
            error.response?.data?.message?.includes("token")) {
            toast.error("Session expired. Please login again");
            setTimeout(() => {
              navigate("/auth/sign-in");
            }, 1500);
          }
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptor on unmount
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [navigate]);

  return (
    <div>
      <Routes>
        {/* Public Routes */}
        <Route path="auth/*" element={<AuthLayout />} />
        <Route path="/" element={<Landing />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute requiredRole="user" />}>
          <Route path="user/*" element={<UserLayout />} />
        </Route>
        <Route element={<ProtectedRoute requiredRole="admin" />}>
          <Route path="admin/*" element={<AdminLayout />} />
          <Route path="admin/profile-complete" element={<FormComponent />} />
        </Route>
      </Routes>
      <ToastContainer />
    </div>
  );
};

export default App;
