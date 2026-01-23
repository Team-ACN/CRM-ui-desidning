import React from 'react';
import { FileText, Send } from 'lucide-react';

const InvoiceGenerator = () => {
  return (
    <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText size={20} className="text-gray-500" />
                Generate Invoice
            </h3>
            <span className="text-xs text-gray-500">INV-AUTO-GEN-001</span>
        </div>
        
        <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-8">
                {/* Billed To */}
                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Bill To</h4>
                    <div className="space-y-3">
                         <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Users Name</label>
                            <input type="text" placeholder="John Doe" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Email Address</label>
                            <input type="email" placeholder="john@example.com" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:outline-none" />
                        </div>
                         <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Address</label>
                            <textarea placeholder="Client Address" rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:outline-none"></textarea>
                        </div>
                    </div>
                </div>

                 {/* Invoice Details */}
                 <div className="space-y-4">
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Details</h4>
                    <div className="space-y-3">
                         <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Invoice Date</label>
                            <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Due Date</label>
                            <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:outline-none" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Line Items */}
            <div>
                 <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Items</h4>
                 <div className="border border-gray-200 rounded-lg overflow-hidden">
                     <table className="w-full text-sm">
                         <thead className="bg-gray-50 text-gray-600">
                             <tr>
                                 <th className="px-4 py-2 text-left">Description</th>
                                 <th className="px-4 py-2 text-right w-24">Qty</th>
                                 <th className="px-4 py-2 text-right w-32">Price</th>
                                 <th className="px-4 py-2 text-right w-32">Total</th>
                             </tr>
                         </thead>
                         <tbody>
                             <tr>
                                 <td className="px-4 py-2 border-t border-gray-100">
                                     <input type="text" placeholder="Item description" className="w-full bg-transparent outline-none" />
                                 </td>
                                 <td className="px-4 py-2 border-t border-gray-100 text-right">
                                     <input type="number" placeholder="1" className="w-full bg-transparent outline-none text-right" />
                                 </td>
                                 <td className="px-4 py-2 border-t border-gray-100 text-right">
                                     <input type="number" placeholder="0.00" className="w-full bg-transparent outline-none text-right" />
                                 </td>
                                 <td className="px-4 py-2 border-t border-gray-100 text-right font-medium">₹0.00</td>
                             </tr>
                         </tbody>
                     </table>
                     <div className="p-2 bg-gray-50 border-t border-gray-200">
                         <button className="text-xs font-medium text-blue-600 hover:text-blue-800">+ Add Line Item</button>
                     </div>
                 </div>
            </div>

            {/* Total */}
             <div className="flex justify-end">
                <div className="w-64 space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Subtotal:</span>
                        <span>₹0.00</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Tax (18%):</span>
                        <span>₹0.00</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                        <span>Total:</span>
                        <span>₹0.00</span>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-100">
                <button className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
                    <Send size={18} />
                    Generate & Send Invoice
                </button>
            </div>
        </div>
    </div>
  );
};

export default InvoiceGenerator;
