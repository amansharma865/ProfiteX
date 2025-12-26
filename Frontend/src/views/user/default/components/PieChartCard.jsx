import React from "react";
import PieChart from "components/charts/PieChart";
import Card from "components/card";

const PieChartCard = ({ totalProduct, inventorySize }) => {
  const total = Number(totalProduct) || 0;
  const size = Number(inventorySize) || 1;

  const inventoryOccupied = ((total / size) * 100).toFixed(2);
  const emptySpace = (100 - inventoryOccupied).toFixed(2);

  const pieChartData = [Number(inventoryOccupied), Number(emptySpace)];
  const pieChartOptions = {
    chart: {
      type: "pie",
      height: 430,
    },
    colors: ["#10b981", "#86f0a6"], // Colors for the chart
    dataLabels: {
      enabled: false, // Disable data labels
    },
    tooltip: {
      enabled: false, // Disable tooltips
    },
    legend: {
      show: false, // Hide legends
    },
  };

  return (
    <Card extra="rounded-[20px] p-6 bg-white dark:bg-black-700">
      <div className="flex flex-col items-center justify-center">
        <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
          Inventory Stats
        </h4>

        <div className="relative flex items-center justify-center w-full h-[220px]">
          {pieChartData.every((value) => !isNaN(value)) ? (
            <PieChart options={pieChartOptions} series={pieChartData} />
          ) : (
            <p className="text-gray-600">Invalid data for chart</p>
          )}
        </div>

        <div className="mt-6 flex w-full justify-between">
          <div className="flex items-center">
            <div
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: "#10b981" }}
            ></div>
            <span className="ml-2 text-sm font-medium text-gray-600 dark:text-white">
              Inventory Occupied:{" "}
              <strong>{inventoryOccupied}%</strong>
            </span>
          </div>
          <div className="flex items-center">
            <div
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: "#86f0a6" }}
            ></div>
            <span className="ml-2 text-sm font-medium text-gray-600 dark:text-white">
              Empty Space: <strong>{emptySpace}%</strong>
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PieChartCard;
