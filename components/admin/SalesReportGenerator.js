"use client";

import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function SalesReportGenerator() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateReport = async () => {
    if (!from || !to) {
      setError("Please select both dates.");
      return;
    }
    if (from > to) {
      setError("'From' date must be before 'To' date.");
      return;
    }
    setError("");
    setLoading(true);
    setReport(null);
    try {
      const res = await fetch(`/api/dashboard/report?from=${from}&to=${to}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate report");
      setReport(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = () => {
    if (!report) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(16);
    doc.setTextColor(30, 60, 45);
    doc.text("Sidaas Naturals", pageWidth / 2, 18, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.text("Sales Report", pageWidth / 2, 26, { align: "center" });
    doc.setFontSize(10);
    doc.text(`${report.from} to ${report.to}`, pageWidth / 2, 32, { align: "center" });

    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    let y = 44;
    doc.text(`Total Sales: Rs. ${report.totalSales.toFixed(2)}`, 14, y);
    doc.text(`Total Orders: ${report.totalOrders}`, 110, y);
    y += 7;
    doc.text(`Average Order Value: Rs. ${report.averageOrderValue.toFixed(2)}`, 14, y);
    y += 10;

    doc.setFontSize(12);
    doc.text("Daily Breakdown", 14, y);
    y += 4;
    autoTable(doc, {
      startY: y,
      head: [["Date", "Orders", "Sales (Rs.)"]],
      body: report.dailyBreakdown.map((d) => [d.date, d.count, d.total.toFixed(2)]),
      theme: "grid",
      headStyles: { fillColor: [184, 146, 63] },
      styles: { fontSize: 9 },
    });

    let payY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text("Payment Method Breakdown", 14, payY);
    payY += 4;
    autoTable(doc, {
      startY: payY,
      head: [["Method", "Orders", "Sales (Rs.)"]],
      body: report.paymentBreakdown.map((p) => [p.method, p.count, p.total.toFixed(2)]),
      theme: "grid",
      headStyles: { fillColor: [184, 146, 63] },
      styles: { fontSize: 9 },
    });

    let topY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text("Top Selling Products", 14, topY);
    topY += 4;
    autoTable(doc, {
      startY: topY,
      head: [["Product", "Qty Sold", "Revenue (Rs.)"]],
      body: report.topSelling.map((p) => [p.name, p.qty, p.revenue.toFixed(2)]),
      theme: "grid",
      headStyles: { fillColor: [184, 146, 63] },
      styles: { fontSize: 9 },
    });

    let ordersY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text("Orders", 14, ordersY);
    ordersY += 4;
    autoTable(doc, {
      startY: ordersY,
      head: [["Order #", "Date", "Customer", "Phone", "Payment", "Status", "Total (Rs.)"]],
      body: report.orders.map((o) => [
        o.orderNumber,
        new Date(o.date).toLocaleDateString(),
        o.customerName,
        o.customerPhone,
        `${o.paymentMethod} (${o.paymentStatus})`,
        o.status,
        o.total.toFixed(2),
      ]),
      theme: "grid",
      headStyles: { fillColor: [184, 146, 63] },
      styles: { fontSize: 7.5 },
    });

    doc.save(`sales-report-${report.from}-to-${report.to}.pdf`);
  };

  return (
    <div className="rounded-xl2 border border-gold/15 bg-white p-6 shadow-card">
      <h2 className="font-display text-base font-bold text-forest">Sales Report</h2>
      <p className="mt-1 text-xs text-muted">Select a date range to generate and export a sales report.</p>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-medium text-muted">From</label>
          <input
            type="date"
            value={from}
            max={to || undefined}
            onChange={(e) => setFrom(e.target.value)}
            className="mt-1 rounded-lg border border-gold/20 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted">To</label>
          <input
            type="date"
            value={to}
            min={from || undefined}
            onChange={(e) => setTo(e.target.value)}
            className="mt-1 rounded-lg border border-gold/20 px-3 py-2 text-sm"
          />
        </div>
        <button
          onClick={generateReport}
          disabled={loading}
          className="rounded-lg bg-forest px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Report"}
        </button>
        {report && (
          <button
            onClick={exportPDF}
            className="rounded-lg border border-gold/30 px-4 py-2 text-sm font-medium text-gold-dark"
          >
            Export as PDF
          </button>
        )}
      </div>

      {error && <p className="mt-3 text-sm text-terracotta">{error}</p>}

      {report && (
        <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-3">
          <div className="rounded-lg bg-cream/60 p-3">
            <p className="text-xs text-muted">Total Sales</p>
            <p className="text-lg font-bold text-forest">₹{report.totalSales.toFixed(2)}</p>
          </div>
          <div className="rounded-lg bg-cream/60 p-3">
            <p className="text-xs text-muted">Total Orders</p>
            <p className="text-lg font-bold text-forest">{report.totalOrders}</p>
          </div>
          <div className="rounded-lg bg-cream/60 p-3">
            <p className="text-xs text-muted">Avg. Order Value</p>
            <p className="text-lg font-bold text-forest">₹{report.averageOrderValue.toFixed(2)}</p>
          </div>
        </div>
      )}
    </div>
  );
}