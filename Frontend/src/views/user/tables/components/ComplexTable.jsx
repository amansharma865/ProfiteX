import React, { useEffect, useState } from "react";
import CardMenu from "components/card/CardMenu";
import Card from "components/card";
import { MdCancel, MdCheckCircle, MdOutlineError, MdEdit, MdDelete } from "react-icons/md";
import axios from "axios";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

const columnHelper = createColumnHelper();

export default function OrderTable(props) {
  const { tableData } = props;
  const [sorting, setSorting] = useState([]);
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  const [selectedOrder, setSelectedOrder] = useState(null); // State for selected order data

  useEffect(() => {
    setData([...tableData]);
  }, [tableData]);

  const columns = [
    columnHelper.accessor("order_id", {
      id: "order_id",
      header: () => <p className="text-sm font-bold text-gray-600 dark:text-white">ORDER ID</p>,
      cell: (info) => <p className="text-sm font-bold text-black-700 dark:text-white">{info.getValue()}</p>,
    }),
    columnHelper.accessor("item_name", {
      id: "item_name",
      header: () => <p className="text-sm font-bold text-gray-600 dark:text-white">ITEM NAME</p>,
      cell: (info) => <p className="text-sm font-bold text-black-700 dark:text-white">{info.getValue()}</p>,
    }),
    columnHelper.accessor("date", {
      id: "date",
      header: () => <p className="text-sm font-bold text-gray-600 dark:text-white">DATE</p>,
      cell: (info) => <p className="text-sm font-bold text-black-700 dark:text-white">{info.getValue()}</p>,
    }),
    columnHelper.accessor("status", {
      id: "status",
      header: () => <p className="text-sm font-bold text-gray-600 dark:text-white">STATUS</p>,
      cell: (info) => {
        const status = info.getValue().toLowerCase();
        return (
          <div className="flex items-center">
            {status === "accepted" ? (
              <MdCheckCircle className="text-green-500 me-1 dark:text-green-300" />
            ) : status === "pending" ? (
              <MdOutlineError className="text-amber-500 me-1 dark:text-amber-300" />
            ) : status === "rejected" ? (
              <MdCancel className="text-red-500 me-1 dark:text-red-300" />
            ) : null}
            <p className="text-sm font-bold text-black-700 dark:text-white capitalize">{info.getValue()}</p>
          </div>
        );
      },
    }),
    columnHelper.accessor("item_quantity", {
      id: "item_quantity",
      header: () => <p className="text-sm font-bold text-gray-600 dark:text-white">ITEM QUANTITY</p>,
      cell: (info) => <p className="text-sm font-bold text-black-700 dark:text-white">{info.getValue()}</p>,
    }),
    // columnHelper.accessor("action", {
    //   id: "action",
    //   header: () => <p className="text-sm font-bold text-gray-600 dark:text-white">ACTION</p>,
    //   cell: (info) => (
    //     <div className="flex space-x-3">
    //       <button
    //         onClick={() => handleEdit(info.row.original)}
    //         className="text-blue-500 dark:text-blue-300"
    //       >
    //         <MdEdit />
    //       </button>
    //       <button
    //         onClick={() => handleDelete(info.row.original.order_id)}
    //         className="text-red-500 dark:text-red-300"
    //       >
    //         <MdDelete />
    //       </button>
    //     </div>
    //   ),
    // }),
  ];

  const handleEdit = (order) => {
    setSelectedOrder(order); // Set selected order data
    setIsModalOpen(true); // Open the modal
  };

  const handleDelete = async (orderId) => {
    try {
      const response = await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/order/deleteorder/${orderId}`, {
        withCredentials: true,
      });

      if (response.status === 200) {
        await fetchOrders();
        alert("Order deleted successfully!");
      } else {
        alert("Failed to delete the order.");
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("Error deleting the order.");
    }
  };

  const fetchOrders = async () => {
    try {
      const result = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/order/getAllOrders`);
      setData(result.data.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null); // Clear selected order data
  };

  const handleModalSubmit = async () => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/order/updateorder/${selectedOrder.order_id}`,
        {
          item_name: selectedOrder.item_name,
          item_quantity: selectedOrder.item_quantity,
        },
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        // Update the local data to reflect the changes
        const updatedOrder = response.data.data;
        setData((prevData) =>
          prevData.map((order) =>
            order.order_id === updatedOrder.order_id ? updatedOrder : order
          )
        );
        closeModal(); // Close the modal after successful update
        alert("Order updated successfully!");
      } else {
        alert("Failed to update the order.");
      }
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Error updating the order.");
    }
  };


  return (
    <Card extra={"w-full h-full px-6 pb-6 sm:overflow-x-auto"}>
      <div className="relative flex items-center justify-between pt-4">
        <div className="text-xl font-bold text-black-700 dark:text-white">Order Tracker</div>
        <CardMenu />
      </div>

      <div className="mt-8 overflow-y-auto">
        <table className="w-full overflow-y-auto">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="!border-px !border-gray-400">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    onClick={header.column.getToggleSortingHandler()}
                    className="cursor-pointer border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start"
                  >
                    <div className="items-center justify-between text-xs text-gray-200">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() ? (header.column.getIsSorted() === "asc" ? "↑" : "↓") : null}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="min-w-[150px] border-white/0 py-3 pr-4 text-start">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg w-1/3">
            <h2 className="text-xl font-bold mb-4">Edit Order</h2>
            <div>
              {/* Item Name field */}
              <label className="block text-sm font-medium mb-2">Item Name</label>
              <input
                type="text"
                value={selectedOrder?.item_name || ""}
                onChange={(e) => setSelectedOrder({ ...selectedOrder, item_name: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded mb-4"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Quantity</label>
              <input
                type="number"
                value={selectedOrder?.item_quantity || ""}
                onChange={(e) => setSelectedOrder({ ...selectedOrder, item_quantity: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded mb-4"
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button onClick={closeModal} className="text-gray-500">
                Cancel
              </button>
              <button onClick={handleModalSubmit} className="bg-blue-500 text-white px-4 py-2 rounded">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

