


import React from "react";
import Card from "components/card";
import BarChart from "components/charts/BarChart";
import { MdBarChart } from "react-icons/md";

const WeeklyRevenue = ({ data }) => {
  // Debug: Verify the received data

  // Handle cases with no data
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <Card extra="flex flex-col bg-white w-full rounded-3xl py-6 px-2 text-center">
        <h2 className="text-lg font-bold text-black-700 dark:text-white">
          No data available to display
        </h2>
      </Card>
    );
  }

  // Prepare chart data
  const chartData = [
    {
      name: "Products Sold",
      data: data.map((entry) => entry.totalQuantity || 0),
    },
  ];

  // Chart configuration
  const chartOptions = {
    chart: {
      type: "bar",
      height: 350,
      toolbar: {
        show: false, // Simplifies the UI
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "45%",
        borderRadius: 8,
      },
    },
    colors: ["#34a853"], // Use a single primary color for simplicity
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: data.map((entry) => entry.date),
      title: {
        text: "Date",
        style: { color: "#888", fontSize: "14px" },
      },
      labels: {
        style: { colors: "#555", fontSize: "12px" },
      },
    },
    yaxis: {
      title: {
        text: "Number of Products Sold",
        style: { color: "#888", fontSize: "14px" },
      },
      labels: {
        style: { colors: "#555", fontSize: "12px" },
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        gradientToColors: ["#a7f3d0"], // Smooth gradient
        stops: [0, 100],
      },
    },
    grid: {
      borderColor: "#eee",
      strokeDashArray: 4,
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} Products`,
      },
    },
  };

  return (
    <Card extra="flex flex-col bg-white w-full rounded-3xl py-6 px-4 text-center">
      <div className="flex items-center justify-between px-6">
        <h2 className="text-lg font-bold text-black-700 dark:text-white">
          Weekly Products Sold
        </h2>
        <button className="flex items-center justify-center rounded-lg bg-lightPrimary p-2 text-brand-500 transition duration-200 hover:bg-gray-100 active:bg-gray-200 dark:bg-black-700 dark:text-white dark:hover:bg-white/20 dark:active:bg-white/10">
          <MdBarChart className="h-6 w-6" />
        </button>
      </div>
      <div className="mt-6">
        <div className="h-[250px] w-full xl:h-[350px]">
          <BarChart chartData={chartData} chartOptions={chartOptions} />
        </div>
      </div>
    </Card>
  );
};

export default WeeklyRevenue;
