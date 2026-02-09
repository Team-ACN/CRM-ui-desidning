import { 
  Building2, 
  Clock, 
  Phone, 
  PhoneIncoming, 
  UserPlus, 
  FileCheck, 
  FileX, 
  User, 
  UserCheck, 
  Crown 
} from 'lucide-react';

// Activity card configuration with mock counts
export const activityCards = [
  {
    id: 'delisted_inventories',
    label: 'Delisted inventories',
    count: 12,
    icon: Building2,
    targetUrl: '/properties',
    filterKey: 'status',
    filterValue: 'delisted',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    // Sub-sections for resale and rental
    subSections: [
      { label: 'Resale', count: 8, filterValue: 'delisted_resale' },
      { label: 'Rental', count: 4, filterValue: 'delisted_rental' }
    ]
  },
  {
    id: 'to_be_delisted',
    label: 'To be delisted',
    count: 5,
    icon: Clock,
    targetUrl: '/properties',
    filterKey: 'status',
    filterValue: 'to_be_delisted',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    subSections: [
      { label: 'Resale', count: 3, filterValue: 'to_be_delisted_resale' },
      { label: 'Rental', count: 2, filterValue: 'to_be_delisted_rental' }
    ]
  },
  {
    id: 't3_calling',
    label: 'T-3 calling',
    count: 8,
    icon: Phone,
    targetUrl: '/agents',
    filterKey: 'status',
    filterValue: 't3_calling',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    id: 'callback',
    label: 'Call back',
    count: 3,
    icon: PhoneIncoming,
    targetUrl: '/agents',
    filterKey: 'status',
    filterValue: 'callback',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  {
    id: 'new_agents_assigned',
    label: 'New agents assigned',
    count: 15,
    icon: UserPlus,
    targetUrl: '/agents',
    filterKey: 'status',
    filterValue: 'new_assigned',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50'
  },
  {
    id: 'forms_filled',
    label: 'Forms filled',
    count: 24,
    icon: FileCheck,
    targetUrl: '/leads',
    filterKey: 'status',
    filterValue: 'form_filled',
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    id: 'forms_skipped',
    label: 'Forms skipped',
    count: 7,
    icon: FileX,
    targetUrl: '/leads',
    filterKey: 'status',
    filterValue: 'form_skipped',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50'
  },
  {
    id: 'basic_agents',
    label: 'Basic agents',
    count: 156,
    icon: User,
    targetUrl: '/agents',
    filterKey: 'plan',
    filterValue: 'basic',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100'
  },
  {
    id: 'trial_agents',
    label: 'Trial agents',
    count: 89,
    icon: UserCheck,
    targetUrl: '/agents',
    filterKey: 'plan',
    filterValue: 'trial',
    color: 'text-sky-600',
    bgColor: 'bg-sky-50'
  },
  {
    id: 'premium_agents',
    label: 'Premium agents',
    count: 45,
    icon: Crown,
    targetUrl: '/agents',
    filterKey: 'plan',
    filterValue: 'premium',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50'
  }
];

// User data for greeting
export const userData = {
  name: 'Samarth',
  role: 'KAM'
};

// List of KAMs for filter dropdown
export const kamList = [
  { id: 'all', name: 'All KAMs' },
  { id: 'samarth', name: 'Samarth (You)' },
  { id: 'sandeep', name: 'Sandeep' },
  { id: 'rasranjan', name: 'Rasranjan' },
  { id: 'siddharth', name: 'Siddharth' },
  { id: 'surendra', name: 'Surendra' },
  { id: 'qalandar', name: 'Qalandar' },
];
