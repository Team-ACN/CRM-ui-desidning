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
    endDate: '19 Jan 2027',
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
    endDate: '20 Dec 2026',
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
    endDate: '21 Dec 2026',
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
    endDate: '22 Jan 2027',
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
    endDate: '18 Dec 2026',
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
    endDate: '17 Dec 2026',
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
    endDate: '01 Mar 2027',
    status: 'Active',
    paymentMode: 'Net Banking'
  }
];


export const mockPaymentLinks = [
  { 
    id: 1, 
    amount: '2,500', 
    name: 'Vedamurthy N', 
    phone: '+91 9886...', 
    status: 'Paid', 
    date: '2 hours ago',
    plan: 'Premium Monthly',
    expiry: '20 Jan 2026',
    linkUrl: 'https://pay.acn.com/l/veda123'
  },
  { 
    id: 2, 
    amount: '5,000', 
    name: 'Amit Daga', 
    phone: '+91 9876...', 
    status: 'Pending', 
    date: '5 hours ago',
    plan: 'Premium Yearly',
    expiry: '21 Jan 2026',
    linkUrl: 'https://pay.acn.com/l/amit456'
  },
  { 
    id: 3, 
    amount: '1,000', 
    name: 'Sandeep', 
    phone: '+91 9123...', 
    status: 'Expired', 
    date: '1 day ago',
    plan: 'Booster Credits',
    expiry: '18 Jan 2026',
    linkUrl: 'https://pay.acn.com/l/san789'
  }
];

export const mockInvoices = [
  { id: 'INV001', user: 'Samarth Jangir', amount: '₹5,000', date: '19 Jan 2026', dueDate: '26 Jan 2026', status: 'Paid', plan: 'Premium Yearly' },
  { id: 'INV002', user: 'Amit Daga', amount: '₹2,500', date: '15 Jan 2026', dueDate: '22 Jan 2026', status: 'Pending', plan: 'Premium Monthly' },
  { id: 'INV003', user: 'Swamy', amount: '₹5,000', date: '10 Jan 2026', dueDate: '17 Jan 2026', status: 'Overdue', plan: 'Booster Credits' },
  { id: 'INV004', user: 'Nazir', amount: '₹1,000', date: '05 Jan 2026', dueDate: '12 Jan 2026', status: 'Paid', plan: 'Booster Credits' },
];
