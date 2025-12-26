import React, { useState, useEffect } from "react";
import axios from "axios";
import Table from "./components/Table";
import Upload from "./components/Upload";
import Storage from "./components/Storage";
import { Search } from "lucide-react";
import EditProductModal from "./components/EditProductModal"; // Import the new modal component
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { toast } from "react-toastify";

const Inventory = ({ userRole }) => {
  const [products, setProducts] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [errors, setErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // For auto-refreshing storage card

  // Fetch products from the API based on user role
  useEffect(() => {
    const fetchProducts = async () => {
      const endpoint = userRole === "admin"
        ? `${process.env.REACT_APP_API_BASE_URL}/superproducts/getall`
        : `${process.env.REACT_APP_API_BASE_URL}/products/getall`;

      try {
        const response = await axios.get(endpoint, {
          withCredentials: true,
        });
        setProducts(response.data.products);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [userRole]);  // Re-fetch products if userRole changes

  // Apply overflow hidden and blur effect when modal is open
  useEffect(() => {
    if (editModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [editModalOpen]);

  // Filter products based on search query
  const filteredProducts = products.filter(
    (product) =>
      product.product_id.toString().includes(searchQuery) ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Validate the form inputs
  const validateForm = () => {
    const newErrors = {};
    const nameRegex = /^[a-zA-Z0-9_\s]+$/;
    const priceRegex = /^(?!0(\.0+)?$)\d+(\.\d+)?$/;
    const stockRegex = /^[0-9]+$/;

    if (!editingProduct.name || !nameRegex.test(editingProduct.name)) {
      newErrors.name = "Name must contain only letters and spaces.";
    }
    if (!editingProduct.price || !priceRegex.test(editingProduct.price)) {
      newErrors.price = "Price must be greater than zero";
    }
    if (!editingProduct.stock || !stockRegex.test(editingProduct.stock)) {
      newErrors.stock = "Stock must be a valid positive number.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save the edited product
  const handleSave = async () => {
    if (!validateForm()) {
      return; // Do not proceed if the form is invalid
    }

    const endpoint = userRole === "admin"
      ? `${process.env.REACT_APP_API_BASE_URL}/superproducts/update/${editingProduct.product_id}`
      : `${process.env.REACT_APP_API_BASE_URL}/products/update/${editingProduct.product_id}`;

    try {
      const response = await axios.put(endpoint, editingProduct, {
        withCredentials: true,
      });

      // Update local state
      setProducts((prevData) =>
        prevData.map((product) =>
          product.product_id === editingProduct.product_id
            ? editingProduct
            : product
        )
      );
      setEditModalOpen(false);
      setEditingProduct(null);
      toast.success("Product updated successfully", { position: "top-right" });
      setRefreshTrigger(prev => prev + 1); // Trigger storage card refresh
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Error saving product";
      const capacityInfo = error.response?.data?.capacityInfo;

      if (capacityInfo) {
        toast.error(
          `${errorMsg}. Current: ${capacityInfo.currentStock}, Limit: ${capacityInfo.storageLimit}, Can add: ${capacityInfo.remainingCapacity} units`,
          { position: "top-right", autoClose: 7000 }
        );
      } else {
        toast.error(errorMsg, { position: "top-right" });
      }
      console.error("Error saving product:", error);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditingProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Delete a product
  const handleDelete = async (productId) => {
    const endpoint = userRole === "admin"
      ? `${process.env.REACT_APP_API_BASE_URL}/superproducts/delete/${productId}`
      : `${process.env.REACT_APP_API_BASE_URL}/products/delete/${productId}`;

    try {
      await axios.delete(endpoint, {
        withCredentials: true,
      });
      setProducts((prevData) =>
        prevData.filter((product) => product.product_id !== productId)
      );
      setRefreshTrigger(prev => prev + 1); // Trigger storage card refresh
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  // Edit a product
  const handleEdit = (product) => {
    setEditingProduct(product);
    setEditModalOpen(true);
  };

  // Close modal if clicked outside
  const handleCloseModal = (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      setEditModalOpen(false);
    }
  };

  // Handle data update from Upload component
  const handleDataUpdate = (newProductData) => {
    setProducts((prevData) => [...prevData, ...newProductData]);
    setRefreshTrigger(prev => prev + 1); // Trigger storage card refresh
  };

  return (
    <div className={`container mx-auto py-8 ${editModalOpen ? "modal-open" : ""}`}>
      <main>
        <div className={`mt-5 grid h-full grid-cols-1 gap-5 md:grid-cols-2`}>
          <Storage userRole={userRole} refreshTrigger={refreshTrigger} />
          <Upload onDataUpdate={handleDataUpdate} userRole={userRole} />
        </div>

        {/* Search Input */}
        <div className="my-4 flex items-center rounded-lg border border-gray-300 bg-white hover:border-brand-500 hover:ring-2 hover:ring-brand-500 focus-within:ring-2 focus-within:ring-brand-500">
          <span className="pl-3 text-gray-400">
            <Search size={20} />
          </span>
          <input
            type="text"
            placeholder="Search by ID or Name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mt-1 w-full rounded-lg border-none bg-white p-2 pl-10 outline-none"
          />
        </div>

        {/* Skeleton Loader for 5 columns */}
        {loading ? (
          <div className="grid grid-cols-5 gap-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex flex-col items-center space-y-3">
                <Skeleton height={30} width={100} /> {/* Heading skeleton */}
                <Skeleton height={20} width={80} />  {/* Product data skeleton */}
                <Skeleton height={20} width={60} />  {/* Product data skeleton */}
                <Skeleton height={20} width={60} />  {/* Product data skeleton */}
                <Skeleton height={20} width={60} />  {/* Product data skeleton */}
                <Skeleton height={20} width={60} />  {/* Product data skeleton */}
                <Skeleton height={20} width={60} />  {/* Product data skeleton */}
                <Skeleton height={20} width={60} />  {/* Product data skeleton */}
                <Skeleton height={20} width={60} />  {/* Product data skeleton */}
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 h-full w-full overflow-auto rounded-lg bg-white dark:bg-black-800">
            <Table
              data={filteredProducts}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        )}
      </main>

      {/* Edit Product Modal */}
      <EditProductModal
        editModalOpen={editModalOpen}
        setEditModalOpen={setEditModalOpen}
        editingProduct={editingProduct}
        handleChange={handleChange}
        errors={errors}
        handleSave={handleSave}
        handleCloseModal={handleCloseModal}
      />
    </div>
  );
};

export default Inventory;
