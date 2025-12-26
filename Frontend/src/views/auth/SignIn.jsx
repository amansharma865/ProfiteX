import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import InputField from "components/fields/InputField";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiEye, FiEyeOff } from "react-icons/fi";



// Common reusable password checks
const passwordValidation = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(64, "Password cannot exceed 64 characters")
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character"
  )
  .refine(
    (password) => {
      const commonPasswords = [
        "password",
        "123456",
        "123456789",
        "qwerty",
        "password123",
        "12345678",
        "admin123",
      ];
      return !commonPasswords.includes(password.toLowerCase());
    },
    "This password is too common and is not allowed"
  );


// Zod schemas (unchanged)
const emailValidation = z
  .string()
  .trim()
  .toLowerCase()
  .email("Invalid email address")
  .max(100, "Email must not exceed 100 characters")
  .refine(
    (email) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/.test(email),
    "Invalid email format"
  )
  .refine((email) => {
    const blockedDomains = [
      "tempmail.com",
      "10minutemail.com",
      "disposablemail.com",
    ];
    return !blockedDomains.some((domain) => email.endsWith(domain));
  }, "Disposable email addresses are not allowed");

// User and Admin Sign-In Schemas (unchanged)
const userSignInSchema = z.object({
  user_email: emailValidation,
  user_password: passwordValidation,
});

const adminSignInSchema = z.object({
  admin_email: emailValidation,
  admin_password: passwordValidation,
});

