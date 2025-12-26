import React from "react";
import { MdFileUpload } from "react-icons/md";
import Card from "components/card";

const Upload = ({ onClick }) => { // Receive onClick as a prop
  return (
    <Card className="grid h-full w-full grid-cols-1 gap-3 rounded-[20px] bg-white bg-clip-border p-3 font-dm shadow-3xl shadow-shadow-500 dark:!bg-black-800 dark:shadow-none 2xl:grid-cols-11">
      <div className="col-span-5 h-full w-full rounded-xl bg-lightPrimary dark:!bg-black-700 2xl:col-span-6">
        <button
          className="flex h-full w-full flex-col items-center justify-center rounded-xl border-[2px] border-dashed border-gray-200 py-3 dark:!border-black-700 lg:pb-0"
          onClick={onClick} // Trigger the popup
        >
          <MdFileUpload className="text-[80px] text-brand-500 dark:text-white" />
          <h4 className="text-xl font-bold text-brand-500 dark:text-white">
            Edit Your Profile
          </h4>
          <p className="mt-2 text-sm font-medium text-gray-600">
            Click here to edit your profile
          </p>
        </button>
      </div>

      <div className="col-span-5 flex h-full w-full flex-col justify-center overflow-hidden rounded-xl bg-white pl-3 pb-4 dark:!bg-black-800">
        <h5 className="text-left text-xl font-bold leading-9 text-black-700 dark:text-white">
          Edit Your Profile
        </h5>
        <p className="leading-1 mt-2 text-base font-normal text-gray-600">
          Update your profile information, including personal details, company information, and profile picture. Keep your account information up to date.
        </p>
      </div>
    </Card>
  );
};

export default Upload;
