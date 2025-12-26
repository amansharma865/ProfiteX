const { body, param, validationResult } = require('express-validator');

const validateInvoiceCreation = [
  body('customer.name').notEmpty().withMessage('Customer name is required'),
  body('customer.email').optional().isEmail().withMessage('Invalid email format'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.product').notEmpty().withMessage('Product is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('subtotal').isFloat({ min: 0 }).withMessage('Subtotal must be a positive number'),
  body('totalAmount').isFloat({ min: 0 }).withMessage('Total amount must be a positive number'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

const validateInvoiceUpdate = [
  param('id').notEmpty().withMessage('Invoice ID is required'),
  body('status').optional().isIn(['DRAFT', 'SENT', 'PAID', 'CANCELLED']).withMessage('Invalid status'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

const validatePayment = [
  body('amount').isFloat({ min: 0.01 }).withMessage('Payment amount must be positive'),
  body('paymentMethod').notEmpty().withMessage('Payment method is required'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = {
  validateInvoiceCreation,
  validateInvoiceUpdate,
  validatePayment
};