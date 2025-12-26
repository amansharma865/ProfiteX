import React, { useEffect, useState } from "react";
import banner from "assets/img/profile/banner.png";
import Card from "components/card";
import { useUser } from "useContext/userContext";
import axios from "axios";
import { toast } from "react-toastify";

const Banner = () => {
  const userInfo = useUser();
  const [userAdmin, setUserAdmin] = useState('admin');
  const [companyName, setCompanyName] = useState('admin');

  const handleAdmin = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/user/admin-details`, { withCredentials: true });

      if (response.data.success === true) {
        setUserAdmin(response.data.admin.username || 'admin');
        setCompanyName(response.data.admin.company_name || 'Company Name');
      } else {
        setUserAdmin('admin');
        setCompanyName('Company Name');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    handleAdmin();
  }, []);

  if (!userInfo) return <div>Loading...</div>;

  return (
    <Card extra={"w-full h-full p-6 bg-cover rounded-lg shadow-lg"}>
      <div
        className="relative flex h-24 w-full justify-center rounded-lg bg-cover"
        style={{ backgroundImage: `url(${banner})` }}
      >
        <div className="absolute -bottom-10 flex h-[100px] w-[100px] items-center justify-center rounded-full border-4 border-white bg-blue-400 shadow-lg">
          <img
            className="h-full w-full rounded-full"
            src={userInfo && userInfo.user_profile_pic ? `${process.env.REACT_APP_API_BASE_URL}${userInfo.user_profile_pic}` : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png"}
            alt="Profile"
          />
        </div>
      </div>

      <div className="mt-14 text-center">
        <h5 className="text-lg font-semibold text-gray-800 dark:text-white">
          {userInfo.user_email || "Username"}
        </h5>
        <p className="text-sm text-gray-500 dark:text-gray-400">email</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-6 text-center">
        <div className="flex flex-col items-center">
          <p className="text-lg font-bold text-gray-800 dark:text-white">{userInfo.user_fullname || "Name"}</p>
          <p className="text-sm text-gray-500">Name</p>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-lg font-bold text-gray-800 dark:text-white">
            {userInfo.user_phone_number || "Emp ID"}
          </p>
          <p className="text-sm text-gray-500">Phone Number</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-6 text-center">
        <div className="flex flex-col items-center">
          <p className="text-lg font-bold text-gray-800 dark:text-white">{companyName || "Company Name"}</p>
          <p className="text-sm text-gray-500">Company Name</p>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-lg font-bold text-gray-800 dark:text-white">
            {userInfo.user_designation || "Designation"}
          </p>
          <p className="text-sm text-gray-500">Designation</p>
        </div>
      </div>

      <div className="flex flex-col items-center mt-4">
        <p className="text-lg font-bold text-gray-800 dark:text-white">{userAdmin || "Admin Name"}</p>
        <p className="text-sm text-gray-500">Admin Name</p>
      </div>
    </Card>
  );
};

export default Banner;