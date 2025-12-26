import MiniCalendar from "components/calendar/MiniCalendar";
import WeeklyRevenue from "views/user/default/components/WeeklyRevenue";
import TotalSpent from "views/user/default/components/TotalSpent";
import PieChartCard from "views/user/default/components/PieChartCard";
import LowStockAlert from "views/user/default/components/LowStockAlert";
import { IoMdHome } from "react-icons/io";
import { IoDocuments } from "react-icons/io5";
import { MdBarChart, MdDashboard } from "react-icons/md";

import { columnsDataCheck, columnsDataComplex } from "./variables/columnsData";

import Widget from "components/widget/Widget";
import CheckTable from "views/user/default/components/CheckTable";
// import ComplexTable from "views/user/default/components/ComplexTable";
import tableDataCheck from "./variables/tableDataCheck.json";
import tableDataComplex from "./variables/tableDataComplex.json";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import WeeklyRevenueChart from "./components/WeeklyRevenueChart";
import ComplexTable from '../tables/components/ComplexTable'

const Dashboard = () => {
  const [earnings, setEarning] = useState(0);
  const [userAdmin, setUserAdmin] = useState('admin');
  const [weeklySale, SetWeeklySale] = useState([])
  const [weeklyRevenue, SetWeeklyRevenue] = useState([])
  const [inventorySize, SetInventorySize] = useState({
    totalProduct: 0,
    inventorySize: 0
  });
  const [tableData, setTableData] = useState([]);
  const [orderCount, setOrderCount] = useState(0);
  const [minQuantity, setMinQuantity] = useState(0);
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const [outOfStockCount, setOutOfStockCount] = useState(0);

  useEffect(() => {
    // Check if warehouse was updated since last fetch
    const warehouseLastUpdated = localStorage.getItem('warehouseLastUpdated');
    const shouldRefresh = warehouseLastUpdated && parseInt(warehouseLastUpdated) > lastFetchTime;

    if (shouldRefresh || lastFetchTime === 0) {
      // Clear the flag after reading
      if (warehouseLastUpdated) {
        setLastFetchTime(parseInt(warehouseLastUpdated));
      }
    }

    const handleEarnings = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/invoices/earnings/total-earnings`, { withCredentials: true });
        if (response.data.success == true) {
          setEarning(response.data.earnings);
        }
        else {
          setEarning(0);
        }
      } catch (error) {
        toast.error(error.message);
      }
    }
    const handleAdmin = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/user/admin-details`, {
          withCredentials: true
        });
        if (response.data.success == true) {
          setUserAdmin(response.data.admin.username);
        }
        else {
          setUserAdmin('admin');
        }
      } catch (error) {
        toast.error(error.message);
      }
    }
    const handleWeeklyData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/user/daily-salees`, { withCredentials: true });
        if (response.data.success == true) {
          SetWeeklySale(response.data.data);

        }
      } catch (error) {
        toast.error(error.message);
      }
    }
    const handleMonthlyRevenue = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/user/weekly-revenue`, { withCredentials: true });
        if (response.data.success == true) {
          SetWeeklyRevenue(response.data.data);
        }
      } catch (error) {
        toast.error(error.message);
      }
    }

    const handlePieChart = async () => {
      try {
        const response1 = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/products/total-stocks`, { withCredentials: true });
        const response2 = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/warehouse/get-details`, { withCredentials: true });
        if (response1.data.success == true && response2.data.success == true) {
          SetInventorySize({ totalProduct: Number(response1.data.totalStocks), inventorySize: response2.data.details.storage });
          setMinQuantity(response2.data.details.min_quantity || 0);
        } else {
        }
      } catch (error) {
      }
    }
    const fetchTableData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/order/getorder`, {
          withCredentials: true, // Ensure cookies are sent if needed for authentication
        });

        if (response.data.status === 200) {
          const result = response.data.data;

          // Limit to latest 5 orders for dashboard view
          const latestOrders = result.slice(0, 5);

          const formattedData = latestOrders.map((order) => ({
            order_id: order.order_id,
            item_name: order.product_name,
            date: new Date(order.createdAt).toLocaleDateString("en-US", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
            status: order.status,
            item_quantity: order.product_quantity,
          }));
          setTableData(formattedData); // Set the formatted data in state
        } else {
          console.error("Failed to fetch data:", response.data.message);
        }
      } catch (error) {
        alert("Error fetching data:", error);
      }
    };
    const handleOrderCountPending = async () => {
      try {

        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/order/countOrder-pending-user`, {
          withCredentials: true,
        });
        if (response.data.success == true) {
          setOrderCount(response.data.count);

        }
      } catch (error) {
        setOrderCount(0);
        console.error("Error fetching users:", error);
      }
    };

    const handleOutOfStockCount = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/products/count-out-of-stock`, {
          withCredentials: true,
        });
        if (response.data.success) {
          setOutOfStockCount(response.data.count);
        }
      } catch (error) {
        setOutOfStockCount(0);
        console.error("Error fetching out of stock count:", error);
      }
    };

    handleWeeklyData();
    handleEarnings();
    handleMonthlyRevenue();
    handlePieChart();
    handleAdmin();
    fetchTableData();
    handleOrderCountPending();
    handleOutOfStockCount();
  }, []);
  return (
    <div>
      {/* Low Stock Alert */}
      <LowStockAlert
        totalProduct={inventorySize.totalProduct}
        minQuantity={minQuantity}
      />

      {/* Card widget */}

      <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3 3xl:grid-cols-4">
        <Widget
          icon={<MdBarChart className="h-7 w-7" />}
          title={"Earnings"}
          subtitle={"₹" + earnings}
        />
        <Widget
          icon={<MdDashboard className="h-6 w-6" />}
          title={"Out of Stock Products"}
          subtitle={outOfStockCount}
        />
        <Widget
          icon={<MdBarChart className="h-7 w-7" />}
          title={"Total Orders"}
          subtitle={orderCount}
        />
        <Widget
          icon={<IoMdHome className="h-6 w-6" />}
          title={"Admin"}
          subtitle={userAdmin}
        />
      </div>

      {/* Charts */}

      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
        <WeeklyRevenueChart data={weeklyRevenue} />
        <WeeklyRevenue data={weeklySale} />
      </div>

      {/* Tables & Charts */}

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        {/* Check Table */}
        <div>
          <ComplexTable columnsData={columnsDataComplex} tableData={tableData} />
        </div>

        {/* Traffic chart & Pie Chart */}

        <div className="grid grid-cols-1 gap-5 rounded-[20px] md:grid-cols-1">
          <PieChartCard totalProduct={inventorySize.totalProduct} inventorySize={inventorySize.inventorySize} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