export default function SignIn() {
  const navigate = useNavigate();
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const [signInPasswordVisible, setSignInPasswordVisible] = useState(false);
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false); // Modal for email submission
  const [otpModalOpen, setOtpModalOpen] = useState(false); // Modal for OTP submission
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState(""); // OTP entered by the user
  const [generatedOtp, setGeneratedOtp] = useState(""); // OTP received from the server
  const [otpValid, setOtpValid] = useState(false); // OTP validity status
  const [newPassword, setNewPassword] = useState(""); // New password
  const [confirmPassword, setConfirmPassword] = useState(""); // Confirm password
  const [passwordModalOpen, setPasswordModalOpen] = useState(false); // Modal for password reset

  const userForm = useForm({
    resolver: zodResolver(userSignInSchema),
  });

  const adminForm = useForm({
    resolver: zodResolver(adminSignInSchema),
  });

  const handleRoleChange = (event) => {
    setRole(event.target.value);
  };

  const handleSignInForUser = async (data) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/user/sign-in`,
        data,
        { withCredentials: true }
      );
      if (response.data.success) {
        toast.success("Successfully signed in!", {
          position: "top-right",
          autoClose: 3000,
        });
        setTimeout(() => {
          navigate("/user/default");
        }, 1000);
      } else {
        toast.error(response.data.error);
      }
    } catch (error) {
      toast.error(error.response?.data?.error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignInForAdmin = async (data) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/admin/login`,
        data,
        { withCredentials: true }
      );
      if (response.data.success) {
        toast.success("Successfully signed in as admin!", {
          position: "top-right",
          autoClose: 3000,
        });
        setTimeout(() => {
          navigate("/admin/default");
        }, 1000);
      } else {
        toast.error(response.data.error, {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.error(
        error.response?.data?.error || "An error occurred during sign in",
        { position: "top-right", autoClose: 3000 }
      );
    } finally {
      setLoading(false);
    }
  };

  const [forgotLoading, setForgotLoading] = useState(false); // Separate loading state for forgot password flow

  const handleForgotPasswordSubmit = async (event) => {
    event.preventDefault();
    setForgotLoading(true);
    try {
      let response;
      // Check if role is user or admin, and call the respective API endpoint
      if (role === "user") {
        response = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/user/forgot-password`,
          { email: forgotEmail, role: role }
        );
      } else if (role === "admin") {
        response = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/admin/forgot-password`,
          { email: forgotEmail, role: role }
        );
      }

      if (response.data.success) {
        toast.success("Password reset instructions sent to your email", {
          position: "top-right",
          autoClose: 3000,
        });
        setModalOpen(false); // Close modal after success
        setOtpModalOpen(true); // Open OTP modal
        setGeneratedOtp(response.data.generatedotp); // Store OTP received from the server
      } else {
        toast.error(response.data.error, {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "An error occurred", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setForgotLoading(false);
    }
  };

  const handleOtpSubmit = async (event) => {
    event.preventDefault();
    if (otp === generatedOtp) {
      setOtpValid(true);
      toast.success("OTP verified successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
      setOtpModalOpen(false);
      setPasswordModalOpen(true); // Open password reset modal after OTP verification
    } else {
      setOtpValid(false);
      toast.error("Invalid OTP. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };
  const handleResetPasswordSubmit = async (event) => {
    event.preventDefault();

    // Define the password regex (example: 8+ characters, 1 uppercase, 1 lowercase, 1 digit, 1 special character)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;


    // Check if passwords match
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    // Validate password strength using regex
    if (!passwordRegex.test(newPassword)) {
      toast.error(
        "Password must be at least 8 characters long, include 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.",
        { position: "top-right", autoClose: 5000 }
      );
      return;
    }

    setForgotLoading(true);

    try {
      let response;

      // API call based on role
      if (role === "user") {
        response = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/user/reset-password`,
          { email: forgotEmail, newPassword: newPassword }
        );
      } else if (role === "admin") {
        response = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/admin/reset-password`,
          { email: forgotEmail, newPassword: newPassword }
        );
      }

      if (response.data.success) {
        toast.success("Password reset successful!", {
          position: "top-right",
          autoClose: 3000,
        });
        setPasswordModalOpen(false);
      } else {
        toast.error(response.data.error, {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.error(
        error.response?.data?.error ||
        "An error occurred while resetting password",
        { position: "top-right", autoClose: 3000 }
      );
    } finally {
      setForgotLoading(false);
    }
  };


  const SubmitButton = () => (
    <button
      type="submit"
      disabled={loading}
      className={`linear mt-2 w-full rounded-xl bg-brand-500 py-[12px] text-base font-medium text-white transition duration-200 
            ${loading
          ? "cursor-not-allowed opacity-70"
          : "hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
        }`}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="border-t-transparent mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white"></div>
          <span>Signing in...</span>
        </div>
      ) : (
        "Sign In"
      )}
    </button>
  );

  return (
    <div className="-mt-12 mb-16 flex h-full w-full items-center justify-center px-2 md:mx-0 md:px-0 lg:mb-10 lg:items-center lg:justify-start">
      <div className="mt-[10vh] w-full max-w-full flex-col items-center md:pl-4 lg:pl-0 xl:max-w-[420px]">
        <h4 className="mb-2.5 text-4xl font-bold text-black-700 dark:text-white">
          {role === "user" ? "User Sign In" : "Admin Sign In"}
        </h4>

        {/* Sign In Form */}

        <label className="mb-2 block text-base font-medium text-gray-700 dark:text-white">
          Sign in as:
          <select
            value={role}
            onChange={handleRoleChange}
            className=" mt-3 w-full rounded-md border-[0.1rem] border-gray-50 py-3  text-sm text-gray-700 dark:bg-[#0d0d0d] dark:text-white"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </label>

        {role === "user" ? (
          <form onSubmit={userForm.handleSubmit(handleSignInForUser)}>
            <InputField
              label="Email"
              placeholder="Enter your email"
              {...userForm.register("user_email")}
              error={userForm.formState.errors.user_email?.message}
            />
            <div className="relative mb-4">
              <InputField
                label="Password"
                placeholder="Enter your password"
                type={signInPasswordVisible ? "text" : "password"}
                {...userForm.register("user_password")}
                error={userForm.formState.errors.user_password?.message}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setSignInPasswordVisible(!signInPasswordVisible)}
                className="absolute right-3 top-14 -translate-y-1/2 transform text-gray-600"
              >
                {signInPasswordVisible ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
            <SubmitButton />
          </form>
        ) : (
          <form onSubmit={adminForm.handleSubmit(handleSignInForAdmin)}>
            <InputField
              label="Email"
              placeholder="Enter your email"
              {...adminForm.register("admin_email")}
              error={adminForm.formState.errors.admin_email?.message}
            />
            <div className="relative mb-4">
              <InputField
                label="Password"
                placeholder="Enter your password"
                type={signInPasswordVisible ? "text" : "password"}
                {...adminForm.register("admin_password")}
                error={adminForm.formState.errors.admin_password?.message}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setSignInPasswordVisible(!signInPasswordVisible)}
                className="absolute right-3 top-14 -translate-y-1/2 transform text-gray-600"
              >
                {signInPasswordVisible ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
            <SubmitButton />
          </form>
        )}

        <div className="mt-4">
          <button
            onClick={() => setModalOpen(true)} // Open the modal
            className="text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-white"
          >
            Forgot Password?
          </button>
        </div>

        <div className="mt-4">
          <span className="text-sm font-medium text-black-700 dark:text-gray-600">
            Don't have an account?
          </span>
          <Link
            to={"/auth/sign-up"}
            className="ml-1 text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-white"
          >
            Sign Up
          </Link>
        </div>

        {/* Forgot Password Modal */}
        {modalOpen && (
          <div className="bg-black fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 ">
            <div className="w-96 rounded-lg bg-white p-6 shadow-lg shadow-gray-800 dark:!bg-black-700 dark:text-white">
              <h3 className="text-xl font-semibold mb-5">Reset Password</h3>
              <form onSubmit={handleForgotPasswordSubmit}>
                <InputField
                  label="Email"
                  placeholder="Enter your email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                />
                <div className="mt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)} // Close the modal
                    className="text-sm text-gray-600 dark:text-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="rounded-lg bg-brand-500 px-4 py-2 text-white disabled:opacity-50"
                  >
                    {forgotLoading ? "Sending..." : "Submit"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* OTP Modal */}
        {otpModalOpen && (
          <div className="bg-black fixed inset-0 z-50 flex items-center justify-center bg-opacity-50">
            <div className="w-96 rounded-lg bg-white p-6 shadow-lg shadow-gray-800 dark:!bg-black-700 dark:text-white">
              <h3 className="text-xl font-semibold mb-5">Enter OTP</h3>
              <form onSubmit={handleOtpSubmit}>
                <InputField
                  label="Enter OTP"
                  placeholder="Enter the OTP sent to your email"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
                <div className="mt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setOtpModalOpen(false)} // Close the modal
                    className="text-sm text-gray-600 dark:text-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-brand-500 px-4 py-2 text-white"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Password Reset Modal */}
        {passwordModalOpen && (
          <div className="bg-black fixed inset-0 z-50 flex items-center justify-center bg-opacity-50">
            <div className="w-96 rounded-lg bg-white p-6 shadow-lg shadow-gray-800 dark:!bg-black-700 dark:text-white">
              <h3 className="text-xl font-semibold mb-5">Reset Your Password</h3>
              <form onSubmit={handleResetPasswordSubmit}>
                <div className="relative mb-4">
                  <InputField
                    label="New Password"
                    type={newPasswordVisible ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setNewPasswordVisible(!newPasswordVisible)}
                    className="absolute right-3 top-14 -translate-y-1/2 transform text-gray-600 dark:text-gray-400"
                  >
                    {newPasswordVisible ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>

                <div className="relative mb-4">
                  <InputField
                    label="Confirm Password"
                    type={confirmPasswordVisible ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                    className="absolute right-3 top-14 -translate-y-1/2 transform text-gray-600 dark:text-gray-400"
                  >
                    {confirmPasswordVisible ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>

                <div className="mt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setPasswordModalOpen(false)} // Close the modal
                    className="text-sm text-gray-600 dark:text-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="rounded-lg bg-brand-500 px-4 py-2 text-white disabled:opacity-50"
                  >
                    {forgotLoading ? "Resetting..." : "Reset Password"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
