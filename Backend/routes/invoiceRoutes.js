const express = require('express');
const router = express.Router();
const { 
  createInvoice, 
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  addInvoicePayment,
  generateInvoicePDF,
  getTotalEarnings,
  getDailySalees
} = require('../controllers/invoiceController');
const authorize = require('../middlewares/authorize')

// Create Invoice
router.post('/create-invoice', 
  authorize.verifyJwtUser, 
  // validateInvoiceCreation, 
  createInvoice
);

// Get All Invoices
router.get('/getall', 

  authorize.verifyJwtUser, 
  getInvoices
);

// Get Single Invoice
router.get('/:id', 
  authorize.verifyJwtUser,  
  getInvoiceById
);

// Generate PDF Invoice
router.get('/pdf/:id',  
  generateInvoicePDF
);

// Update Invoice
router.put('/:id', 
  authorize.verifyJwtUser, 
  // validateInvoiceUpdate, 
  updateInvoice
);

// Delete Invoice
router.delete('/:id', 
  authorize.verifyJwtUser, 
  deleteInvoice
);

// Add Payment to Invoice
router.post('/:id/payments', 
  authorize.verifyJwtUser, 
  addInvoicePayment
);

router.get('/earnings/total-earnings',authorize.verifyJwtUser,getTotalEarnings);

module.exports = router;