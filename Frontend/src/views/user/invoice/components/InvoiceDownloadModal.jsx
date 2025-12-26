import React, { useState, useRef } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Dialog, Transition } from '@headlessui/react';
import { toast } from 'react-toastify';
import { DownloadIcon, PrinterIcon } from '@heroicons/react/outline';

const InvoiceDownloadModal = ({
  isOpen,
  onClose,
  invoiceData,
  logo
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const printRef = useRef();

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([600, 800]);
      const { width, height } = page.getSize();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      // Define colors
      const brandGreen = rgb(0.063, 0.725, 0.506);
      const darkGray = rgb(0.2, 0.2, 0.2);
      const lightGray = rgb(0.95, 0.95, 0.95);
      const black = rgb(0, 0, 0);

      let yPosition = height - 50;

      // ===== HEADER SECTION =====
      // Logo (if available)
      if (logo) {
        try {
          const logoImage = await pdfDoc.embedPng(logo);
          const logoHeight = 60;
          const logoWidth = 60;
          page.drawImage(logoImage, {
            x: 50,
            y: yPosition - logoHeight,
            width: logoWidth,
            height: logoHeight
          });
        } catch (err) {
        }
      }

      // INVOICE Title (large, right side)
      page.drawText('INVOICE', {
        x: width - 200,
        y: yPosition,
        size: 28,
        font: boldFont,
        color: brandGreen
      });

      // Invoice metadata box (right side)
      const metadataX = width - 220;
      yPosition -= 35;

      page.drawText(`Invoice #: ${invoiceData.invoiceNumber || 'N/A'}`, {
        x: metadataX,
        y: yPosition,
        size: 10,
        font: font,
        color: darkGray
      });

      yPosition -= 15;
      page.drawText(`Date: ${new Date(invoiceData.createdAt || Date.now()).toLocaleDateString()}`, {
        x: metadataX,
        y: yPosition,
        size: 10,
        font: font,
        color: darkGray
      });

      yPosition -= 15;
      const status = invoiceData.status || 'PENDING';
      const statusColor = status === 'PAID' ? rgb(0, 0.6, 0) : rgb(0.8, 0.6, 0);
      page.drawText(`Status: ${status}`, {
        x: metadataX,
        y: yPosition,
        size: 10,
        font: boldFont,
        color: statusColor
      });

      // ===== CUSTOMER SECTION =====
      yPosition = height - 150;

      // "Bill To" label
      page.drawText('BILL TO:', {
        x: 50,
        y: yPosition,
        size: 12,
        font: boldFont,
        color: darkGray
      });

      // Customer box with border
      const boxY = yPosition - 50;
      page.drawRectangle({
        x: 50,
        y: boxY,
        width: 250,
        height: 45,
        borderColor: lightGray,
        borderWidth: 1,
        color: rgb(0.98, 0.98, 0.98)
      });

      yPosition -= 20;
      page.drawText(invoiceData.customer.name || 'Customer', {
        x: 60,
        y: yPosition,
        size: 11,
        font: boldFont,
        color: black
      });

      // ===== LINE ITEMS TABLE =====
      yPosition -= 60;

      // Table header background
      const tableStartY = yPosition;
      page.drawRectangle({
        x: 50,
        y: yPosition - 5,
        width: width - 100,
        height: 25,
        color: brandGreen
      });

      // Table headers
      page.drawText('ITEM', {
        x: 60,
        y: yPosition + 5,
        size: 11,
        font: boldFont,
        color: rgb(1, 1, 1)
      });

      page.drawText('QTY', {
        x: 320,
        y: yPosition + 5,
        size: 11,
        font: boldFont,
        color: rgb(1, 1, 1)
      });

      page.drawText('PRICE', {
        x: 390,
        y: yPosition + 5,
        size: 11,
        font: boldFont,
        color: rgb(1, 1, 1)
      });

      page.drawText('TOTAL', {
        x: 470,
        y: yPosition + 5,
        size: 11,
        font: boldFont,
        color: rgb(1, 1, 1)
      });

      yPosition -= 25;

      // Table rows
      invoiceData.items.forEach((item, index) => {
        // Alternating row background
        if (index % 2 === 0) {
          page.drawRectangle({
            x: 50,
            y: yPosition - 5,
            width: width - 100,
            height: 22,
            color: lightGray
          });
        }

        // Row border
        page.drawLine({
          start: { x: 50, y: yPosition - 5 },
          end: { x: width - 50, y: yPosition - 5 },
          thickness: 0.5,
          color: rgb(0.8, 0.8, 0.8)
        });

        // Item name
        const itemName = item.product?.name || item.product || 'Item';
        page.drawText(itemName.substring(0, 30), {
          x: 60,
          y: yPosition + 5,
          size: 10,
          font: font,
          color: black
        });

        // Quantity (right-aligned)
        page.drawText(String(item.quantity), {
          x: 340,
          y: yPosition + 5,
          size: 10,
          font: font,
          color: black
        });

        // Unit Price (right-aligned)
        page.drawText(`₹${item.unitPrice.toFixed(2)}`, {
          x: 385,
          y: yPosition + 5,
          size: 10,
          font: font,
          color: black
        });

        // Total (right-aligned)
        page.drawText(`₹${item.totalPrice.toFixed(2)}`, {
          x: 465,
          y: yPosition + 5,
          size: 10,
          font: font,
          color: black
        });

        yPosition -= 22;
      });

      // Bottom table border
      page.drawLine({
        start: { x: 50, y: yPosition + 17 },
        end: { x: width - 50, y: yPosition + 17 },
        thickness: 1.5,
        color: brandGreen
      });

      // ===== TOTALS SECTION =====
      yPosition -= 40;

      // Total amount box
      const totalBoxY = yPosition - 35;
      page.drawRectangle({
        x: width - 250,
        y: totalBoxY,
        width: 200,
        height: 35,
        color: rgb(0.95, 0.98, 0.95),
        borderColor: brandGreen,
        borderWidth: 1.5
      });

      page.drawText('TOTAL AMOUNT:', {
        x: width - 240,
        y: yPosition,
        size: 12,
        font: boldFont,
        color: darkGray
      });

      page.drawText(`₹${invoiceData.totalAmount.toFixed(2)}`, {
        x: width - 130,
        y: yPosition,
        size: 16,
        font: boldFont,
        color: brandGreen
      });

      // ===== FOOTER SECTION =====
      yPosition = 100;

      // Separator line
      page.drawLine({
        start: { x: 50, y: yPosition },
        end: { x: width - 50, y: yPosition },
        thickness: 1,
        color: lightGray
      });

      yPosition -= 25;

      // Thank you message
      page.drawText('Thank you for your business!', {
        x: 50,
        y: yPosition,
        size: 11,
        font: boldFont,
        color: brandGreen
      });

      yPosition -= 20;

      // Payment terms
      page.drawText('Payment Terms: Due upon receipt', {
        x: 50,
        y: yPosition,
        size: 9,
        font: font,
        color: darkGray
      });

      yPosition -= 15;

      // Company contact (if available)
      page.drawText('For questions, please contact: support@profitex.com', {
        x: 50,
        y: yPosition,
        size: 8,
        font: font,
        color: darkGray
      });

      // Serialize PDF to bytes
      const pdfBytes = await pdfDoc.save();

      // Create and trigger download
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `invoice_${invoiceData.invoiceNumber || 'INV'}_${invoiceData.customer.name.replace(/\s+/g, '_')}.pdf`;
      link.click();

      toast.success('Invoice downloaded successfully!');
      onClose();
    } catch (error) {
      console.error('PDF Generation Error:', error);
      toast.error('Failed to generate invoice PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex min-h-screen items-center justify-center px-4">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative z-50 w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-xl transition-all">
          <Dialog.Title className="text-lg font-medium leading-6 text-gray-900">
            Invoice Generated Successfully
          </Dialog.Title>

          <div className="mt-4 flex space-x-4">
            <button
              onClick={generatePDF}
              disabled={isGenerating}
              className="flex items-center rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
            >
              <DownloadIcon className="mr-2 h-5 w-5" />
              {isGenerating ? 'Generating...' : 'Download PDF'}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              <PrinterIcon className="mr-2 h-5 w-5" />
              Print Invoice
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default InvoiceDownloadModal;