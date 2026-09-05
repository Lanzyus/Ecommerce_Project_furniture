import React from "react";
import styles from "./InvoicePage.module.css";

const InvoicePage = () => {
    return (
        <div className={styles.invoicePage}>

            <div className={styles.invoiceHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Invoice</h1>
                    <p className={styles.orderNumber}>
                        Order #ORD-20260831150605
                    </p>
                </div>

                <button
                    className={styles.printButton}
                    onClick={() => window.print()}
                >
                    🖨 Print Invoice
                </button>
            </div>

            <div className={styles.invoiceCard}>

                <div className={styles.companyHeader}>
                    <div>
                        <h2 className={styles.companyName}>
                            Sensational Interiors
                        </h2>

                        <p className={styles.companyTagline}>
                            Quality Furniture for Beautiful Spaces
                        </p>
                    </div>

                    <div className={styles.invoiceLabel}>
                        <h2>INVOICE</h2>
                        <p>
                            Order #ORD-20260831150605
                        </p>
                        <p>
                            Date: 31/08/2026
                        </p>
                    </div>
                </div>

                <div className={styles.divider} />

                <section className={styles.section}>
                    <h3>Customer Information</h3>

                    <div className={styles.infoGrid}>
                        <div>
                            <strong>Name</strong>
                            <span>Funmi Onipede</span>
                        </div>

                        <div>
                            <strong>Email</strong>
                            <span>funmilolaonipede@gmail.com</span>
                        </div>
                    </div>
                </section>

                <section className={styles.section}>
                    <h3>Shipping Information</h3>

                    <div className={styles.infoGrid}>
                        <div>
                            <strong>Address</strong>
                            <span>
                                3 Unity Close, Off Oremeji
                            </span>
                        </div>

                        <div>
                            <strong>City</strong>
                            <span>Alagbado</span>
                        </div>
                    </div>
                </section>

                <section className={styles.section}>
                    <h3>Payment Information</h3>

                    <div className={styles.paymentGrid}>
                        <div>
                            <strong>Payment Type</strong>
                            <span>online</span>
                        </div>

                        <div>
                            <strong>Payment Method</strong>
                            <span>paystack</span>
                        </div>

                        <div>
                            <strong>Payment Status</strong>
                            <span className={styles.paid}>
                                Paid
                            </span>
                        </div>

                        <div>
                            <strong>Order Status</strong>
                            <span className={styles.processing}>
                                Processing
                            </span>
                        </div>
                    </div>
                </section>

                <section className={styles.section}>
                    <h3>Ordered Items</h3>

                    <div className={styles.tableWrapper}>
                        <table className={styles.invoiceTable}>
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Qty</th>
                                    <th>Unit Price</th>
                                    <th>Total</th>
                                </tr>
                            </thead>

                            <tbody>
                                <tr>
                                    <td>
                                        Modern Comfort
                                        Rectangular Coffee Table
                                    </td>

                                    <td>1</td>

                                    <td>
                                        ₦347,890.00
                                    </td>

                                    <td>
                                        ₦347,890.00
                                    </td>
                                </tr>

                                <tr>
                                    <td>
                                        Modern Comfort Single Bed
                                    </td>

                                    <td>1</td>

                                    <td>
                                        ₦160,000.00
                                    </td>

                                    <td>
                                        ₦160,000.00
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <div className={styles.totalSection}>
                    <div>
                        <span>Subtotal</span>
                        <strong>₦507,890.00</strong>
                    </div>

                    <div className={styles.grandTotal}>
                        <span>Order Total</span>
                        <strong>₦545,981.75</strong>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default InvoicePage;