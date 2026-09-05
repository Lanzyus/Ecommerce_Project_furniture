import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";

import logo from "../../assets/image/Sensational.png";

/*
=========================================================
DJANGO BACKEND URL
=========================================================
*/

const BACKEND_URL = "http://127.0.0.1:8001";

/*
=========================================================
IMAGE URL HELPER
=========================================================

Your API may return:

/media/product_media/image.PNG

or:

http://127.0.0.1:8001/media/product_media/image.PNG

This function handles BOTH.
*/

const getImageUrl = (image) => {
  if (!image) {
    return null;
  }

  if (typeof image !== "string") {
    return null;
  }

  const cleanedImage = image.trim();

  if (!cleanedImage) {
    return null;
  }

  /*
  Already an absolute URL
  */

  if (
    cleanedImage.startsWith("http://") ||
    cleanedImage.startsWith("https://")
  ) {
    return cleanedImage;
  }

  /*
  Protocol-relative URL
  */

  if (cleanedImage.startsWith("//")) {
    return `http:${cleanedImage}`;
  }

  /*
  Django media URL
  */

  if (cleanedImage.startsWith("/")) {
    return `${BACKEND_URL}${cleanedImage}`;
  }

  /*
  Image path without leading slash
  */

  return `${BACKEND_URL}/${cleanedImage}`;
};

/*
=========================================================
ORDER ITEMS HELPER
=========================================================
*/

const getOrderItems = (order) => {
  if (!order) {
    return [];
  }

  /*
  Current backend format
  */

  if (
    Array.isArray(order.orderitems)
  ) {
    return order.orderitems;
  }

  /*
  Older format
  */

  if (
    Array.isArray(order.items)
  ) {
    return order.items;
  }

  /*
  Another possible format
  */

  if (
    Array.isArray(order.order_items)
  ) {
    return order.order_items;
  }

  return [];
};

/*
=========================================================
FORMAT CURRENCY
=========================================================
*/

