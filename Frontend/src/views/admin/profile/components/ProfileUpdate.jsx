import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import {optional, z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, CheckCircle, AlertCircle } from "lucide-react";
import { ToastContainer, toast, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAdmin } from "useContext/adminContext";

// Zod schema for form validation
const profileUpdateSchema = z.object({
  admin_name: z
  .string()
  .min(3, { message: "Admin name must be at least 3 characters" })
  .max(20, { message: "Admin name must be less than 20 characters" })
  .refine((val) => /^[a-zA-Z0-9 ]+$/.test(val.trim()), {
    message: "Admin name can only contain letters, numbers, and spaces.",
  })
  .transform((val) => val.trim().replace(/\s+/g, " ")) // Trim and normalize spaces
  .optional(),


  admin_email: z
    .string()
    .nonempty("Email is required")
    .email("Please enter a valid email address")
    .refine((email) => !/^\d/.test(email), "Email cannot start with a number")
    .refine(
      (email) => email.trim() === email,
      "Email cannot have leading or trailing spaces"
    )
    
    .transform((email) => email.toLowerCase()) // Convert email to lowercase
    .optional(), // Optional field

  admin_mobile_number: z
    .coerce.number()
    .min(1000000000, { message: "Phone number must be at least 10 digits" })
    .max(9999999999, { message: "Phone number must be less than 10 digits" })
    .optional(), // Optional field

    // company_name: z
    //   .string()
    //   .max(20, { message: "Company name must be less than 20 characters" })
    //   .refine(
    //     (val) => val === "" || /^[a-zA-Z0-9 ]+$/.test(val.trim()), // Allow blank or valid input
    //     { message: "Company name can only contain letters, numbers, and spaces" }
    //   )
    //   .transform((val) => (val ? val.trim().replace(/\s+/g, " ") : val)) // Only transform if not empty
    //   .optional(), // Optional field

    // company_industry: z
    //   .string()
    //   .max(20, { message: "Company industry must be less than 20 characters" })
    //   .refine((val) => val === "" || /^[a-zA-Z0-9 ]+$/.test(val.trim()), {
    //     message: "Company Industry can only contain letters, numbers",
    //   })
    //   .transform((val) => (val ? val.trim().replace(/\s+/g, " ") : val)) // Only transform if not empty
    //   .optional(), // Optional field

    // company_address: z
    //   .string()
    //   .max(100, { message: "Address must be less than 100 characters" })
    //   .optional(), // Optional field


   company_name: z
  .string()
  .max(20, { message: "Company name must be less than 20 characters" })
  .refine(
    (val) =>
      val === "" ||
      /^[a-zA-Z0-9 &.,\-_@()]+$/.test(val.trim()),
    {
      message:
        "Company name can contain letters, numbers, spaces, and special characters (& . , - _ @ ( ))",
    }
  )
  .transform((val) => (val ? val.trim().replace(/\s+/g, " ") : val))
  .optional(),


company_industry: z
  .string()
  .max(20, { message: "Company industry must be less than 20 characters" })
  .refine(
    (val) => val === "" || /^[a-zA-Z0-9 ]+$/.test(val.trim()),
    { message: "Company Industry can only contain letters, numbers, and spaces" }
  )
  .transform((val) => (val ? val.trim().replace(/\s+/g, " ") : val)) // Trim and reduce spaces only if not empty
  .optional(), // Optional field

company_address: z
  .string()
  .max(100, { message: "Address must be less than 100 characters" })
  .refine(
    (val) =>
      val === "" ||
      /^[a-zA-Z0-9\s,.\-/#()&:]+$/.test(val.trim()),
    {
      message:
        "Address can contain letters, numbers, spaces, and special characters (, . - / # ( ) & :)",
    }
  )
  .transform((val) => val.trim().replace(/\s+/g, " "))
  .optional(),



});

const ProfileUpdate = ({ onClose }) => {
  const adminInfo = useAdmin();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(profileUpdateSchema),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // Centralized toast configuration
  const toastConfig = {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    transition: Slide,
    theme: "light",
  };

  // Fetch and pre-fill existing user data
  useEffect(() => {

    // useEffect(() => {
      // setValue("company_industry", adminInfo.company_industry || "");
    // }, [adminInfo, setValue]);
    
    // useEffect(() => {
    // }, [adminInfo]);

    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/admin/get-details`,
          {
            withCredentials: true,
          }
        );


        const userData = response.data;
        setValue("admin_name", adminInfo.admin_name || "");
        setValue("admin_email", adminInfo.admin_email || "");
        setValue("admin_mobile_number", adminInfo.admin_mobile_number || "");
        setValue("company_address", adminInfo.company_address || "");
        setValue("company_name", adminInfo.company_name || "");
        setValue("company_industry", adminInfo.company_industry || "");
        
      } catch (error) {
        console.error("Error fetching user data", error);
      }
    };

    fetchUserData();
  }, [setValue]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    const maxFileSize = 5 * 1024 * 1024; // 5MB
  
    if (file) {
      if (!allowedTypes.includes(file.type)) {
        alert("Only .png, .jpg, and .jpeg formats are allowed!");
        return;
      }
      if (file.size > maxFileSize) {
        alert("File size must be under 5MB.");
        return;
      }
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const uploadProfileImage = async () => {
    if (!profileImage) return;
  
    setIsSubmitting(true); // Indicate uploading
    const formData = new FormData();
    formData.append("profilePic", profileImage);  // Use "profilePic" as the key here
  
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/admin/upload-profile-pic`, 
        formData, 
        {
        withCredentials: true,  
        headers: { 
          "Content-Type": "multipart/form-data" 
        },
      });
  
      if (response.status === 200) {
        alert("Profile picture updated successfully.");
      } else {
        console.error("Unexpected response:", response);
        alert("Unexpected error uploading profile picture.");
      }
    } catch (error) {
      if (error.response) {
        console.error("Error uploading profile picture", error.response.data);
        alert("Failed to upload profile picture. " + error.response.data.message || error.response.statusText);
      } else {
        console.error("Error uploading profile picture", error);
        alert("Failed to upload profile picture.");
      }
    } finally {
      setIsSubmitting(false); // End upload indication
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    // Object.keys(data).forEach((key) => {
    //   if (data[key] === "") delete data[key];
    // });


    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/admin/profile-complete`,
        data,
        { withCredentials: true }
      );

      // Now, upload the profile image if it's changed
      await uploadProfileImage();
  
      // Display success message and reload the page
      alert("Profile updated successfully!");
      if (response.data.success) {
        toast.success("Profile updated successfully!", { ...toastConfig });
        onClose();
      } else {
        toast.error(response.data.message || "Failed to update profile.", {
          ...toastConfig,
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred.", {
        ...toastConfig,
      });
    } finally {
      setIsSubmitting(false);
      window.location.reload();
    }
  };

  // Handle escape key to close the popup
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [onClose]);

  return (
    <div className="relative mx-auto w-full max-w-2xl">
      <ToastContainer limit={3} />

      <div className="relative rounded-[20px] bg-white p-6 shadow-3xl shadow-shadow-500 dark:!bg-black-800">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-50 text-gray-500 hover:text-gray-700 dark:text-white"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="mb-6">
          <h4 className="mb-2 text-2xl font-bold text-black-700 dark:text-white">
            Update Your Profile
          </h4>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            You can update any of the fields below (all fields are optional)
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Profile Picture
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:rounded-md file:border-0
                file:bg-green-800 file:px-4
                file:py-2 file:text-sm
                file:font-semibold file:text-white
                hover:file:bg-green-700"
            />
            {previewImage && (
              <img
                src={previewImage}
                alt="Profile Preview"
                className="mt-4 h-32 w-32 rounded-full object-cover"
              />
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Admin Name
              </label>
              <input
                {...register("admin_name")}
                placeholder="Enter your name"
                className="w-full rounded-md border px-3 py-2"
              />
              {errors.admin_name && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.admin_name.message}
                </p>
              )}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Email</label>
              <input
                {...register("admin_email")}
                placeholder="Enter your email"
                className="w-full rounded-md border px-3 py-2"
              />
              {errors.admin_email && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.admin_email.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Phone Number
              </label>
              <input
                {...register("admin_mobile_number")}
                placeholder="Enter your phone number"
                className="w-full rounded-md border px-3 py-2"
              />
              {errors.admin_mobile_number && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.admin_mobile_number.message}
                </p>
              )}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">
                Company Name
              </label>
              <input
                {...register("company_name")}
                placeholder="Enter your company name"
                className="w-full rounded-md border px-3 py-2"
              />
              {errors.company_name && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.company_name.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Company Industry
              </label>
              <input
                {...register("company_industry")}
                placeholder="Enter your company industry"
                className="w-full rounded-md border px-3 py-2"
              />
              {errors.company_industry && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.company_industry.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Company Address
              </label>
              <input
                {...register("company_address")}
                placeholder="Enter your company address"
                className="w-full rounded-md border px-3 py-2"
              />
              {errors.company_address && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.company_address.message}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex justify-center rounded-md border bg-brand-500 px-4 py-2 text-sm text-white ${
                isSubmitting ? "cursor-not-allowed opacity-50" : ""
              }`}
            >
              {isSubmitting ? "Updating..." : "Update Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileUpdate;