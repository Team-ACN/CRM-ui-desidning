import React, { useState } from 'react';
import { FileText, Send, ChevronDown, Download, Eye } from 'lucide-react';
import { mockInvoices } from '../../data/mockFinance';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const InvoiceGenerator = () => {
  const [filter, setFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [discount, setDiscount] = useState(0);
  
  // Invoice State
  const [invoiceDetails, setInvoiceDetails] = useState({
      invoiceNo: 'ACN/12-2025/INV161',
      date: '2025-12-30',
      dueDate: ''
  });

  const [billTo, setBillTo] = useState({
      name: '',
      gst: '',
      phone: ''
  });

  const [selectedPlanDetails, setSelectedPlanDetails] = useState({
        plan: 'Premium Yearly',
        rate: 12711,
        description: 'ACN Annual Membership',
        hsn: '998313',
        qty: 1
  });

  const calculateTotals = () => {
      const rate = selectedPlanDetails.rate || 0;
      const qty = selectedPlanDetails.qty || 0;
      const subtotal = rate * qty;
      const taxable = Math.max(0, subtotal - discount);
      const cgst = Math.round(taxable * 0.09);
      const sgst = Math.round(taxable * 0.09);
      const total = taxable + cgst + sgst;
      return { subtotal, discount, taxable, cgst, sgst, total };
  };

  const totals = calculateTotals();

  const handlePlanChange = (planType) => {
      let details = { ...selectedPlanDetails, plan: planType };
      
      switch(planType) {
          case 'Premium Yearly':
              details = { ...details, rate: 12711, description: 'ACN Annual Membership', hsn: '998313' };
              break;
          case 'Premium Monthly':
              details = { ...details, rate: 1694, description: 'ACN Monthly Membership', hsn: '998313' };
              break;
          case 'Booster Credits':
              details = { ...details, rate: 211, description: 'Booster Credits Pack', hsn: '998313' };
              break;
          default:
              break;
      }
      setSelectedPlanDetails(details);
  };

  const generatePDF = () => {
      const doc = new jsPDF();

      // -- Header --
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('ACN', 14, 20);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100);
      doc.text('TAX INVOICE', 14, 26);

      // Company Info (Left)
      doc.setFontSize(9);
      doc.setTextColor(0);
      let yPos = 40;
      doc.setFont('helvetica', 'bold');
      doc.text('IQOL Technologies Private Limited', 14, yPos);
      yPos += 5;
      doc.setFont('helvetica', 'normal');
      doc.text('GST No: IQOL 29AAHCI3411P1Z7', 14, yPos);
      yPos += 5;
      doc.text('No. 1579, 27TH MAIN ROAD, 26TH CROSS ROAD,', 14, yPos);
      yPos += 5;
      doc.text('NORTH-EAST CORNER, 2ND SECTOR, HSR LAYOUT,', 14, yPos);
      yPos += 5;
      doc.text('BANGALORE - 560102', 14, yPos);
      yPos += 5;
      doc.text('Place of Supply: Karnataka', 14, yPos);
      yPos += 5;
      doc.text('Website: https://acnonline.in/', 14, yPos);

      // Invoice Info (Right)
      doc.setFontSize(10);
      const rightX = 140;
      let rightY = 40;
      
      doc.setFont('helvetica', 'bold');
      doc.text('Invoice No:', rightX, rightY);
      doc.setFont('helvetica', 'normal');
      doc.text(invoiceDetails.invoiceNo, rightX + 25, rightY);
      
      rightY += 6;
      doc.setFont('helvetica', 'bold');
      doc.text('Invoice Date:', rightX, rightY);
      doc.setFont('helvetica', 'normal');
      doc.text(invoiceDetails.date, rightX + 25, rightY);

      // -- Bill To --
      yPos += 15;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('BILL TO', 14, yPos);
      
      yPos += 2;
      doc.setDrawColor(200);
      doc.line(14, yPos, 80, yPos); // Underline

      yPos += 6;
      doc.setFontSize(9);
      doc.text(`Name: ${billTo.name}`, 14, yPos);
      yPos += 5;
      doc.text(`GST No: ${billTo.gst || 'NA'}`, 14, yPos);
      yPos += 5;
      doc.text(`Phone Number: ${billTo.phone}`, 14, yPos);

      // -- Table --
      const tableStartY = 100;
      autoTable(doc, {
          startY: tableStartY,
          head: [['DESCRIPTION', 'HSN Code', 'Rate', 'Quantity', 'Total']],
          body: [
              [
                  selectedPlanDetails.description, 
                  selectedPlanDetails.hsn, 
                  `INR ${selectedPlanDetails.rate}`, 
                  selectedPlanDetails.qty, 
                  `INR ${totals.subtotal.toLocaleString()}`
              ]
          ],
          theme: 'plain',
          styles: { fontSize: 9, cellPadding: 3 },
          headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
          columnStyles: {
              0: { cellWidth: 80 }, // Description
              1: { halign: 'center' }, // HSN
              2: { halign: 'right' }, // Rate
              3: { halign: 'center' }, // Qty
              4: { halign: 'right', fontStyle: 'bold' } // Total
          }
      });

      // -- Totals --
      let finalY = (doc).lastAutoTable.finalY + 10;
      const totalsX = 130;
      
      // Helper for right-aligned totals
      const addTotalRow = (label, value, isBold = false) => {
          doc.setFont('helvetica', isBold ? 'bold' : 'normal');
          doc.text(label, totalsX, finalY);
          doc.text(value, 195, finalY, { align: 'right' });
          finalY += 6;
      };

      addTotalRow('Subtotal', `INR ${totals.subtotal.toLocaleString()}`);
      addTotalRow('Discount', `${totals.discount.toFixed(2)}`);
      addTotalRow('Subtotal Less Discount', `INR ${totals.taxable.toLocaleString()}`);
      addTotalRow('CGST (9%)', `INR ${totals.cgst.toLocaleString()}`);
      addTotalRow('SGST (9%)', `INR ${totals.sgst.toLocaleString()}`);
      
      // Total Box
      finalY += 2;
      doc.setFillColor(240, 240, 240);
      doc.rect(totalsX - 2, finalY - 5, 70, 10, 'F');
      doc.setFont('helvetica', 'bold');
      doc.text('Total', totalsX, finalY);
      doc.text(`INR ${totals.total.toLocaleString()}`, 195, finalY, { align: 'right' });

      doc.save(`Invoice-${invoiceDetails.invoiceNo}.pdf`);
  };

  const filteredInvoices = (mockInvoices || []).filter(inv => {
      if (filter === 'All') return true;
      return inv.plan && inv.plan.includes(filter);
  });

  return (
    <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
             {/* Filters */}
             <div className="relative">
                  <select 
                     value={filter}
                     onChange={(e) => setFilter(e.target.value)}
                     className="appearance-none bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 block pl-3 pr-8 py-2 cursor-pointer min-w-[140px]"
                  >
                      <option value="All">All Plans</option>
                      <option value="Yearly">Yearly</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Booster">Booster Credits</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                     <ChevronDown size={14} />
                  </div>
             </div>

             <button 
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
             >
                <FileText size={16} />
                {showForm ? 'Cancel Invoice' : 'Create New Invoice'}
             </button>
        </div>

        {/* Generator Form (Collapsible) */}
        {showForm && (
            <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <FileText size={20} className="text-gray-500" />
                        Generate Invoice
                    </h3>
                    <span className="text-xs text-gray-500">INV-AUTO-GEN-001</span>
                </div>
                
                <div className="p-8 space-y-8">
                    {/* Header Section with Company Info & Invoice Info */}
                    <div className="flex flex-col md:flex-row justify-between gap-8 border-b border-gray-200 pb-8">
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-2xl font-bold text-gray-900 mb-1">ACN</h4>
                                <span className="text-sm text-gray-500 block">TAX INVOICE</span>
                            </div>
                            <div className="space-y-1 text-sm text-gray-600">
                                <p className="font-semibold text-gray-900">IQOL Technologies Private Limited</p>
                                <p>GST No: IQOL 29AAHCI3411P1Z7</p>
                                <p className="max-w-xs">No. 1579, 27TH MAIN ROAD, 26TH CROSS ROAD, NORTH-EAST CORNER, 2ND SECTOR, HSR LAYOUT, BANGALORE - 560102</p>
                                <p>Place of Supply: Karnataka</p>
                                <p>Website: https://acnonline.in/</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between md:justify-end gap-4 items-center">
                                    <label className="text-sm font-medium text-gray-600">Invoice No:</label>
                                    <span className="font-mono font-medium text-gray-900">{invoiceDetails.invoiceNo}</span>
                                </div>
                                <div className="flex justify-between md:justify-end gap-4 items-center">
                                    <label className="text-sm font-medium text-gray-600">Invoice Date:</label>
                                    <input 
                                        type="date" 
                                        value={invoiceDetails.date}
                                        onChange={(e) => setInvoiceDetails({...invoiceDetails, date: e.target.value})}
                                        className="px-2 py-1 border border-gray-300 rounded text-sm w-36" 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Billed To Section */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Bill To</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                                    <input 
                                        type="text" 
                                        placeholder="Chekkera Properties" 
                                        value={billTo.name}
                                        onChange={(e) => setBillTo({...billTo, name: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:outline-none" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">GST No</label>
                                    <input 
                                        type="text" 
                                        placeholder="29AAMFC6353N1ZR" 
                                        value={billTo.gst}
                                        onChange={(e) => setBillTo({...billTo, gst: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:outline-none" 
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Phone Number</label>
                                    <input 
                                        type="text" 
                                        placeholder="+91-9986507655" 
                                        value={billTo.phone}
                                        onChange={(e) => setBillTo({...billTo, phone: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:outline-none" 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Line Items Table */}
                    <div>
                         {/* Plan Selector */}
                         <div className="mb-4">
                             <label className="block text-xs font-medium text-gray-500 mb-1">Select Plan to Populate</label>
                             <div className="relative w-64">
                                <select 
                                    className="w-full appearance-none bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-900 focus:border-gray-900 block p-2.5 pr-8"
                                    value={selectedPlanDetails.plan}
                                    onChange={(e) => handlePlanChange(e.target.value)}
                                >
                                    <option value="Premium Yearly">Premium Yearly</option>
                                    <option value="Premium Monthly">Premium Monthly</option>
                                    <option value="Booster Credits">Booster Credits</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                                    <ChevronDown size={14} />
                                </div>
                             </div>
                         </div>

                         <div className="border border-gray-200 rounded-lg overflow-hidden">
                             <table className="w-full text-sm">
                                 <thead className="bg-gray-50 text-gray-900 font-semibold">
                                     <tr>
                                         <th className="px-4 py-3 text-left border-b border-gray-200">DESCRIPTION</th>
                                         <th className="px-4 py-3 text-center w-32 border-b border-gray-200">HSN Code</th>
                                         <th className="px-4 py-3 text-right w-32 border-b border-gray-200">Rate</th>
                                         <th className="px-4 py-3 text-center w-24 border-b border-gray-200">Quantity</th>
                                         <th className="px-4 py-3 text-right w-32 border-b border-gray-200">Total</th>
                                     </tr>
                                 </thead>
                                 <tbody>
                                     <tr>
                                         <td className="px-4 py-3 border-b border-gray-100">
                                             <input 
                                                type="text" 
                                                value={selectedPlanDetails.description}
                                                onChange={(e) => setSelectedPlanDetails({...selectedPlanDetails, description: e.target.value})}
                                                className="w-full bg-transparent outline-none font-medium" 
                                             />
                                         </td>
                                         <td className="px-4 py-3 border-b border-gray-100 text-center">
                                             <input 
                                                type="text" 
                                                value={selectedPlanDetails.hsn}
                                                onChange={(e) => setSelectedPlanDetails({...selectedPlanDetails, hsn: e.target.value})}
                                                className="w-full bg-transparent outline-none text-center" 
                                             />
                                         </td>
                                         <td className="px-4 py-3 border-b border-gray-100 text-right">
                                             <input 
                                                type="number" 
                                                value={selectedPlanDetails.rate}
                                                onChange={(e) => setSelectedPlanDetails({...selectedPlanDetails, rate: parseInt(e.target.value) || 0})}
                                                className="w-full bg-transparent outline-none text-right" 
                                             />
                                         </td>
                                         <td className="px-4 py-3 border-b border-gray-100 text-center">
                                              <input 
                                                type="number" 
                                                value={selectedPlanDetails.qty}
                                                onChange={(e) => setSelectedPlanDetails({...selectedPlanDetails, qty: parseInt(e.target.value) || 1})}
                                                className="w-full bg-transparent outline-none text-center" 
                                             />
                                         </td>
                                         <td className="px-4 py-3 border-b border-gray-100 text-right font-medium">INR {totals.subtotal.toLocaleString()}</td>
                                     </tr>
                                 </tbody>
                             </table>
                             <div className="p-2 bg-gray-50 border-t border-gray-200">
                                 <button className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                     + Add Line Item
                                 </button>
                             </div>
                         </div>
                    </div>

                    {/* Totals Section */}
                     <div className="flex justify-end">
                        <div className="w-80 border border-gray-200 rounded-lg overflow-hidden">
                            <div className="flex justify-between items-center px-4 py-2 border-b border-gray-100 text-sm">
                                <span className="font-semibold text-gray-600 transform scale-90 origin-left uppercase">Subtotal</span>
                                <span className="font-medium">INR {totals.subtotal.toLocaleString()}</span>
                            </div>
                             <div className="flex flex-col gap-2 items-end px-4 py-2 border-b border-gray-100">
                                <div className="flex justify-between w-full text-sm">
                                    <span className="font-semibold text-gray-600 transform scale-90 origin-left uppercase">Discount</span>
                                    <input
                                        type="number"
                                        value={discount === 0 ? '' : discount}
                                        onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                                        className="w-24 text-right bg-transparent border-b border-gray-300 focus:border-gray-900 outline-none font-medium"
                                        placeholder="0"
                                    />
                                </div>
                                {/* Discount Suggestion Chips */}
                                {selectedPlanDetails.plan === 'Premium Yearly' && (
                                    <div className="flex flex-wrap justify-end gap-2 mt-1 max-w-[280px]">
                                        {[14000, 13500, 13000, 12500, 11500, 11000].map(target => (
                                            <button
                                                key={target}
                                                onClick={() => {
                                                    // Reverse calc: Target = (Subtotal - Discount) * 1.18
                                                    // Discount = Subtotal - (Target / 1.18)
                                                    const subtotal = selectedPlanDetails.rate * selectedPlanDetails.qty;
                                                    const requiredTaxable = target / 1.18;
                                                    const calculatedDiscount = Math.max(0, Math.round(subtotal - requiredTaxable));
                                                    setDiscount(calculatedDiscount);
                                                }}
                                                className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full border border-emerald-100 hover:bg-emerald-100 transition-colors whitespace-nowrap"
                                            >
                                                Make ₹{(target/1000).toString().replace('.5', '.5')}k
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                             <div className="flex justify-between items-center px-4 py-2 border-b border-gray-100 text-sm bg-gray-50">
                                <span className="font-semibold text-gray-700 transform scale-90 origin-left uppercase">Subtotal Less Discount</span>
                                <span className="font-medium">INR {totals.taxable.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center px-4 py-2 border-b border-gray-100 text-sm">
                                <span className="font-semibold text-gray-600 transform scale-90 origin-left uppercase">CGST (9%)</span>
                                <span className="font-medium">INR {totals.cgst.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center px-4 py-2 border-b border-gray-100 text-sm">
                                <span className="font-semibold text-gray-600 transform scale-90 origin-left uppercase">SGST (9%)</span>
                                <span className="font-medium">INR {totals.sgst.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center px-4 py-3 bg-gray-900 text-white">
                                <span className="font-bold transform scale-90 origin-left uppercase">Total</span>
                                <span className="font-bold">INR {totals.total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-6 border-t border-gray-100">
                        <button 
                            onClick={generatePDF}
                            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
                        >
                            <Send size={18} />
                            Generate & Send Invoice (PDF)
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Generated Invoices Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-900 font-semibold border-b border-gray-200">
                    <tr>
                        <th className="p-4">Invoice ID</th>
                        <th className="p-4">User</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Date Issued</th>
                        <th className="p-4">Due Date</th>
                        <th className="p-4">Plan</th>
                        <th className="p-4">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {filteredInvoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-mono font-medium text-gray-900">{inv.id}</td>
                            <td className="px-4 py-3 font-medium text-gray-900">{inv.user}</td>
                            <td className="px-4 py-3 text-gray-900">{inv.amount}</td>
                            <td className="px-4 py-3 text-gray-600">{inv.date}</td>
                            <td className="px-4 py-3 text-gray-600">{inv.dueDate}</td>
                            <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded text-xs font-medium border ${
                                    inv.plan.includes('Yearly') ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                    inv.plan.includes('Monthly') ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                    'bg-amber-50 text-amber-700 border-amber-200'
                                }`}>
                                    {inv.plan}
                                </span>
                            </td>
                            <td className="px-4 py-3">
                                    <div className="flex gap-2">
                                        <button className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100">
                                            <Eye size={16} />
                                        </button>
                                        <button className="text-gray-400 hover:text-blue-600 p-1 rounded hover:bg-blue-50">
                                            <Download size={16} />
                                        </button>
                                    </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
                {filteredInvoices.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                    No invoices found matching criteria.
                </div>
            )}
        </div>
        </div>
    </div>
  );
};

export default InvoiceGenerator;