const formatCurrency = (amount) => {
  const value = Number(amount);

  if (Number.isNaN(value)) {
    return "0.00";
  }

  return value.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/*
=========================================================
FORMAT DATE
=========================================================
*/

const formatDate = (date) => {
  if (!date) {
    return "—";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/*
=========================================================
STATUS CLASS
=========================================================
*/

const getStatusClass = (status) => {
  const normalizedStatus = String(
    status || ""
  ).toLowerCase();

  switch (normalizedStatus) {
    case "delivered":
      return "bg-success";

    case "cancelled":
    case "canceled":
      return "bg-danger";

    case "shipped":
      return "bg-primary";

    case "processing":
      return "bg-warning text-dark";

    case "pending":
      return "bg-secondary";

    case "completed":
      return "bg-success";

    default:
      return "bg-secondary";
  }
};

/*
=========================================================
MAIN COMPONENT
=========================================================
*/

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);

  const [selectedOrder, setSelectedOrder] =
    useState(null);

  const [orderDetails, setOrderDetails] =
    useState({});

  const [loading, setLoading] =
    useState(true);

  const [loadingDetails, setLoadingDetails] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
  =======================================================
  FETCH ORDERS
  =======================================================
  */

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/my-orders/"
      );

      console.log(
        "========== MY ORDERS RESPONSE =========="
      );

      console.log(response.data);

      /*
      Backend currently returns:

      {
        count: 1,
        orders: [...]
      }
      */

      let receivedOrders = [];

      if (
        Array.isArray(
          response.data?.orders
        )
      ) {
        receivedOrders =
          response.data.orders;
      } else if (
        Array.isArray(response.data)
      ) {
        receivedOrders =
          response.data;
      }

      console.log(
        "========== ORDERS =========="
      );

      console.log(receivedOrders);

      /*
      Normalize orders.
      */

      const normalizedOrders =
        receivedOrders.map((order) => {
          const items =
            getOrderItems(order);

          console.log(
            "ORDER:",
            order.id
          );

          console.log(
            "ORDER ITEMS:",
            items
          );

          items.forEach((item) => {
            console.log(
              "PRODUCT:",
              item.product_name
            );

            console.log(
              "RAW IMAGE:",
              item.product_image
            );

            console.log(
              "FINAL IMAGE:",
              getImageUrl(
                item.product_image
              )
            );
          });

          return {
            ...order,

            orderitems: items,

            items: items,
          };
        });

      console.log(
        "========== NORMALIZED ORDERS =========="
      );

      console.log(normalizedOrders);

      setOrders(normalizedOrders);

      /*
      Save the order details immediately.

      We DON'T need another API request if
      /my-orders/ already contains orderitems.
      */

      const details = {};

      normalizedOrders.forEach(
        (order) => {
          details[order.id] = order;
        }
      );

      setOrderDetails(details);

    } catch (err) {
      console.error(
        "========== MY ORDERS ERROR =========="
      );

      console.error(err);

      console.error(
        "SERVER RESPONSE:",
        err.response?.data
      );

      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Unable to load your orders."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  =======================================================
  FETCH ORDER DETAILS
  =======================================================
  */

  const fetchOrderDetails = async (
    orderId
  ) => {
    /*
    Close currently opened order.
    */

    if (
      selectedOrder === orderId
    ) {
      setSelectedOrder(null);
      return;
    }

    /*
    Find existing order.
    */

    const existingOrder =
      orders.find(
        (order) =>
          Number(order.id) ===
          Number(orderId)
      );

    /*
    IMPORTANT:

    If /my-orders/ already contains
    orderitems, use those immediately.
    */

    if (existingOrder) {
      const items =
        getOrderItems(existingOrder);

      if (items.length > 0) {
        setOrderDetails(
          (previous) => ({
            ...previous,

            [orderId]: {
              ...existingOrder,

              orderitems: items,

              items: items,
            },
          })
        );

        setSelectedOrder(orderId);

        return;
      }
    }

    /*
    Otherwise request the detail endpoint.
    */

    try {
      setLoadingDetails(true);

      const response =
        await api.get(
          `/orders/${orderId}/`
        );

      console.log(
        "========== ORDER DETAIL RESPONSE =========="
      );

      console.log(response.data);

      const responseData =
        response.data || {};

      const items =
        getOrderItems(responseData);

      const normalizedOrder = {
        ...(existingOrder || {}),
        ...responseData,

        orderitems: items,

        items: items,
      };

      setOrderDetails(
        (previous) => ({
          ...previous,

          [orderId]:
            normalizedOrder,
        })
      );

      setSelectedOrder(orderId);

    } catch (err) {
      console.error(
        "ORDER DETAIL ERROR:",
        err
      );

      console.error(
        "SERVER RESPONSE:",
        err.response?.data
      );

      /*
      Don't destroy the page if detail
      endpoint fails.

      Use the order already loaded.
      */

      if (existingOrder) {
        setOrderDetails(
          (previous) => ({
            ...previous,

            [orderId]: {
              ...existingOrder,

              orderitems:
                getOrderItems(
                  existingOrder
                ),

              items:
                getOrderItems(
                  existingOrder
                ),
            },
          })
        );

        setSelectedOrder(orderId);
      }
    } finally {
      setLoadingDetails(false);
    }
  };

  /*
  =======================================================
  DELETE ORDER
  =======================================================
  */

  const deleteOrder = async (
    orderId
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this order?"
      );

    if (!confirmed) {
      return;
    }

    try {
      const token =
        localStorage.getItem(
          "access"
        );

      await api.delete(
        `/orders/delete/${orderId}/`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      setOrders(
        (previousOrders) =>
          previousOrders.filter(
            (order) =>
              Number(order.id) !==
              Number(orderId)
          )
      );

      setOrderDetails(
        (previousDetails) => {
          const updated = {
            ...previousDetails,
          };

          delete updated[
            orderId
          ];

          return updated;
        }
      );

      if (
        selectedOrder === orderId
      ) {
        setSelectedOrder(null);
      }

      alert(
        "Order deleted successfully."
      );

    } catch (err) {
      console.error(
        "DELETE ORDER ERROR:",
        err
      );

      alert(
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Failed to delete order."
      );
    }
  };

  /*
  =======================================================
  GENERATE PDF
  =======================================================
  */

  const generateInvoicePDF = async (
    order,
    details
  ) => {
    try {
      const doc = new jsPDF();

      const items =
        getOrderItems(details);

      const invoiceUrl =
        `${window.location.origin}/invoice/${order.id}`;

      const qrCode =
        await QRCode.toDataURL(
          invoiceUrl
        );

      /*
      LOGO
      */

      doc.addImage(
        logo,
        "PNG",
        14,
        10,
        25,
        25
      );

      /*
      HEADER
      */

      doc.setFontSize(22);

      doc.text(
        "NaijaOpenMarket",
        45,
        18
      );

      doc.setFontSize(10);

      doc.text(
        "Your Trusted Online Marketplace",
        45,
        25
      );

      doc.setFontSize(18);

      doc.text(
        "INVOICE",
        160,
        20
      );

      /*
      QR
      */

      doc.addImage(
        qrCode,
        "PNG",
        160,
        30,
        35,
        35
      );

      /*
      ORDER INFORMATION
      */

      doc.setFontSize(11);

      doc.text(
        `Order No: ${
          order.order_number ||
          ""
        }`,
        14,
        45
      );

      doc.text(
        `Date: ${
          formatDate(
            order.created_at
          )
        }`,
        14,
        52
      );

      doc.text(
        `Status: ${
          order.status ||
          "Processing"
        }`,
        14,
        59
      );

      doc.text(
        `Payment: ${
          order.payment_method ||
          "—"
        }`,
        14,
        66
      );

      /*
      CUSTOMER
      */

      doc.setFontSize(14);

      doc.text(
        "Customer Information",
        14,
        82
      );

      doc.setFontSize(11);

      doc.text(
        `Customer: ${
          order.full_name ||
          order.customer_name ||
          ""
        }`,
        14,
        90
      );

      doc.text(
        `Email: ${
          order.email ||
          ""
        }`,
        14,
        97
      );

      doc.text(
        `Phone: ${
          order.phone ||
          order.phone_number ||
          ""
        }`,
        14,
        104
      );

      doc.text(
        `Address: ${
          order.shipping_address ||
          order.address ||
          ""
        }`,
        14,
        111
      );

      /*
      PRODUCTS
      */

      const rows =
        items.map(
          (item) => [
            item.product_name ||
              item.product?.name ||
              "Product",

            item.quantity || 0,

            `₦${formatCurrency(
              item.unit_price
            )}`,

            `₦${formatCurrency(
              item.total_price ??
                Number(
                  item.unit_price || 0
                ) *
                  Number(
                    item.quantity || 0
                  )
            )}`,
          ]
        );

      autoTable(doc, {
        startY: 120,

        head: [
          [
            "Product",
            "Qty",
            "Unit Price",
            "Total",
          ],
        ],

        body:
          rows.length > 0
            ? rows
            : [
                [
                  "No products",
                  "",
                  "",
                  "",
                ],
              ],

        theme: "grid",
      });

      const finalY =
        doc.lastAutoTable.finalY +
        15;

      /*
      TOTALS
      */

      doc.setFontSize(11);

      doc.text(
        `Subtotal: ₦${formatCurrency(
          order.subtotal
        )}`,
        130,
        finalY
      );

      if (
        order.vat !==
        undefined
      ) {
        doc.text(
          `VAT: ₦${formatCurrency(
            order.vat
          )}`,
          130,
          finalY + 8
        );
      }

      const delivery =
        order.delivery_fee ??
        order.shipping_fee;

      if (
        delivery !==
        undefined
      ) {
        doc.text(
          `Delivery: ₦${formatCurrency(
            delivery
          )}`,
          130,
          finalY + 16
        );
      }

      doc.setFontSize(14);

      doc.text(
        `TOTAL: ₦${formatCurrency(
          order.total_amount
        )}`,
        130,
        finalY + 28
      );

      /*
      FOOTER
      */

      doc.setFontSize(10);

      doc.text(
        "Thank you for shopping with NaijaOpenMarket.",
        14,
        finalY + 45
      );

      doc.text(
        "support@naijaopenmarket.com",
        14,
        finalY + 52
      );

      doc.save(
        `${
          order.order_number ||
          "order"
        }-Invoice.pdf`
      );

    } catch (err) {
      console.error(
        "INVOICE ERROR:",
        err
      );

      alert(
        "Unable to generate invoice."
      );
    }
  };

  /*
  =======================================================
  LOADING
  =======================================================
  */

  if (loading) {
    return (
      <div className="container py-5">

        <div className="text-center py-5">

          <div
            className="spinner-border text-primary mb-3"
            role="status"
          />

          <p className="text-muted">
            Loading your orders...
          </p>

        </div>

      </div>
    );
  }

  /*
  =======================================================
  ERROR
  =======================================================
  */

  if (error) {
    return (
      <div className="container py-5">

        <div
          className="card border-0 shadow-sm"
          style={{
            borderRadius: "18px",
          }}
        >

          <div className="card-body text-center py-5">

            <div
              style={{
                fontSize: "45px",
              }}
            >
              ⚠️
            </div>

            <h4 className="fw-bold mt-3">
              Unable to load orders
            </h4>

            <p className="text-muted">
              {error}
            </p>

            <button
              type="button"
              className="btn btn-dark px-4"
              onClick={fetchOrders}
            >
              Try Again
            </button>

          </div>

        </div>

      </div>
    );
  }

  /*
  =======================================================
  PAGE
  =======================================================
  */

  return (
    <div
      className="container py-5"
      style={{
        maxWidth: "1200px",
      }}
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-5">

        <div
          className="text-uppercase text-muted fw-semibold small mb-2"
          style={{
            letterSpacing: "0.16em",
          }}
        >
          My Account
        </div>

        <div className="d-flex flex-wrap justify-content-between align-items-end gap-3">

          <div>

            <h1
              className="fw-bold mb-2"
              style={{
                fontSize:
                  "clamp(2rem, 4vw, 3rem)",
              }}
            >
              My Orders
            </h1>

            <p className="text-muted mb-0">
              Track your purchases,
              view products and manage
              your orders.
            </p>

          </div>

          <div
            className="px-4 py-3 rounded-4"
            style={{
              background: "#f6f6f3",
            }}
          >

            <div
              className="small text-muted"
            >
              Total Orders
            </div>

            <div
              className="fw-bold fs-4"
            >
              {orders.length}
            </div>

          </div>

        </div>

      </div>

      {/* =================================================
          EMPTY
      ================================================= */}

      {orders.length === 0 ? (

        <div
          className="card border-0 shadow-sm"
          style={{
            borderRadius: "20px",
          }}
        >

          <div
            className="card-body text-center py-5"
          >

            <div
              style={{
                fontSize: "55px",
              }}
            >
              🛍️
            </div>

            <h3 className="fw-bold mt-3">
              No orders yet
            </h3>

            <p className="text-muted">
              Your completed purchases
              will appear here.
            </p>

            <Link
              to="/shop"
              className="btn btn-dark px-4 py-2"
            >
              Start Shopping
            </Link>

          </div>

        </div>

      ) : (

        /* =================================================
           ORDERS
        ================================================= */

        <div className="d-flex flex-column gap-4">

          {orders.map(
            (order) => {

              const details =
                orderDetails[
                  order.id
                ] || order;

              const items =
                getOrderItems(
                  details
                );

              const isSelected =
                selectedOrder ===
                order.id;

              return (

                <div
                  key={order.id}
                  className="card border-0 shadow-sm overflow-hidden"
                  style={{
                    borderRadius:
                      "20px",
                  }}
                >

                  {/* =====================================
                      ORDER SUMMARY
                  ===================================== */}

                  <div className="card-body p-4">

                    <div className="row align-items-center g-4">

                      {/* ORDER */}

                      <div className="col-lg-4">

                        <div
                          className="small text-muted text-uppercase fw-semibold mb-1"
                          style={{
                            letterSpacing:
                              "0.12em",
                          }}
                        >
                          Order Number
                        </div>

                        <button
                          type="button"
                          className="btn btn-link p-0 text-decoration-none fw-bold"
                          onClick={() =>
                            fetchOrderDetails(
                              order.id
                            )
                          }
                        >
                          {order.order_number}
                        </button>

                      </div>

                      {/* DATE */}

                      <div className="col-6 col-lg-2">

                        <div
                          className="small text-muted text-uppercase fw-semibold mb-1"
                          style={{
                            letterSpacing:
                              "0.12em",
                          }}
                        >
                          Date
                        </div>

                        <div className="fw-medium">
                          {formatDate(
                            order.created_at
                          )}
                        </div>

                      </div>

                      {/* TOTAL */}

                      <div className="col-6 col-lg-2">

                        <div
                          className="small text-muted text-uppercase fw-semibold mb-1"
                          style={{
                            letterSpacing:
                              "0.12em",
                          }}
                        >
                          Total
                        </div>

                        <div className="fw-bold">
                          ₦
                          {formatCurrency(
                            order.total_amount
                          )}
                        </div>

                      </div>

                      {/* STATUS */}

                      <div className="col-6 col-lg-2">

                        <div
                          className="small text-muted text-uppercase fw-semibold mb-1"
                          style={{
                            letterSpacing:
                              "0.12em",
                          }}
                        >
                          Status
                        </div>

                        <span
                          className={`badge rounded-pill px-3 py-2 ${getStatusClass(
                            order.status
                          )}`}
                        >
                          {order.status ||
                            "Processing"}
                        </span>

                      </div>

                      {/* DELETE */}

                      <div className="col-6 col-lg-2 text-lg-end">

                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm px-3"
                          onClick={() =>
                            deleteOrder(
                              order.id
                            )
                          }
                        >
                          Delete
                        </button>

                      </div>

                    </div>

                  </div>

                  {/* =====================================
                      DETAILS
                  ===================================== */}

                  {isSelected && (

                    <div
                      className="border-top"
                      style={{
                        background:
                          "#f8f8f6",
                      }}
                    >

                      <div className="p-4">

                        {loadingDetails ? (

                          <div className="text-center py-5">

                            <div
                              className="spinner-border text-primary"
                              role="status"
                            />

                            <div className="text-muted mt-3">
                              Loading order
                              details...
                            </div>

                          </div>

                        ) : (

                          <>

                            {/* =================================
                                DETAIL HEADER
                            ================================= */}

                            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">

                              <div>

                                <div
                                  className="small text-muted text-uppercase fw-semibold mb-1"
                                  style={{
                                    letterSpacing:
                                      "0.13em",
                                  }}
                                >
                                  Order Details
                                </div>

                                <h4 className="fw-bold mb-0">
                                  {order.order_number}
                                </h4>

                              </div>

                              <div
                                className="badge rounded-pill bg-dark px-3 py-2"
                              >
                                {items.length}{" "}
                                {items.length ===
                                1
                                  ? "Product"
                                  : "Products"}
                              </div>

                            </div>

                            {/* =================================
                                DELIVERY + PAYMENT
                            ================================= */}

                            <div className="row g-4 mb-4">

                              {/* DELIVERY */}

                              <div className="col-lg-6">

                                <div
                                  className="card border-0 h-100 shadow-sm"
                                  style={{
                                    borderRadius:
                                      "16px",
                                  }}
                                >

                                  <div className="card-body p-4">

                                    <div
                                      className="small text-muted text-uppercase fw-semibold mb-2"
                                      style={{
                                        letterSpacing:
                                          "0.12em",
                                      }}
                                    >
                                      Delivery
                                    </div>

                                    <h5 className="fw-bold mb-4">
                                      Shipping
                                      Information
                                    </h5>

                                    <div className="mb-3">

                                      <div className="small text-muted">
                                        Address
                                      </div>

                                      <div
                                        className="fw-medium"
                                        style={{
                                          whiteSpace:
                                            "pre-line",
                                        }}
                                      >
                                        {order.shipping_address ||
                                          order.address ||
                                          "Not provided"}
                                      </div>

                                    </div>

                                    <div className="row g-3">

                                      <div className="col-4">

                                        <div className="small text-muted">
                                          City
                                        </div>

                                        <div className="fw-medium">
                                          {order.city ||
                                            "—"}
                                        </div>

                                      </div>

                                      <div className="col-4">

                                        <div className="small text-muted">
                                          State
                                        </div>

                                        <div className="fw-medium">
                                          {order.state ||
                                            "—"}
                                        </div>

                                      </div>

                                      <div className="col-4">

                                        <div className="small text-muted">
                                          Country
                                        </div>

                                        <div className="fw-medium">
                                          {order.country ||
                                            "—"}
                                        </div>

                                      </div>

                                    </div>

                                  </div>

                                </div>

                              </div>

                              {/* PAYMENT */}

                              <div className="col-lg-6">

                                <div
                                  className="card border-0 h-100 shadow-sm"
                                  style={{
                                    borderRadius:
                                      "16px",
                                  }}
                                >

                                  <div className="card-body p-4">

                                    <div
                                      className="small text-muted text-uppercase fw-semibold mb-2"
                                      style={{
                                        letterSpacing:
                                          "0.12em",
                                      }}
                                    >
                                      Payment
                                    </div>

                                    <h5 className="fw-bold mb-4">
                                      Payment
                                      Information
                                    </h5>

                                    <div className="row g-4">

                                      <div className="col-6">

                                        <div className="small text-muted">
                                          Method
                                        </div>

                                        <div className="fw-semibold text-capitalize">
                                          {order.payment_method ||
                                            "—"}
                                        </div>

                                      </div>

                                      <div className="col-6">

                                        <div className="small text-muted">
                                          Type
                                        </div>

                                        <div className="fw-semibold text-capitalize">
                                          {order.payment_type ||
                                            "—"}
                                        </div>

                                      </div>

                                      <div className="col-6">

                                        <div className="small text-muted">
                                          Payment
                                          Status
                                        </div>

                                        <span className="badge rounded-pill bg-success mt-1">
                                          {order.payment_status ||
                                            "Paid"}
                                        </span>

                                      </div>

                                      <div className="col-6">

                                        <div className="small text-muted">
                                          Order
                                          Status
                                        </div>

                                        <div className="fw-semibold text-capitalize">
                                          {order.status ||
                                            "Processing"}
                                        </div>

                                      </div>

                                    </div>

                                  </div>

                                </div>

                              </div>

                            </div>

                            {/* =================================
                                PRODUCTS
                            ================================= */}

                            <div
                              className="card border-0 shadow-sm"
                              style={{
                                borderRadius:
                                  "16px",
                              }}
                            >

                              <div className="card-body p-0">

                                <div className="p-4 border-bottom">

                                  <div
                                    className="small text-muted text-uppercase fw-semibold mb-1"
                                    style={{
                                      letterSpacing:
                                        "0.13em",
                                    }}
                                  >
                                    Order Contents
                                  </div>

                                  <div className="d-flex justify-content-between align-items-center">

                                    <h4 className="fw-bold mb-0">
                                      Products
                                    </h4>

                                    <span className="text-muted">
                                      {items.length}{" "}
                                      {items.length ===
                                      1
                                        ? "item"
                                        : "items"}
                                    </span>

                                  </div>

                                </div>

                                {items.length >
                                0 ? (

                                  <div>

                                    {items.map(
                                      (
                                        item,
                                        index
                                      ) => {

                                        const productName =
                                          item.product_name ||
                                          item.product?.name ||
                                          "Product";

                                        const image =
                                          item.product_image ||
                                          item.image ||
                                          item.product?.image ||
                                          item.product?.product_image ||
                                          null;

                                        const imageUrl =
                                          getImageUrl(
                                            image
                                          );

                                        const quantity =
                                          Number(
                                            item.quantity ||
                                              0
                                          );

                                        const unitPrice =
                                          Number(
                                            item.unit_price ||
                                              0
                                          );

                                        const totalPrice =
                                          Number(
                                            item.total_price ??
                                              unitPrice *
                                                quantity
                                          );

                                        return (

                                          <div
                                            key={
                                              item.id ||
                                              `${order.id}-${index}`
                                            }
                                            className="p-4 border-bottom"
                                          >

                                            <div className="row align-items-center g-4">

                                              {/* IMAGE */}

                                              <div className="col-auto">

                                                <div
                                                  style={{
                                                    width:
                                                      "100px",
                                                    height:
                                                      "100px",
                                                    background:
                                                      "#f3f3f0",
                                                    borderRadius:
                                                      "16px",
                                                    overflow:
                                                      "hidden",
                                                    display:
                                                      "flex",
                                                    alignItems:
                                                      "center",
                                                    justifyContent:
                                                      "center",
                                                  }}
                                                >

                                                  {imageUrl ? (

                                                    <img
                                                      src={
                                                        imageUrl
                                                      }
                                                      alt={
                                                        productName
                                                      }
                                                      style={{
                                                        width:
                                                          "100%",
                                                        height:
                                                          "100%",
                                                        objectFit:
                                                          "cover",
                                                        display:
                                                          "block",
                                                      }}
                                                      onLoad={() => {
                                                        console.log(
                                                          "IMAGE LOADED:",
                                                          imageUrl
                                                        );
                                                      }}
                                                      onError={(
                                                        event
                                                      ) => {
                                                        console.error(
                                                          "IMAGE FAILED:",
                                                          imageUrl
                                                        );

                                                        /*
                                                        Prevent
                                                        infinite
                                                        fallback.
                                                        */

                                                        event.currentTarget.style.display =
                                                          "none";

                                                        const parent =
                                                          event
                                                            .currentTarget
                                                            .parentElement;

                                                        if (
                                                          parent
                                                        ) {
                                                          parent.dataset.imageFailed =
                                                            "true";

                                                          parent.innerHTML =
                                                            `
                                                            <span
                                                              style="
                                                                color:#999;
                                                                font-size:12px;
                                                                text-align:center;
                                                                padding:10px;
                                                              "
                                                            >
                                                              Image unavailable
                                                            </span>
                                                            `;
                                                        }
                                                      }}
                                                    />

                                                  ) : (

                                                    <span
                                                      className="text-muted small text-center px-2"
                                                    >
                                                      No Image
                                                    </span>

                                                  )}

                                                </div>

                                              </div>

                                              {/* PRODUCT */}

                                              <div className="col">

                                                <div
                                                  className="small text-muted text-uppercase fw-semibold mb-1"
                                                  style={{
                                                    letterSpacing:
                                                      "0.1em",
                                                  }}
                                                >
                                                  Item{" "}
                                                  {String(
                                                    index +
                                                      1
                                                  ).padStart(
                                                    2,
                                                    "0"
                                                  )}
                                                </div>

                                                <h5 className="fw-bold mb-2">
                                                  {
                                                    productName
                                                  }
                                                </h5>

                                                <div className="d-flex flex-wrap gap-3">

                                                  {item.seller_username && (

                                                    <span className="small text-muted">
                                                      Seller:{" "}
                                                      <strong>
                                                        {
                                                          item.seller_username
                                                        }
                                                      </strong>
                                                    </span>

                                                  )}

                                                  {item.shop_name && (

                                                    <span className="small text-muted">
                                                      Shop:{" "}
                                                      <strong>
                                                        {
                                                          item.shop_name
                                                        }
                                                      </strong>
                                                    </span>

                                                  )}

                                                </div>

                                              </div>

                                              {/* QUANTITY */}

                                              <div className="col-4 col-md-2">

                                                <div className="small text-muted mb-1">
                                                  Quantity
                                                </div>

                                                <div className="fw-semibold">
                                                  {quantity}
                                                </div>

                                              </div>

                                              {/* UNIT PRICE */}

                                              <div className="col-4 col-md-2">

                                                <div className="small text-muted mb-1">
                                                  Unit Price
                                                </div>

                                                <div className="fw-semibold">
                                                  ₦
                                                  {formatCurrency(
                                                    unitPrice
                                                  )}
                                                </div>

                                              </div>

                                              {/* TOTAL */}

                                              <div className="col-4 col-md-2 text-md-end">

                                                <div className="small text-muted mb-1">
                                                  Item Total
                                                </div>

                                                <div className="fw-bold">
                                                  ₦
                                                  {formatCurrency(
                                                    totalPrice
                                                  )}
                                                </div>

                                              </div>

                                            </div>

                                          </div>

                                        );
                                      }
                                    )}

                                    {/* =================================
                                        TOTALS
                                    ================================= */}

                                    <div className="p-4">

                                      <div className="row justify-content-end">

                                        <div className="col-md-5 col-lg-4">

                                          <div className="d-flex justify-content-between mb-2">

                                            <span className="text-muted">
                                              Subtotal
                                            </span>

                                            <strong>
                                              ₦
                                              {formatCurrency(
                                                order.subtotal
                                              )}
                                            </strong>

                                          </div>

                                          {order.vat !==
                                            undefined && (

                                            <div className="d-flex justify-content-between mb-2">

                                              <span className="text-muted">
                                                VAT
                                              </span>

                                              <span>
                                                ₦
                                                {formatCurrency(
                                                  order.vat
                                                )}
                                              </span>

                                            </div>

                                          )}

                                          {(
                                            order.delivery_fee !==
                                              undefined ||
                                            order.shipping_fee !==
                                              undefined
                                          ) && (

                                            <div className="d-flex justify-content-between mb-3">

                                              <span className="text-muted">
                                                Delivery
                                              </span>

                                              <span>
                                                ₦
                                                {formatCurrency(
                                                  order.delivery_fee ??
                                                    order.shipping_fee
                                                )}
                                              </span>

                                            </div>

                                          )}

                                          <div
                                            className="d-flex justify-content-between border-top pt-3"
                                          >

                                            <span className="fw-bold">
                                              Order Total
                                            </span>

                                            <span className="fw-bold fs-5">
                                              ₦
                                              {formatCurrency(
                                                order.total_amount
                                              )}
                                            </span>

                                          </div>

                                        </div>

                                      </div>

                                    </div>

                                  </div>

                                ) : (

                                  <div className="text-center py-5 px-4">

                                    <div
                                      style={{
                                        fontSize:
                                          "40px",
                                      }}
                                    >
                                      🛒
                                    </div>

                                    <h5 className="fw-bold mt-3">
                                      No products
                                      found
                                    </h5>

                                    <p className="text-muted mb-0">
                                      No order
                                      items were
                                      returned
                                      for this
                                      order.
                                    </p>

                                  </div>

                                )}

                              </div>

                            </div>

                            {/* =================================
                                ACTION BUTTONS
                            ================================= */}

                            <div className="d-flex flex-wrap gap-2 mt-4">

                              <Link
                                to={`/invoice/${order.id}`}
                                className="btn btn-success px-4"
                              >
                                View Invoice
                              </Link>

                              <button
                                type="button"
                                className="btn btn-dark px-4"
                                onClick={() =>
                                  generateInvoicePDF(
                                    order,
                                    details
                                  )
                                }
                              >
                                Download PDF
                              </button>

                              <button
                                type="button"
                                className="btn btn-outline-dark px-4"
                                onClick={() =>
                                  window.print()
                                }
                              >
                                Print Order
                              </button>

                              <button
                                type="button"
                                className="btn btn-outline-secondary px-4"
                                onClick={() =>
                                  setSelectedOrder(
                                    null
                                  )
                                }
                              >
                                Close
                              </button>

                            </div>

                          </>

                        )}

                      </div>

                    </div>

                  )}

                </div>

              );
            }
          )}

        </div>

      )}

    </div>
  );
};

