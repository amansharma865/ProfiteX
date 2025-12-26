import React, { useState, useEffect } from "react";
import axios from "axios";
import CardMenu from "components/card/CardMenu";
import Card from "components/card";
import { FaEdit, FaTrashAlt } from "react-icons/fa";

// const api = axios.create({
//   baseURL: 'http://localhost:3001/',
//   withCredentials: true // Ensure cookies are sent with requests
// });

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  withCredentials: true
});

// Table Component
const Table = ({ data = [] }) => {
  const [users, setUsers] = useState([]);

  // Update users when the data prop changes
  useEffect(() => {
    setUsers(data);
  }, [data]);

  const tableHeaders = [
    "User ID",
    "Name",
    "Designation",
    "Email",
    "Phone Number",
    "Status",
  ];

  // Sort users to place "Inactive" status users at the bottom
  const sortedUsers = [...users].sort((a, b) => {
    if (a.status === "Inactive" && b.status !== "Inactive") return 1;
    if (b.status === "Inactive" && a.status !== "Inactive") return -1;
    return 0;
  });

  // Function to handle status change and call the backend API
  const handleStatusChange = async (userId, newStatus) => {
    try {
      // Call the backend API
      const response = await api.put(`${process.env.REACT_APP_API_BASE_URL}/admin/update-status`, {
        userId,
        newStatus,
      });
      if (response.status === 200) {
        // Update the local state on successful API response
        const updatedUsers = users.map((user) =>
          user.user_id === userId ? { ...user, status: newStatus } : user
        );
        setUsers(updatedUsers);
        alert(response.data.message); // Optional success message
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update user status. Please try again.");
    }
  };

  const handleStatusPopup = (userId, newStatus) => {
    const confirmed = window.confirm(
      "Are you sure you want to change the status?"
    );
    if (confirmed) {
      handleStatusChange(userId, newStatus);
    }
  };

  return (
    <Card extra="w-full h-full px-6 pb-6 sm:overflow-x-auto">
      {/* Header Section */}
      <div className="relative flex items-center justify-between pt-4">
        <h1 className="text-xl font-bold text-black-700 dark:text-white">
          User Table
        </h1>
        <CardMenu />
      </div>

      {/* Table Section */}
      <div className="mt-8 overflow-x-auto">
        <table className="w-full overflow-y-auto">
          {/* Table Head */}
          <thead>
            <tr className="border-b border-gray-200 text-start">
              {tableHeaders.map((header) => (
                <th
                  key={header}
                  className="py-3 text-left text-sm font-bold uppercase text-gray-600 dark:text-white"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {sortedUsers.length > 0 ? (
              sortedUsers.map((user) => (
                <tr
                  key={user.user_id}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    user.status === "Inactive"
                      ? "bg-red-100 dark:bg-red-800"
                      : ""
                  }`}
                >
                  <TableCell>{user.user_id}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.designation}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone_number}</TableCell>
                  <TableCell>
                    <StatusDropdown
                      status={user.status}
                      userId={user.user_id}
                      handleStatusChange={handleStatusPopup}
                    />
                  </TableCell>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={tableHeaders.length}
                  className="py-6 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
                >
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

// TableCell Component
const TableCell = ({ children }) => (
  <td className="min-w-[150px] border-white/0 py-3 pr-4 text-start text-sm font-bold text-black-700 dark:text-white">
    {children}
  </td>
);

// StatusDropdown Component
const StatusDropdown = ({ status, userId, handleStatusChange }) => {
  const statusColors = {
    Active: "text-green-500",
    Inactive: "text-red-500",
  };

  return (
    <div className="relative">
      <button
        className={`rounded-md ${statusColors[status]}`}
        onClick={() =>
          handleStatusChange(
            userId,
            status === "Active" ? "Inactive" : "Active"
          )
        }
      >
        {status}
      </button>
    </div>
  );
};

export default Table;
