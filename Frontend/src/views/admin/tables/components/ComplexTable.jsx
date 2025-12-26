
import React, { useEffect, useState } from "react";
import CardMenu from "components/card/CardMenu";
import Card from "components/card";
import { MdCancel, MdCheckCircle, MdOutlineError, MdThumbUp, MdThumbDown } from "react-icons/md";
import axios from "axios";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { toast } from "react-toastify";

const columnHelper = createColumnHelper();

export default function OrderTable(props) {
  const { tableData } = props;
  const orderStatus = props.status
  const [sorting, setSorting] = useState([]);
  const [data, setData] = useState([]);

  useEffect(() => {
    setData([...tableData]);
  }, [tableData]);

  const handleAcceptReject = async (orderId, action) => {
    // Make 4xx responses resolve so we can display server message without throwing
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/order/updateorder`,
        {
          adminOutput: action,
          orderId: orderId,
        },
        {
          withCredentials: true,
          validateStatus: (status) => status < 500, // resolve for 2xx-4xx, reject 5xx and network errors
        }
      );

      // If success and backend indicates success
      if (response.status >= 200 && response.status < 300 && response.data?.success !== false) {
        await fetchOrders();
        setTimeout(() => window.location.reload(), 2000);
        toast.success(`Order ${action}ed successfully!`);
        return;
      }

      // For business/client errors (e.g., insufficient stock), show server message
      const serverMessage = response?.data?.message || response?.data?.error || `Failed to ${action} the order.`;
      toast.error(serverMessage);
    } catch (err) {
      // Network or server 5xx errors
      toast.error(`Error ${action}ing the order.`);
    }
  };

  const fetchOrders = async () => {
    try {
      const result = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/order/checkOrder`, { withCredentials: true });
      setData(result.data.data);
    } catch (error) {
      // If the session/cookie is missing or expired the server will return 401
      if (error?.response?.status === 401) {
        // Avoid noisy stack in console; show a concise toast and stop
        toast.error('Session expired or unauthorized. Please sign in again.');
        return;
      }
      console.error("Error fetching orders:", error?.message || error);
    }
  };

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
    columnHelper.accessor("employee", {
      id: "orderFrom",
      header: () => <p className="text-sm font-bold text-gray-600 dark:text-white">EMPLOYEE</p>,
      cell: (info) => <p className="text-sm font-bold text-black-700 dark:text-white">{info.getValue()}</p>,
    }),
    columnHelper.accessor("action", {
      id: "action",
      header: () => <p className="text-sm font-bold text-gray-600 dark:text-white">ACTION</p>,
      cell: (info) => {
        const order = info.row.original;
        return (
          <div className="flex space-x-3">
            {order.status === "pending" ? (
              <>
                <button
                  onClick={() => handleAcceptReject(order.order_id, "accepted")}
                  className="flex items-center bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                >
                  <MdThumbUp className="mr-1" /> Accept
                </button>
                <button
                  onClick={() => handleAcceptReject(order.order_id, "rejected")}
                  className="flex items-center bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  <MdThumbDown className="mr-1" /> Reject
                </button>
              </>
            ) : (
              <p className="text-gray-500 text-sm">
                {order.status === "accepted" ? "accepted" : "rejected"}
              </p>
            )}
          </div>
        );
      },
    }),
  ];

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
    </Card>
  );
}