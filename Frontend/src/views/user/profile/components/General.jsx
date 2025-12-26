import React from "react";
import { MdModeEditOutline } from "react-icons/md";
import Card from "components/card";

const General = ({values}) => {
  return (
    <Card extra={"w-full p-4 h-full"}>
      <div className="mb-8 w-full">
        <h4 className="text-xl font-bold text-black-700 dark:text-white">
          User Information
        </h4>
        <p className="mt-2 text-base text-gray-600">
          Here you can find detailed information about the user. Make sure all the data is up to date and accurate.
        </p>
      </div>
      {/* Full Name */}
      <div className="flex w-full items-center justify-between rounded-2xl bg-white p-3 shadow-3xl shadow-shadow-500 dark:!bg-black-700 dark:shadow-none">
        <div className="flex items-center">
          <div className="ml-4">
            <p className="text-base font-medium text-black-700 dark:text-white">
              Full Name: {values.user_username}
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Full legal name of the user.
            </p>
          </div>
        </div>
        <div className="mr-4 flex items-center justify-center text-gray-600 dark:text-white">
          <MdModeEditOutline />
        </div>
      </div>
      {/* Email */}
      <div className="mt-3 flex w-full items-center justify-between rounded-2xl bg-white p-3 shadow-3xl shadow-shadow-500 dark:!bg-black-700 dark:shadow-none">
        <div className="flex items-center">
          <div className="ml-4">
            <p className="text-base font-medium text-black-700 dark:text-white">
              Email: {values.user_email}
            </p>
            <p className="mt-2 text-sm text-gray-600">
              User's primary email address.
            </p>
          </div>
        </div>
        <div className="mr-4 flex items-center justify-center text-gray-600 dark:text-white">
          <MdModeEditOutline />
        </div>
      </div>
      {/* Mobile Number */}
      <div className="mt-3 flex w-full items-center justify-between rounded-2xl bg-white p-3 shadow-3xl shadow-shadow-500 dark:!bg-black-700 dark:shadow-none">
        <div className="flex items-center">
          <div className="ml-4">
            <p className="text-base font-medium text-black-700 dark:text-white">
              Mobile Number: {values.user_phone_number}
            </p>
            <p className="mt-2 text-sm text-gray-600">
              User's primary contact number.
            </p>
          </div>
        </div>
        <div className="mr-4 flex items-center justify-center text-gray-600 dark:text-white">
          <MdModeEditOutline />
        </div>
      </div>
      {/* Company Name */}
      <div className="mt-3 flex w-full items-center justify-between rounded-2xl bg-white p-3 shadow-3xl shadow-shadow-500 dark:!bg-black-700 dark:shadow-none">
        <div className="flex items-center">
          <div className="ml-4">
            <p className="text-base font-medium text-black-700 dark:text-white">
              Company Name: {values.user_company_name}
            </p>
            <p className="mt-2 text-sm text-gray-600">
              The company the user is associated with.
            </p>
          </div>
        </div>
        <div className="mr-4 flex items-center justify-center text-gray-600 dark:text-white">
          <MdModeEditOutline />
        </div>
      </div>
      {/* PAN Number */}
      {/* <div className="mt-3 flex w-full items-center justify-between rounded-2xl bg-white p-3 shadow-3xl shadow-shadow-500 dark:!bg-black-700 dark:shadow-none">
        <div className="flex items-center">
          <div className="ml-4">
            <p className="text-base font-medium text-black-700 dark:text-white">
              PAN Number: ABCDE1234F
            </p>
            <p className="mt-2 text-sm text-gray-600">
              User's Permanent Account Number (PAN) for tax purposes.
            </p>
          </div>
        </div>
        <div className="mr-4 flex items-center justify-center text-gray-600 dark:text-white">
          <MdModeEditOutline />
        </div>
      </div> */}
      {/* GST Number */}
      {/* <div className="mt-3 flex w-full items-center justify-between rounded-2xl bg-white p-3 shadow-3xl shadow-shadow-500 dark:!bg-black-700 dark:shadow-none">
        <div className="flex items-center">
          <div className="ml-4">
            <p className="text-base font-medium text-black-700 dark:text-white">
              GST Number: 22ABCDE1234F2Z5
            </p>
            <p className="mt-2 text-sm text-gray-600">
              User's Goods and Services Tax Identification Number (GSTIN).
            </p>
          </div>
        </div>
        <div className="mr-4 flex items-center justify-center text-gray-600 dark:text-white">
          <MdModeEditOutline />
        </div>
      </div> */}
      {/* Company ID */}
      <div className="mt-3 flex w-full items-center justify-between rounded-2xl bg-white p-3 shadow-3xl shadow-shadow-500 dark:!bg-black-700 dark:shadow-none">
        <div className="flex items-center">
          <div className="ml-4">
            <p className="text-base font-medium text-black-700 dark:text-white">
              Company ID: {values.user_username}
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Unique ID assigned to the user's company.
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

export default General;
