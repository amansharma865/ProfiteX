import React, { useState, useEffect } from "react";
import Dropdown from "components/dropdown";
import { FiAlignJustify } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { BsArrowBarUp } from "react-icons/bs";
import { RiMoonFill, RiSunFill } from "react-icons/ri";
import {
  IoMdNotificationsOutline,
  IoMdInformationCircleOutline,
} from "react-icons/io";
import avatar from "assets/img/avatars/avatar4.png";
import axios from "axios";

const Navbar = (props) => {
  const { onOpenSidenav, brandText, userInf, role } = props;
  const navigate = useNavigate();
  const [darkmode, setDarkmode] = React.useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch notifications
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [role]);

  const fetchNotifications = async () => {
    try {
      const endpoint = role === 'admin'
        ? `${process.env.REACT_APP_API_BASE_URL}/notifications/admin`
        : `${process.env.REACT_APP_API_BASE_URL}/notifications/user`;

      const response = await axios.get(endpoint, { withCredentials: true });

      if (response.data.success) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      // Silently handle error
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      const endpoint = role === 'admin'
        ? `${process.env.REACT_APP_API_BASE_URL}/notifications/mark-all-read/admin`
        : `${process.env.REACT_APP_API_BASE_URL}/notifications/mark-all-read/user`;

      await axios.put(endpoint, {}, { withCredentials: true });
      fetchNotifications();
    } catch (error) {
      // Silently handle error
    }
  };

  const clearAllNotifications = async () => {
    try {
      const endpoint = role === 'admin'
        ? `${process.env.REACT_APP_API_BASE_URL}/notifications/clear-all/admin`
        : `${process.env.REACT_APP_API_BASE_URL}/notifications/clear-all/user`;

      await axios.delete(endpoint, { withCredentials: true });
      fetchNotifications();
    } catch (error) {
      // Silently handle error
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/${role}/logout`, {
        withCredentials: true,
      });
      if (response.data.success) {
        alert("User logged out successfully");
        navigate("/");
      }
    } catch (error) {
      alert("Error while logout:", error.message);
    }
  };

  // Determine greeting based on time of day
  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour >= 6 && currentHour < 12) {
      return "Good Morning";
    }
    else if (currentHour >= 12 && currentHour < 17) {
      return "Good Afternoon";
    }
    else {
      return "Good Evening";
    }
  };

  return (
    <nav className="sticky top-4 z-40 flex flex-row flex-wrap items-center justify-between rounded-xl p-2 backdrop-blur-xl">
      <div className="ml-[6px]">
        <div className="h-6 w-[224px] pt-1">
          <a
            className="text-sm font-normal text-black-700 hover:underline dark:text-white dark:hover:text-white"
            href="#"
          >
            Pages
            <span className="mx-1 text-sm text-black-700 hover:text-black-700 dark:text-white">
              {" "}
              /{" "}
            </span>
          </a>
          <Link
            className="text-sm font-normal capitalize text-black-700 hover:underline dark:text-white dark:hover:text-white"
            to="#"
          >
            {brandText}
          </Link>
        </div>
        <p className="shrink text-[33px] capitalize text-black-700 dark:text-white">
          <Link
            to="#"
            className="font-bold capitalize hover:text-black-700 dark:hover:text-white"
          >
            {brandText}
          </Link>
        </p>
      </div>

      <div className="relative mt-[3px] flex h-[61px] w-[355px] flex-grow items-center justify-around gap-2 rounded-full bg-white px-2 py-2 shadow-xl shadow-shadow-500 dark:!bg-black-800 dark:shadow-none md:w-[300px] md:flex-grow-0 md:gap-1 xl:w-[300px] xl:gap-2">
        <h6 className="text-gray-600">{getGreeting()}</h6>

        <span
          className="flex cursor-pointer text-xl text-gray-600 dark:text-white xl:hidden"
          onClick={onOpenSidenav}
        >
          <FiAlignJustify className="h-5 w-5" />
        </span>

        {/* Start Notification */}
        <Dropdown
          button={
            <div className="relative cursor-pointer">
              <IoMdNotificationsOutline className="h-4 w-4 text-gray-600 dark:text-white" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[8px] rounded-full w-3 h-3 flex items-center justify-center border border-white dark:border-black-800">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
          }
          animation="origin-[65%_0%] md:origin-top-right transition-all duration-300 ease-in-out"
          children={
            <div className="flex w-[360px] flex-col gap-3 rounded-[20px] bg-white p-4 shadow-xl shadow-shadow-500 dark:!bg-black-700 dark:text-white dark:shadow-none sm:w-[460px]">
              <div className="flex items-center justify-between">
                <p className="text-base font-bold text-black-700 dark:text-white">
                  Notifications ({notifications.length})
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={markAllAsRead}
                    className="text-xs font-bold text-brand-500 dark:text-brand-400 hover:underline"
                  >
                    Mark all read
                  </button>
                  <span className="text-gray-400">|</span>
                  <button
                    onClick={clearAllNotifications}
                    className="text-xs font-bold text-red-500 dark:text-red-400 hover:underline"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <p className="text-center text-gray-500 py-4">Loading...</p>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <IoMdNotificationsOutline className="h-12 w-12 text-gray-300 mb-2" />
                    <p className="text-gray-500">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif._id}
                      className={`flex items-start gap-3 p-3 rounded-lg mb-2 ${notif.read
                        ? 'bg-white dark:bg-black-800'
                        : 'bg-blue-50 dark:bg-blue-900'
                        }`}
                    >
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-b from-brandLinear to-brand-500 flex items-center justify-center text-white">
                        {notif.type === 'order_placed' && '📦'}
                        {notif.type === 'order_accepted' && '✅'}
                        {notif.type === 'order_rejected' && '❌'}
                        {notif.type === 'low_stock' && '⚠️'}
                        {notif.type === 'new_user' && '👤'}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-black-700 dark:text-white">
                          {notif.title}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {notif.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notif.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          }
          classNames={"py-2 top-4 -left-[230px] md:-left-[440px] w-max"}
        />

        {/* Information Icon */}
        {/* <Dropdown
          button={
            <p className="cursor-pointer">
              <IoMdInformationCircleOutline className="h-4 w-4 text-gray-600 dark:text-white" />
            </p>
          }
          children={
            <div className="flex w-[350px] flex-col gap-2 rounded-[20px] bg-white p-4 shadow-xl shadow-shadow-500 dark:!bg-black-700 dark:text-white dark:shadow-none"></div>
          }
          classNames={"py-2 top-6 -left-[250px] md:-left-[330px] w-max"}
          animation="origin-[75%_0%] md:origin-top-right transition-all duration-300 ease-in-out"
        /> */}

        {/* Dark Mode Toggle */}
        <div
          className="cursor-pointer text-gray-600"
          onClick={() => {
            if (darkmode) {
              document.body.classList.remove("dark");
              setDarkmode(false);
            } else {
              document.body.classList.add("dark");
              setDarkmode(true);
            }
          }}
        >
          {darkmode ? (
            <RiSunFill className="h-4 w-4 text-gray-600 dark:text-white" />
          ) : (
            <RiMoonFill className="h-4 w-4 text-gray-600 dark:text-white" />
          )}
        </div>

        {/* Profile & Dropdown */}
        <Dropdown
          button={
            <img
              className="h-10 w-10 rounded-full"
              src={role == 'user' ? (userInf && userInf.user_profile_pic ? `${process.env.REACT_APP_API_BASE_URL}${userInf.user_profile_pic} ` : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png") : (userInf && userInf.admin_profile_pic
                ? `${process.env.REACT_APP_API_BASE_URL}${userInf.admin_profile_pic.trim()}`
                : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png")}
              alt="A"
            />
          }
          children={
            <div className="flex w-56 flex-col justify-start rounded-[20px] bg-white bg-cover bg-no-repeat shadow-xl shadow-shadow-500 dark:!bg-black-700 dark:text-white dark:shadow-none">
              <div className="p-4">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-black-700 dark:text-white">
                    {userInf.user_email || userInf.admin_email}
                  </p>
                </div>
              </div>
              <div className="h-px w-full bg-gray-200 dark:bg-white/20" />
              <div className="flex flex-col p-4">
                <Link
                  to={`/${role}/profile`}
                  href=" "
                  className="text-sm text-gray-800 dark:text-white hover:dark:text-white"
                >
                  Profile Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="mt-3 text-sm font-medium text-red-500 transition duration-150 ease-out hover:text-red-500 hover:ease-in"
                >
                  Log Out
                </button>
              </div>
            </div>
          }
          classNames={"py-2 top-8 -left-[180px] w-max"}
        />
      </div>
    </nav>
  );
};

export default Navbar;