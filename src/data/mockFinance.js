export const mockPaymentHistory = [
  {
    id: 1,
    transactionId: 'TXN123456789',
    user: 'Samarth Jangir',
    amount: '₹5,000',
    date: '19 Jan 2026',
    status: 'Success',
    plan: 'Premium Yearly',
    method: 'UPI',
    source: 'Platform Direct'
  },
  {
    id: 2,
    transactionId: 'TXN987654321',
    user: 'Amit Daga',
    amount: '₹2,500',
    date: '19 Jan 2026',
    status: 'Failed',
    plan: 'Premium Monthly',
    method: 'Card',
    source: 'Payment Link'
  },
  {
    id: 3,
    transactionId: 'TXN456123789',
    user: 'Swamy',
    amount: '₹5,000',
    date: '18 Jan 2026',
    status: 'Pending',
    plan: 'Premium Yearly',
    method: 'Net Banking',
    source: 'Platform Direct'
  },
  {
    id: 4,
    transactionId: 'TXN789123456',
    user: 'Nazir',
    amount: '₹1,000',
    date: '17 Jan 2026',
    status: 'Success',
    plan: 'Booster Credits',
    method: 'UPI',
    source: 'Payment Link'
  },
  {
    id: 5,
    transactionId: 'TXN321654987',
    user: 'Dilip',
    amount: '₹5,000',
    date: '16 Jan 2026',
    status: 'Success',
    plan: 'Premium Monthly',
    method: 'Card',
    source: 'Platform Direct'
  },
  // Previous Months Data for testing filters
  {
    id: 6,
    transactionId: 'TXN555444333',
    user: 'Rishik',
    amount: '₹5,000',
    date: '15 Dec 2025',
    status: 'Success',
    plan: 'Premium Yearly',
    method: 'UPI',
    source: 'Platform Direct'
  },
  {
    id: 7,
    transactionId: 'TXN999888777',
    user: 'Sandeep',
    amount: '₹2,500',
    date: '10 Dec 2025',
    status: 'Success',
    plan: 'Premium Monthly',
    method: 'Card',
    source: 'Payment Link'
  },
  {
    id: 8,
    transactionId: 'TXN111222333',
    user: 'Venkatesh',
    amount: '₹5,000',
    date: '05 Nov 2025',
    status: 'Success',
    plan: 'Premium Yearly',
    method: 'Net Banking',
    source: 'Platform Direct'
  }
];

export const mockCoupons = [
  { id: 1, code: 'WELCOME50', discount: '50', maxDiscount: '1500', type: 'percentage', expiry: '31 Jan 2026', status: 'Active' },
  { id: 2, code: 'FLAT500', discount: '50', maxDiscount: '1000', type: 'percentage', expiry: '28 Feb 2026', status: 'Active' },
  { id: 3, code: 'NEWYEAR20', discount: '20', maxDiscount: '1000', type: 'percentage', expiry: '15 Jan 2026', status: 'Expired' },
];

export const mockSubscriptions = [
  // Upcoming Renewals
  {
    id: 1,
    user: 'Samarth Jangir',
    plan: 'Premium Yearly',
    amount: '₹50,000',
    startDate: '19 Jan 2025',
    nextRenewal: '19 Jan 2026', // Today (assuming current date is 19 Jan)
    status: 'Active',
    paymentMode: 'Net Banking'
  },
  {
    id: 2,
    user: 'Amit Daga',
    plan: 'Premium Monthly',
    amount: '₹5,000',
    startDate: '20 Dec 2025',
    nextRenewal: '20 Jan 2026', // Tomorrow (1 day)
    status: 'Active',
    paymentMode: 'Credit Card'
  },
  {
    id: 3,
    user: 'Rishik',
    plan: 'Premium Monthly',
    amount: '₹5,000',
    startDate: '21 Dec 2025',
    nextRenewal: '21 Jan 2026', // Day after tomorrow (2 days)
    status: 'Active',
    paymentMode: 'UPI'
  },
  {
    id: 4,
    user: 'Nazir',
    plan: 'Premium Yearly',
    amount: '₹50,000',
    startDate: '22 Jan 2025',
    nextRenewal: '22 Jan 2026', // 3 days
    status: 'Active',
    paymentMode: 'UPI'
  },
  
  // Past Due
  {
    id: 5,
    user: 'Dilip',
    plan: 'Premium Monthly',
    amount: '₹5,000',
    startDate: '18 Dec 2025',
    nextRenewal: '18 Jan 2026', // Past 1 day
    status: 'Past Due',
    paymentMode: 'Debit Card'
  },
  {
    id: 6,
    user: 'Sandeep',
    plan: 'Premium Monthly',
    amount: '₹5,000',
    startDate: '17 Dec 2025',
    nextRenewal: '17 Jan 2026', // Past 2 days
    status: 'Past Due',
    paymentMode: 'Card'
  },
  
  // Regular Active (Future)
  {
    id: 7,
    user: 'Swamy',
    plan: 'Premium Yearly',
    amount: '₹50,000',
    startDate: '01 Mar 2025',
    nextRenewal: '01 Mar 2026', // Future
    status: 'Active',
    paymentMode: 'Net Banking'
  }
];

export const mockInvoices = [
  { id: 'INV001', user: 'Samarth Jangir', amount: '₹5,000', date: '19 Jan 2026', dueDate: '26 Jan 2026', status: 'Paid', plan: 'Premium Yearly' },
  { id: 'INV002', user: 'Amit Daga', amount: '₹2,500', date: '15 Jan 2026', dueDate: '22 Jan 2026', status: 'Pending', plan: 'Premium Monthly' },
  { id: 'INV003', user: 'Swamy', amount: '₹5,000', date: '10 Jan 2026', dueDate: '17 Jan 2026', status: 'Overdue', plan: 'Booster Credits' },
  { id: 'INV004', user: 'Nazir', amount: '₹1,000', date: '05 Jan 2026', dueDate: '12 Jan 2026', status: 'Paid', plan: 'Booster Credits' },
];
