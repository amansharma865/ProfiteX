import React from "react";

const ChooseOption = ({
  handleManualEntry,
  handleExcelUpload,
  excelData,
  showManualForm,
  loading,
}) => {
  return (
    <>
      {!showManualForm && !excelData && (
        <div className="flex gap-4">
          <button
            onClick={handleManualEntry}
            className="flex-1 rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600 disabled:bg-gray-400"
            disabled={loading}
            aria-label="Enter data manually"
          >
            Enter Manually
          </button>
          <label className="flex-1">
            <span
              className="flex cursor-pointer items-center justify-center rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600 disabled:bg-gray-400"
              aria-label="Upload Excel file"
            >
              Enter with Excel
            </span>
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleExcelUpload}
              disabled={loading}
            />
          </label>
        </div>
      )}
    </>
  );
};

export default ChooseOption;
