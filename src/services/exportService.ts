import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { formatCurrency, formatDate } from "@/lib/utils";

export const exportService = {
  /**
   * Generates a professional PDF statement of account.
   */
  async exportToPDF(data: {
    entries: any[];
    totalEquity: number;
    totalCommitment: number;
    progress: number;
    user: any;
  }) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // 1. Add Logo (Centered at the top)
    try {
      const logoUrl = "/images/logo.png";
      doc.addImage(logoUrl, "PNG", pageWidth / 2 - 25, 10, 50, 20);
    } catch (e) {
      console.warn("Logo could not be loaded into PDF", e);
    }

    // 2. Headings
    doc.setFont("helvetica", "bold"); // Changed from 'serif' to 'helvetica' for compatibility
    doc.setFontSize(22);
    doc.setTextColor(212, 175, 55); // Gold color (#d4af37)
    doc.text("Official Statement of Account", pageWidth / 2, 45, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "italic");
    doc.text("Comprehensive financial audit for property equity and disbursements.", pageWidth / 2, 52, { align: "center" });

    // 3. User & Portfolio Details
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.5);
    doc.line(20, 60, pageWidth - 20, 60);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Client: ${data.user?.firstName || "Valued"} ${data.user?.lastName || "Customer"}`, 20, 70);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Email: ${data.user?.email || "N/A"}`, 20, 76);
    doc.text(`Statement Date: ${formatDate(new Date())}`, pageWidth - 20, 70, { align: "right" });
    doc.text(`Portfolio ID: #${data.user?.id?.slice(-8).toUpperCase() || "INTERNAL"}`, pageWidth - 20, 76, { align: "right" });

    // Summary Box
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(20, 85, pageWidth - 40, 30, 3, 3, "F");
    
    doc.setFont("helvetica", "bold");
    doc.text("Portfolio Summary", 25, 92);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Commitment: ${formatCurrency(data.totalCommitment)}`, 25, 100);
    doc.text(`Total Paid (Equity): ${formatCurrency(data.totalEquity)}`, 25, 106);
    doc.text(`Current Equity Progress: ${data.progress.toFixed(1)}%`, pageWidth - 25, 100, { align: "right" });
    doc.text(`Remaining Obligation: ${formatCurrency(data.totalCommitment - data.totalEquity)}`, pageWidth - 25, 106, { align: "right" });

    // 4. Ledger Table
    const tableHeaders = [["Date", "Description / Project", "Reference", "Debit", "Credit", "Balance"]];
    const tableData = data.entries.map(entry => [
      formatDate(entry.paidDate || entry.dueDate),
      `Installment #${entry.installmentNumber}\n${entry.project?.name || 'General Portfolio'}`,
      entry.id.slice(-8).toUpperCase(),
      entry.debit > 0 ? `+${entry.debit.toLocaleString()}` : "—",
      entry.credit > 0 ? entry.credit.toLocaleString() : "—",
      entry.runningBalance.toLocaleString()
    ]);

    autoTable(doc, {
      startY: 125,
      head: tableHeaders,
      body: tableData,
      theme: "striped",
      headStyles: { 
        fillColor: [212, 175, 55], 
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: "bold"
      },
      styles: { 
        fontSize: 8,
        cellPadding: 4
      },
      columnStyles: {
        3: { fontStyle: "bold", textColor: [34, 197, 94] }, // Green for debit
        5: { fontStyle: "bold" }
      }
    });

    // 5. Footer
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.setFont("helvetica", "italic");
    doc.text(
      "This is a computer-generated statement and does not require a physical signature.",
      pageWidth / 2,
      finalY,
      { align: "center" }
    );
    doc.text(
      "All records are subject to final audit by the treasury department of ABS Developers.",
      pageWidth / 2,
      finalY + 5,
      { align: "center" }
    );

    doc.save(`ABS_Statement_${data.user?.lastName || "Client"}_${new Date().getTime()}.pdf`);
  },

  /**
   * Generates a clean Excel/CSV file of the ledger records.
   */
  exportToExcel(data: { entries: any[] }) {
    const flattenedData = data.entries.map(entry => ({
      "Entry Date": formatDate(entry.paidDate || entry.dueDate),
      "Description": `Installment #${entry.installmentNumber}`,
      "Project": entry.project?.name || "General Portfolio",
      "Reference ID": entry.id.toUpperCase(),
      "Debit (Paid)": entry.debit,
      "Credit (Due)": entry.credit,
      "Running Balance": entry.runningBalance,
      "Status": entry.status.toUpperCase()
    }));

    const worksheet = XLSX.utils.json_to_sheet(flattenedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ledger Statement");

    // Auto-size columns
    const maxWidths = flattenedData.reduce((acc: any, row: any) => {
      Object.keys(row).forEach((key, i) => {
        const val = row[key] ? row[key].toString().length : 0;
        acc[i] = Math.max(acc[i] || 0, val, key.length);
      });
      return acc;
    }, []);
    worksheet["!cols"] = maxWidths.map((w: number) => ({ wch: w + 2 }));

    XLSX.writeFile(workbook, `Ledger_Export_${new Date().getTime()}.xlsx`);
  },

  /**
   * Generates a professional PDF financial report for admin (filtered by year).
   */
  async exportAdminPDF(data: {
    entries: any[];
    year: number;
    totalCollected: number;
    totalBilled: number;
    collectionRate: number;
    outstandingBalance: number;
  }) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // 1. Logo
    try {
      const logoUrl = "/images/logo.png";
      doc.addImage(logoUrl, "PNG", pageWidth / 2 - 25, 10, 50, 20);
    } catch (e) {
      console.warn("Logo could not be loaded into PDF", e);
    }

    // 2. Headings
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(212, 175, 55);
    doc.text("Financial Report", pageWidth / 2, 45, { align: "center" });

    doc.setFontSize(14);
    doc.setTextColor(80, 80, 80);
    doc.text(`Fiscal Year ${data.year}`, pageWidth / 2, 53, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 100, 100);
    doc.text("System-wide payment collections and financial summary.", pageWidth / 2, 60, { align: "center" });

    // 3. Separator
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.5);
    doc.line(20, 67, pageWidth - 20, 67);

    // 4. Report metadata
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Report Generated: ${formatDate(new Date())}`, 20, 77);
    doc.text(`Total Transactions: ${data.entries.length}`, pageWidth - 20, 77, { align: "right" });

    // 5. Financial Summary Box
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(20, 85, pageWidth - 40, 35, 3, 3, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Financial Summary", 25, 94);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Billed: ${formatCurrency(data.totalBilled)}`, 25, 103);
    doc.text(`Total Collected: ${formatCurrency(data.totalCollected)}`, 25, 110);
    doc.text(`Collection Rate: ${data.collectionRate.toFixed(1)}%`, pageWidth - 25, 103, { align: "right" });
    doc.text(`Outstanding Balance: ${formatCurrency(data.outstandingBalance)}`, pageWidth - 25, 110, { align: "right" });

    // 6. Ledger Table
    const tableHeaders = [["Date", "Client", "Property", "Inst. #", "Type", "Amount", "Status"]];
    const tableData = data.entries.map((entry: any) => [
      formatDate(entry.paidDate || entry.dueDate),
      entry.clientName || "Unknown",
      entry.propertyName || "N/A",
      `#${entry.installmentNumber}`,
      (entry.type || "installment").charAt(0).toUpperCase() + (entry.type || "installment").slice(1),
      formatCurrency(entry.amount),
      entry.status.charAt(0).toUpperCase() + entry.status.slice(1),
    ]);

    autoTable(doc, {
      startY: 130,
      head: tableHeaders,
      body: tableData,
      theme: "striped",
      headStyles: {
        fillColor: [212, 175, 55],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: "bold",
      },
      styles: {
        fontSize: 7,
        cellPadding: 3,
      },
      columnStyles: {
        5: { fontStyle: "bold" },
      },
    });

    // 7. Footer
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.setFont("helvetica", "italic");
    doc.text(
      "This is a computer-generated report and does not require a physical signature.",
      pageWidth / 2, finalY, { align: "center" }
    );
    doc.text(
      "All records are subject to final audit by the treasury department of ABS Developers.",
      pageWidth / 2, finalY + 5, { align: "center" }
    );

    doc.save(`ABS_Financial_Report_${data.year}_${new Date().getTime()}.pdf`);
  },

  /**
   * Generates an all-time Excel report of all payment records for admin.
   */
  exportAdminExcel(data: { entries: any[] }) {
    const flattenedData = data.entries.map((entry: any) => ({
      "Date": formatDate(entry.paidDate || entry.dueDate),
      "Client Name": entry.clientName || "Unknown",
      "Client Email": entry.clientEmail || "N/A",
      "Property": entry.propertyName || "N/A",
      "Installment #": entry.installmentNumber,
      "Type": (entry.type || "installment").charAt(0).toUpperCase() + (entry.type || "installment").slice(1),
      "Amount": entry.amount,
      "Debit (Paid)": entry.debit || 0,
      "Credit (Due)": entry.credit || 0,
      "Running Balance": entry.runningBalance || 0,
      "Investment Amount": entry.investmentAmount || 0,
      "Payment Method": entry.paymentMethod || entry.method || "N/A",
      "Status": entry.status.toUpperCase(),
      "Verification": (entry.verificationStatus || "N/A").replace(/_/g, " "),
      "Due Date": formatDate(entry.dueDate),
      "Paid Date": entry.paidDate ? formatDate(entry.paidDate) : "—",
    }));

    const worksheet = XLSX.utils.json_to_sheet(flattenedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "All-Time Financials");

    // Auto-size columns
    const maxWidths = flattenedData.reduce((acc: any, row: any) => {
      Object.keys(row).forEach((key, i) => {
        const val = row[key] ? row[key].toString().length : 0;
        acc[i] = Math.max(acc[i] || 0, val, key.length);
      });
      return acc;
    }, []);
    worksheet["!cols"] = maxWidths.map((w: number) => ({ wch: w + 2 }));

    XLSX.writeFile(workbook, `ABS_Financials_AllTime_${new Date().getTime()}.xlsx`);
  }
};
