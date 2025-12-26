import React from "react";
import CardMenu from "components/card/CardMenu";
import Card from "components/card";
import { FaEdit, FaTrashAlt } from "react-icons/fa";

const Table = ({ data = [], onDelete, onEdit }) => {
  const tableHeaders = [
    "Product ID",
    "Name",
    "Price",
    "Stock",
    "Actions",
  ];

  return (
    <Card extra="w-full h-full px-6 pb-6 sm:overflow-x-auto">
      {/* Header Section */}
      <div className="relative flex items-center justify-between pt-4">
        <h1 className="text-xl font-bold text-black-700 dark:text-white">Product Table</h1>
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
                  className="py-3 text-left text-sm font-bold text-gray-600 uppercase dark:text-white"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {data.length > 0 ? (
              data.map((item) => (
                <tr
                  key={item.product_id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <TableCell>{item.product_id}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.price}</TableCell>
                  <TableCell>{item.stock}</TableCell>
                  <td className="py-3 pr-4 text-sm font-bold text-black-700 dark:text-white flex space-x-3">
                    <ActionButton
                      onClick={() => onEdit(item)}
                      className="text-blue-500 dark:text-blue-300"
                      Icon={FaEdit}
                    />
                    <ActionButton
                      onClick={() => onDelete(item.product_id)}
                      className="text-red-500 dark:text-red-300"
                      Icon={FaTrashAlt}
                    />
                  </td>
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

const TableCell = ({ children }) => (
  <td className="min-w-[150px] border-white/0 py-3 pr-4 text-start text-sm font-bold text-black-700 dark:text-white">
    {children}
  </td>
);

const ActionButton = ({ onClick, className, Icon }) => (
  <button onClick={onClick} className={className}>
    <Icon />
  </button>
);

export default Table;
