// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import Card from "components/card"; // Card component for layout
// import { MdFileUpload } from "react-icons/md"; // Upload icon for the button
// import AddOrder from "./components/AddUser"; // Modal component for adding order
// import Table from "./components/Table";

// // const api = axios.create({
// //   baseURL: 'http://localhost:3001/',
// //   withCredentials: true // Ensure cookies are sent with requests
// // });

// function User() {
//   const [users, setUsers] = useState([]);
//   const [isModalOpen, setIsModalOpen] = useState(false); // State to handle modal visibility
//   const [error, setError] = useState(null); // Error state to handle failures

//   const handleOrderClick = () => {
//     setIsModalOpen(true); // Open the modal when the order button is clicked
//   };

//   const handleModalClose = () => {
//     setIsModalOpen(false); // Close the modal
//   };

//   // Fetch users from the backend API
//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
        
//         const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/admin/getAllUsers`, {
//           withCredentials: true,
//         });
//         setUsers(response.data.users); // Set the users state
//       } catch (error) {
//         setError("Failed to fetch users");
//         console.error("Error fetching users:", error);
//       }
//     };

//     fetchUsers();
//   }, []);

//   const generateDummyData = () => {
//     return users.length
//       ? users.map((user) => ({
//           user_id: user._id,
//           name: user.user_fullname || "N/A", // Assuming `username` is the correct key for user name
//           designation: user.user_designation || "N/A", // Correct key as per the data
//           email: user.user_email || "N/A", // Email key matches your response
//           phone_number: user.user_phone_number || "N/A", // Adjust if the key exists in your API
//           status: user.user_status || "Active", // Correct key for user status
//         }))
//       : [];
//   };
  
  

//   return (
//     <>
//       <div className="mt-5 w-1/2 h-64 mb-5">
//         <Card className="grid h-full w-full grid-cols-1 gap-3 rounded-[20px] bg-white bg-clip-border p-4 font-dm shadow-3xl shadow-shadow-500 dark:!bg-black-800 dark:shadow-none 2xl:grid-cols-11">
//           <div className="col-span-5 h-full w-full overflow-y-auto rounded-xl bg-lightPrimary dark:!bg-black-700 2xl:col-span-6">
//             <button
//               className="flex h-full w-full flex-col items-center justify-center rounded-xl border-[2px] border-dashed border-gray-200 py-3 dark:!border-black-700 lg:pb-0"
//               onClick={handleOrderClick}
//             >
//               <MdFileUpload className="text-[80px] text-brand-500 dark:text-white" />
//               <h4 className="text-xl font-bold text-brand-500 dark:text-white">
//                 Add User
//               </h4>
//               <p className="mt-2 text-sm font-medium text-gray-600">
//                 Add users from your owned stores
//               </p>
//             </button>
//           </div>

//           <div className="col-span-5 flex h-full w-full flex-col justify-center overflow-hidden rounded-xl bg-white pb-4 pl-3 dark:!bg-black-800">
//             <h5 className="text-left text-xl font-bold leading-9 text-black-700 dark:text-white">
//               Add Users from here
//             </h5>
//             <p className="leading-1 mt-2 text-base font-normal text-gray-600">
//               You can add users from your 's stores through this.
//             </p>
//             <button
//               className="linear mt-4 flex items-center justify-center rounded-xl bg-brand-500 px-2 py-2 text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
//               onClick={handleOrderClick}
//             >
//               Click here to add user
//             </button>
//           </div>
//         </Card>
//       </div>

//       <Table data={generateDummyData()} />
//       {isModalOpen && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 ">
//           <div className="bg-white rounded-lg shadow-lg p-6 w-2/5 h-2/4 dark:!bg-black-900">
//             <AddOrder onClose={handleModalClose} /> {/* Rendering AddOrder modal */}
//           </div>
//         </div>
//       )}

//       {/* Display error message if there is an error */}
//       {error && <div className="text-red-500">{error}</div>}
//     </>
//   );
// }

// export default User;










import React, { useState, useEffect } from "react";
import axios from "axios";
import Card from "components/card"; // Card component for layout
import { MdFileUpload } from "react-icons/md"; // Upload icon for the button
import AddOrder from "./components/AddUser"; // Modal component for adding order
import Table from "./components/Table";
import Skeleton from "react-loading-skeleton"; // Import Skeleton loader
import "react-loading-skeleton/dist/skeleton.css"; // Import skeleton CSS

