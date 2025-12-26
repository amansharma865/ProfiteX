import React, { useState, useEffect } from "react";
import Card from "components/card";
import CardMenu from "components/card/CardMenu";
import { BsCloudCheck } from "react-icons/bs";
import axios from "axios";
import { toast } from "react-toastify";

const Storage = ({ userRole, onUpdate, refreshTrigger }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    minProducts: "",
    inventorySize: "",
  });
  const [warehouseData, setWarehouseData] = useState({
    storage: 0,
    min_quantity: 0
  });
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch warehouse details on mount and when refreshTrigger changes
  useEffect(() => {
    const fetchWarehouseData = async () => {
      try {
        const endpoint = userRole === "admin"
          ? `${process.env.REACT_APP_API_BASE_URL}/warehouse/get-details-admin`
          : `${process.env.REACT_APP_API_BASE_URL}/warehouse/get-details`;
        const response = await axios.get(endpoint, { withCredentials: true });
        if (response.data.success) {
          setWarehouseData(response.data.details);
        }
      } catch (error) {
        console.error("Error fetching warehouse data:", error);
      }
    };
    fetchWarehouseData();
  }, [userRole, refreshTrigger]); // Added refreshTrigger to dependencies

  // Fetch total products on mount and when refreshTrigger changes
  useEffect(() => {
    const fetchTotalProducts = async () => {
      try {
        const endpoint = userRole === "admin"
          ? `${process.env.REACT_APP_API_BASE_URL}/superproducts/get-superProduct-stocks`
          : `${process.env.REACT_APP_API_BASE_URL}/products/total-stocks`;
        const response = await axios.get(endpoint, { withCredentials: true });
        if (response.data.success) {
          setTotalProducts(response.data.totalStocks || 0);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching total products:", error);
        setLoading(false);
      }
    };
    fetchTotalProducts();
  }, [userRole, refreshTrigger]); // Added refreshTrigger to dependencies

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endPoint = userRole === "admin"
        ? `${process.env.REACT_APP_API_BASE_URL}/warehouse/enter-details-admin`
        : `${process.env.REACT_APP_API_BASE_URL}/warehouse/enter-details`;
      const response = await axios.post(endPoint, { min_val: formData.minProducts, storage: formData.inventorySize }, { withCredentials: true });
      if (response.data.success == true) {
        // Check if there's a warning
        if (response.data.warning) {
          toast.warning(response.data.message, {
            autoClose: 7000, // Show for 7 seconds
            position: "top-right"
          });
        } else {
          toast.success(response.data.message, { position: "top-right" });
        }
        // Update local state with new values
        setWarehouseData({
          storage: parseInt(formData.inventorySize),
          min_quantity: parseInt(formData.minProducts)
        });
        // Notify dashboard to refresh via localStorage
        localStorage.setItem('warehouseLastUpdated', Date.now().toString());
        // Call parent callback if provided
        if (onUpdate) {
          onUpdate();
        }
      }
      else {
        toast.error(response.data.message, { position: "top-right" });
      }
      handleCloseModal();
    } catch (error) {
      toast.error(error.message, { position: "top-right" });
      return;
    }

  };

  return (
    <>
      {/* Storage Card */}
      <Card
        extra={"w-full h-full p-4 cursor-pointer"}
        onClick={handleOpenModal}
      >
        <div className="ml-auto">
          <CardMenu />
        </div>
        {/* Storage Content */}
        <div className="mb-auto flex flex-col items-center justify-center">
          <div className="mt-2 flex items-center justify-center rounded-full bg-lightPrimary p-[26px] text-5xl font-bold text-brand-500 dark:!bg-black-700 dark:text-white">
            <BsCloudCheck />
          </div>
          <h4 className="mb-px mt-3 text-2xl font-bold text-black-700 dark:text-white">
            Warehouse Capacity
          </h4>
          <p className="px-5 text-center text-base font-normal text-gray-600 md:!px-0 xl:!px-8">
            Monitor your inventory storage capacity and set limits
          </p>
        </div>
        {/* Progress Bar */}
        <div className="flex flex-col">
          <div className="flex justify-between">
            {loading ? (
              <>
                <p className="text-sm font-medium text-gray-400">Loading...</p>
                <p className="text-sm font-medium text-gray-400">Loading...</p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-gray-600">
                  {totalProducts} units
                </p>
                <p className="text-sm font-medium text-gray-600">
                  {warehouseData.storage || 0} units
                </p>
              </>
            )}
          </div>
          <div className="mt-2 flex h-3 w-full items-center rounded-full bg-lightPrimary dark:!bg-black-700">
            <span
              className="h-full rounded-full bg-brand-500 dark:!bg-white transition-all duration-300"
              style={{
                width: `${warehouseData.storage > 0 ? Math.min((totalProducts / warehouseData.storage) * 100, 100) : 0}%`
              }}
            />
          </div>
        </div>
      </Card>

      {/* Modal Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white dark:!bg-black-700 p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-bold text-gray-800 dark:!text-white">
              Set Inventory Details
            </h2>
            <form onSubmit={handleSubmit}>
              {/* Minimum Products Input */}
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:!text-gray-400">
                  Minimum Products in Inventory
                </label>
                <input
                  type="number"
                  name="minProducts"
                  value={formData.minProducts}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-black-700 text-gray-900 dark:text-white p-2 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
                  placeholder="Enter minimum products"
                  required
                />
              </div>

              {/* Inventory Size Input */}
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:!text-gray-400">
                  Inventory Size (in units)
                </label>
                <input
                  type="number"
                  name="inventorySize"
                  value={formData.inventorySize}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-black-700 text-gray-900 dark:text-white p-2 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
                  placeholder="Enter inventory size (0 for unlimited)"
                  required
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="mr-2 rounded-md bg-gray-300 dark:bg-gray-600 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-500">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-green-700 dark:bg-green-600 px-4 py-2 text-white hover:bg-green-600 dark:hover:bg-green-500">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Storage;