export default OrdersPage;










// import React, { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import api from "../../api";

// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import QRCode from "qrcode";

// import logo from "../../assets/image/NaijaOpenMarket.png";

// const OrdersPage = () => {

//   const [orders, setOrders] = useState([]);
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [orderDetails, setOrderDetails] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [loadingDetails, setLoadingDetails] = useState(false);
//   const [error, setError] = useState("");


//   const deleteOrder = async (orderId) => {
//     const confirmDelete = window.confirm(
//         "Are you sure you want to delete this order?"
//     );

//     if (!confirmDelete) return;

//     try {
//         const token = localStorage.getItem("access");

//         await api.delete(
//             `/orders/delete/${orderId}/`,
//             {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                 },
//             }
//         );

//         setOrders(
//             orders.filter(
//                 (order) => order.id !== orderId
//             )
//         );

//         alert("Order deleted successfully");

//     } catch (error) {
//         console.error(error);

//         alert(
//             error.response?.data?.error ||
//             "Failed to delete order"
//         );
//     }
// };

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   const formatCurrency = (amount) =>
//     Number(amount || 0).toLocaleString(
//       "en-NG",
//       {
//         minimumFractionDigits: 2,
//         maximumFractionDigits: 2,
//       }
//     );

//   const fetchOrders = async () => {
//     try {
//       const res = await api.get(
//         "/my-orders/"
//       );

