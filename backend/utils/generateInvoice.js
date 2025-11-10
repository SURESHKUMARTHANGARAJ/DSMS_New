const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateInvoicePDF = async (invoice, student, items) => {
  return new Promise((resolve, reject) => {
    try {
      // Create uploads/invoices directory if it doesn't exist
      const invoicesDir = path.join(__dirname, '../uploads/invoices');
      if (!fs.existsSync(invoicesDir)) {
        fs.mkdirSync(invoicesDir, { recursive: true });
      }

      const filename = `invoice-${invoice.invoiceNumber}.pdf`;
      const filepath = path.join(invoicesDir, filename);

      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);

      // Header
      doc.fontSize(20).text('DRIVING SCHOOL', { align: 'center' });
      doc.fontSize(16).text('INVOICE', { align: 'center' });
      doc.moveDown();

      // Invoice details
      doc.fontSize(12);
      doc.text(`Invoice Number: ${invoice.invoiceNumber}`, 50, 120);
      doc.text(`Date: ${new Date(invoice.generatedDate).toLocaleDateString()}`, 50, 140);
      if (invoice.dueDate) {
        doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 50, 160);
      }

      // Student details
      const studentName = student.userId?.name || 'N/A';
      const studentEmail = student.userId?.email || 'N/A';
      
      doc.text('Bill To:', 350, 120);
      doc.text(studentName, 350, 140);
      doc.text(studentEmail, 350, 160);

      doc.moveDown(3);

      // Items table header
      let yPos = 220;
      doc.fontSize(10);
      doc.text('Description', 50, yPos);
      doc.text('Quantity', 250, yPos);
      doc.text('Unit Price', 320, yPos);
      doc.text('Total', 420, yPos);

      // Line
      doc.moveTo(50, yPos + 20).lineTo(550, yPos + 20).stroke();

      // Items
      yPos += 30;
      items.forEach(item => {
        doc.text(item.description || 'N/A', 50, yPos);
        doc.text(item.quantity?.toString() || '1', 250, yPos);
        doc.text(`₹${item.unitPrice?.toFixed(2) || '0.00'}`, 320, yPos);
        doc.text(`₹${item.total?.toFixed(2) || '0.00'}`, 420, yPos);
        yPos += 20;
      });

      // Total
      doc.moveDown();
      doc.fontSize(12);
      doc.text(`Total Amount: ₹${invoice.totalAmount.toFixed(2)}`, 350, yPos + 20, { align: 'right' });
      
      // Status
      doc.text(`Status: ${invoice.status.toUpperCase()}`, 350, yPos + 40, { align: 'right' });

      // Footer
      doc.fontSize(10);
      doc.text('Thank you for your business!', 50, doc.page.height - 100, { align: 'center' });

      doc.end();

      stream.on('finish', () => {
        resolve(filepath);
      });

      stream.on('error', (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = generateInvoicePDF;