// const api = axios.create({
//   baseURL: 'http://localhost:3001/',
//   withCredentials: true // Ensure cookies are sent with requests
// });

function User() {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false); // State to handle modal visibility
  const [error, setError] = useState(null); // Error state to handle failures
  const [isLoading, setIsLoading] = useState(true); // Loading state for skeleton

  const handleOrderClick = () => {
    setIsModalOpen(true); // Open the modal when the order button is clicked
  };

  const handleModalClose = () => {
    setIsModalOpen(false); // Close the modal
  };

  // Fetch users from the backend API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/admin/getAllUsers`, {
          withCredentials: true,
        });
        setUsers(response.data.users); // Set the users state
        setIsLoading(false); // Stop loading when data is fetched
      } catch (error) {
        setError("Failed to fetch users");
        setIsLoading(false); // Stop loading even if there is an error
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const generateDummyData = () => {
    return users.length
      ? users.map((user) => ({
          user_id: user._id,
          name: user.user_fullname || "N/A", // Assuming `username` is the correct key for user name
          designation: user.user_designation || "N/A", // Correct key as per the data
          email: user.user_email || "N/A", // Email key matches your response
          phone_number: user.user_phone_number || "N/A", // Adjust if the key exists in your API
          status: user.user_status || "Active", // Correct key for user status
        }))
      : [];
  };

  return (
    <>
      <div className="mt-5 w-1/2 h-64 mb-5">
        <Card className="grid h-full w-full grid-cols-1 gap-3 rounded-[20px] bg-white bg-clip-border p-4 font-dm shadow-3xl shadow-shadow-500 dark:!bg-black-800 dark:shadow-none 2xl:grid-cols-11">
          <div className="col-span-5 h-full w-full overflow-y-auto rounded-xl bg-lightPrimary dark:!bg-black-700 2xl:col-span-6">
            <button
              className="flex h-full w-full flex-col items-center justify-center rounded-xl border-[2px] border-dashed border-gray-200 py-3 dark:!border-black-700 lg:pb-0"
              onClick={handleOrderClick}
            >
              <MdFileUpload className="text-[80px] text-brand-500 dark:text-white" />
              <h4 className="text-xl font-bold text-brand-500 dark:text-white">
                Add User
              </h4>
              <p className="mt-2 text-sm font-medium text-gray-600">
                Add users from your owned stores
              </p>
            </button>
          </div>

          <div className="col-span-5 flex h-full w-full flex-col justify-center overflow-hidden rounded-xl bg-white pb-4 pl-3 dark:!bg-black-800">
            <h5 className="text-left text-xl font-bold leading-9 text-black-700 dark:text-white">
              Add Users from here
            </h5>
            <p className="leading-1 mt-2 text-base font-normal text-gray-600">
              You can add users from your 's stores through this.
            </p>
            <button
              className="linear mt-4 flex items-center justify-center rounded-xl bg-brand-500 px-2 py-2 text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
              onClick={handleOrderClick}
            >
              Click here to add user
            </button>
          </div>
        </Card>
      </div>

      {/* Skeleton loader for the Table with 5 columns displaying headings */}
      {isLoading ? (
        <div className="grid grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex flex-col items-center space-y-3">
              <Skeleton height={30} width={150} /> {/* Simulating heading */}
              <Skeleton height={20} width={100} />  {/* Subheading or secondary text */}
              <Skeleton height={20} width={100} />  {/* Subheading or secondary text */}
              <Skeleton height={20} width={100} />  {/* Subheading or secondary text */}
              <Skeleton height={20} width={100} />  {/* Subheading or secondary text */}
              <Skeleton height={20} width={100} />  {/* Subheading or secondary text */}
            </div>
          ))}
        </div>
      ) : (
        <Table data={generateDummyData()} />
      )}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 ">
          <div className="bg-white rounded-lg shadow-lg p-6 w-2/5 h-2/4 dark:!bg-black-900">
            <AddOrder onClose={handleModalClose} /> {/* Rendering AddOrder modal */}
          </div>
        </div>
      )}

      {/* Display error message if there is an error */}
      {error && <div className="text-red-500">{error}</div>}
    </>
  );
}

export default User;
