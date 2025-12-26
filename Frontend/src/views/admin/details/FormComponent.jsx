import React, { useState } from "react";
import { z } from "zod";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";


const schema = z.object({
  admin_name: z
    .string()
    .max(20, "Cannot be more than 20 letters")
    .min(1, "Admin name is required")
    .regex(/.[^\d]./, "Admin name cannot be only numbers") // Ensure it contains at least one non-digit character
    .refine((value) => value.trim().length > 0, "Admin name cannot be just spaces") // Check for non-space input
    .transform((value) => value.trim().replace(/\s+/g, " ")), // Normalize spaces
  admin_mobile_number: z
    .string()
    .min(10, "Mobile number must be 10 digits")
    .max(10, "Mobile number must be 10 digits")
    .regex(/^\d+$/, "Mobile number must contain only digits"),
  company_name: z
    .string()
    .max(20, "Cannot be more than 20 letters")
    .min(1, "Company name is required")
    .regex(/.[^\d]./, "Company name cannot be only numbers") // Ensure it contains at least one non-digit character
    .refine((value) => value.trim().length > 0, "Company name cannot be just spaces") // Check for non-space input
    .transform((value) => value.trim().replace(/\s+/g, " ")), // Normalize spaces
  company_address: z
    .string()
    .min(1, "Company industry is required")
    .max(100, "Cannot be more than 100 letters")
    .regex(/.[^\d]./, "Company industry cannot be only numbers") // Ensure it contains at least one non-digit character
    .refine((value) => value.trim().length > 0, "Company industry cannot be just spaces") // Check for non-space input
    .transform((value) => value.trim().replace(/\s+/g, " ")), // Normalize spaces
  pan_number: z
    .string()
    .min(1, "PAN Number is required")
    .length(10, "PAN number must be exactly 10 characters")
    .regex(/[A-Z]{5}[0-9]{4}[A-Z]{1}/, "Invalid PAN number format"),
  gst_number: z
    .string()
    .min(1, "GST Number is required")
    .length(15, "GST number must be exactly 15 characters")
    .regex(/[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9]{1}[A-Z]{1}[0-9]{1}/, "Invalid GST number format"),
});



const FormComponent = () => {
  const [formData, setFormData] = useState({
    admin_name: "",
    admin_mobile_number: "",
    company_name: "",
    company_address: "",
    pan_number: "",
    gst_number: "",
  });
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate form data using Zod
    try {
      const validatedData = schema.parse(formData); // Throws an error if validation fails
      setErrors({}); // Clear previous errors
      setLoading(true);
      // Make an Axios request to submit the form
      try {
        const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/admin/profile-complete`, validatedData,{withCredentials:true});
        if(response.data.success==true){
          toast.success(response.data.message);
          navigate('/admin/default');
        }
        else{
          toast.error(response.data.message);
        }
        setLoading(false);
      } catch (error) {
        toast.error("Error submitting form:", error);
        setLoading(false);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors = error.errors.reduce((acc, curr) => {
          acc[curr.path[0]] = curr.message;
          return acc;
        }, {});
        setErrors(validationErrors);
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Admin Details</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block font-medium" htmlFor="admin_name">
                Admin Name
              </label>
              <input
                type="text"
                name="admin_name"
                id="admin_name"
                value={formData.admin_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
              />
              {errors.admin_name && <p className="text-red-500 text-sm">{errors.admin_name}</p>}
            </div>

            <div>
              <label className="block font-medium" htmlFor="admin_mobile_number">
                Mobile Number
              </label>
              <input
                type="text"
                name="admin_mobile_number"
                id="admin_mobile_number"
                value={formData.admin_mobile_number}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
              />
              {errors.admin_mobile_number && (
                <p className="text-red-500 text-sm">{errors.admin_mobile_number}</p>
              )}
            </div>

            <div>
              <label className="block font-medium" htmlFor="company_name">
                Company Name
              </label>
              <input
                type="text"
                name="company_name"
                id="company_name"
                value={formData.company_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
              />
              {errors.company_name && <p className="text-red-500 text-sm">{errors.company_name}</p>}
            </div>

            <div>
              <label className="block font-medium" htmlFor="company_address">
                Company address
              </label>
              <input
                type="text"
                name="company_address"
                id="company_address"
                value={formData.company_address}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
              />
              {errors.company_address && (
                <p className="text-red-500 text-sm">{errors.company_address}</p>
              )}
            </div>

            <div>
              <label className="block font-medium" htmlFor="pan_number">
                PAN Number
              </label>
              <input
                type="text"
                name="pan_number"
                id="pan_number"
                value={formData.pan_number}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
              />
              {errors.pan_number && <p className="text-red-500 text-sm">{errors.pan_number}</p>}
            </div>

            <div>
              <label className="block font-medium" htmlFor="gst_number">
                GST Number
              </label>
              <input
                type="text"
                name="gst_number"
                id="gst_number"
                value={formData.gst_number}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
              />
              {errors.gst_number && <p className="text-red-500 text-sm">{errors.gst_number}</p>}
            </div>

            <div>
              <button
                type="submit"
                className={`w-full py-2 px-4 bg-green-800 text-white rounded-md ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                } hover:bg-green-700`}
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormComponent;
