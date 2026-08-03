import { TODAY_PRESET } from './enquiryConstants';

const parseEnquiryDate = (value) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const daysAgo = (days) => {
  const date = startOfDay(new Date());
  date.setDate(date.getDate() - days);
  return date;
};

export const isToday = (enquiry) => {
  const date = parseEnquiryDate(enquiry.dateOfEnquiry);
  if (!date) return false;
  return startOfDay(date).getTime() === startOfDay(new Date()).getTime();
};

const matchesDate = (enquiry, dateFilter) => {
  if (!dateFilter) return true;

  const date = parseEnquiryDate(enquiry.dateOfEnquiry);
  if (!date) return false;

  if (dateFilter === TODAY_PRESET) return isToday(enquiry);
  if (dateFilter === 'Last 7 days') return startOfDay(date) >= daysAgo(7);
  if (dateFilter === 'Last 30 days') return startOfDay(date) >= daysAgo(30);
  if (dateFilter === 'This year') return date.getFullYear() === new Date().getFullYear();

  // Custom range, stored as "YYYY-MM-DD → YYYY-MM-DD"
  const [from, to] = dateFilter.split(' → ');
  const fromDate = parseEnquiryDate(from);
  const toDate = parseEnquiryDate(to);
  if (!fromDate || !toDate) return true;
  return startOfDay(date) >= startOfDay(fromDate) && startOfDay(date) <= startOfDay(toDate);
};

const SELECTION_MATCHERS = {
  status: (enquiry, value) => enquiry.status === value,
  contacted: (enquiry, value) => enquiry.contacted === (value === 'Contacted'),
  propertyStatus: (enquiry, value) =>
    value === 'Not Available'
      ? enquiry.propertyStatus === 'Not Available'
      : enquiry.propertyStatus !== 'Not Available',
  currentPropertyStatus: (enquiry, value) => enquiry.currentPropertyStatus === value,
  buyerKam: (enquiry, value) => enquiry.buyerKam === value,
  sellerKam: (enquiry, value) => enquiry.sellerKam === value,
};

export const filterEnquiries = (enquiries, filters) =>
  enquiries.filter((enquiry) => {
    if (filters.dealType && enquiry.dealType !== filters.dealType) return false;
    if (!matchesDate(enquiry, filters.date)) return false;

    return Object.entries(filters.selected).every(([key, value]) => {
      if (!value) return true;
      const matcher = SELECTION_MATCHERS[key];
      return matcher ? matcher(enquiry, value) : true;
    });
  });

const countDistinctAgents = (enquiries) =>
  new Set(enquiries.map((enquiry) => enquiry.buyerNumber)).size;

const countContacted = (enquiries) => enquiries.filter((enquiry) => enquiry.contacted).length;

const countNotAvailable = (enquiries) =>
  enquiries.filter((enquiry) => enquiry.propertyStatus === 'Not Available').length;

// Overall reacts to the filter bar; today is always the unfiltered count for today
export const buildStatCards = (allEnquiries, filteredEnquiries) => {
  const todaysEnquiries = allEnquiries.filter(isToday);

  return [
    {
      key: 'enquiries',
      label: 'Enquiries',
      filter: {},
      overall: filteredEnquiries.length,
      today: todaysEnquiries.length,
    },
    {
      key: 'agentsEnquired',
      label: 'Agents Enquired',
      filter: {},
      overall: countDistinctAgents(filteredEnquiries),
      today: countDistinctAgents(todaysEnquiries),
    },
    {
      key: 'contacted',
      label: 'Contacted',
      filter: { contacted: 'Contacted' },
      overall: countContacted(filteredEnquiries),
      today: countContacted(todaysEnquiries),
    },
    {
      key: 'notAvailableMarked',
      label: 'Not Available Marked',
      filter: { propertyStatus: 'Not Available' },
      overall: countNotAvailable(filteredEnquiries),
      today: countNotAvailable(todaysEnquiries),
    },
  ];
};
