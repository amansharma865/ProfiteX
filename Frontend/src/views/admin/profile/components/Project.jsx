import React from "react";
import { MdModeEditOutline } from "react-icons/md";
import image1 from "assets/img/profile/image1.png";
import image2 from "assets/img/profile/image2.png";
import image3 from "assets/img/profile/image3.png";
import Card from "components/card";

const Project = () => {
  return (
    <Card extra={"w-full p-4 h-full"}>
      <div className="mb-8 w-full">
        <h4 className="text-xl font-bold text-black-700 dark:text-white">
          All Warehouses
        </h4>
        <p className="mt-2 text-base text-gray-600">
          Here you can find more details about your warehouses. Keep your inventory managed by having all the essential information at your fingertips.
        </p>
      </div>
      {/* Warehouse 1 */}
      <div className="flex w-full items-center justify-between rounded-2xl bg-white p-3 shadow-3xl shadow-shadow-500 dark:!bg-black-700 dark:shadow-none">
        <div className="flex items-center">
          <div className="">
            <img className="h-[83px] w-[83px] rounded-lg" src={image1} alt="Warehouse 1" />
          </div>
          <div className="ml-4">
            <p className="text-base font-medium text-black-700 dark:text-white">
              Main Warehouse - New York
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Warehouse #1 .
              <a
                className="ml-1 font-medium text-brand-500 hover:text-brand-500 dark:text-white"
                href=" "
              >
                See warehouse details
              </a>
            </p>
          </div>
        </div>
        <div className="mr-4 flex items-center justify-center text-gray-600 dark:text-white">
          <MdModeEditOutline />
        </div>
      </div>
      {/* Warehouse 2 */}
      <div className="mt-3 flex w-full items-center justify-between rounded-2xl bg-white p-3 shadow-3xl shadow-shadow-500 dark:!bg-black-700 dark:shadow-none">
        <div className="flex items-center">
          <div className="">
            <img className="h-[83px] w-[83px] rounded-lg" src={image2} alt="Warehouse 2" />
          </div>
          <div className="ml-4">
            <p className="text-base font-medium text-black-700 dark:text-white">
              Secondary Warehouse - Los Angeles
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Warehouse #2 .
              <a
                className="ml-1 font-medium text-brand-500 hover:text-brand-500 dark:text-white"
                href=" "
              >
                See warehouse details
              </a>
            </p>
          </div>
        </div>
        <div className="mr-4 flex items-center justify-center text-gray-600 dark:text-white">
          <MdModeEditOutline />
        </div>
      </div>
      {/* Warehouse 3 */}
      <div className="mt-3 flex w-full items-center justify-between rounded-2xl bg-white p-3 shadow-3xl shadow-shadow-500 dark:!bg-black-700 dark:shadow-none">
        <div className="flex items-center">
          <div className="">
            <img className="h-[83px] w-[83px] rounded-lg" src={image3} alt="Warehouse 3" />
          </div>
          <div className="ml-4">
            <p className="text-base font-medium text-black-700 dark:text-white">
              Satellite Warehouse - Miami
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Warehouse #3 .
              <a
                className="ml-1 font-medium text-brand-500 hover:text-brand-500 dark:text-white"
                href=" "
              >
                See warehouse details
              </a>
            </p>
          </div>
        </div>
        <div className="mr-4 flex items-center justify-center text-gray-600 dark:text-white">
          <MdModeEditOutline />
        </div>
      </div>
    </Card>
  );
};

export default Project;
