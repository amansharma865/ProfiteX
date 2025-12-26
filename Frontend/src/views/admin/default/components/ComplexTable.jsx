// import React from "react";
// import CardMenu from "components/card/CardMenu";
// import Card from "components/card";
// import Progress from "components/progress";
// import { MdCancel, MdCheckCircle, MdOutlineError } from "react-icons/md";

// import {
//   createColumnHelper,
//   flexRender,
//   getCoreRowModel,
//   getSortedRowModel,
//   useReactTable,
// } from "@tanstack/react-table";

// const columnHelper = createColumnHelper();

// // const columns = columnsDataCheck;
// export default function ComplexTable(props) {
//   const { tableData } = props;
//   const [sorting, setSorting] = React.useState([]);
//   let defaultData = tableData;
//   const columns = [
//     columnHelper.accessor("name", {
//       id: "name",
//       header: () => (
//         <p className="text-sm font-bold text-gray-600 dark:text-white">NAME</p>
//       ),
//       cell: (info) => (
//         <p className="text-sm font-bold text-black-700 dark:text-white">
//           {info.getValue()}
//         </p>
//       ),
//     }),
//     columnHelper.accessor("status", {
//       id: "status",
//       header: () => (
//         <p className="text-sm font-bold text-gray-600 dark:text-white">
//           STATUS
//         </p>
//       ),
//       cell: (info) => (
//         <div className="flex items-center">
//           {info.getValue() === "Approved" ? (
//             <MdCheckCircle className="text-green-500 me-1 dark:text-green-300" />
//           ) : info.getValue() === "Disable" ? (
//             <MdCancel className="text-red-500 me-1 dark:text-red-300" />
//           ) : info.getValue() === "Error" ? (
//             <MdOutlineError className="text-amber-500 me-1 dark:text-amber-300" />
//           ) : null}
//           <p className="text-sm font-bold text-black-700 dark:text-white">
//             {info.getValue()}
//           </p>
//         </div>
//       ),
//     }),
//     columnHelper.accessor("date", {
//       id: "date",
//       header: () => (
//         <p className="text-sm font-bold text-gray-600 dark:text-white">DATE</p>
//       ),
//       cell: (info) => (
//         <p className="text-sm font-bold text-black-700 dark:text-white">
//           {info.getValue()}
//         </p>
//       ),
//     }),
//     columnHelper.accessor("progress", {
//       id: "progress",
//       header: () => (
//         <p className="text-sm font-bold text-gray-600 dark:text-white">
//           PROGRESS
//         </p>
//       ),
//       cell: (info) => (
//         <div className="flex items-center">
//           <Progress width="w-[108px]" value={info.getValue()} />
//         </div>
//       ),
//     }),
//   ]; // eslint-disable-next-line
//   const [data, setData] = React.useState(() => [...defaultData]);
//   const table = useReactTable({
//     data,
//     columns,
//     state: {
//       sorting,
//     },
//     onSortingChange: setSorting,
//     getCoreRowModel: getCoreRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//     debugTable: true,
//   });
//   return (
//     <Card extra={"w-full h-full px-6 pb-6 sm:overflow-x-auto"}>
//       <div className="relative flex items-center justify-between pt-4">
//         <div className="text-xl font-bold text-black-700 dark:text-white">
//           Order Status
//         </div>
//         <CardMenu />
//       </div>

//       <div className="mt-8 overflow-x-scroll xl:overflow-x-hidden">
//         <table className="w-full">
//           <thead>
//             {table.getHeaderGroups().map((headerGroup) => (
//               <tr key={headerGroup.id} className="!border-px !border-gray-400">
//                 {headerGroup.headers.map((header) => {
//                   return (
//                     <th
//                       key={header.id}
//                       colSpan={header.colSpan}
//                       onClick={header.column.getToggleSortingHandler()}
//                       className="cursor-pointer border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start"
//                     >
//                       <div className="items-center justify-between text-xs text-gray-200">
//                         {flexRender(
//                           header.column.columnDef.header,
//                           header.getContext()
//                         )}
//                         {{
//                           asc: "",
//                           desc: "",
//                         }[header.column.getIsSorted()] ?? null}
//                       </div>
//                     </th>
//                   );
//                 })}
//               </tr>
//             ))}
//           </thead>
//           <tbody>
//             {table
//               .getRowModel()
//               .rows.slice(0, 5)
//               .map((row) => {
//                 return (
//                   <tr key={row.id}>
//                     {row.getVisibleCells().map((cell) => {
//                       return (
//                         <td
//                           key={cell.id}
//                           className="min-w-[150px] border-white/0 py-3  pr-4"
//                         >
//                           {flexRender(
//                             cell.column.columnDef.cell,
//                             cell.getContext()
//                           )}
//                         </td>
//                       );
//                     })}
//                   </tr>
//                 );
//               })}
//           </tbody>
//         </table>
//       </div>
//     </Card>
//   );
// }









































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
  const [processingOrders, setProcessingOrders] = useState(new Set()); // Track which orders are being processed

  useEffect(() => {
    setData([...tableData]);
  }, [tableData]);

  const handleAcceptReject = async (orderId, action) => {
    // Prevent double-click
    if (processingOrders.has(orderId)) {
      return; // Already processing this order
    }

    // Mark this order as processing
    setProcessingOrders(prev => new Set([...prev, orderId]));

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/order/updateorder`,
        {
          adminOutput: action,
          orderId: orderId,
        },
        {
          withCredentials: true,
          validateStatus: (status) => status < 500,
        }
      );

      if (response.status >= 200 && response.status < 300 && response.data?.success !== false) {
        await fetchOrders();
        setTimeout(() => window.location.reload(), 2000);
        toast.success(`Order ${action}ed successfully!`);
        return;
      }

      const serverMessage = response?.data?.message || response?.data?.error || `Failed to ${action} the order.`;
      toast.error(serverMessage);
    } catch (err) {
      toast.error(`Error ${action}ing the order.`);
    } finally {
      // Remove from processing set (in case of error and no reload)
      setProcessingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
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
        const isProcessing = processingOrders.has(order.order_id);
        return (
          <div className="flex space-x-3">
            {order.status === "pending" ? (
              <>
                <button
                  onClick={() => handleAcceptReject(order.order_id, "accepted")}
                  disabled={isProcessing}
                  className={`flex items-center px-2 py-1 rounded ${isProcessing
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-500 hover:bg-green-600'
                    } text-white`}
                >
                  <MdThumbUp className="mr-1" /> {isProcessing ? 'Processing...' : 'Accept'}
                </button>
                <button
                  onClick={() => handleAcceptReject(order.order_id, "rejected")}
                  disabled={isProcessing}
                  className={`flex items-center px-2 py-1 rounded ${isProcessing
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-red-500 hover:bg-red-600'
                    } text-white`}
                >
                  <MdThumbDown className="mr-1" /> {isProcessing ? 'Processing...' : 'Reject'}
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