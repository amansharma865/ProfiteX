import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import InputField from "components/fields/InputField";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FiEye, FiEyeOff } from "react-icons/fi";

const adminSchema = z.object({
  username: z
    .string()
    .trim() // Ensure leading and trailing spaces are removed
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username cannot exceed 30 characters")
    .regex(
      /^[a-zA-Z][a-zA-Z0-9_]*$/,
      "Username must start with a letter and can only contain letters, numbers, and underscores"
    )
    .refine(
      (username) =>
        !["admin", "root", "system", "superuser"].includes(
          username.toLowerCase()
        ),
      "This username is not allowed"
    ),

  admin_email: z
    .string()
    .trim() // Ensure leading and trailing spaces are removed
    .toLowerCase() // Convert email to lowercase
    .email("Invalid email address")
    .max(100, "Email address is too long")
    .regex(
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      "Email must contain only one '@' and cannot contain spaces"
    ),

  admin_password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(64, "Password cannot exceed 64 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      "Password must include uppercase, lowercase, number, and special character"
    ),
});

export default function AdminSignUp() {
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(adminSchema),
    mode: "onChange", // Enable real-time validation
  });

  const handleSignUp = async (data) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/admin/register`,
        data,
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success("Successfully registered");
        navigate("/admin/profile-complete");
      } else {
        toast.error(response.data.message || "Registration failed");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "An error occurred during registration"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-16 mt-6 flex h-full w-full items-center justify-center px-2 md:mx-0 md:px-0 lg:mb-10 lg:items-center lg:justify-start">
      <div className="top-0 w-full max-w-full flex-col items-center md:pl-4 lg:pl-0 xl:max-w-[420px]">
        <h4 className="mb-2.5 text-4xl font-bold text-black-700 dark:text-white">
          Admin Sign Up
        </h4>

        <form onSubmit={handleSubmit(handleSignUp)} noValidate>
          <div className="mb-4">
            <InputField
              label="Username"
              placeholder="Enter your username"
              {...register("username")}
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-500">
                {errors.username.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <InputField
              label="Email"
              placeholder="Enter your email"
              type="email"
              {...register("admin_email")}
            />
            {errors.admin_email && (
              <p className="mt-1 text-sm text-red-500">
                {errors.admin_email.message}
              </p>
            )}
          </div>

          <div className="relative mb-4">
            <InputField
              label="Password"
              placeholder="Enter your password"
              type={passwordVisible ? "text" : "password"}
              {...register("admin_password")}
              className="pr-10"
            />

            <button
              type="button"
              onClick={() => setPasswordVisible(!passwordVisible)}
              className="absolute right-3 top-14 -translate-y-1/2 transform text-gray-600"
            >
              {passwordVisible ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>

            {errors.admin_password && (
              <p className="mt-1 text-sm text-red-500">
                {errors.admin_password.message}
              </p>
            )}
          </div>

          {/* <div className="mb-4">
            <InputField
              label="Confirm Password"
              placeholder="Enter your password"
              type="password"
              {...register("admin_password")}
            />
            {errors.admin_password && (
              <p className="mt-1 text-sm text-red-500">
                {errors.admin_password.message}
              </p>
            )}
          </div> */}

          <button
            type="submit"
            disabled={loading}
            className={`linear mt-2 flex w-full items-center justify-center rounded-xl bg-brand-500 py-[12px] text-base font-medium text-white transition duration-200 ${
              loading
                ? "cursor-not-allowed bg-gray-500"
                : "hover:bg-brand-600 active:bg-brand-700"
            }`}
          >
            {loading ? (
              <div className="spinner border-t-transparent h-5 w-5 animate-spin rounded-full border-2 border-white"></div>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <div className="mt-4">
          <span className="text-sm font-medium text-black-700 dark:text-gray-600">
            Already have an account?
          </span>
          <Link
            to="/auth/sign-in"
            className="ml-1 text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-white"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