//       setOrders(res.data.orders || []);
//     } catch (err) {
//       console.error(err);

//       setError(
//         "Unable to load orders."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchOrderDetails = async (
//     orderId
//   ) => {
//     try {
//       if (selectedOrder === orderId) {
//         setSelectedOrder(null);
//         return;
//       }

//       if (orderDetails[orderId]) {
//         setSelectedOrder(orderId);
//         return;
//       }

//       setLoadingDetails(true);

//       const res = await api.get(
//         `/orders/${orderId}/`
//       );

//       setOrderDetails((prev) => ({
//         ...prev,
//         [orderId]: res.data,
//       }));

//       setSelectedOrder(orderId);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoadingDetails(false);
//     }
//   };

//   const generateInvoicePDF = async (
//     order,
//     details
//   ) => {
//     try {
//       const doc = new jsPDF();

//       const invoiceUrl =
//         `${window.location.origin}/invoice/${order.id}`;

//       const qrCodeImage =
//         await QRCode.toDataURL(
//           invoiceUrl
//         );

//       // LOGO

//       doc.addImage(
//         logo,
//         "PNG",
//         14,
//         10,
//         25,
//         25
//       );

//       // HEADER

//       doc.setFontSize(22);

//       doc.text(
//         "NaijaOpenMarket",
//         45,
//         18
//       );

