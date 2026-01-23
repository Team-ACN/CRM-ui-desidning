import React from 'react';
import { Plus, Tag } from 'lucide-react';

const CouponGenerator = ({ coupons }) => {
  const [discountType, setDiscountType] = React.useState('percentage'); // 'percentage' | 'fixed'

  return (
    <div className="space-y-6">
      {/* Create Coupon Card */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Tag size={20} className="text-gray-500" />
            Create New Coupon
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
                <input type="text" placeholder="e.g. SUMMER2026" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:outline-none" />
            </div>
            
            <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select 
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:outline-none bg-white"
                >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                </select>
            </div>

             <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {discountType === 'percentage' ? 'Discount (%)' : 'Amount (₹)'}
                </label>
                 <input 
                    type="number" 
                    placeholder={discountType === 'percentage' ? "20" : "1000"} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:outline-none" 
                 />
            </div>
             <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                 <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:outline-none" />
            </div>
            <div className="md:col-span-1">
                <button className="w-full bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 h-[42px]">
                    <Plus size={18} />
                    Generate
                </button>
            </div>
        </div>
      </div>

       {/* Active Coupons List */}
       <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">

           <table className="min-w-full text-sm text-left">
               <thead className="bg-gray-50 text-gray-900 font-semibold border-b border-gray-200">
                   <tr>
                       <th className="p-4">Code</th>
                       <th className="p-4">Discount</th>
                       <th className="p-4">Expiry</th>
                       <th className="p-4">Status</th>
                       <th className="p-4">Actions</th>
                   </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                   {coupons.map(coupon => (
                       <tr key={coupon.id} className="hover:bg-gray-50">
                           <td className="px-4 py-3 font-mono font-bold text-gray-800">{coupon.code}</td>
                           <td className="px-4 py-3 font-medium">
                               {coupon.type === 'fixed' 
                                 ? `Flat ₹${coupon.discount}` 
                                 : `${coupon.discount}% - ₹${coupon.maxDiscount}`
                               }
                           </td>
                           <td className="px-4 py-3 text-gray-500">{coupon.expiry}</td>
                           <td className="px-4 py-3">
                               <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                   coupon.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                               }`}>
                                   {coupon.status}
                               </span>
                           </td>
                           <td className="px-4 py-3">
                               <button className="text-red-600 hover:text-red-800 text-xs font-medium">Deactivate</button>
                           </td>
                       </tr>
                   ))}
               </tbody>
           </table>
       </div>
    </div>
  );
};

export default CouponGenerator;
