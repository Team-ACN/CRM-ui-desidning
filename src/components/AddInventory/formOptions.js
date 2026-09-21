/**
 * Option lists and labels for the add-property form, matching the live ACN form.
 * Values stay in the shared property schema's vocabulary; only the labels differ.
 */

export const LISTING_OPTIONS = ['resale', 'rental'];
export const LISTING_LABELS = { resale: 'Sell', rental: 'Rent' };

export const PROPERTY_KIND_OPTIONS = ['residential', 'commercial'];

export const RESIDENTIAL_ASSETS = ['apartment', 'villa', 'plot', 'row house', 'villament', 'independent building'];
export const COMMERCIAL_ASSETS = ['office', 'retail', 'warehouse', 'land'];

export const COMMUNITY_OPTIONS = ['gated', 'independent'];

export const APARTMENT_TYPE_OPTIONS = ['simplex', 'duplex', 'triplex', 'penthouse'];

export const DOOR_FACING_OPTIONS = [
  'north',
  'east',
  'south',
  'west',
  'north east',
  'north west',
  'south west',
  'south east',
];

export const DOOR_FACING_LABELS = {
  'north east': 'North-East',
  'north west': 'North-West',
  'south west': 'South-West',
  'south east': 'South-East',
};

export const FURNISHING_OPTIONS = ['unfurnished', 'semi furnished', 'furnished'];
export const FURNISHING_LABELS = {
  unfurnished: 'Unfurnished',
  'semi furnished': 'Semi-Furnished',
  furnished: 'Fully Furnished',
};

export const BEDROOM_OPTIONS = ['Studio', '1', '2', '3', '4', '5', '5+'];
export const COUNT_OPTIONS = ['1', '2', '3', '4', '5', '5+'];

export const EXTRA_ROOM_OPTIONS = ['Servant Room', 'Study Room', 'Pooja Room', 'Other'];

export const BALCONY_FACING_OPTIONS = ['inside', 'outside'];

export const POSSESSION_LABELS = {
  'ready to move': 'Ready to Move',
  'under construction': 'Under Construction',
  'available by': 'Available By',
};

export const BUILDING_KHATA_OPTIONS = ['A-Khata', 'B-Khata'];
export const LAND_KHATA_OPTIONS = ['A-Khata', 'B-Khata'];

export const KHATA_FLAG_OPTIONS = ['E-Khata', 'BIAPPA Approved Khata', 'BDA Approved Khata'];

export const AMENITY_OPTIONS = [
  'Power Backup',
  'CCTV Security',
  'Visitor Management',
  'Gym',
  'Swimming Pool',
  'Yoga',
  'Jogging Track',
  'Spa / Sauna',
  'Badminton',
  'Tennis',
  'Squash',
  'Cricket Net',
  'Basketball',
  'Indoor Games',
  'Clubhouse',
  'Visitor Parking',
  'Service Lifts',
  'Water Storage',
  'Park',
];

export const PRICE_UNIT_OPTIONS = ['Total Ask Price', 'Price per Sqft'];

export const MAINTENANCE_OPTIONS = ['Included', 'Not Included'];

export const ASK_PRICE_HINT = 'Eg. 2.20 Cr | 2 Crore 20 Lakh Rupees only';
export const RENT_HINT = 'Eg. 7.5 K | 7500 Rupees only';

/** Labels the live form uses where they differ from the schema's own wording. */
export const FORM_LABELS = {
  rent: 'Rent/ month',
  deposit: 'Deposit',
  maintenance: 'Maintenance',
  maintenanceAmount: 'Maintenance Amount',
  commissionType: 'Commission Type',
  listingType: "You're looking to?",
  propertyType: 'What kind of property?',
  assetType: 'Select property type',
  communityType: 'Select community type',
  apartmentType: 'Apartment Type',
  propertyName: 'Project Name',
  sbua: 'SBUA',
  carpetArea: 'Carpet Area',
  facing: 'Door Facing',
  floorNumber: 'Floor No.',
  totalFloors: 'Total Floors',
  furnishing: 'Furnishing',
  noOfBedrooms: 'No. of Bedrooms',
  extraRooms: 'Extra Rooms',
  noOfBathrooms: 'No. of Bathrooms',
  noOfBalcony: 'No. of Balconies',
  balconyFacing: 'Balcony Facing',
  possession: 'Possession',
  totalAskPrice: 'Total Ask Price',
  uds: 'UDS',
  buildingKhata: 'Building Khata',
  landKhata: 'Land Khata',
  amenities: 'Amenities',
  extraDetails: 'Extra Details',
  parking: 'Parking',
};

/** Fields rendered as pill pickers — the UI already constrains them, so no format checks. */
export const CHOICE_CONSTRAINED_KEYS = [
  'listingType',
  'propertyType',
  'assetType',
  'communityType',
  'apartmentType',
  'facing',
  'furnishing',
  'noOfBedrooms',
  'noOfBathrooms',
  'noOfBalcony',
  'possession',
];

/** Form-only fields the live page has but the upload schema does not. */
export const EXTRA_VALUE_KEYS = ['carpetArea', 'balconyFacing', 'buildingKhata', 'landKhata', 'priceUnit'];

export const EXTRA_LIST_KEYS = ['extraRooms', 'khataFlags', 'amenities'];

export const EXTRA_FLAG_KEYS = ['cornerUnit', 'exclusive', 'ocReceived'];
