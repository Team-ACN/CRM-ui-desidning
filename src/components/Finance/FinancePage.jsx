import React, { useState } from 'react';
import { BadgeIndianRupeeIcon, Receipt, Tag, Link as LinkIcon, Wallet, Crown, Search } from 'lucide-react';
import PaymentHistory from './PaymentHistory';
import CouponGenerator from './CouponGenerator';
import InvoiceGenerator from './InvoiceGenerator';
import PaymentLinkGenerator from './PaymentLinkGenerator';
import Subscriptions from './Subscriptions';
import { mockPaymentHistory, mockCoupons, mockSubscriptions } from '../../data/mockFinance';

const FinancePage = () => {
  const [activeTab, setActiveTab] = useState('Payment History');
  const [searchQuery, setSearchQuery] = useState('');

  const content = {
    'Payment History': <PaymentHistory payments={mockPaymentHistory} searchQuery={searchQuery} />,
    'Subscriptions': <Subscriptions subscriptions={mockSubscriptions} />,
    'Coupons': <CouponGenerator coupons={mockCoupons} />,
    'Invoices': <InvoiceGenerator />,
    'Payment Links': <PaymentLinkGenerator />
  };

  const tabs = [
    { id: 'Payment History', icon: <Wallet size={18} /> },
    { id: 'Subscriptions', icon: <Crown size={18} /> },
    { id: 'Coupons', icon: <Tag size={18} /> },
    { id: 'Invoices', icon: <Receipt size={18} /> },
    { id: 'Payment Links', icon: <LinkIcon size={18} /> },
  ];

  return (
    <div className="pb-8 bg-gray-50 min-h-screen">
      {/* Finance Header */}
      <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between mb-0">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                <BadgeIndianRupeeIcon size={20} />
            </div>
            Finance & Payments
        </h1>
        
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search finance..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-64 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>
      </header>

      {/* Tabs Menu */}
      <div className="bg-white border-b border-gray-200 px-6 mb-6 sticky top-0 z-10">
          <div className="flex gap-6">
              {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === tab.id 
                            ? 'border-gray-900 text-gray-900' 
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                      {tab.icon}
                      {tab.id}
                  </button>
              ))}
          </div>
      </div>

      <div className="px-6">
         {content[activeTab]}
      </div>
    </div>
  );
};

export default FinancePage;
