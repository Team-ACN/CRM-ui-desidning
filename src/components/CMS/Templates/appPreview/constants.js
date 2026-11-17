/** Real system widgets of the app, keyed by backend widget type. */
export const DEFAULT_HEADINGS = {
  PROPERTY_EDGE_CARDS: '',
  DELIST_INVENTORIES: 'Attention Needed',
  ENQUIRY_RECEIVED: 'Enquiry Received',
  ENQUIRY_FEEDBACK: 'Made Enquiries? Review Them',
  RESALE_INVENTORY: 'Resale Properties',
  RENTAL_INVENTORY: 'Rental Properties',
  SUGGESTED_PROPERTIES: 'Suggested Properties',
  POPUP: '',
  SEARCH: '',
  EDGE_WIDGET: 'Early Market insights',
  SERVICE_WIDGET: 'Legal & Documentation',
};

export const SYSTEM_WIDGET_META = {
  PROPERTY_EDGE_CARDS: { label: 'Property & Edge cards', editableHeading: false },
  DELIST_INVENTORIES: { label: 'Delist inventories', editableHeading: true },
  ENQUIRY_RECEIVED: { label: 'Enquiry received', editableHeading: true },
  ENQUIRY_FEEDBACK: { label: 'Enquiry feedback', editableHeading: true },
  RESALE_INVENTORY: { label: 'Resale inventory', editableHeading: true },
  RENTAL_INVENTORY: { label: 'Rental inventory', editableHeading: true },
  SUGGESTED_PROPERTIES: { label: 'Suggested properties', editableHeading: true },
  POPUP: { label: 'Pop-up', editableHeading: false },
  SEARCH: { label: 'Search', editableHeading: false },
  EDGE_WIDGET: { label: 'Edge widget', editableHeading: true },
  SERVICE_WIDGET: { label: 'Service widget', editableHeading: true },
};

/** Default page tint (app `headerColour`). */
export const PAGE_TINTS = { home: '#FFEDD5', properties: '#B6FFF2', services: '#C2DDFD' };

