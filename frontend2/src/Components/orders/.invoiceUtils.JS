import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";
import logo from "../../assets/image/NaijaOpenMarket.png";

export const generateInvoicePDF = async (
  order,
  details
) => {
  const doc = new jsPDF();

  const formatCurrency = (value) =>
    Number(value || 0).toLocaleString(
      "en-NG",
      {
        minimumFractionDigits: 2,
      }
    );

  const invoiceUrl =
    `${window.location.origin}/invoice/${order.id}`;

  const qrCode =
    await QRCode.toDataURL(invoiceUrl);

  doc.addImage(
    logo,
    "PNG",
    14,
    10,
    25,
    25
  );

  doc.setFontSize(22);
  doc.setTextColor(96, 88, 220);

  doc.text(
    "NaijaOpenMarket",
    45,
    20
  );

  doc.setFontSize(10);

  doc.text(
    "Your Trusted Online Marketplace",
    45,
    28
  );

  doc.addImage(
    qrCode,
    "PNG",
    160,
    15,
    35,
    35
  );

  doc.setFontSize(16);

  doc.text(
    "INVOICE",
    160,
    60
  );

  doc.setFontSize(11);

  doc.text(
    `Invoice No: ${order.order_number}`,
    14,
    50
  );

  doc.text(
    `Date: ${new Date(
      order.created_at
    ).toLocaleDateString()}`,
    14,
    57
  );

  doc.text(
    `Status: ${order.status}`,
    14,
    64
  );

  doc.text(
    `Payment Status: ${
      order.payment_status || "Paid"
    }`,
    14,
    71
  );

  doc.text(
    `Customer: ${
      order.full_name || ""
    }`,
    14,
    85
  );

  doc.text(
    `Email: ${order.email || ""}`,
    14,
    92
  );

  doc.text(
    `Phone: ${order.phone || ""}`,
    14,
    99
  );

  doc.text(
    `Address: ${
      order.shipping_address
    }`,
    14,
    106
  );

  const rows =
    details.items?.map((item) => [
      item.product_name,
      item.quantity,
      `₦${formatCurrency(
        item.unit_price
      )}`,
      `₦${formatCurrency(
        item.total_price
      )}`,
    ]) || [];

  autoTable(doc, {
    startY: 115,
    head: [
      [
        "Product",
        "Qty",
        "Price",
        "Total",
      ],
    ],
    body: rows,
    headStyles: {
      fillColor: [96, 88, 220],
    },
  });

  const finalY =
    doc.lastAutoTable.finalY + 15;

  const subtotal =
    Number(order.subtotal || 0);

  const vat = subtotal * 0.075;

  const delivery =
    Number(order.delivery_fee || 0);

  const grandTotal =
    subtotal +
    vat +
    delivery;

  doc.text(
    `Subtotal: ₦${formatCurrency(
      subtotal
    )}`,
    130,
    finalY
  );

  doc.text(
    `VAT (7.5%): ₦${formatCurrency(
      vat
    )}`,
    130,
    finalY + 8
  );

  doc.text(
    `Delivery: ₦${formatCurrency(
      delivery
    )}`,
    130,
    finalY + 16
  );

  doc.setFontSize(13);

  doc.text(
    `Grand Total: ₦${formatCurrency(
      grandTotal
    )}`,
    130,
    finalY + 28
  );

  doc.setFontSize(10);

  doc.text(
    "Thank you for shopping with NaijaOpenMarket",
    14,
    finalY + 45
  );

  doc.save(
    `${order.order_number}.pdf`
  );
};