import React, { useState, useEffect } from "react";
import axios from "axios";
import { X } from "lucide-react";
import { useUser } from "useContext/userContext";

const ProfileUpdate = ({ onClose }) => {
  const userInfo = useUser();
  const [formData, setFormData] = useState({
    user_username: "Username", // Default fallback
    user_email: "Email",
    user_fullname: "Name",
    user_phone_number: "Phone Number",
    user_designation: "Designation",
    user_company_name: "Company Name",
  });

  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});

  // Fetch and pre-fill existing user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/user/get-details`,
          { withCredentials: true }
        );

        const userData = response.data;

        // Update form data with fetched values or defaults
        setFormData({
          user_email: userInfo.user_email || "Email",
          user_fullname: userInfo.user_fullname || "Name",
          user_phone_number: userInfo.user_phone_number || "Phone Number",
          user_designation: userInfo.user_designation || "Designation",
          user_company_name: userInfo.user_company_name || "Company Name",
        });
      } catch (error) {
        console.error("Error fetching user data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

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
  

  // const validateFields = () => {
  //   const errors = {};

  //   // Email: cannot start with a number
  //   const emailRegex = /^[^\d][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  //   if (!formData.user_email || !emailRegex.test(formData.user_email)) {
  //     errors.user_email = "Email cannot start with a number and must be valid";
  //   }

  //   // Full Name: cannot be just spaces and cannot contain numbers
  //   const nameRegex = /\d/; // Regex to detect numbers
  //   if (!formData.user_fullname.trim()) {
  //     errors.user_fullname = "Full Name cannot be empty or just spaces";
  //   } else if (nameRegex.test(formData.user_fullname)) {
  //     errors.user_fullname = "Full Name cannot contain numbers";
  //   } else if (formData.user_fullname.length > 15) {
  //     errors.user_fullname = "Full Name cannot be more than 15 characters";
  //   }

  //   // Phone Number: should only contain 10 digits
  //   const phoneRegex = /^\d{10}$/;
  //   if (
  //     !formData.user_phone_number ||
  //     !phoneRegex.test(formData.user_phone_number)
  //   ) {
  //     errors.user_phone_number = "Phone Number must be 10 digits";
  //   }

  //   // Designation: cannot be just spaces and cannot contain numbers
  //   if (!formData.user_designation.trim()) {
  //     errors.user_designation = "Designation cannot be empty or just spaces";
  //   } else if (nameRegex.test(formData.user_designation)) {
  //     errors.user_designation = "Designation cannot contain numbers";
  //   }

  //   // Company Name: cannot be just spaces and cannot contain numbers
  //   if (!formData.user_company_name.trim()) {
  //     errors.user_company_name = "Company Name cannot be empty or just spaces";
  //   } else if (nameRegex.test(formData.user_company_name)) {
  //     errors.user_company_name = "Company Name cannot contain numbers";
  //   }

  //   setErrors(errors);
  //   return Object.keys(errors).length === 0;
  // };

  const validateFields = () => {
    const errors = {};

    // Email: cannot start with a number
    // const emailRegex = /^[^\d][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    // if (!formData.user_email || !emailRegex.test(formData.user_email)) {
    //   errors.user_email = "Email cannot start with a number and must be valid";
    // }

    const emailRegex =
      /^[^\d][a-zA-Z0-9._%+-]*@(gmail|yahoo|outlook|hotmail|icloud|protonmail|zoho|customdomain|etc)\.(com|edu\.in|org|net|gov|co|info|biz|io|tech|dev|me|ai|us|uk|ca|au|in|eu)$/;

    // Regex to detect special characters (excluding @ and . for email format)
    const specialCharRegex = /[^a-zA-Z0-9._%+-@]/;

    if (!formData.user_email) {
      errors.user_email = "Email is required";
    } else if (/^\d/.test(formData.user_email)) {
      errors.user_email = "Email cannot start with a number";
    } else if (formData.user_email.trim() !== formData.user_email) {
      errors.user_email = "Email cannot have leading or trailing spaces";
    } else if (specialCharRegex.test(formData.user_email)) {
      errors.user_email = "Email cannot contain special characters";
    } 

    // Full Name: cannot be just spaces and cannot contain numbers
    // const nameRegex = /\d/; // Regex to detect numbers
    // if (!formData.user_fullname.trim()) {
    //   errors.user_fullname = "Full Name cannot be empty or just spaces";
    // } else if (nameRegex.test(formData.user_fullname)) {
    //   errors.user_fullname = "Full Name cannot contain numbers";
    // } else if (formData.user_fullname.length > 15) {
    //   errors.user_fullname = "Full Name cannot be more than 15 characters";
    // }

    const nameRegex = /\d/; // Regex to detect numbers
    const specialCharRegex1 = /[^a-zA-Z\s]/; // Regex to detect special characters (only allows letters and spaces)

    // Normalize the full name: trim leading/trailing spaces and replace multiple spaces with one
    const normalizedFullName = formData.user_fullname
      .trim()
      .replace(/\s+/g, " ");

    if (!normalizedFullName) {
      errors.user_fullname = "Full Name cannot be empty or just spaces";
    } else if (nameRegex.test(normalizedFullName)) {
      errors.user_fullname = "Full Name cannot contain numbers";
    } else if (specialCharRegex1.test(normalizedFullName)) {
      errors.user_fullname = "Full Name cannot contain special characters";
    } else if (normalizedFullName.length > 15) {
      errors.user_fullname = "Full Name cannot be more than 15 characters";
    } else {
      // If no errors, update the form data with the normalized name
      formData.user_fullname = normalizedFullName;
    }

    // Phone Number: should only contain 10 digits
    const phoneRegex = /^\d{10}$/;
    if (
      !formData.user_phone_number ||
      !phoneRegex.test(formData.user_phone_number)
    ) {
      errors.user_phone_number = "Phone Number must be 10 digits";
    }

    // Designation: cannot be just spaces and cannot contain numbers
    if (!formData.user_designation.trim()) {
      errors.user_designation = "Designation cannot be empty or just spaces";
    } else if (nameRegex.test(formData.user_designation)) {
      errors.user_designation = "Designation cannot contain numbers";
    }

    // Company Name: cannot be just spaces and cannot contain numbers
    if (!formData.user_company_name.trim()) {
      errors.user_company_name = "Company Name cannot be empty or just spaces";
    } else if (nameRegex.test(formData.user_company_name)) {
      errors.user_company_name = "Company Name cannot contain numbers";
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const uploadProfileImage = async () => {
    if (!profileImage) return;
  
    setIsSubmitting(true); // Indicate uploading
    const formData = new FormData();
    formData.append("profilePic", profileImage);  // Use "profilePic" as the key here
  
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/user/upload-profile-pic`, 
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
  
  
  
  

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Validate the form fields before submission
    if (!validateFields()) return;
  
    setIsSubmitting(true); // Start the submitting state
  
    try {
      // First, update the user details
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/user/update-details`, formData, {
        withCredentials: true,
      });
  
      // Now, upload the profile image if it's changed
      await uploadProfileImage();
  
      // Display success message and reload the page
      alert("Profile updated successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error updating profile", error);
      alert("Failed to update profile.");
    } finally {
      setIsSubmitting(false); // End the submitting state
    }
  };
  

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="relative mx-auto w-full max-w-2xl">
      <div className="relative rounded-lg bg-white p-6 shadow-md">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>

        <h4 className="mb-4 text-2xl font-bold">Update Your Profile</h4>
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium">Email</label>
              <input
                type="email"
                name="user_email"
                value={formData.user_email}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.user_email && (
                <p className="text-xs text-red-500">{errors.user_email}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Full Name */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Full Name
              </label>
              <input
                name="user_fullname"
                value={formData.user_fullname}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.user_fullname && (
                <p className="text-xs text-red-500">{errors.user_fullname}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Phone Number
              </label>
              <input
                type="tel"
                name="user_phone_number"
                value={formData.user_phone_number}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.user_phone_number && (
                <p className="text-xs text-red-500">
                  {errors.user_phone_number}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`rounded-md bg-blue-500 px-4 py-2 text-white ${
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