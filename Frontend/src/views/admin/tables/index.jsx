// import React, { useState, useEffect } from "react";
// import ComplexTable from "./components/ComplexTable"; // Importing ComplexTable
// import { columnsDataComplex } from "./variables/columnsData"; // Assuming you have column data here
// import axios from "axios";
// import Card from "components/card"; // Card component for layout
// import { MdFileUpload } from "react-icons/md"; // Upload icon for the button
// import AddOrder from "./components/AddOrder"; // Modal component for adding order

// const Tables = () => {
//   const [tableData, setTableData] = useState([]); // State to store the table data
//   const [isModalOpen, setIsModalOpen] = useState(false); // State to handle modal visibility

//   // Fetch table data from the server
//   useEffect(() => {
//     const fetchTableData = async () => {
//       try {
//         const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/order/checkOrder`, {
//           withCredentials: true, // Ensure cookies are sent if needed for authentication
//         });
//         if (response.data.status === 200) {
//           const result = response.data.data;
//           const formattedData = result.map((order) => ({
//             order_id: order.order_id,
//             item_name: order.product_name,
//             date: new Date(order.createdAt).toLocaleDateString("en-US", {
//               day: "2-digit",
//               month: "short",
//               year: "numeric",
//             }),
//             status: order.status,
//             item_quantity: order.product_quantity,
//             employee:order.orderFrom.user_email
//           }));
//           setTableData(formattedData); // Set the formatted data in state
//         } else {
//           console.error("Failed to fetch data:", response.data.message);
//         }
//       } catch (error) {
//         alert("Error fetching data:", error);
//       }
//     };

//     fetchTableData(); // Call the function to fetch data on component mount
//   }, []);

//   const handleOrderClick = () => {
//     setIsModalOpen(true); // Open the modal when the order button is clicked
//   };

//   const handleModalClose = () => {
//     setIsModalOpen(false); // Close the modal
//   };

//   return (
//     <div>
//       {/* <div className="mt-5 w-2/4">
//         <Card className="grid h-full w-full grid-cols-1 gap-3 rounded-[20px] bg-white bg-clip-border p-4 font-dm shadow-3xl shadow-shadow-500 dark:!bg-black-800 dark:shadow-none 2xl:grid-cols-11">
//           <div className="col-span-5 h-full w-full rounded-xl bg-lightPrimary dark:!bg-black-700 2xl:col-span-6 overflow-y-auto">
//             <button
//               className="flex h-full w-full flex-col items-center justify-center rounded-xl border-[2px] border-dashed border-gray-200 py-3 dark:!border-black-700 lg:pb-0"
//               onClick={handleOrderClick}
//             >
//               <MdFileUpload className="text-[80px] text-brand-500 dark:text-white" />
//               <h4 className="text-xl font-bold text-brand-500 dark:text-white">
//                 Order Now
//               </h4>
//               <p className="mt-2 text-sm font-medium text-gray-600">
//                 Order products from super inventory
//               </p>
//             </button>
//           </div>

//           <div className="col-span-5 flex h-full w-full flex-col justify-center overflow-hidden rounded-xl bg-white pl-3 pb-4 dark:!bg-black-800">
//             <h5 className="text-left text-xl font-bold leading-9 text-black-700 dark:text-white">
//               Order Products from here
//             </h5>
//             <p className="leading-1 mt-2 text-base font-normal text-gray-600">
//               You can order products from your 's super inventory through this order.
//             </p>
//             <button
//               className="linear mt-4 flex items-center justify-center rounded-xl bg-brand-500 px-2 py-2 text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
//               onClick={handleOrderClick}
//             >
//               Click here to Order
//             </button>
//           </div>
//         </Card>
//       </div> */}

//       <div className="mt-16">
//         <ComplexTable columnsData={columnsDataComplex} tableData={tableData} /> {/* Rendering ComplexTable component */}
//       </div>

//       {isModalOpen && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 ">
//           <div className="bg-white rounded-lg shadow-lg p-6 w-2/5 h-2/4 dark:!bg-black-900">
//             <AddOrder onClose={handleModalClose} /> {/* Rendering AddOrder modal */}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Tables;



import React, { useState, useEffect } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import ComplexTable from "./components/ComplexTable";
import { columnsDataComplex } from "./variables/columnsData";
import axios from "axios";
import Card from "components/card";
import { MdFileUpload } from "react-icons/md";
import AddOrder from "./components/AddOrder";

const Tables = () => {
  const [tableData, setTableData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTableData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/order/checkOrder`, {
          withCredentials: true,
        });
        if (response.data.status === 200) {
          const result = response.data.data;
          const formattedData = result.map((order) => ({
            order_id: order.order_id,
            item_name: order.product_name,
            date: new Date(order.createdAt).toLocaleDateString("en-US", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
            status: order.status,
            item_quantity: order.product_quantity,
            employee: order.orderFrom.user_email,
          }));
          setTableData(formattedData);
        } else {
          console.error("Failed to fetch data:", response.data.message);
        }
      } catch (error) {
        alert("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTableData();
    // Auto-refresh every 5 seconds to show new orders
    const interval = setInterval(fetchTableData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleOrderClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="mt-16">
        {loading ? (
          // Skeleton Loader for 5 columns with headings
          <div className="grid grid-cols-7 gap-4">
            {[...Array(7)].map((_, index) => (
              <div key={index} className="flex flex-col items-center space-y-3">
                <Skeleton height={30} width={100} /> {/* Simulating heading */}
                <Skeleton height={20} width={80} />  {/* Placeholder for content */}
                <Skeleton height={20} width={60} />  {/* Placeholder for content */}
                <Skeleton height={20} width={60} />  {/* Placeholder for content */}
                <Skeleton height={20} width={60} />  {/* Placeholder for content */}
                <Skeleton height={20} width={60} />  {/* Placeholder for content */}
                <Skeleton height={20} width={60} />  {/* Placeholder for content */}
                <Skeleton height={20} width={60} />  {/* Placeholder for content */}
                <Skeleton height={20} width={60} />  {/* Placeholder for content */}
                <Skeleton height={20} width={60} />  {/* Placeholder for content */}
                <Skeleton height={20} width={60} />  {/* Placeholder for content */}
                <Skeleton height={20} width={60} />  {/* Placeholder for content */}
                <Skeleton height={20} width={60} />  {/* Placeholder for content */}
              </div>
            ))}
          </div>
        ) : (
          <ComplexTable columnsData={columnsDataComplex} tableData={tableData} />
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-2/5 h-2/4 dark:!bg-black-900">
            <AddOrder onClose={handleModalClose} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Tables;
