const Invoice = require('../models/Invoice');
const Product = require('../models/Product');
const mongoose = require('mongoose');
const PDFDocument = require('pdfkit');
const moment = require('moment');

const { checkLowStockAndNotify } = require('../helper/lowStockHelper');

// Generate Unique Invoice Number
const generateInvoiceNumber = async () => {
  const lastInvoice = await Invoice.findOne().sort({ createdAt: -1 });
  const currentYear = new Date().getFullYear();
  const prefix = `INV-${currentYear}`;

  if (!lastInvoice) {
    return `${prefix}-0001`;
  }

  const lastInvoiceNumber = lastInvoice.invoiceNumber;
  const lastSequence = parseInt(lastInvoiceNumber.split('-').pop());
  const newSequence = lastSequence + 1;

  return `${prefix}-${newSequence.toString().padStart(4, '0')}`;
};


const createInvoice = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { customer, items, subtotal, totalAmount, status = 'PAID' } = req.body;

    // Validate input
    if (!customer || !customer.name) {
      return res.status(404).json({ success: false, message: 'customer not found' });
    }

    if (!items || items.length === 0) {
      return res.status(404).json({ success: false, message: 'items not found in invoice' });
    }

    // Process items and validate stock
    const processedItems = await Promise.all(items.map(async (item) => {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({ success: false, message: 'product not found' });
      }

      if (product.stock < item.quantity) {
        return res.status(401).json({ success: false, message: `Insufficient stock for product: ${product.name}` });
      }

      // Reduce product stock
      product.stock -= item.quantity;
      await product.save({ session });

      return {
        product: product._id,
        productId: product._id.toString(), // Add string representation of product ID
        name: product.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice || product.price,
        totalPrice: item.totalPrice || (item.quantity * (item.unitPrice || product.price))
      };
    }));

    // Calculate totals
    const calculatedSubtotal = processedItems.reduce((sum, item) => sum + item.totalPrice, 0);

    // Generate Invoice Number
    const invoiceNumber = await generateInvoiceNumber();

    // Create Invoice
    const newInvoice = new Invoice({
      invoiceNumber,
      customer: {
        _id: customer._id ? mongoose.Types.ObjectId(customer._id) : undefined,
        name: customer.name,
        email: customer.email || '',
        phone: customer.phone || ''
      },
      items: processedItems,
      subtotal: subtotal || calculatedSubtotal,
      totalAmount: totalAmount || calculatedSubtotal,
      status,
      shop: req.user.shop,
      createdBy: req.user._id,
      paymentStatus: status === 'PAID' ? 'PAID' : 'UNPAID'
    });

    await newInvoice.save({ session });
    await session.commitTransaction();

    // Check if stock is now below minimum and create notification
    // We call this AFTER commit to ensure data is consistent for the aggregation query
    await checkLowStockAndNotify(req.user._id, false);

    res.status(201).json({
      message: 'Invoice created successfully',
      invoice: newInvoice
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Invoice Creation Error:', error);
    res.status(400).json({
      message: 'Invoice creation failed',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};


const getInvoices = async (req, res) => {
  try {
    const user_id = req.user._id; // Extract the user ID from the request
    const { page = 1, limit = 10, startDate, endDate, searchTerm } = req.query;

    // Build the query filters dynamically
    const query = {
      createdBy: user_id,
      status: "PAID"
    };

    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    } else if (startDate) {
      query.createdAt = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.createdAt = { $lte: new Date(endDate) };
    }
    if (searchTerm) {
      query.$or = [
        { invoiceNumber: { $regex: searchTerm, $options: "i" } },
        { 'customer.name': { $regex: searchTerm, $options: "i" } },
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;
    const invoices = await Invoice.find(query).skip(skip).limit(Number(limit)).sort({ updatedAt: -1 });
    const totalInvoices = await Invoice.countDocuments(query);
    const totalPages = Math.ceil(totalInvoices / limit);

    // Return the response
    return res.status(200).json({
      success: true,
      message: "Invoices fetched successfully",
      invoices,
      currentPage: Number(page),
      totalPages,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch invoices",
      error: error.message,
    });
  }
};



// Get Single Invoice
const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('items.product')
      .populate('createdBy', 'name email');

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching invoice',
      error: error.message
    });
  }
};

