import React, {
  useState,
  useEffect,
  useRef,
  Fragment,
  useCallback,
} from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  EyeIcon,
  DownloadIcon,
  TrashIcon,
  PlusIcon,
  SearchIcon,
  UploadIcon,
} from "@heroicons/react/outline";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import img from '../../../assets/favicon.png'
import InvoiceDownloadModal from "./components/InvoiceDownloadModal";
// API Client with Axios
const api = axios.create({
  baseURL: `${process.env.REACT_APP_API_BASE_URL}/`,
  withCredentials: true,
});

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusColors = {
    PAID: "bg-green-100 text-green-800",
    PENDING: "bg-yellow-100 text-yellow-800",
    OVERDUE: "bg-red-100 text-red-800",
    DRAFT: "bg-gray-100 text-gray-800",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColors[status] || statusColors.DRAFT
        }`}
    >
      {status}
    </span>
  );
};

const CreateInvoiceForm = ({ onSuccess }) => {
  const [products, setProducts] = useState([]);
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [items, setItems] = useState([
    { product: "", quantity: 1, unitPrice: 0, totalPrice: 0 },
  ]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [logo, setLogo] = useState(null);
  const logoInputRef = useRef(null);

  const [responseId, setResponseId] = React.useState("");
  const [responseState, setResponseState] = React.useState([]);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [generatedInvoiceData, setGeneratedInvoiceData] = useState(null);

  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");

      script.src = src;

      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };

      document.body.appendChild(script);
    });
  };

  const handleRazorpayScreen = async (amount, onPaymentSuccess) => {
    try {
      // If developer wants to skip real checkout in local dev, mock a payment response
      // const DEV_SKIP = process.env.REACT_APP_DEV_SKIP_CHECKOUT === "true";
      // if (DEV_SKIP) {
      //   const mockId = `dev_mock_${Date.now()}`;
      //   setResponseId(mockId);
      //   toast.info("DEV_SKIP_CHECKOUT enabled: skipping Razorpay UI and mocking success.");
      //   if (onPaymentSuccess) onPaymentSuccess({ razorpay_payment_id: mockId });
      //   return;
      // }
      // Load the Razorpay script dynamically
      const res = await loadScript(
        "https://checkout.razorpay.com/v1/checkout.js"
      );

      // If Razorpay script fails to load, show an alert and return
      if (!res) {
        alert("Some error occurred while loading the Razorpay screen");
        return;
      }

      // Configure Razorpay payment options
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID, // Razorpay test key
        amount: amount * 100, // Amount in paise
        currency: "INR", // Currency INR
        name: "PROFITEX", // Merchant name
        description: "Payment to PROFITEX", // Description of payment
        image: process.env.REACT_APP_MERCHANT_LOGO_URL || img, // Merchant logo (public HTTPS recommended)
        handler: function (response) {
          // Capture the Razorpay payment ID upon successful payment
          setResponseId(response.razorpay_payment_id);
          toast.success("Payment successful!"); // Show success toast

          // Call the callback function to create the invoice
          if (onPaymentSuccess) {
            onPaymentSuccess(response); // Pass the response to the callback
          }
        },
        prefill: {
          name: "ProfiteX", // User's name
          email: "ProfiteX@gmail.com", // User's email
        },
        theme: {
          color: "#166534", // Customize theme color
        },
      };

      // Create a Razorpay payment object with the provided options
      const paymentObject = new window.Razorpay(options);

      // Open the Razorpay payment window
      paymentObject.open();
    } catch (error) {
      // Handle any errors that occur during the process
      console.error("Error loading Razorpay payment screen:", error);
      toast.error("Failed to load Razorpay payment screen");
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get(
          `${process.env.REACT_APP_API_BASE_URL}/products/getall`,
          { withCredentials: true }
        );
        if (response.data.products.length > 0) {
          setProducts(response.data.products);
        } else if (response.data.products.length == 0) {
          toast.error("first add products to your inventory");
        } else {
          toast.error("Unexpected product data format");
        }
      } catch (error) {
        console.error("Error fetching products", error);
        toast.error("Failed to fetch products");
      }
    };
    fetchProducts();
  }, []);

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;

    if (field === "product") {
      const selectedProduct = products.find((p) => p._id === value);
      if (selectedProduct) {
        newItems[index].unitPrice = selectedProduct.price;
        newItems[index].maxQuantity = selectedProduct.stock;
      } else {
        newItems[index].unitPrice = 0;
        newItems[index].maxQuantity = 1;
      }
    }

    if (field === "quantity") {
      // Allow empty or invalid values temporarily while editing
      if (value === "" || value === null || value === undefined) {
        newItems[index].quantity = "";
      } else {
        const parsedQuantity = parseInt(value);
        const maxQuantity = newItems[index].maxQuantity || 1;

        if (isNaN(parsedQuantity) || parsedQuantity < 1) {
          newItems[index].quantity = "";
        } else {
          newItems[index].quantity = Math.min(parsedQuantity, maxQuantity);
        }
      }
    }

    // Calculate total price (treat empty quantity as 0 for calculation)
    const qty = newItems[index].quantity === "" ? 0 : newItems[index].quantity;
    newItems[index].totalPrice = qty * newItems[index].unitPrice;

    const newTotalAmount = newItems.reduce(
      (sum, item) => {
        const itemQty = item.quantity === "" ? 0 : item.quantity;
        return sum + (itemQty * item.unitPrice);
      },
      0
    );

    setItems(newItems);
    setTotalAmount(newTotalAmount);
  };

  const addItem = () => {
    setItems([
      ...items,
      { product: "", quantity: 1, unitPrice: 0, totalPrice: 0 },
    ]);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    const newTotalAmount = newItems.reduce(
      (sum, item) => sum + item.totalPrice,
      0
    );
    setTotalAmount(newTotalAmount);
  };

  // const validateForm = () => {
  //   // Check if the name is empty or invalid
  //   if (!customer.name || customer.name.length>20) {
  //     toast.error("Customer name is required");
  //     return false;
  //   }

  //   // Check if the name contains only letters and spaces
  //   const nameRegex = /^[a-zA-Z\s]+$/;
  //   if (!nameRegex.test(customer.name)) {
  //     toast.error("Customer name must contain only letters");
  //     return false;
  //   }

  //   // Check if at least one item is added
  //   if (items.length === 0) {
  //     toast.error("Please add at least one item");
  //     return false;
  //   }

  //   // Check if all items have a selected product
  //   const invalidItems = items.some((item) => !item.product);
  //   if (invalidItems) {
  //     toast.error("Please select a product for all items");
  //     return false;
  //   }

  //   // Check if quantities are valid and within stock limits
  //   const invalidQuantities = items.some((item) => {
  //     const product = products.find((p) => p._id === item.product);
  //     return !product || item.quantity > product.stock;
  //   });
  //   if (invalidQuantities) {
  //     toast.error("Invalid product quantities or insufficient stock");
  //     return false;
  //   }

  //   return true;
  // };

  const validateForm = () => {
    // Check if the name is empty or invalid
    if (!customer.name || customer.name.trim() === "") {
      toast.error("Customer name is required and cannot be just spaces");
      return false;
    }

    // Trim leading/trailing spaces and replace multiple spaces between words with a single space
    const trimmedName = customer.name.trim().replace(/\s+/g, " ");

    if (trimmedName.length > 20) {
      toast.error("Customer name should be less than 20 characters.");
      return false;
    }

    // Check if the name contains only letters and spaces
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(trimmedName)) {
      toast.error("Customer name must contain only letters");
      return false;
    }

    // Check if at least one item is added
    if (items.length === 0) {
      toast.error("Please add at least one item");
      return false;
    }

    // Check if all items have a selected product
    const invalidItems = items.some((item) => !item.product);
    if (invalidItems) {
      toast.error("Please select a product for all items");
      return false;
    }

    // Check if quantities are valid and within stock limits
    const invalidQuantities = items.some((item) => {
      const product = products.find((p) => p._id === item.product);
      return !product || item.quantity > product.stock;
    });
    if (invalidQuantities) {
      toast.error("Invalid product quantities or insufficient stock");
      return false;
    }

    return true;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate the form before proceeding
    if (!validateForm()) {
      return;
    }

    try {
      // Prepare the invoice data
      const invoiceData = {
        customer: {
          name: customer.name,
          email: customer.email || "",
          phone: customer.phone || "",
          address: customer.address || "",
        },
        items: items.map((item) => ({
          product: item.product,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        })),
        subtotal: totalAmount,
        totalAmount: totalAmount,
        status: "PAID", // Status is "PAID" because it's only set after successful payment
      };

      // Call Razorpay payment screen and pass the callback to create the invoice after payment
      await handleRazorpayScreen(totalAmount, async (paymentResponse) => {
        // After successful payment, create the invoice
        await api.post("/invoices/create-invoice", invoiceData, {
          withCredentials: true,
        });

        setGeneratedInvoiceData(invoiceData);
        setShowDownloadModal(true);
        // Show success notification
        toast.success("Invoice created successfully");
        // Trigger the success callback
        onSuccess();
      });

    } catch (error) {
      // Log the error and show error notification
      console.error("Error creating invoice:", error);

      const errorMessage =
        error.response?.data?.message || "Failed to create invoice";
      toast.error(errorMessage);
    }
  };


  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white dark:!bg-black-700"
      >
        <div className="mb-8 flex items-center justify-between ">
          <h2 className="text-3xl font-bold text-gray-800 dark:!text-white">
            Create Invoice
          </h2>

          <div className="flex items-center">
            <input
              type="file"
              ref={logoInputRef}
              onChange={handleLogoUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => logoInputRef.current.click()}
              className="flex items-center rounded-md bg-green-800 px-4 py-2 text-white hover:bg-green-700"
            >
              <UploadIcon className="mr-2 h-5 w-5" />
              Upload Logo
            </button>
            {logo && (
              <img
                src={logo}
                alt="Company Logo"
                className="ml-4 h-16 w-16 object-contain"
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:!text-gray-400">
              Customer Name *
            </label>
            <input
              type="text"
              placeholder="Enter customer name"
              value={customer.name}
              onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-200"
              required
            />
          </div>
        </div>

        <div className="rounded-md bg-gray-50 p-4 dark:!bg-black-800">
          <div className="mb-4 grid grid-cols-6 gap-4 font-semibold text-gray-700 dark:!text-gray-400">
            <div className="col-span-3">Product</div>
            <div>Quantity</div>
            <div>Unit Price</div>
            <div>Total Price</div>
          </div>

          {items.map((item, index) => (
            <div key={index} className="mb-3 grid grid-cols-6 items-center gap-4">
              <div className="col-span-3">
                <select
                  value={item.product}
                  onChange={(e) => updateItem(index, "product", e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-700"
                  required
                >
                  <option value="">Select Product</option>
                  {products.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.name} (Stock: {product.stock})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(index, "quantity", e.target.value)
                  }
                  onFocus={(e) => e.target.select()}
                  onKeyPress={(e) => {
                    // Prevent non-numeric characters (allow only numbers)
                    if (!/[0-9]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onBlur={(e) => {
                    // When user leaves field, ensure it's at least 1
                    if (!e.target.value || parseInt(e.target.value) < 1) {
                      updateItem(index, "quantity", "1");
                    }
                  }}
                  min="1"
                  max={products.find((p) => p._id === item.product)?.stock || 1}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-700"
                  required
                />
              </div>
              <div>
                <input
                  type="number"
                  value={item.unitPrice}
                  readOnly
                  className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2"
                />
              </div>
              <div>
                <input
                  type="number"
                  value={item.totalPrice}
                  readOnly
                  className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2"
                />
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="rounded-full p-2 text-red-500 hover:bg-red-50"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addItem}
            className="flex items-center rounded-md px-4 py-2 text-green-800 hover:bg-blue-50 dark:!text-green-600"
          >
            <PlusIcon className="mr-2 h-5 w-5" />
            Add Item
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-gray-800 dark:!text-gray-400">
            Total Amount: &#8377;{totalAmount.toFixed(2)}
          </div>
          <button
            type="submit"
            className="rounded-md bg-green-800 px-8 py-3 text-white transition-colors hover:bg-green-700"
          >
            Create Invoice
          </button>
        </div>
      </form>
      {/* Invoice Download Modal */}
      {showDownloadModal && generatedInvoiceData && (
        <InvoiceDownloadModal
          isOpen={showDownloadModal}
          onClose={() => setShowDownloadModal(false)}
          invoiceData={generatedInvoiceData}
          logo={logo}
        />
      )}
    </>
  );
};


const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });
  const [filters, setFilters] = useState({
    status: "",
    startDate: "",
    endDate: "",
    searchTerm: "",
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);

  const navigate = useNavigate();

  // Memoized fetchInvoices function
  const fetchInvoices = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const response = await api.get(
          `${process.env.REACT_APP_API_BASE_URL}/invoices/getall`,
          {
            params: {
              page,
              limit: 10,
              status: appliedFilters.status,
              startDate: appliedFilters.startDate,
              endDate: appliedFilters.endDate,
              searchTerm: appliedFilters.searchTerm,
            },
          }
        );

        const { invoices, totalPages, currentPage } = response.data;
        setInvoices(invoices);
        setFilteredInvoices(invoices);
        setPagination({ currentPage, totalPages });
      } catch (error) {
        console.error("Error fetching invoices", error);
        toast.error("Failed to fetch invoices");
      } finally {
        setLoading(false);
      }
    },
    [appliedFilters] // Dependencies for fetchInvoices
  );

  // Effect to fetch invoices whenever appliedFilters or pagination changes
  useEffect(() => {
    fetchInvoices(pagination.currentPage);
  }, [fetchInvoices, pagination.currentPage]); // Include fetchInvoices and currentPage in dependencies

  const downloadInvoice = async (invoiceId) => {
    try {
      // Ensure base URL matches your backend server
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/invoices/pdf/${invoiceId}`, {
        responseType: "blob", // Important for handling binary data
      });

      // Create a blob from the response data
      const blob = new Blob([response.data], { type: "application/pdf" });

      // Create a temporary link element for download
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `invoice_${invoiceId}.pdf`;

      // Simulate a click to trigger the download
      link.click();

      // Clean up the object URL after download
      window.URL.revokeObjectURL(link.href);

      toast.success("Invoice downloaded successfully!");
    } catch (error) {
      console.error("Error downloading invoice:", error);
      toast.error("Failed to download invoice. Please try again.");
    }
  };

  const deleteInvoice = async (invoiceId) => {
    try {
      await api.delete(`/invoices/${invoiceId}`);
      setInvoices(invoices.filter((inv) => inv._id !== invoiceId));
      setFilteredInvoices(
        filteredInvoices.filter((inv) => inv._id !== invoiceId)
      );
      toast.success("Invoice deleted successfully");
    } catch (error) {
      console.error("Error deleting invoice", error);
      toast.error("Failed to delete invoice");
    }
  };

  const handlePageChange = (newPage) => {
    fetchInvoices(newPage);
  };

  const applyFilters = () => {
    setAppliedFilters(filters); // Update appliedFilters, triggering the API call
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800 dark:!text-gray-100">
          Invoices
        </h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center rounded-full bg-green-800 px-4 py-2 text-white transition hover:bg-green-700"
          >
            <PlusIcon className="mr-2 h-5 w-5" />
            Create Invoice
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="mb-6 rounded-lg bg-white p-6 shadow-md dark:!bg-black-700">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search invoices..."
              value={filters.searchTerm}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, searchTerm: e.target.value }))
              }
              className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-green-700"
            />
            <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          </div>
          {/* Date Range Inputs */}
          <div className="flex space-x-2">
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, startDate: e.target.value }))
              }
              className="w-[30%] rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-700"
            />
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, endDate: e.target.value }))
              }
              className="w-[30%] rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-700"
            />
            <button
              onClick={applyFilters}
              className="rounded-md bg-green-800 px-4 py-3 text-white transition hover:bg-green-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="overflow-hidden rounded-lg bg-white shadow-md dark:!bg-black-700">
        <table className="min-w-full">
          <thead className="bg-gray-100 font-bold dark:!bg-black-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-green-900 dark:!text-white">
                Invoice #
              </th>
              <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-green-900 dark:!text-white">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-green-900 dark:!text-white">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-green-900 dark:!text-white">
                Total Amount
              </th>
              <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-green-900 dark:!text-white">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs uppercase tracking-wider text-green-900 dark:!text-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredInvoices.map((invoice) => (
              <tr
                key={invoice._id}
                className="transition hover:bg-gray-50 dark:hover:bg-black-500"
              >
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:!text-white">
                  {invoice.invoiceNumber}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:!text-white">
                  {invoice.customer.name}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:!text-white">
                  {new Date(invoice.createdAt).toLocaleDateString()}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:!text-white">
                  &#8377;{invoice.totalAmount.toFixed(2)}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <StatusBadge status={invoice.status} />
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    {/* <button
                      onClick={() => navigate(`/invoice/${invoice._id}`)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button> */}
                    <button
                      onClick={() => downloadInvoice(invoice._id)}
                      className="text-green-600 hover:text-green-900"
                    >
                      <DownloadIcon className="h-5 w-5" />
                    </button>
                    {/* <button
                      onClick={() => deleteInvoice(invoice._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button> */}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredInvoices.length === 0 && (
          <div className="py-10 text-center">
            <p className="text-gray-500">No invoices found</p>
          </div>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="mt-6 flex justify-center space-x-2">
          {[...Array(pagination.totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => handlePageChange(index + 1)}
              className={`rounded-md px-4 py-2 ${pagination.currentPage === index + 1
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
                }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}

      <Transition appear show={isCreateModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setIsCreateModalOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="bg-black fixed inset-0 bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:!bg-black-700">
                  <CreateInvoiceForm
                    onSuccess={() => {
                      setIsCreateModalOpen(false);
                      fetchInvoices();
                    }}
                  />
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default InvoiceList;
