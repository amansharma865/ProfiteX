import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { z } from "zod"; // Import zod for schema validation
import { zodResolver } from "@hookform/resolvers/zod";

const api = axios.create({
  baseURL: `${process.env.REACT_APP_API_BASE_URL}/`,
  withCredentials: true, // Ensure cookies are sent with requests
});

// Define the Zod schema
const userSchema = z.object({
  email: z
    .string()
    .nonempty("Email is required")
    .email("Please enter a valid email address")
    .refine((email) => !/^\d/.test(email), "Email cannot start with a number") // Email cannot start with a number
    .refine(
      (email) => email.trim() === email,
      "Email cannot have leading or trailing spaces"
    ) // No leading or trailing spaces
    .transform((email) => email.toLowerCase()), // Convert email to lowercase after validations

  designation: z
    .string()
    .nonempty("Designation is required")
    .regex(
      /^[A-Za-z\s]+$/,
      "Designation cannot contain numbers or special characters"
    ) // Only alphabets and spaces allowed
    .min(2, "Designation must have at least 2 characters") // Minimum length requirement
    .max(50, "Designation cannot exceed 50 characters") // Maximum length requirement
    .refine(
      (value) => value.trim() === value,
      "Designation cannot have leading or trailing spaces"
    ) // No leading or trailing spaces
    .transform((value) => value.trim().replace(/\s+/g, " ")), // Normalize spaces
});

const AddOrder = ({ onClose }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(userSchema), // Use zodResolver to integrate zod validation
  });

  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const isDarkMode = document.body.classList.contains("dark");
    setDarkMode(isDarkMode);
  }, []);

  const onSubmit = async (data) => {
    setLoading(true); // Start loader
    try {
      const response = await api.post(
        `${process.env.REACT_APP_API_BASE_URL}/admin/create-user`,
        {
          user_email: data.email,
          user_designation: data.designation,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success("User created successfully!");
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        onClose();
      } else {
        toast.error(response.data.message || "Failed to create user.");
      }
    } catch (error) {
      console.error("Error while creating the user:", error);
      const errorMessage =
        error.response?.data?.message || "An error occurred. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false); // Stop loader
    }
  };

  return (
    <div className="h-full w-full rounded-lg bg-white dark:!bg-black-700 p-4 shadow-lg">
      <h3 className="mb-4 text-lg font-bold text-gray-800 dark:!text-white">Add a New User</h3>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* User's Email input */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:!text-gray-400">User's Email</label>
          <input
            type="email"
            placeholder="Enter User's Email"
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-black-700 text-gray-900 dark:text-white p-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
            {...register("email")}
            disabled={loading}
          />
          {errors.email && (
            <span className="text-sm text-red-500">{errors.email.message}</span>
          )}
        </div>

        {/* User's Designation input */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:!text-gray-400">
            User's Designation
          </label>
          <input
            type="text"
            placeholder="Enter User's Designation"
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-black-700 text-gray-900 dark:text-white p-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
            {...register("designation")}
            disabled={loading}
          />
          {errors.designation && (
            <span className="text-sm text-red-500">
              {errors.designation.message}
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center justify-end">
          <button
            type="button"
            className="mr-4 inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-md border bg-brand-500 dark:bg-brand-600 hover:bg-brand-600 dark:hover:bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none"
            disabled={loading}
          >
            {loading ? (
              <svg
                className="h-5 w-5 animate-spin text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
            ) : (
              "Add User"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddOrder;