// Update Invoice
const updateInvoice = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Find existing invoice
    const existingInvoice = await Invoice.findById(id);
    if (!existingInvoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Validate status updates
    if (updateData.status) {
      const validStatuses = ['DRAFT', 'SENT', 'PAID', 'CANCELLED'];
      if (!validStatuses.includes(updateData.status)) {
        throw new Error('Invalid invoice status');
      }
    }

    // Handle item updates with stock management
    if (updateData.items) {
      // Restore original stock
      for (let item of existingInvoice.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock += item.quantity;
          await product.save({ session });
        }
      }

      // Process new items and validate stock
      const processedItems = await Promise.all(updateData.items.map(async (item) => {
        const product = await Product.findById(item.product);

        if (!product) {
          throw new Error(`Product not found: ${item.product}`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product: ${product.name}`);
        }

        // Reduce product stock
        product.stock -= item.quantity;
        await product.save({ session });

        return {
          product: product._id,
          name: product.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.quantity * item.unitPrice
        };
      }));

      updateData.items = processedItems;
    }

    // Update invoice
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    await session.commitTransaction();

    res.json({
      message: 'Invoice updated successfully',
      invoice: updatedInvoice
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({
      message: 'Error updating invoice',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

// Delete Invoice
const deleteInvoice = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Restore stock for deleted invoice
    for (let item of invoice.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save({ session });
      }
    }

    // Delete invoice
    await Invoice.findByIdAndDelete(req.params.id, { session });

    await session.commitTransaction();

    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({
      message: 'Error deleting invoice',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

// Add Payment
const addInvoicePayment = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const { amount, paymentMethod, notes } = req.body;

    // Validate payment amount
    if (amount <= 0) {
      return res.status(400).json({ message: 'Payment amount must be positive' });
    }

    if (amount > invoice.totalAmount - (invoice.paymentHistory?.reduce((sum, payment) => sum + payment.amount, 0) || 0)) {
      return res.status(400).json({ message: 'Payment amount exceeds remaining balance' });
    }

    invoice.addPayment(amount, paymentMethod, notes);
    await invoice.save();

    res.json({
      message: 'Payment added successfully',
      invoice
    });
  } catch (error) {
    res.status(400).json({
      message: 'Error adding payment',
      error: error.message
    });
  }
};




class InvoicePDFGenerator {
  constructor(invoice) {
    this.invoice = invoice;
    this.doc = new PDFDocument({ size: 'A4', margin: 50 });

    // Design Constants
    this.COLORS = {
      PRIMARY: '#1D3557',
      SECONDARY: '#457B9D',
      GRAY: '#718096',
      LIGHT_GRAY: '#F8F9FA',
      BLACK: '#000000',
      WHITE: '#FFFFFF',
    };

    this.FONTS = {
      REGULAR: 'Helvetica',
      BOLD: 'Helvetica-Bold',
    };
  }

  // Main PDF generation method
  generate(res) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${this.invoice.invoiceNumber}.pdf`);

    this.doc.pipe(res);

    this._createHeader();
    this._createCompanyDetails();
    this._createCustomerDetails();
    this._createInvoiceItemsTable();
    this._createTotalsSection();
    this._createFooter();

    this.doc.end();
  }

  // Header Section
  _createHeader() {
    const { doc, invoice, COLORS, FONTS } = this;

    doc.font(FONTS.BOLD)
      .fontSize(20)
      .fillColor(COLORS.PRIMARY)
      .text('INVOICE', 50, 50, { align: 'left' });

    doc.font(FONTS.REGULAR)
      .fontSize(10)
      .fillColor(COLORS.GRAY)
      .text(`Invoice Number: ${invoice.invoiceNumber}`, 400, 50, { align: 'right' })
      .text(`Date: ${this._formatDate(invoice.createdAt)}`, 400, 65, { align: 'right' })
      .text(`Status: ${invoice.status}`, 400, 80, { align: 'right' });

    doc.moveTo(50, 100).lineTo(550, 100).strokeColor(COLORS.LIGHT_GRAY).lineWidth(1).stroke();
  }

  // Company Details
  _createCompanyDetails() {
    const { doc, invoice, COLORS, FONTS } = this;

    doc.font(FONTS.BOLD)
      .fontSize(10)
      .fillColor(COLORS.PRIMARY)
      .text('FROM:', 50, 120);

    doc.font(FONTS.REGULAR)
      .fontSize(10)
      .fillColor(COLORS.BLACK)
      .text(invoice.createdBy.user_admin.company_name, 50, 135)
      .text(invoice.createdBy.user_admin.company_address, 50, 150)
  }

  // Customer Details
  _createCustomerDetails() {
    const { doc, invoice, COLORS, FONTS } = this;

    doc.font(FONTS.BOLD)
      .fontSize(10)
      .fillColor(COLORS.PRIMARY)
      .text('BILL TO:', 350, 120);

    doc.font(FONTS.REGULAR)
      .fontSize(10)
      .fillColor(COLORS.BLACK)
      .text(invoice.customer?.name || 'N/A', 350, 135);
    // .text(invoice.customer?.email || 'No Email', 350, 150)
    // .text(invoice.customer?.phone || 'No Phone', 350, 165);
  }

  // Invoice Items Table
  _createInvoiceItemsTable() {
    const { doc, invoice, COLORS, FONTS } = this;
    const tableTop = 200;
    const rowHeight = 20;

    // Table Header
    const headers = ['#', 'Product Name', 'Quantity', 'Unit Price', 'Total'];
    const columnWidths = [30, 250, 80, 80, 80];
    this._drawTableRow(headers, columnWidths, tableTop, FONTS.BOLD, COLORS.SECONDARY, COLORS.WHITE);

    // Table Body
    invoice.items.forEach((item, index) => {
      const rowData = [
        `${index + 1}`,
        item.name,
        item.quantity.toString(),
        `Rs ${item.unitPrice.toFixed(2)}`,
        `Rs ${item.totalPrice.toFixed(2)}`,
      ];
      const rowY = tableTop + (index + 1) * rowHeight;
      this._drawTableRow(rowData, columnWidths, rowY, FONTS.REGULAR, COLORS.BLACK, COLORS.LIGHT_GRAY);
    });
  }

  // Helper to Draw a Row
  _drawTableRow(data, columnWidths, y, font, textColor, bgColor) {
    const { doc } = this;
    let x = 50;

    // Background
    doc.rect(x, y, 500, 20).fillColor(bgColor).fill();

    // Text
    data.forEach((text, i) => {
      doc.font(font)
        .fontSize(9)
        .fillColor(textColor)
        .text(text, x + 5, y + 5, { width: columnWidths[i], align: 'left' });
      x += columnWidths[i];
    });
  }

  // Totals Section
  // Totals Section

  _createTotalsSection() {
    const { doc, invoice, COLORS, FONTS } = this;

    // Define starting X and Y coordinates
    const startX = 300; // Start X for label
    let startY = 400;  // Start Y position

    // Row height
    const rowHeight = 20;

    // Define Totals Content from Invoice Data
    const totals = [
      { label: 'Subtotal:', value: `Rs ${invoice.subtotal.toFixed(2)}` },
      { label: 'Tax (0%):', value: `Rs 0.00` }, // Assuming no tax included
      { label: 'Discount:', value: `Rs 0.00` }, // Assuming no discount applied
      { label: 'Shipping:', value: `Rs 0.00` }  // Assuming no shipping cost applied
    ];

    // Render each total item
    totals.forEach(({ label, value }) => {
      // Render label
      doc.font(FONTS.REGULAR)
        .fontSize(10)
        .fillColor(COLORS.GRAY)
        .text(label, startX, startY, {
          width: 500,
          align: 'left',
        });

      // Render value
      doc.text(value, startX + 100, startY, {
        width: 100,
        align: 'right',
      });

      // Increment Y position for the next row
      startY += rowHeight;
    });

    // Total Amount Highlighted
    startY += 10; // Add space before the highlighted total
    doc.fillColor(COLORS.PRIMARY)
      .rect(startX - 20, startY, 400, 30) // Highlight area for total
      .fill();

    doc.fillColor('white')
      .font(FONTS.BOLD)
      .fontSize(12)
      .text('Total Amount:', startX, startY + 8, {
        width: 150,
        align: 'left',
      })
      .text(`Rs ${invoice.totalAmount.toFixed(2)}`, startX + 150, startY + 8, {
        width: 100,
        align: 'right',
      });
  }



  // Footer Section
  _createFooter() {
    const { doc, invoice, COLORS, FONTS } = this;

    doc.font(FONTS.BOLD)
      .fontSize(10)
      .fillColor(COLORS.PRIMARY)
      .text('Payment Status:', 50, 500);

    doc.font(FONTS.REGULAR)
      .fontSize(10)
      .fillColor(COLORS.BLACK)
      .text(invoice.paymentStatus, 150, 500);
  }

  // Utility: Format Date
  _formatDate(dateObj) {
    const date = dateObj instanceof Date ? dateObj : new Date(dateObj);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}

// Controller for PDF Generation
const generateInvoicePDF = async (req, res) => {
  try {
    // const invoice = await Invoice.findById(req.params.id).populate('items');
    const invoice = await Invoice.findById(req.params.id)
      .populate({
        path: 'items',
      })
      .populate({
        path: 'createdBy',
        model: 'user',
        populate: {
          path: 'user_admin',
          model: 'admin',
        },
      });
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const pdfGenerator = new InvoicePDFGenerator(invoice);
    pdfGenerator.generate(res);
  } catch (error) {
    console.error('PDF Generation Error:', error);
    res.status(500).json({ message: 'Error generating PDF', error: error.message });
  }
};



const getTotalEarnings = async (req, res) => {
  try {
    const userId = req.user._id; // Get userId from request parameters

    const result = await Invoice.aggregate([
      {
        $match: {
          status: 'PAID',
          createdBy: userId
        }
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$totalAmount' }
        }
      }
    ]);

    const totalEarnings = result[0]?.totalEarnings || 0;

    // Respond with success
    res.status(200).json({
      success: true,
      earnings: totalEarnings
    });
  } catch (error) {
    // Handle errors
    res.status(500).json({
      success: false,
      message: 'Failed to calculate total earnings',
      error: error.message
    });
  }
};








module.exports = {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  addInvoicePayment,
  generateInvoicePDF,
  getTotalEarnings,
};