//       doc.setFontSize(10);

//       doc.text(
//         "Your Trusted Online Marketplace",
//         45,
//         25
//       );

//       doc.setFontSize(18);

//       doc.text(
//         "INVOICE",
//         160,
//         20
//       );

//       // QR CODE

//       doc.addImage(
//         qrCodeImage,
//         "PNG",
//         160,
//         30,
//         35,
//         35
//       );

//       // ORDER INFO

//       doc.setFontSize(11);

//       doc.text(
//         `Invoice No: ${order.order_number}`,
//         14,
//         45
//       );

//       doc.text(
//         `Date: ${new Date(
//           order.created_at
//         ).toLocaleDateString()}`,
//         14,
//         52
//       );

//       doc.text(
//         `Status: ${order.status}`,
//         14,
//         59
//       );

//       doc.text(
//         `Payment Status: ${
//           order.payment_status ||
//           "Paid"
//         }`,
//         14,
//         66
//       );

//       // CUSTOMER

//       doc.setFontSize(14);

//       doc.text(
//         "Customer Information",
//         14,
//         82
//       );

//       doc.setFontSize(11);

//       doc.text(
//         `Customer: ${
//           order.full_name || ""
//         }`,
//         14,
//         90
//       );

//       doc.text(
//         `Email: ${
//           order.email || ""
//         }`,
//         14,
//         97
//       );

//       doc.text(
//         `Phone: ${
//           order.phone || ""
//         }`,
//         14,
//         104
//       );

//       doc.text(
//         `Address: ${
//           order.shipping_address || ""
//         }`,
//         14,
//         111
//       );

//       // ITEMS

//       const rows =
//         details?.items?.map(
//           (item) => [
//             item.product_name,
//             item.quantity,
//             `₦${formatCurrency(
//               item.unit_price
//             )}`,
//             `₦${formatCurrency(
//               item.total_price
//             )}`,
//           ]
//         ) || [];

//       autoTable(doc, {
//         startY: 120,

//         head: [
//           [
//             "Product",
//             "Qty",
//             "Unit Price",
//             "Total",
//           ],
//         ],

//         body: rows,

//         theme: "grid",

//         headStyles: {
//           fillColor: [96, 88, 220],
//         },
//       });

//       const finalY =
//         doc.lastAutoTable.finalY + 15;

//       // TOTALS

//       doc.text(
//         `Subtotal: ₦${formatCurrency(
//           order.subtotal
//         )}`,
//         130,
//         finalY
//       );

//       doc.text(
//         `VAT: ₦${formatCurrency(
//           order.vat
//         )}`,
//         130,
//         finalY + 8
//       );

//       doc.text(
//         `Delivery Fee: ₦${formatCurrency(
//           order.delivery_fee
//         )}`,
//         130,
//         finalY + 16
//       );

//       doc.setFontSize(14);

//       doc.text(
//         `TOTAL: ₦${formatCurrency(
//           order.total_amount
//         )}`,
//         130,
//         finalY + 28
//       );

//       // FOOTER

//       doc.setFontSize(10);

//       doc.text(
//         "Thank you for shopping with NaijaOpenMarket",
//         14,
//         finalY + 45
//       );

//       doc.text(
//         "support@naijaopenmarket.com",
//         14,
//         finalY + 52
//       );

//       doc.save(
//         `${order.order_number}-Invoice.pdf`
//       );
//     } catch (err) {
//       console.error(
//         "Invoice Error:",
//         err
//       );
//     }
//   };

