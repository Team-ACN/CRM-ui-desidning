import React from 'react';
import { Trash2, BarChart3, Mail, MessageSquare, Image, Search, Building2, Key, Megaphone, Sparkles } from 'lucide-react';

export const mockCohorts = [
  {
    id: 'COH001',
    name: 'Whitefield Premium Agents',
    description: 'High value premium resale agents in East Bangalore',
    tags: ['AREA', 'PLAN'],
    status: 'Active',
    isActive: true,
    agentCount: 338,
  },
  {
    id: 'COH002',
    name: 'Rental Focus – Bangalore',
    description: 'Agents primarily focused on long-term leasing',
    tags: ['FOCUS'],
    status: 'Active',
    isActive: true,
    agentCount: 845,
  },
  {
    id: 'COH003',
    name: 'Low Pricing Behavior',
    description: 'Agents listing properties under 50L',
    tags: ['PRICING', 'AREA'],
    status: 'Inactive',
    isActive: false,
    agentCount: 152,
  },
  {
    id: 'COH004',
    name: 'Manual Selection Cohort',
    description: 'Hand-picked agents from recent event',
    tags: ['MANUAL'],
    status: 'Inactive',
    isActive: false,
    agentCount: 12,
  },
  {
    id: 'COH005',
    name: 'New Launch Specialists',
    description: 'Agents tied to Tier-1 developer pre-launches',
    tags: ['FOCUS', 'PLAN'],
    status: 'Active',
    isActive: true,
    agentCount: 420,
  },
  {
    id: 'COH006',
    name: 'South Bangalore Expats',
    description: 'Specialists in Koramangala and Indiranagar luxury',
    tags: ['AREA'],
    status: 'Active',
    isActive: true,
    agentCount: 185,
  },
  {
    id: 'COH007',
    name: 'Commercial Realty Pros',
    description: 'Office space and retail leasing network',
    tags: ['FOCUS', 'PRICING'],
    status: 'Active',
    isActive: true,
    agentCount: 94,
  },
  {
    id: 'COH008',
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
    icon: <Trash2 size={16} />,
    hasConfig: false,
  },
  {
    type: 'analytics_cards',
    label: 'Property & Edge Cards',
    description: 'Stat cards for Property, My Business, Edge',
    icon: <BarChart3 size={16} />,
    hasConfig: false,
  },
  {
    type: 'enquiry_received',
    label: 'Enquiry Received',
    description: 'Summary of incoming enquiries',
    icon: <Mail size={16} />,
    hasConfig: false,
  },
  {
    type: 'enquiry_feedback',
    label: 'Enquiry Feedback',
    description: 'Collection and readouts of feedback',
    icon: <MessageSquare size={16} />,
    hasConfig: false,
  },
  {
    type: 'banner_carousel',
    label: 'Banner Carousel',
    description: 'Multiple sliding promotional banners',
    icon: <Image size={16} />,
    hasConfig: true,
  },
  {
    type: 'inventory_discovery',
    label: 'Inventory Discovery',
    description: 'Asset Type, Configuration, Zone filters',
    icon: <Search size={16} />,
    hasConfig: true,
  },
  {
    type: 'new_resale',
    label: 'Resale Inventory',
    description: 'Showcase of new resale inventory',
    icon: <Building2 size={16} />,
    hasConfig: false,
  },
  {
    type: 'new_rental',
    label: 'Rental Inventory',
    description: 'Showcase of new rental inventory',
    icon: <Key size={16} />,
    hasConfig: false,
  },
  {
    type: 'advertisement',
    label: 'Advertisement Banner',
    description: 'Single large banner unit',
    icon: <Megaphone size={16} />,
    hasConfig: true,
  },
  {
    type: 'suggested_properties',
    label: 'Suggested Properties',
    description: 'AI-driven contextual suggestions',
    icon: <Sparkles size={16} />,
    hasConfig: false,
  },
];

