/**
 * Invoice PDF generation utility
 * Creates printable/downloadable invoices from order data
 */

export interface InvoiceData {
  orderId: string;
  orderDate: string;
  customer: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    zipcode?: string;
    country?: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  tax: number;
  shipping: {
    method: string;
    cost: number;
  };
  total: number;
  paymentMethod: string;
  reference?: string;
  status: string;
}

export function generateInvoiceHTML(invoice: InvoiceData): string {
  const itemsHTML = invoice.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">R${item.price.toFixed(2)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">R${(item.quantity * item.price).toFixed(2)}</td>
    </tr>
  `
    )
    .join('');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice ${invoice.orderId}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #333;
      background: white;
      padding: 40px;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
      border-bottom: 2px solid #ff9500;
      padding-bottom: 20px;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      color: #ff9500;
    }
    .invoice-title {
      text-align: right;
    }
    .invoice-title h1 {
      font-size: 24px;
      margin-bottom: 10px;
    }
    .invoice-meta {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-bottom: 40px;
    }
    .section {
      font-size: 13px;
    }
    .section h3 {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      color: #666;
      margin-bottom: 8px;
      letter-spacing: 0.5px;
    }
    .section p {
      margin-bottom: 4px;
      line-height: 1.6;
    }
    table {
      width: 100%;
      margin-bottom: 30px;
      border-collapse: collapse;
    }
    th {
      background: #f3f4f6;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #e5e7eb;
      font-size: 12px;
      text-transform: uppercase;
      color: #666;
    }
    .summary {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 40px;
    }
    .summary-box {
      width: 300px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e5e7eb;
      font-size: 14px;
    }
    .summary-total {
      display: flex;
      justify-content: space-between;
      padding: 15px 0;
      font-size: 18px;
      font-weight: bold;
      color: #ff9500;
      background: #fff8f0;
      padding: 15px;
      margin: 15px 0;
    }
    .footer {
      border-top: 1px solid #e5e7eb;
      padding-top: 20px;
      font-size: 12px;
      color: #666;
      text-align: center;
    }
    .status-badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      margin-top: 10px;
    }
    .status-pending {
      background: #fef3c7;
      color: #92400e;
    }
    .status-processing {
      background: #dbeafe;
      color: #0c2340;
    }
    .status-shipped {
      background: #e9d5ff;
      color: #6b21a8;
    }
    .status-delivered {
      background: #dcfce7;
      color: #166534;
    }
    @media print {
      body {
        padding: 0;
      }
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Armani Esso</div>
      <div class="invoice-title">
        <h1>INVOICE</h1>
        <div style="color: #666; font-size: 14px;">Order #${invoice.orderId}</div>
      </div>
    </div>

    <div class="invoice-meta">
      <div>
        <div class="section">
          <h3>Bill To</h3>
          <p>${invoice.customer.name || 'Customer'}</p>
          ${invoice.customer.email ? `<p>${invoice.customer.email}</p>` : ''}
          ${invoice.customer.phone ? `<p>${invoice.customer.phone}</p>` : ''}
          ${invoice.customer.address ? `<p>${invoice.customer.address}</p>` : ''}
          ${
            invoice.customer.city || invoice.customer.zipcode
              ? `<p>${invoice.customer.city || ''} ${invoice.customer.zipcode || ''}</p>`
              : ''
          }
          ${invoice.customer.country ? `<p>${invoice.customer.country}</p>` : ''}
        </div>
      </div>
      <div>
        <div class="section">
          <h3>Order Details</h3>
          <p><strong>Order Date:</strong> ${new Date(invoice.orderDate).toLocaleDateString('en-ZA')}</p>
          <p><strong>Payment Method:</strong> ${invoice.paymentMethod.toUpperCase()}</p>
          ${invoice.reference ? `<p><strong>Reference:</strong> ${invoice.reference}</p>` : ''}
          <div class="status-badge status-${invoice.status.toLowerCase()}">
            ${invoice.status}
          </div>
        </div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Unit Price</th>
          <th style="text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHTML}
      </tbody>
    </table>

    <div class="summary">
      <div class="summary-box">
        <div class="summary-row">
          <span>Subtotal</span>
          <span>R${invoice.subtotal.toFixed(2)}</span>
        </div>
        <div class="summary-row">
          <span>Shipping (${invoice.shipping.method})</span>
          <span>R${invoice.shipping.cost.toFixed(2)}</span>
        </div>
        <div class="summary-row">
          <span>Tax (15%)</span>
          <span>R${invoice.tax.toFixed(2)}</span>
        </div>
        <div class="summary-total">
          <span>TOTAL</span>
          <span>R${invoice.total.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>Thank you for your business!</p>
      <p>Armani Esso | Premium Printing & Branding Services</p>
      <p style="margin-top: 10px; color: #999;">This is an automatically generated invoice. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
  `;

  return html;
}

/**
 * Download invoice as PDF via browser print
 * Uses browser's print-to-PDF functionality for maximum compatibility
 */
export function downloadInvoiceAsPDF(invoice: InvoiceData): void {
  const html = generateInvoiceHTML(invoice);
  const printWindow = window.open('', '', 'width=800,height=600');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
}

/**
 * Get tracking URL based on carrier
 */
export function getTrackingURL(carrier: string, trackingNumber: string): string | null {
  const urls: Record<string, (tn: string) => string> = {
    fastway: (tn) => `https://www.fastway.co.za/trackandtrace?ref=${tn}`,
    dhl: (tn) => `https://www.dhl.co.za/en/express/tracking.html?AWB=${tn}`,
    'dhl-express': (tn) => `https://www.dhl.co.za/en/express/tracking.html?AWB=${tn}`,
    pickup: () => 'N/A', // Local pickup, no tracking
  };

  const url = urls[carrier?.toLowerCase()] || urls[carrier?.toLowerCase().split('-')[0]];
  return url ? url(trackingNumber) : null;
}