//   if (loading)
//     return (
//       <div className="text-center py-5">
//         Loading orders...
//       </div>
//     );

//   if (error)
//     return (
//       <div className="alert alert-danger">
//         {error}
//       </div>
//     );

//   return (
//     <div className="container py-5">

//       <h2 className="mb-4">
//         My Orders
//       </h2>

//       <table className="table table-hover">

//         <thead className="table-dark">
//           <tr>
//             <th>Order</th>
//             <th>Date</th>
//             <th>Total</th>
//             <th>Status</th>
//           </tr>
//         </thead>

//         <tbody>

//           {orders.map((order) => (
//             <React.Fragment
//               key={order.id}
//             >

//               <tr>

//                 <td>

//                   <button
//                     className="btn btn-link"
//                     onClick={() =>
//                       fetchOrderDetails(
//                         order.id
//                       )
//                     }
//                   >
//                     {order.order_number}
//                   </button>

//                 </td>

//                 <td>
//                   {new Date(
//                     order.created_at
//                   ).toLocaleDateString()}
//                 </td>

//                 <td>
//                   ₦
//                   {formatCurrency(
//                     order.total_amount
//                   )}
//                 </td>

//                 <td>
//                   {order.status}
//                 </td>

//                 <td>
//                     <button
//                         className="btn btn-danger btn-sm"
//                         onClick={() => deleteOrder(order.id)}
//                     >
//                         Delete
//                     </button>
//                 </td>


//               </tr>
// {selectedOrder === order.id && (
//   <tr>
//     <td colSpan="4" className="bg-light">
//       <div className="card border-0 shadow-sm">
//         <div className="card-body">

//           <h5 className="mb-3">
//             Order Details
//           </h5>

//           {loadingDetails ? (
//             <div className="text-center py-3">
//               <div className="spinner-border spinner-border-sm text-primary" />
//             </div>
//           ) : (
//             <>
//               <div className="row">

//                 <div className="col-md-6">

//                   <p>
//                     <strong>Shipping Address:</strong>
//                   </p>

//                   <p>
//                     {order.shipping_address}
//                   </p>

//                   <p>
//                     <strong>City:</strong>{" "}
//                     {order.city}
//                   </p>

//                 </div>

//                 <div className="col-md-6">

//                   <p>
//                     <strong>Payment Type:</strong>{" "}
//                     {orderDetails[order.id]?.payment_type ||
//                       "Online"}
//                   </p>

//                   <p>
//                     <strong>Payment Method:</strong>{" "}
//                     {orderDetails[order.id]?.payment_method ||
//                       "Paystack"}
//                   </p>

//                   <p>
//                     <strong>Payment Status:</strong>{" "}
//                     <span className="badge bg-success">
//                       {order.payment_status || "Paid"}
//                     </span>
//                   </p>

//                 </div>

//               </div>

//               <hr />

//               <h6 className="fw-bold">
//                 Ordered Items
//               </h6>

//               <table className="table table-bordered">
//                 <thead>
//                   <tr>
//                     <th>Product</th>
//                     <th>Qty</th>
//                     <th>Unit Price</th>
//                     <th>Total</th>
//                   </tr>
//                 </thead>
//                 <thead>
//                   <tr>
//                       <th>Order Number</th>
//                       <th>Date</th>
//                       <th>Total</th>
//                       <th>Status</th>
//                       <th>Actions</th>
//                   </tr>
//               </thead>

//                 <tbody>

//                   {orderDetails[order.id]?.items?.length > 0 ? (

//                     orderDetails[order.id].items.map(
//                       (item) => (
//                         <tr key={item.id}>

//                           <td>
//                             {item.product_name}
//                           </td>

//                           <td>
//                             {item.quantity}
//                           </td>

//                           <td>
//                             ₦
//                             {Number(
//                               item.unit_price
//                             ).toLocaleString()}
//                           </td>

//                           <td>
//                             ₦
//                             {Number(
//                               item.total_price
//                             ).toLocaleString()}
//                           </td>

//                         </tr>
//                       )
//                     )

//                   ) : (

//                     <tr>
//                       <td
//                         colSpan="4"
//                         className="text-center"
//                       >
//                         No items found.
//                       </td>
//                     </tr>

//                   )}

//                 </tbody>
//               </table>

//               <div className="mt-4 d-flex gap-2 flex-wrap">

//                 <Link
//                   to={`/invoice/${order.id}`}
//                   className="btn btn-success"
//                 >
//                   View Invoice
//                 </Link>

//                 <button
//                   className="btn btn-danger"
//                   onClick={() =>
//                     generateInvoicePDF(
//                       order,
//                       orderDetails[order.id]
//                     )
//                   }
//                 >
//                   Download PDF
//                 </button>

//                 <button
//                   className="btn btn-primary"
//                   onClick={() =>
//                     window.print()
//                   }
//                 >
//                   Print Order
//                 </button>

//               </div>

//             </>
//           )}

//         </div>
//       </div>
//     </td>
//   </tr>
// )}
//               {/* {selectedOrder ===
//                 order.id && (
//                 <tr>

//                   <td colSpan="4">

//                     <div className="card">

//                       <div className="card-body">

//                         {loadingDetails ? (
//                           "Loading..."
//                         ) : (
//                           <>
//                             <p>
//                               <strong>
//                                 Address:
//                               </strong>{" "}
//                               {
//                                 order.shipping_address
//                               }
//                             </p>

//                             <p>
//                               <strong>
//                                 City:
//                               </strong>{" "}
//                               {order.city}
//                             </p>

//                             <p>
//                               <strong>
//                                 Payment Type:
//                               </strong>{" "}
//                               {
//                                 orderDetails[
//                                   order.id
//                                 ]
//                                   ?.payment_type
//                               }
//                             </p>

//                             <p>
//                               <strong>
//                                 Payment Method:
//                               </strong>{" "}
//                               {
//                                 orderDetails[
//                                   order.id
//                                 ]
//                                   ?.payment_method
//                               }
//                             </p>

//                             <div className="d-flex gap-2 mt-3">

//                               <Link
//                                 to={`/invoice/${order.id}`}
//                                 className="btn btn-success"
//                               >
//                                 View Invoice
//                               </Link>

//                               <button
//                                 className="btn btn-danger"
//                                 onClick={() =>
//                                   generateInvoicePDF(
//                                     order,
//                                     orderDetails[
//                                       order.id
//                                     ]
//                                   )
//                                 }
//                               >
//                                 Download PDF
//                               </button>

//                               <button
//                                 className="btn btn-primary"
//                                 onClick={() =>
//                                   window.print()
//                                 }
//                               >
//                                 Print Order
//                               </button>

//                             </div>
//                           </>
//                         )}

//                       </div>

//                     </div>

//                   </td>

//                 </tr>
//               )} */}

//             </React.Fragment>
//           ))}

//         </tbody>

//       </table>

//     </div>
//   );
// };

// export default OrdersPage;





// import React, { useEffect, useState } from "react";
// import api from "../../api";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import { Link } from "react-router-dom";

// import QRCode from "qrcode";
// import logo from "../../assets/image/NaijaOpenMarket.png";

// const OrdersPage = () => {
// const generateInvoicePDF = (order, details) => {
//   const doc = new jsPDF();


// const invoiceUrl =
//   `${window.location.origin}/invoice/${order.id}`;

// const qrCodeImage =
//   await QRCode.toDataURL(invoiceUrl);

//   const formatCurrency = (amount) =>
//     Number(amount || 0).toLocaleString("en-NG", {
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//     });
// const img = new Image();
// img.src = logo;

