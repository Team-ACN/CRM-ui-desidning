export const mockCohorts = [
  {
    id: 1,
    name: 'Whitefield Premium Agents',
    description: 'High value premium resale agents in East Bangalore',
    tags: ['AREA', 'PLAN'],
    status: 'Active',
    isActive: true,
    agentCount: 338,
  },
  {
    id: 2,
    name: 'Rental Focus – Bangalore',
    description: 'Agents primarily focused on long-term leasing',
    tags: ['FOCUS'],
    status: 'Active',
    isActive: true,
    agentCount: 845,
  },
  {
    id: 3,
    name: 'Low Pricing Behavior',
    description: 'Agents listing properties under 50L',
    tags: ['PRICING', 'AREA'],
    status: 'Inactive',
    isActive: false,
    agentCount: 152,
  },
  {
    id: 4,
    name: 'Manual Selection Cohort',
    description: 'Hand-picked agents from recent event',
    tags: ['MANUAL'],
    status: 'Inactive',
    isActive: false,
    agentCount: 12,
  },
  {
    id: 5,
    name: 'New Launch Specialists',
    description: 'Agents tied to Tier-1 developer pre-launches',
    tags: ['FOCUS', 'PLAN'],
    status: 'Active',
    isActive: true,
    agentCount: 420,
  },
  {
    id: 6,
    name: 'South Bangalore Expats',
    description: 'Specialists in Koramangala and Indiranagar luxury',
    tags: ['AREA'],
    status: 'Active',
    isActive: true,
    agentCount: 185,
  },
  {
    id: 7,
    name: 'Commercial Realty Pros',
    description: 'Office space and retail leasing network',
    tags: ['FOCUS', 'PRICING'],
    status: 'Active',
    isActive: true,
    agentCount: 94,
  },
  {
    id: 8,
    name: 'Dormant Accounts',
    description: 'Agents with no login in 90 days',
    tags: ['MANUAL'],
    status: 'Inactive',
    isActive: false,
    agentCount: 2105,
  },
];

export const cohortTypes = [
  { id: 'area', label: 'Area of Operation', description: 'Micromarket zones', exclusive: false },
  { id: 'plan', label: 'Plan Type', description: 'Subscription tiers', exclusive: false },
  { id: 'focus', label: 'Resale / Rental Focus', description: 'Business model', exclusive: false },
  { id: 'pricing', label: 'Pricing Behavior', description: 'Price bands', exclusive: false },
  { id: 'manual', label: 'Manual Selection', description: 'Hand-pick agents', exclusive: true },
];

// Available widget types for the template builder
export const availableWidgets = [
  {
    type: 'delist_inventories',
    label: 'Delist Inventories',
    description: 'Allows users to quickly manage delisted listings',
    icon: '🗑️',
    hasConfig: false,
  },
  {
    type: 'analytics_cards',
    label: 'Property & Edge Cards',
    description: 'Stat cards for Property, My Business, Edge',
    icon: '📊',
    hasConfig: false,
  },
  {
    type: 'enquiry_received',
    label: 'Enquiry Received',
    description: 'Summary of incoming enquiries',
    icon: '📬',
    hasConfig: false,
  },
  {
    type: 'enquiry_feedback',
    label: 'Enquiry Feedback',
    description: 'Collection and readouts of feedback',
    icon: '💬',
    hasConfig: false,
  },
  {
    type: 'banner_carousel',
    label: 'Banner Carousel',
    description: 'Multiple sliding promotional banners',
    icon: '🖼️',
    hasConfig: true,
  },
  {
    type: 'inventory_discovery',
    label: 'Inventory Discovery',
    description: 'Asset Type, Configuration, Zone filters',
    icon: '🔍',
    hasConfig: true,
  },
  {
    type: 'new_resale',
    label: 'Resale Inventory',
    description: 'Showcase of new resale inventory',
    icon: '🏢',
    hasConfig: false,
  },
  {
    type: 'new_rental',
    label: 'Rental Inventory',
    description: 'Showcase of new rental inventory',
    icon: '🔑',
    hasConfig: false,
  },
  {
    type: 'advertisement',
    label: 'Advertisement Banner',
    description: 'Single large banner unit',
    icon: '📢',
    hasConfig: true,
  },
  {
    type: 'suggested_properties',
    label: 'Suggested Properties',
    description: 'AI-driven contextual suggestions',
    icon: '✨',
    hasConfig: false,
  },
];

// Mock templates powered by the new widgets
export const mockTemplates = [
  {
    id: 't1',
    name: 'Premium Whitefield Home',
    cohortId: 1,
    priority: 1,
    status: 'Live',
    isActive: true,
    pageType: 'HOME',
    widgets: [
      { id: 'w1', type: 'analytics_cards' },
      { id: 'w2', type: 'new_resale' },
      { id: 'w3', type: 'suggested_properties' },
    ],
  },
  {
    id: 't2',
    name: 'Rental Discovery',
    cohortId: 2,
    priority: 2,
    status: 'Live',
    isActive: true,
    pageType: 'PROPERTIES',
    widgets: [
      { id: 'w4', type: 'enquiry_received' },
      { 
        id: 'w5', 
        type: 'banner_carousel',
        config: {
          items: [
            { id: 'b1', imageUrl: 'https://placehold.co/600x200/png', linkUrl: 'https://example.com' },
            { id: 'b2', imageUrl: 'https://placehold.co/600x200/png', linkUrl: 'https://example.com' }
          ]
        }
      },
      { id: 'w6', type: 'new_rental' },
    ],
  },
  {
    id: 't3',
    name: 'Budget Deals Navigation',
    cohortId: 3,
    priority: 3,
    status: 'Draft',
    isActive: false,
    pageType: 'HOME',
    widgets: [
      { id: 'w7', type: 'inventory_discovery', config: { assetType: 'Apartment', zone: 'North' } },
      { id: 'w8', type: 'suggested_properties' }
    ],
  },
  {
    id: 't4',
    name: 'New Launch Blast',
    cohortId: 5,
    priority: 1,
    status: 'Live',
    isActive: true,
    pageType: 'PROPERTIES',
    widgets: [
      { id: 'w9', type: 'advertisement', config: { imageUrl: 'https://placehold.co/600x300/png', linkUrl: '' } },
      { id: 'w10', type: 'new_resale' },
      { id: 'w11', type: 'enquiry_feedback' }
    ],
  },
  {
    id: 't5',
    name: 'Commercial Pipeline',
    cohortId: 7,
    priority: 2,
    status: 'Live',
    isActive: true,
    pageType: 'HOME',
    widgets: [
      { id: 'w12', type: 'analytics_cards' },
      { id: 'w13', type: 'enquiry_received' },
      { id: 'w14', type: 'inventory_discovery', config: { assetType: 'Commercial', zone: 'Central' } }
    ],
  },
  {
    id: 't6',
    name: 'Expat Luxury Showcase',
    cohortId: 6,
    priority: 3,
    status: 'Draft',
    isActive: false,
    pageType: 'PROPERTIES',
    widgets: [
      { id: 'w15', type: 'banner_carousel', config: { items: [{ id: 1, imageUrl: 'https://placehold.co/600x200/png' }] } },
      { id: 'w16', type: 'suggested_properties' },
    ],
  }
];
