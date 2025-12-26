// Upload.js
import { MdFileUpload } from "react-icons/md";
import { X } from "lucide-react";
import Card from "components/card";
import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import ExcelUploadPopup from "./ExcelUploadPopup";
import ManualEntryPopup from "./ManualEntryPopup";
import ChooseOption from "./ChooseOption";
import { toast } from "react-toastify";

const Upload = ({ onDataUpdate, userRole }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [excelData, setExcelData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (showPopup) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [showPopup]);

  const handleAddNowClick = () => setShowPopup(true);
  const handleUploadClick = () => setShowPopup(true);

  const handleClosePopup = () => {
    setShowPopup(false);
    setShowManualForm(false);
    setExcelData(null);
    setError(null);
  };

  const handleManualEntry = () => setShowManualForm(true);

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];

    if (!file) {
      setError("Please select a file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {

        const binaryStr = event.target.result;
        const workbook = XLSX.read(binaryStr, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        if (data && data.length > 0) {

          const requiredFields = ["product_id", "name", "price", "stock"];
          const hasAllFields = requiredFields.every((field) =>
            Object.keys(data[0]).some(
              (key) => key.toLowerCase().replace(/\s+/g, "_") === field
            )
          );

          if (!hasAllFields) {
            setError(
              "Excel file must contain columns for: Product ID, Name, Price, and Stock"
            );
            setExcelData(null);
            return;
          }

          setExcelData(data);
          setError(null);
        } else {
          setError("No valid data found in the Excel file.");
          setExcelData(null);
        }
      } catch (err) {
        setError(
          "Error processing Excel file. Please ensure it's a valid Excel format."
        );
        setExcelData(null);
        console.error(err);
      }
    };

    reader.onerror = () => {
      setError("Error reading the file. Please try again.");
      setExcelData(null);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleSubmitExcel = async () => {
    if (!excelData || excelData.length === 0) {
      setError("No data to submit");
      return;
    }

    try {
      const formattedData = excelData.map((row) => ({
        product_id: row.product_id || row["Product ID"],
        name: row.name || row["Name"],
        price: parseFloat(row.price || row["Price"]) || 0,
        stock: parseInt(row.stock || row["Stock"]) || 0,
      }));

      const isValid = formattedData.every(
        (row) => row.product_id && row.name && row.price > 0 && row.stock >= 0
      );
      if (!isValid) {
        setError(
          "Some rows are missing required fields or have invalid values."
        );
        return;
      }


      setLoading(true);

      // Conditionally set the API URL based on user role
      const apiUrl =
        userRole === "admin"
          ? `${process.env.REACT_APP_API_BASE_URL}/superproducts/upload-excel`
          : `${process.env.REACT_APP_API_BASE_URL}/products/upload-excel`;

      await axios.post(apiUrl, formattedData, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });


      onDataUpdate(formattedData);
      setLoading(false);
      handleClosePopup();

      window.location.reload();
    } catch (err) {
      setLoading(false);
      const errorMsg = err.response?.data?.message || "Error submitting product data";
      const capacityInfo = err.response?.data?.capacityInfo;

      if (capacityInfo) {
        toast.error(
          `${errorMsg}. Current: ${capacityInfo.currentStock}, Limit: ${capacityInfo.storageLimit}, Can add: ${capacityInfo.remainingCapacity} units`,
          { position: "top-right", autoClose: 7000 }
        );
      } else {
        toast.error(errorMsg, { position: "top-right" });
      }
      console.error(err);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Get the form data
    const formData = {
      product_id: e.target.product_id.value,
      name: e.target.name.value,
      price: parseFloat(e.target.price.value),
      stock: parseInt(e.target.stock.value),
    };

    try {
      setLoading(true);

      // Conditionally set the API URL based on user role
      const apiUrl =
        userRole === "admin"
          ? `${process.env.REACT_APP_API_BASE_URL}/superproducts/create`
          : `${process.env.REACT_APP_API_BASE_URL}/products/create`;

      const response = await axios.post(apiUrl, formData, {
        withCredentials: true,
      });

      if (response.status === 200) {
        onDataUpdate([formData]);
        handleClosePopup();
      } else {
        setError(response.data?.message || "Error submitting product data.");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Error submitting product data";
      const capacityInfo = err.response?.data?.capacityInfo;

      if (capacityInfo) {
        toast.error(
          `${errorMsg}. Current: ${capacityInfo.currentStock}, Limit: ${capacityInfo.storageLimit}, Can add: ${capacityInfo.remainingCapacity} units`,
          { position: "top-right", autoClose: 7000 }
        );
      } else {
        toast.error(errorMsg, { position: "top-right" });
      }
    } finally {
      setLoading(false); // Always reset the loading state
    }
  };

  const handleOutsideClick = (e) => {
    if (e.target.id === "popup-overlay") {
      handleClosePopup();
    }
  };

  return (
    <>
      <Card className="grid h-full w-full grid-cols-1 gap-3 rounded-[20px] bg-white bg-clip-border p-3 font-dm shadow-3xl shadow-shadow-500 dark:!bg-black-800 dark:shadow-none 2xl:grid-cols-11">
        <div
          className="col-span-5 h-full w-full rounded-xl bg-lightPrimary dark:!bg-black-700 2xl:col-span-6"
          onClick={handleUploadClick}
        >
          <button className="flex h-full w-full flex-col items-center justify-center rounded-xl border-[2px] border-dashed border-gray-200 py-3 dark:!border-black-700 lg:pb-0">
            <MdFileUpload className="text-[80px] text-brand-500 dark:text-white" />
            <h4 className="text-xl font-bold text-brand-500 dark:text-white">
              Upload Product
            </h4>
            <p className="mt-2 text-sm font-medium text-gray-600">
              Excel files (.xlsx, .xls) are allowed
            </p>
          </button>
        </div>

        <div className="col-span-5 flex h-full w-full flex-col justify-center overflow-hidden rounded-xl bg-white pb-4 pl-3 dark:!bg-black-800">
          <h5 className="text-left text-xl font-bold leading-9 text-black-700 dark:text-white">
            Add your Product here
          </h5>
          <p className="leading-1 mt-2 text-base font-normal text-gray-600">
            Upload your product data through Excel or add manually
          </p>
          <button
            onClick={handleAddNowClick}
            className="linear mt-4 flex items-center justify-center rounded-xl bg-brand-500 px-2 py-2 text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
          >
            Add Now
          </button>
        </div>
      </Card>

      {showPopup && (
        <div
          id="popup-overlay"
          onClick={handleOutsideClick}
          className="bg-black fixed inset-0 z-50 flex items-center justify-center bg-opacity-75 backdrop-blur-sm"
        >
          <div className="relative w-full max-w-md transform rounded-lg bg-white p-6 shadow-xl dark:!bg-black-700">
            <button
              onClick={handleClosePopup}
              className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:bg-black-700 dark:text-gray-400 dark:hover:bg-black-600 dark:hover:text-white"
            >
              <X size={18} />
            </button>

            <h3 className="mb-4 text-xl font-bold text-black-700 dark:!text-white">
              Choose an Option
            </h3>
            <ChooseOption
              handleManualEntry={handleManualEntry}
              handleExcelUpload={handleExcelUpload}
              excelData={excelData}
              showManualForm={showManualForm}
            />

            {showManualForm && (
              <ManualEntryPopup
                handleFormSubmit={handleFormSubmit}
                loading={loading}
                error={error}
                handleClosePopup={handleClosePopup}
              />
            )}

            {excelData && !showManualForm && (
              <ExcelUploadPopup
                excelData={excelData}
                handleSubmitExcel={handleSubmitExcel}
                error={error}
                loading={loading}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Upload;
