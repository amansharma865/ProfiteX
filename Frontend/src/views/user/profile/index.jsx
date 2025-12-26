import { useState, useEffect, useCallback } from "react";
import Banner from "./components/Banner";
import General from "./components/General";
import Project from "./components/Project";
import Upload from "./components/Upload";
import ProfileUpdate from "./components/ProfileUpdate";
import axios from "axios";

const ProfileOverview = () => {
  const [isProfileUpdateOpen, setIsProfileUpdateOpen] = useState(false);
  const [value, setValue] = useState({});

  const handleProfileUpdateClick = useCallback(() => {
    setIsProfileUpdateOpen(true);
  }, []);

  const handleProfileUpdateClose = useCallback(() => {
    setIsProfileUpdateOpen(false);
  }, []);

  // Close popup when clicking outside
  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      handleProfileUpdateClose();
    }
  }, [handleProfileUpdateClose]);

  useEffect(() => {
    const handleApi = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/user/get-details`, {
          withCredentials: true,
        });

        const userData = response.data.data;
        setValue("user_username", userData.username || "");
        setValue("user_email", userData.email || "");
        setValue("user_fullname", userData.fullName || "");
        setValue("user_phone_number", userData.phoneNumber || "");
        setValue("user_designation", userData.designation || "");
        setValue("user_company_name", userData.companyName || "");
      } catch (error) {
        console.error("Error fetching user data", error);
      }
    };
    handleApi();
  }, [handleProfileUpdateClose]);

  return (
    <div
      className={`
        flex w-full flex-col gap-5 
        transition-all duration-300 ease-in-out 
        ${isProfileUpdateOpen
          ? 'relative overflow-hidden'
          : ''
        }
      `}
    >
      {/* Blur overlay when popup is open */}
      {isProfileUpdateOpen && (
        <div
          className="fixed inset-0 bg-white/70 backdrop-blur-xs z-40 pointer-events-none"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 40,
            pointerEvents: 'none'
          }}
        />
      )}

      <div className="w-full mt-3 flex h-fit flex-col gap-5 lg:grid lg:grid-cols-12">
        <div className="col-span-4 lg:!mb-0">
          <Banner />
        </div>

        <div className="z-0 col-span-8 lg:!mb-0">
          <Upload onClick={handleProfileUpdateClick} />
        </div>
      </div>

      <div className="grid h-full grid-cols-1 gap-5 lg:!grid-cols-12">
        {/* <div className="col-span-5 lg:col-span-6 lg:mb-0 3xl:col-span-4">
          <Project />
        </div>
        <div className="col-span-5 lg:col-span-6 lg:mb-0 3xl:col-span-5">
          <General values={value} />
        </div> */}


      </div>

      {isProfileUpdateOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          onClick={handleOverlayClick}
        >
          <div className="w-full max-w-xl mx-auto">
            <ProfileUpdate onClose={handleProfileUpdateClose} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileOverview;