// img.onload = () => {
//   doc.addImage(
//     img,
//     "PNG",
//     14,
//     10,
//     30,
//     30
//   );
// };


//   // Header
//   doc.setFontSize(24);
//   doc.setTextColor(96, 88, 220);
//   doc.text("NaijaOpenMarket", 14, 20);

//   doc.setFontSize(12);
//   doc.setTextColor(0, 0, 0);

//   doc.text(
//     "Your Trusted Online Marketplace",
//     14,
//     28
//   );

//   // Invoice Title
//   doc.setFontSize(18);
//   doc.text("INVOICE", 160, 20);

//   doc.setFontSize(11);

//   doc.text(
//     `Invoice No: ${order.order_number}`,
//     14,
//     45
//   );

//   doc.text(
//     `Date: ${new Date(
//       order.created_at
//     ).toLocaleDateString()}`,
//     14,
//     52
//   );

//   doc.text(
//     `Status: ${order.status}`,
//     14,
//     59
//   );

//   doc.text(
//   `Payment Type: ${details.payment_type}`,
//   14,
//   55
// );

// doc.text(
//   `Payment Method: ${details.payment_method}`,
//   14,
//   63
// );
//   // Customer Details
//   doc.setFontSize(14);
//   doc.text("Shipping Information", 14, 75);

//   doc.setFontSize(11);

//   doc.text(
//     `Address: ${order.shipping_address}`,
//     14,
//     85
//   );

//   doc.text(
//     `City: ${order.city}`,
//     14,
//     92
//   );
// doc.addImage(
//   qrCodeImage,
//   "PNG",
//   160,
//   30,
//   35,
//   35
// );

//   // Products Table
//   const rows =
//     details?.items?.map((item) => [
//       item.product_name,
//       item.quantity,
//       `₦${formatCurrency(
//         item.unit_price
//       )}`,
//       `₦${formatCurrency(
//         item.total_price
//       )}`,
//     ]) || [];

//   autoTable(doc, {
//     startY: 105,
//     head: [
//       [
//         "Product",
//         "Qty",
//         "Unit Price",
//         "Total",
//       ],
//     ],
//     body: rows,
//     theme: "grid",
//     headStyles: {
//       fillColor: [96, 88, 220],
//     },
//   });

//   const finalY =
//     doc.lastAutoTable.finalY + 15;

//   // Summary
//   doc.setFontSize(12);

//   doc.text(
//     `Subtotal: ₦${formatCurrency(
//       order.subtotal
//     )}`,
//     130,
//     finalY
//   );

//   doc.text(
//     `Total: ₦${formatCurrency(
//       order.total_amount
//     )}`,
//     130,
//     finalY + 10
//   );

//   // Footer
//   doc.setFontSize(10);

//   doc.text(
//     "Thank you for shopping with NaijaOpenMarket.",
//     14,
//     finalY + 30
//   );

//   doc.text(
//     "For support contact support@naijaopenmarket.com",
//     14,
//     finalY + 38
//   );

//   doc.save(
//     `${order.order_number}-Invoice.pdf`
//   );
// };

//   const logo = "/assets/image/NaijaOpenMarket.png";

// const img = new Image();

// img.src = logo;

// img.onload = () => {
//   doc.addImage(
//     img,
//     "PNG",
//     14,
//     10,
//     25,
//     25
//   );

//   // Rest of PDF generation code
// };

//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [loadingDetails, setLoadingDetails] = useState(false);
//   const [error, setError] = useState("");

//   const [selectedOrder, setSelectedOrder] =
//     useState(null);

