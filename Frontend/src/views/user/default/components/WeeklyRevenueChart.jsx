import React from "react";
import { MdBarChart } from "react-icons/md";
// Importing ReactApexChart directly for React.js
import ReactApexChart from "react-apexcharts";

const WeeklyRevenueChart = ({ data }) => {
  // Extract weeks and revenue data from the props
  const categories = data.map((entry) => entry.week); // X-axis categories (weeks)
  const revenueData = data.map((entry) => entry.totalRevenue); // Y-axis data (total revenue)

  // Chart configuration
  const chartOptions = {
    chart: {
      type: "area", // Keep the chart type as area
      height: 350, // Chart height
      toolbar: { show: false }, // Hide the toolbar for a cleaner look
    },
    title: {
      text: "Weekly Revenue",
      align: "center",
      style: { fontSize: "16px", color: "#333" },
    },
    xaxis: {
      categories, // Map weeks as x-axis labels
      title: { text: "Weeks", style: { color: "#888", fontSize: "14px" } },
      labels: { style: { colors: "#555", fontSize: "12px" } },
    },
    yaxis: {
      title: { text: "Revenue", style: { color: "#888", fontSize: "14px" } },
      labels: { style: { colors: "#555", fontSize: "12px" } },
    },
    dataLabels: {
      enabled: false, // Disable data labels for simplicity
    },
    stroke: {
      curve: "smooth", // Smooth curve for the area line
      colors: ["#10B981"], // Darker green color for the line
    },
    fill: {
      type: "gradient", // Set a gradient fill for the area chart
      gradient: {
        shade: "light",
        gradientToColors: ["#34D399"], // Lighter green for the gradient effect
        shadeIntensity: 1,
        type: "vertical",
        opacityFrom: 0.6,
        opacityTo: 0.1,
        stops: [0, 100],
      },
    },
    colors: ["#10B981"], // Set a smooth green color for the line and gradient fill
    tooltip: {
      y: {
        formatter: (value) => `$${value.toFixed(2)}`, // Format tooltip values as currency
      },
    },
  };

  const series = [
    {
      name: "Revenue",
      data: revenueData, // Revenue data for the chart
    },
  ];

  return (
    <div className="flex flex-col bg-white p-6 rounded-xl shadow-lg dark:!bg-black-800 dark:text-white dark:shadow-none">
      {/* Header with the MdBarChart icon */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white">Weekly Revenue</h2>
        <button className="flex items-center justify-center rounded-lg bg-lightPrimary p-2 text-brand-500 transition duration-200 hover:bg-gray-100 active:bg-gray-200 dark:bg-black-700 dark:text-white dark:hover:bg-white/20 dark:active:bg-white/10">
          <MdBarChart className="h-6 w-6" />
        </button>
      </div>

      {/* Chart area */}
      <div className="h-[350px] w-full">
        <ReactApexChart options={chartOptions} series={series} type="area" height={350} />
      </div>
    </div>
  );
};

export default WeeklyRevenueChart;