// Mock templates powered by the new widgets
export const mockTemplates = [
  {
    id: 't1',
    name: 'Premium Whitefield Home',
    cohortIds: ['COH001'],
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
    cohortIds: ['COH002'],
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
    cohortIds: ['COH003'],
    priority: 3,
    status: 'Not Live',
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
    cohortIds: ['COH005'],
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
    cohortIds: ['COH007'],
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
    cohortIds: ['COH006'],
    priority: 3,
    status: 'Not Live',
    isActive: false,
    pageType: 'PROPERTIES',
    widgets: [
      { id: 'w15', type: 'banner_carousel', config: { items: [{ id: 1, imageUrl: 'https://placehold.co/600x200/png' }] } },
      { id: 'w16', type: 'suggested_properties' },
    ],
  }
];

// Mock pre-configured components (Saved Widgets)
export const mockComponents = [
  {
    id: 'CMP001',
    name: 'Diwali Festive Banner',
    type: 'banner_carousel',
    pageType: 'HOME',
    createdAt: '2023-11-01T10:00:00Z',
    config: {
      heading: 'Festive Offers',
      items: [
        { id: 'b1', imageUrl: 'https://placehold.co/600x200/png?text=Diwali+Offer+1', linkUrl: '' },
        { id: 'b2', imageUrl: 'https://placehold.co/600x200/png?text=Diwali+Offer+2', linkUrl: '' },
        { id: 'b3', imageUrl: 'https://placehold.co/600x200/png?text=Diwali+Offer+3', linkUrl: '' }
      ]
    }
  },
  {
    id: 'CMP002',
    name: 'Premium North Blr Filters',
    type: 'inventory_discovery',
    pageType: 'PROPERTIES',
    createdAt: '2023-10-15T09:30:00Z',
    config: {
      heading: 'Discover Premium Villas',
      assetType: 'Villa',
      zone: 'North',
      priceMin: '20000000',
      priceMax: '50000000',
      areaMin: '3000',
      hasImages: true,
      propertyIds: ['PB3864', 'PB4201', 'PB5102']
    }
  },
  {
    id: 'CMP003',
    name: 'Flash Sale Ad',
    type: 'advertisement',
    pageType: 'HOME',
    createdAt: '2023-11-10T14:20:00Z',
    config: {
      heading: 'Limited Time Offer',
      items: [
        { id: 'a1', imageUrl: 'https://placehold.co/600x300/png?text=Flash+Sale+20%OFF', linkUrl: 'https://acn.com/sale' },
        { id: 'a2', imageUrl: 'https://placehold.co/600x300/png?text=Zero+Brokerage', linkUrl: 'https://acn.com/zerobrokerage' },
        { id: 'a3', imageUrl: 'https://placehold.co/600x300/png?text=Free+Site+Visit', linkUrl: 'https://acn.com/visit' }
      ]
    }
  },
  {
    id: 'CMP004',
    name: 'New Launch Spotlight',
    type: 'advertisement',
    pageType: 'PROPERTIES',
    createdAt: '2023-11-12T09:15:00Z',
    config: {
      heading: 'Project of the Month',
      items: [
        { id: 'a1', imageUrl: 'https://placehold.co/600x300/png?text=Godrej+Splendour', linkUrl: '' },
        { id: 'a2', imageUrl: 'https://placehold.co/600x300/png?text=Launch+Price+Guaranteed', linkUrl: '' },
        { id: 'a3', imageUrl: 'https://placehold.co/600x300/png?text=Book+Now', linkUrl: '' }
      ]
    }
  },
  {
    id: 'CMP005',
    name: 'Commercial Properties Hub',
    type: 'inventory_discovery',
    pageType: 'HOME',
    createdAt: '2023-11-05T11:45:00Z',
    config: {
      heading: 'Top Commercial Spaces',
      assetType: 'Commercial',
      zone: 'Central',
      hasImages: true,
      propertyIds: ['PB7891', 'PB6543']
    }
  },
  {
    id: 'CMP006',
    name: 'Budget Apartments Banner',
    type: 'banner_carousel',
    pageType: 'PROPERTIES',
    createdAt: '2023-10-28T16:00:00Z',
    config: {
      heading: 'Affordable Homes',
      items: [
        { id: 'b1', imageUrl: 'https://placehold.co/600x200/png?text=Under+50L', linkUrl: '' },
        { id: 'b2', imageUrl: 'https://placehold.co/600x200/png?text=Ready+To+Move', linkUrl: '' },
        { id: 'b3', imageUrl: 'https://placehold.co/600x200/png?text=EMI+Offers', linkUrl: '' }
      ]
    }
  }
];