//   const [orderDetails, setOrderDetails] =
//     useState({});

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   const fetchOrders = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       const response = await api.get(
//         "/my-orders/"
//       );

//       console.log(
//         "Orders Response:",
//         response.data
//       );

//       setOrders(
//         response.data.orders || []
//       );
//     } catch (err) {
//       console.error(err);

//       setError(
//         err.response?.data?.message ||
//           "Failed to load orders."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchOrderDetails = async (
//     orderId
//   ) => {
//     try {
//       if (selectedOrder === orderId) {
//         setSelectedOrder(null);
//         return;
//       }

//       if (orderDetails[orderId]) {
//         setSelectedOrder(orderId);
//         return;
//       }

//       setLoadingDetails(true);

//       const response = await api.get(
//         `/orders/${orderId}/`
//       );

//       console.log(
//         "Order Details:",
//         response.data
//       );

//       setOrderDetails((prev) => ({
//         ...prev,
//         [orderId]: response.data,
//       }));

//       setSelectedOrder(orderId);

//     } catch (err) {
//       console.error(
//         "Order Detail Error:",
//         err
//       );

//       alert(
//         err.response?.data?.detail ||
//         err.response?.data?.error ||
//         "Unable to load order details."
//       );
//     } finally {
//       setLoadingDetails(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="container py-5 text-center">
//         <div
//           className="spinner-border text-primary"
//           role="status"
//         >
//           <span className="visually-hidden">
//             Loading...
//           </span>
//         </div>

//         <p className="mt-3">
//           Loading your orders...
//         </p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="container py-5">
//         <div className="alert alert-danger">
//           {error}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container py-5">

//       <div className="d-flex justify-content-between align-items-center mb-4">
//         <h2 className="fw-bold">
//           My Orders
//         </h2>

//         <span className="badge bg-primary fs-6">
//           {orders.length} Orders
//         </span>
//       </div>

//       {orders.length === 0 ? (
//         <div className="alert alert-info">
//           You have not placed any orders yet.
//         </div>
//       ) : (
//         <div className="table-responsive">

//           <table className="table table-hover align-middle shadow-sm">

//             <thead className="table-dark">
//               <tr>
//                 <th>Order Number</th>
//                 <th>Date</th>
//                 <th>Total</th>
//                 <th>Status</th>
//               </tr>
//             </thead>

//             <tbody>

//               {orders.map((order) => (
//                 <React.Fragment
//                   key={order.id}
//                 >

//                   {/* Main Order Row */}

//                   <tr>

//                     <td>

//                       <button
//                         className="btn btn-link fw-bold text-decoration-none p-0"
//                         onClick={() =>
//                           fetchOrderDetails(
//                             order.id
//                           )
//                         }
//                       >
//                         {order.order_number}

//                         <span className="ms-2">
//                           {selectedOrder ===
//                           order.id
//                             ? "▲"
//                             : "▼"}
//                         </span>

//                       </button>

//                     </td>

//                     <td>
//                       {new Date(
//                         order.created_at
//                       ).toLocaleDateString()}
//                     </td>

//                     <td>
//                       ₦
//                       {Number(
//                         order.total_amount
//                       ).toLocaleString()}
//                     </td>

//                     <td>

//                       <span
//                         className={`badge ${
//                           order.status ===
//                           "delivered"
//                             ? "bg-success"
//                             : order.status ===
//                               "processing"
//                             ? "bg-warning text-dark"
//                             : order.status ===
//                               "cancelled"
//                             ? "bg-danger"
//                             : "bg-secondary"
//                         }`}
//                       >
//                         {order.status}
//                       </span>

//                     </td>

//                   </tr>

//                   {/* Expanded Order Details */}

//                   {selectedOrder ===
//                     order.id && (
//                     <tr>

//                       <td
//                         colSpan="4"
//                         className="bg-light"
//                       >

//                         <div className="card border-0 shadow-sm">

//                           <div className="card-body">

//                             <h5 className="mb-3">
//                               Order Details
//                             </h5>

//                             {loadingDetails ? (
//                               <div className="text-center py-3">
//                                 <div className="spinner-border spinner-border-sm text-primary" />
//                               </div>
//                             ) : (
//                               <>
//                                 <div className="row">

//                                   <div className="col-md-6 mb-3">
//                                     <strong>
//                                       Shipping Address
//                                     </strong>

//                                     <p className="mb-0">
//                                       {
//                                         order.shipping_address
//                                       }
//                                     </p>
//                                   </div>

//                                   <div className="col-md-6 mb-3">
//                                     <strong>
//                                       City
//                                     </strong>

//                                     <p className="mb-0">
//                                       {
//                                         order.city
//                                       }
//                                     </p>
//                                     <p>
//                                       <strong>Payment Type:</strong>{" "}
//                                       {selectedOrder.payment_type}
//                                     </p>

//                                     <p>
//                                       <strong>Payment Method:</strong>{" "}
//                                       {selectedOrder.payment_method}
//                                     </p>
//                                   </div>

//                                 </div>

//                                 <hr />

//                                 <h6 className="fw-bold">
//                                   Ordered Items
//                                 </h6>

//                                 <table className="table table-bordered">

//                                   <thead>
//                                     <tr>
//                                       <th>
//                                         Product
//                                       </th>
//                                       <th>
//                                         Qty
//                                       </th>
//                                       <th>
//                                         Price
//                                       </th>
//                                       <th>
//                                         Total
//                                       </th>
//                                     </tr>
//                                   </thead>

//                                   <tbody>

//                                     {orderDetails[
//                                       order.id
//                                     ]?.items?.length >
//                                     0 ? (
//                                       orderDetails[
//                                         order.id
//                                       ].items.map(
//                                         (
//                                           item
//                                         ) => (
//                                           <tr
//                                             key={
//                                               item.id
//                                             }
//                                           >

//                                             <td>
//                                               {
//                                                 item.product_name
//                                               }
//                                             </td>

//                                             <td>
//                                               {
//                                                 item.quantity
//                                               }
//                                             </td>

//                                             <td>
//                                               ₦
//                                               {Number(item.unit_price).toLocaleString()}
//                                             </td>

//                                             <td>
//                                               ₦
//                                               {Number(item.total_price).toLocaleString()}
//                                             </td>
//                                             <Link
//                                               to={`/invoice/${order.id}`}
//                                               className="btn btn-success btn-sm"
//                                             >
//                                               View Invoice
//                                             </Link>
//                                             {/* <td>
//                                               ₦
//                                               {Number(
//                                                 item.price
//                                               ).toLocaleString()}
//                                             </td>

//                                             <td>
//                                               ₦
//                                               {(
//                                                 Number(
//                                                   item.price
//                                                 ) *
//                                                 Number(
//                                                   item.quantity
//                                                 )
//                                               ).toLocaleString()}
//                                             </td> */}

//                                           </tr>
//                                         )
//                                       )
//                                     ) : (
//                                       <tr>
//                                         <td
//                                           colSpan="4"
//                                           className="text-center"
//                                         >
//                                           No items found.
//                                         </td>
//                                       </tr>
//                                     )}

//                                   </tbody>
//                               <div className="mt-3 text-end">
                                
       

//                                 <button
//                                   className="btn btn-danger"
//                                   onClick={() =>
//                                   generateInvoicePDF(
//                                     order,
//                                     orderDetails[order.id]
//                                   )
//                                 }
//                                 >
//                                   Download PDF
//                                 </button>
                                
// {/*                                 

//                                 <button
//                                   className="btn btn-danger"
//                                   onClick={() =>
//                                     downloadOrderPDF(
//                                       order,
//                                       orderDetails[order.id]
//                                     )
//                                   }
//                                 >
//                                   Download PDF
//                                 </button> */}
//                               </div>
//                               <button
//                                 className="btn btn-primary me-2"
//                                 onClick={() => window.print()}
//                               >
//                                 Print Order
//                               </button>
//                                 </table>

//                               </>
//                             )}

//                           </div>

//                         </div>

//                       </td>

//                     </tr>
//                   )}

//                 </React.Fragment>
//               ))}

//             </tbody>

//           </table>

//         </div>
//       )}
//     </div>
    
//   );
// };


// export default OrdersPage;



// import React, { useEffect, useState } from "react";
// import api from "../../api";

// const OrdersPage = () => {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [selectedOrder, setSelectedOrder] = useState(null);

//   const [orderDetails, setOrderDetails] = useState({});

//   const [loadingDetails, setLoadingDetails] = useState(false);

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   const fetchOrders = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       const response = await api.get("/my-orders/");

//       console.log("Orders Response:", response.data);

//       setOrders(response.data.orders || []);
//     } catch (err) {
//       console.error(err);

//       setError(
//         err.response?.data?.message ||
//         "Failed to load orders."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//     const fetchOrderDetails = async (
//     orderId
//     ) => {
//     try {
//         setLoadingDetails(true);

//         if (selectedOrder === orderId) {
//         setSelectedOrder(null);
//         return;
//         }

//         const response = await api.get(
//         `/orders/${orderId}/`
//         );

//         setOrderDetails((prev) => ({
//         ...prev,
//         [orderId]: response.data,
//         }));

//         setSelectedOrder(orderId);

//     } catch (err) {
//         console.error(err);
//     } finally {
//         setLoadingDetails(false);
//     }
//     };

//   console.log("Loading:", loading);
//   console.log("Orders:", orders);

//   if (loading) {
//     return (
//       <div className="container py-5 text-center">
//         <div
//           className="spinner-border text-primary"
//           role="status"
//         >
//           <span className="visually-hidden">
//             Loading...
//           </span>
//         </div>

//         <p className="mt-3">
//           Loading your orders...
//         </p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="container py-5">
//         <div className="alert alert-danger">
//           {error}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container py-5">

//       <h2 className="mb-4">
//         My Orders
//       </h2>

//       {orders.length === 0 ? (
//         <div className="alert alert-info">
//           You have no orders yet.
//         </div>
//       ) : (
//         <div className="table-responsive">

//           <table className="table table-striped table-hover">

//             <thead className="table-dark">
//               <tr>
//                 <th>Order Number</th>
//                 <th>Date</th>
//                 <th>Total</th>
//                 <th>Status</th>
//               </tr>
//             </thead>

//             <tbody>

//               {orders.map((order) => (
//                 <tr key={order.id}>

//                   {/* <td>
//                     {order.order_number}
//                   </td> */}
//                   <td>
//                 <button
//                     className="btn btn-link text-decoration-none fw-bold"
//                     onClick={() =>
//                     fetchOrderDetails(order.id)
//                     }
//                 >
//                     {order.order_number}

//                     {selectedOrder === order.id
//                     ? " ▲"
//                     : " ▼"}
//                 </button>
//                 </td>

//                   <td>
//                     {new Date(
//                       order.created_at
//                     ).toLocaleDateString()}
//                   </td>

//                   <td>
//                     ₦
//                     {Number(
//                       order.total_amount
//                     ).toLocaleString()}
//                   </td>

//                   <td>
//                     <span
//                       className={`badge ${
//                         order.status === "delivered"
//                           ? "bg-success"
//                           : order.status === "processing"
//                           ? "bg-warning text-dark"
//                           : order.status === "cancelled"
//                           ? "bg-danger"
//                           : "bg-secondary"
//                       }`}
//                     >
//                       {order.status}
//                     </span>
//                   </td>

//                 </tr>
//               ))}

//             </tbody>

//           </table>

//         </div>
//       )}
//     </div>
//   );
// };

// export default OrdersPage;