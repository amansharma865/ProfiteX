import React, { useEffect, useState } from "react";
import banner from "assets/img/profile/banner.png";
import Card from "components/card";
import { useAdmin } from "useContext/adminContext";
import axios from "axios";
import { toast } from "react-toastify";

const Banner = () => {
  const adminInfo = useAdmin();
  const [companyName, setCompanyName] = useState('Company Name');

  const handleAdminDetails = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/admin/get-details`, { withCredentials: true });

      if (response.data.success === true) {
        setCompanyName(response.data.admin.company_name || 'Company Name');
      } else {
        setCompanyName('Company Name');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    handleAdminDetails();
  }, []);

  if (!adminInfo) return <div>Loading...</div>;

  return (
    <Card extra={"items-center w-full h-full p-[16px] bg-cover"}>
      {/* Background and profile */}
      <div
        className="relative mt-1 flex h-24 w-full justify-center rounded-xl bg-cover"
        style={{ backgroundImage: ` url(${banner})` }}
      >
        <div className="absolute -bottom-12 flex h-[87px] w-[87px] items-center justify-center rounded-full border-[4px] border-white bg-pink-400 dark:!border-black-700">
          <img
            className="h-full w-full rounded-full"

            src={adminInfo && adminInfo.admin_profile_pic
              ? `${process.env.REACT_APP_API_BASE_URL}${adminInfo.admin_profile_pic.trim()}`
              : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png"}
            alt="Profile"
          />
        </div>
      </div>

      {/* Admin Name and position */}
      <div className="mt-16 flex flex-col items-center">
        <h4 className="text-xl font-bold text-black-700 dark:text-white">
          {adminInfo.admin_name || "Admin Name"}
        </h4>
        <p className="text-base font-normal text-gray-600">Admin Name</p>
      </div>
      <div className="mt-4 flex flex-col items-center">
        <h4 className="text-xl font-bold text-black-700 dark:text-white">
          {adminInfo.admin_email || "Email"}
        </h4>
        <p className="text-base font-normal text-gray-600">Email</p>
      </div>

      {/* Admin Details */}
      <div className="mt-6 mb-3 flex gap-40 md:!gap-32">
        <div className="flex flex-col items-center justify-center">
          <p className="text-lg font-bold text-black-700 dark:text-white">{adminInfo.admin_plan_type || "Plan Type"}</p>
          <p className="text-sm font-normal text-gray-600">Plan Type</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <p className="text-lg font-bold text-black-700 dark:text-white">
            {adminInfo.admin_mobile_number || "Mobile Number"}
          </p>
          <p className="text-sm font-normal text-gray-600">Mobile Number</p>
        </div>
      </div>

      {/* Company Details */}
      <div className="mt-6 mb-3 flex gap-40 md:!gap-32">
        <div className="flex flex-col items-center justify-center">
          <p className="text-lg font-bold text-black-700 dark:text-white">{adminInfo.company_name || "Company Name"}</p>
          <p className="text-sm font-normal text-gray-600">Company Name</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <p className="text-lg font-bold text-black-700 dark:text-white">
            {adminInfo.company_industry || "Company Industry"}
          </p>
          <p className="text-sm font-normal text-gray-600">Company Industry</p>
        </div>
      </div>

      <div className="mt-4 flex flex-col items-center">
        <h4 className="text-lg font-bold text-black-700 dark:text-white">
          {adminInfo.company_address || "Company Address"}
        </h4>
        <p className="text-base font-normal text-gray-600">Company Address</p>
      </div>
    </Card>
  );
};

export default Banner;