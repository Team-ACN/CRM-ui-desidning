// Fake in-memory "backend" for the Edge (CMS) feature.
// Mirrors the shape of the real /api/cms/* routes so pages can be swapped
// over to real fetch() calls later without changing their read/write logic.

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
// These typedefs are documentation only (plain JS, no build-time checking) —
// they exist so anyone editing a page under src/components/Edge/ can see
// every field a Post/Project/HomeFeed carries without hunting through the
// editor JSX. Keep this in sync whenever a field is added/removed from an
// editor page.

/**
 * @typedef {'article' | 'carousel' | 'video'} PostType
 * @typedef {'Trends' | 'Infrastructure' | 'Employment' | 'Supply' | 'Policy' | 'Legal'} PostTag
 *
 * @typedef {Object} Post
 * @property {string} id                       Auto-generated: 'A'+4-digit (article), 'C'+4-digit (carousel), 'V'+4-digit (video) — e.g. 'A0001'
 * @property {PostType} type                    Set once at creation, drives which editor fields show
 * @property {string} title                     Required — headline shown everywhere the post is listed
 * @property {string|null} cover_image_url      Main image (article/carousel cover, video thumbnail)
 * @property {string|null} notif_image          Separate image used for push-notification/share previews
 * @property {boolean} is_live                  false = draft (hidden from public feed), true = published
 * @property {string|null} shared_text          Pre-written text used when a KAM shares this with a client
 * @property {number} client_shares             Counter — how many times a KAM has shared this post
 * @property {string|null} project_id           Optional link to a Project (this post is "about" that project)
 * @property {string[]|null} zone               One or more of ZONES below
 * @property {string[]|null} micromarket        Must belong to the selected zone(s) — see ZONE_MICROMARKETS
 * @property {string[]|null} corridor           Must belong to the selected zone(s) — see ZONE_CORRIDORS
 * @property {PostTag|null} tag                 Single category tag, drives filter chips on the client
 * @property {string} created_at                ISO timestamp, set once at creation
 * @property {string|null} published_at         ISO timestamp — null while still a draft
 * @property {string|null} summary              1-2 line teaser shown in list views
 * @property {Array<{heading: string, text: string}>|null} pulse   Structured "why it matters" blocks
 * @property {string|null} shareable_name        Optional display name override used on the public share link
 * @property {string|null} source_url            Where this article was sourced from (if aggregated)
 * @property {string|null} source_name           Publisher name for the source_url
 * @property {string[]|null} slides              Carousel-only: ordered slide text/image content
 * @property {string|null} video_url             Video-only: playable video URL
 *
 * @typedef {Object} Project
 * @property {string} id                         Auto-generated: 'P'+4-digit — e.g. 'P0001'
 * @property {string} name                       Required — full project name
 * @property {string|null} codename              Internal short name, shown when name is still a placeholder
 * @property {string|null} description
 * @property {string|null} rera_id               RERA registration number
 * @property {string|null} launch_status         Free text badge, e.g. 'New Launch' | 'Ongoing' | 'Ready to Move' | 'Sold Out'
 * @property {string|null} cover_image_url
 * @property {string|null} notif_image
 * @property {string|null} zone                  Single zone — see ZONES
 * @property {string|null} micromarket            Single micromarket — see ZONE_MICROMARKETS
 * @property {string[]|null} corridor              One or more corridors — see ZONE_CORRIDORS
 * @property {number|null} latitude
 * @property {number|null} longitude
 * @property {string|null} kml_file_url           Uploaded site-boundary file
 * @property {string|null} pricing                Free text, e.g. '₹1.2 Cr - 2.0 Cr'
 * @property {number|null} land_area_acres
 * @property {number|null} total_units
 * @property {string|null} floor                  Free text, e.g. 'G+30'
 * @property {string[]|null} layouts               e.g. ['2 BHK', '3 BHK']
 * @property {string[]|null} configurations         e.g. ['Apartment', 'Penthouse']
 * @property {string|null} completion_date          ISO date
 * @property {string|null} approval_date            ISO date
 * @property {string|null} master_plan_url
 * @property {string|null} brochure_url
 * @property {string[]} images                       Gallery, in display order
 * @property {string|null} builder_name
 * @property {string|null} builder_logo_url
 * @property {string|null} builder_contact_name
 * @property {string|null} builder_contact_designation
 * @property {string|null} builder_contact_mobile
 * @property {string} created_at
 * @property {string|null} published_at            null = draft
 * @property {boolean} [is_live]                    Derived convenience flag (mirrors published_at != null)
 *
 * @typedef {Object} PageOrderSection
 * @property {string} name                          One of PAGE_ORDER_SECTIONS
 * @property {boolean} hidden                        true = section is hidden from the public homepage
 *
 * @typedef {Object} HomeFeed
 * @property {string[]} feed                          Ordered list of Post ids shown on the homepage feed
 * @property {PageOrderSection[]} page_order           Display order + visibility of homepage sections
 * @property {PageOrderSection[]} project_page_order    Display order + visibility of /project page sections (PRD §8.2)
 */

export const ZONES = ['East Bangalore', 'West Bangalore', 'North Bangalore', 'South Bangalore', 'Central Bangalore'];

export const ZONE_MICROMARKETS = {
  'East Bangalore': ['Whitefield', 'Marathahalli', 'Sarjapur Road', 'Bellandur', 'Varthur', 'ITPL', 'KR Puram', 'Indiranagar', 'Domlur', 'HAL', 'Old Airport Road'],
  'West Bangalore': ['Rajajinagar', 'Malleshwaram', 'Yeshwantpur', 'Nagarbhavi', 'Kengeri', 'Vijayanagar', 'Peenya'],
  'North Bangalore': ['Hebbal', 'Yelahanka', 'Devanahalli', 'Thanisandra', 'Jakkur', 'Banaswadi', 'HBR Layout', 'Hennur', 'Kogilu'],
  'South Bangalore': ['Electronic City', 'Bannerghatta Road', 'JP Nagar', 'Jayanagar', 'BTM Layout', 'Kanakapura Road', 'Hulimavu', 'Begur', 'Gottigere', 'Mysore Road'],
  'Central Bangalore': ['Koramangala', 'HSR Layout', 'MG Road', 'Richmond Town', 'Lavelle Road', 'Sadashivanagar', 'Vasanth Nagar', 'Ulsoor'],
};

export const ZONE_CORRIDORS = {
  'East Bangalore': ['Outer Ring Road', 'Sarjapur Road', 'Whitefield Corridor', 'Old Madras Road'],
  'West Bangalore': ['Tumkur Road', 'Magadi Road', 'Mysore Road West'],
  'North Bangalore': ['Bellary Road', 'Airport Road NH44', 'Hennur Road', 'Thanisandra Road'],
  'South Bangalore': ['Hosur Road', 'Bannerghatta Road Corridor', 'Kanakapura Road', 'Electronic City Expressway'],
  'Central Bangalore': ['MG Road', 'Residency Road', 'Cunningham Road'],
};

export const TAGS = ['Trends', 'Infrastructure', 'Employment', 'Supply', 'Policy', 'Legal'];

export const PAGE_ORDER_SECTIONS = ['Visual Stories', 'Latest Project Updates', 'Last 48 Hours', 'Location wise sort'];

// Section order for the /project page (PRD §8.2) — separate from the Home page's own PAGE_ORDER_SECTIONS above.
export const PROJECT_PAGE_ORDER_SECTIONS = ['Pre-launch', 'RERA Approved', 'Search by Builder', 'Zones', 'Asset Type', 'Possession'];

export const LAUNCH_STATUSES = ['New Launch', 'Ongoing', 'Ready to Move', 'Sold Out'];

export const LAYOUTS = ['Apartment', 'Villa', 'Row House', 'Plot', 'Commercial', 'Offices'];

/** @returns {Partial<Post>} */
export function blankPost(type) {
  return {
    type,
    title: '',
    cover_image_url: null,
    notif_image: null,
    is_live: false,
    shared_text: null,
    client_shares: 0,
    tag: type === 'video' ? 'Trends' : null,
    zone: [],
    micromarket: [],
    corridor: [],
    project_id: null,
    published_at: new Date().toISOString(),
    summary: null,
    pulse: [],
    shareable_name: null,
    source_url: null,
    source_name: null,
    slides: [],
    video_url: null,
  };
}

/** @returns {Partial<Project>} */
export function blankProject() {
  return {
    name: '',
    codename: null,
    description: null,
    launch_status: null,
    cover_image_url: null,
    notif_image: null,
    zone: null,
    micromarket: null,
    corridor: [],
    latitude: null,
    longitude: null,
    kml_file_url: null,
    pricing: null,
    land_area_acres: null,
    total_units: null,
    floor: null,
    layouts: [],
    configurations: [],
    phase_details: [],
    master_plan_url: null,
    brochure_url: null,
    images: [],
    builder_id: null,
    rawBuilderName: null,
    restackProjectId: null,
    published_at: null,
    status: 'drafted',
  };
}

/** @type {Post[]} */
let posts = [
  {
    id: 'A0001', type: 'article', title: 'Whitefield Metro Line Extension Cuts Commute Times by 40%',
    cover_image_url: null, notif_image: null, is_live: true, shared_text: 'Big infra update for Whitefield buyers — worth a look before your next site visit.', client_shares: 12,
    project_id: 'P0002', zone: ['East Bangalore'], micromarket: ['Whitefield'], corridor: ['Outer Ring Road'],
    tag: 'Infrastructure', created_at: '2026-08-01T09:00:00.000Z', published_at: '2026-08-01T09:00:00.000Z',
    summary: 'The new metro extension has significantly improved connectivity for the Whitefield corridor.',
    pulse: [
      { heading: 'Why it matters', text: 'Faster commute is driving fresh demand from IT corridor buyers.'},
      { heading: 'What to watch', text: 'Prices along the new stations have moved 8-12% in the last two quarters.'},
    ],
    shareable_name: null, source_url: 'https://example.com/brtc-whitefield-metro', source_name: 'BRTC Bulletin', slides: [], video_url: null,
  },
  {
    id: 'C0001', type: 'carousel', title: '5 Reasons Sarjapur Road is Bangalore’s Next Big Micromarket',
    cover_image_url: null, notif_image: null, is_live: true, shared_text: null, client_shares: 8,
    project_id: null, zone: ['East Bangalore'], micromarket: ['Sarjapur Road'], corridor: ['Sarjapur Road'],
    tag: 'Trends', created_at: '2026-08-05T09:00:00.000Z', published_at: '2026-08-05T09:00:00.000Z',
    summary: 'A quick visual breakdown of why demand is surging in this corridor.',
    pulse: [], shareable_name: 'Sarjapur Road: 5 Reasons to Watch', source_url: null, source_name: null,
    slides: [
      'Slide 1: Connectivity — Outer Ring Road + upcoming metro',
      'Slide 2: Price appreciation — 14% YoY across resale inventory',
      'Slide 3: Upcoming supply — 6 new launches in the next 12 months',
      'Slide 4: Social infra — 3 new international schools opened in 2025',
      'Slide 5: Verdict — best entry point for 3-5 year holds',
    ],
    video_url: null,
  },
  {
    id: 'V0001', type: 'video', title: 'Walkthrough: Hebbal’s Newest Launch',
    cover_image_url: null, notif_image: null, is_live: false, shared_text: null, client_shares: 0,
    project_id: null, zone: ['North Bangalore'], micromarket: ['Hebbal'], corridor: ['Bellary Road'],
    tag: 'Trends', created_at: '2026-08-10T09:00:00.000Z', published_at: null,
    summary: 'A short walkthrough of the show flat and amenities block.',
    pulse: [], shareable_name: null, source_url: null, source_name: null,
    slides: [], video_url: 'https://example.com/videos/hebbal-walkthrough.mp4',
  },
  {
    id: 'A0002', type: 'article', title: 'RERA Flags Delays Across 12 South Bangalore Projects',
    cover_image_url: null, notif_image: null, is_live: false, shared_text: null, client_shares: 0,
    project_id: null, zone: ['South Bangalore'], micromarket: ['Electronic City'], corridor: ['Hosur Road'],
    tag: 'Legal', created_at: '2026-08-12T09:00:00.000Z', published_at: null,
    summary: 'A regulatory update buyers should know before booking in the affected micromarkets.',
    pulse: [{ heading: 'Bottom line', text: 'Ask for the updated completion certificate before any booking amount changes hands.' }],
    shareable_name: null, source_url: 'https://example.com/rera-order-2026-08', source_name: 'Karnataka RERA', slides: [], video_url: null,
  },
  {
    id: 'A0003', type: 'article', title: 'IT Hiring Rebound Puts Bellandur and Marathahalli Back in Demand',
    cover_image_url: null, notif_image: null, is_live: true, shared_text: 'Client-facing note: hiring numbers back this up if anyone asks why prices are firming up.', client_shares: 21,
    project_id: null, zone: ['East Bangalore'], micromarket: ['Bellandur', 'Marathahalli'], corridor: ['Outer Ring Road'],
    tag: 'Employment', created_at: '2026-07-18T09:00:00.000Z', published_at: '2026-07-19T09:00:00.000Z',
    summary: 'Fresh hiring data from three large IT campuses is reviving rental and resale demand along ORR.',
    pulse: [{ heading: 'Numbers', text: '3 large campuses reported combined headcount growth of 9% this quarter.' }],
    shareable_name: null, source_url: null, source_name: null, slides: [], video_url: null,
  },
  {
    id: 'C0002', type: 'carousel', title: 'Before You Book: 6 Documents Every Buyer Should Verify',
    cover_image_url: null, notif_image: null, is_live: true, shared_text: 'Send this to first-time buyers before they sign anything.', client_shares: 34,
    project_id: null, zone: [], micromarket: [], corridor: [],
    tag: 'Legal', created_at: '2026-07-02T09:00:00.000Z', published_at: '2026-07-03T09:00:00.000Z',
    summary: 'A buyer-education checklist we reuse across every KAM handoff.',
    pulse: [], shareable_name: null, source_url: null, source_name: null,
    slides: [
      'Slide 1: RERA registration certificate',
      'Slide 2: Encumbrance certificate (13-year chain)',
      'Slide 3: Approved building plan',
      'Slide 4: Occupancy/completion certificate',
      'Slide 5: Khata certificate + extract',
      'Slide 6: Bank pre-approval / loan sanction letter',
    ],
    video_url: null,
  },
  {
    id: 'V0002', type: 'video', title: 'Founder’s Take: Why We’re Bullish on North Bangalore',
    cover_image_url: null, notif_image: null, is_live: true, shared_text: null, client_shares: 5,
    project_id: 'P0001', zone: ['North Bangalore'], micromarket: ['Devanahalli'], corridor: ['Airport Road NH44'],
    tag: 'Trends', created_at: '2026-06-28T09:00:00.000Z', published_at: '2026-06-29T09:00:00.000Z',
    summary: 'A 3-minute take on the airport-corridor thesis.',
    pulse: [], shareable_name: null, source_url: null, source_name: null,
    slides: [], video_url: 'https://example.com/videos/north-bangalore-thesis.mp4',
  },
  {
    id: 'A0004', type: 'article', title: 'New STRR Alignment Finalised — What It Means for Kanakapura Road',
    cover_image_url: null, notif_image: null, is_live: false, shared_text: null, client_shares: 0,
    project_id: null, zone: ['South Bangalore'], micromarket: ['Kanakapura Road'], corridor: ['Kanakapura Road'],
    tag: 'Infrastructure', created_at: '2026-08-13T09:00:00.000Z', published_at: null,
    summary: null, pulse: [], shareable_name: null, source_url: null, source_name: null, slides: [], video_url: null,
  },
  {
    id: 'A0005', type: 'article', title: 'Peenya Industrial Belt Redevelopment Opens Up West Bangalore Housing Demand',
    cover_image_url: null, notif_image: null, is_live: true, shared_text: null, client_shares: 6,
    project_id: 'P0006', zone: ['West Bangalore'], micromarket: ['Peenya'], corridor: ['Tumkur Road'],
    tag: 'Infrastructure', created_at: '2026-06-05T09:00:00.000Z', published_at: '2026-06-06T09:00:00.000Z',
    summary: 'A state-backed redevelopment plan is expected to free up land and pull housing demand westward.',
    pulse: [{ heading: 'Timeline', text: 'Phase 1 land parcels are expected to be cleared by early 2028.' }],
    shareable_name: null, source_url: null, source_name: null, slides: [], video_url: null,
  },
  {
    id: 'C0003', type: 'carousel', title: 'Koramangala vs HSR Layout: Where Should You Actually Buy?',
    cover_image_url: null, notif_image: null, is_live: true, shared_text: 'Good one to send when a client is torn between these two.', client_shares: 19,
    project_id: null, zone: ['Central Bangalore'], micromarket: ['Koramangala', 'HSR Layout'], corridor: ['MG Road'],
    tag: 'Trends', created_at: '2026-05-22T09:00:00.000Z', published_at: '2026-05-23T09:00:00.000Z',
    summary: 'A side-by-side comparison across price, rental yield, and social infrastructure.',
    pulse: [], shareable_name: null, source_url: null, source_name: null,
    slides: [
      'Slide 1: Entry price — Koramangala commands a 15-20% premium',
      'Slide 2: Rental yield — HSR Layout edges ahead at 3.4% vs 2.9%',
      'Slide 3: Social infra — both are well served, Koramangala denser',
      'Slide 4: Verdict — HSR for yield, Koramangala for long-term appreciation',
    ],
    video_url: null,
  },
  {
    id: 'V0003', type: 'video', title: 'Site Visit Vlog: Jayanagar Redevelopment Pockets',
    cover_image_url: null, notif_image: null, is_live: false, shared_text: null, client_shares: 0,
    project_id: null, zone: ['South Bangalore'], micromarket: ['Jayanagar'], corridor: [],
    tag: 'Trends', created_at: '2026-08-09T09:00:00.000Z', published_at: null,
    summary: 'Walking through three redevelopment sites in old Jayanagar blocks.',
    pulse: [], shareable_name: null, source_url: null, source_name: null,
    slides: [], video_url: 'https://example.com/videos/jayanagar-redevelopment.mp4',
  },
  {
    id: 'A0006', type: 'article', title: 'Karnataka Revises Guidance Value Across 40 Bangalore Zones',
    cover_image_url: null, notif_image: null, is_live: true, shared_text: 'Guidance value hike — good context if a client asks why registration costs went up.', client_shares: 15,
    project_id: null, zone: ['East Bangalore', 'North Bangalore'], micromarket: [], corridor: [],
    tag: 'Policy', created_at: '2026-04-11T09:00:00.000Z', published_at: '2026-04-12T09:00:00.000Z',
    summary: 'The revision raises guidance values by an average of 15-30% depending on the zone.',
    pulse: [{ heading: 'Impact', text: 'Registration costs will rise proportionally from the next fiscal quarter.' }],
    shareable_name: null, source_url: 'https://example.com/karnataka-guidance-value-2026', source_name: 'Department of Stamps & Registration', slides: [], video_url: null,
  },
  {
    id: 'C0004', type: 'carousel', title: 'Rent vs Buy in 2026: A Bangalore-Specific Breakeven Calculator',
    cover_image_url: null, notif_image: null, is_live: false, shared_text: null, client_shares: 0,
    project_id: null, zone: [], micromarket: [], corridor: [],
    tag: 'Trends', created_at: '2026-08-14T09:00:00.000Z', published_at: null,
    summary: null, pulse: [], shareable_name: null, source_url: null, source_name: null,
    slides: [
      'Slide 1: The assumptions we use',
      'Slide 2: Breakeven at 5 years',
      'Slide 3: Breakeven at 10 years',
    ],
    video_url: null,
  },
  {
    id: 'A0007', type: 'article', title: 'Vacancy Rates Tighten in Malleshwaram and Rajajinagar Rental Market',
    cover_image_url: null, notif_image: null, is_live: true, shared_text: null, client_shares: 3,
    project_id: null, zone: ['West Bangalore'], micromarket: ['Malleshwaram', 'Rajajinagar'], corridor: [],
    tag: 'Supply', created_at: '2026-03-30T09:00:00.000Z', published_at: '2026-03-31T09:00:00.000Z',
    summary: 'Rental vacancy has dropped below 4% in both micromarkets for the first time in three years.',
    pulse: [], shareable_name: null, source_url: null, source_name: null, slides: [], video_url: null,
  },
  {
    id: 'V0004', type: 'video', title: 'Drone Flyover: Devanahalli Airport Corridor Land Parcels',
    cover_image_url: null, notif_image: null, is_live: true, shared_text: 'Great one to send investors evaluating the airport-corridor thesis.', client_shares: 11,
    project_id: 'P0004', zone: ['North Bangalore'], micromarket: ['Devanahalli'], corridor: ['Airport Road NH44'],
    tag: 'Trends', created_at: '2026-07-08T09:00:00.000Z', published_at: '2026-07-09T09:00:00.000Z',
    summary: 'Aerial coverage of the parcels flagged for the next wave of launches.',
    pulse: [], shareable_name: null, source_url: null, source_name: null,
    slides: [], video_url: 'https://example.com/videos/devanahalli-flyover.mp4',
  },
];

/** @type {Project[]} */
let projects = [
  {
    id: 'P0001', name: 'Prestige Lakeside Habitat', codename: 'PLH', description: 'Large-format lakeside township in East Bangalore with a mix of apartments and villas around a 5-acre landscaped lake.',
    rera_id: 'PRM/KA/RERA/1251/446/PR/171020/002715', launch_status: 'Prelaunch', cover_image_url: null, notif_image: null,
    zone: 'East Bangalore', micromarket: 'Varthur', corridor: ['Outer Ring Road'], latitude: 12.9351, longitude: 77.7373,
    kml_file_url: null, pricing: '₹1.2 Cr - 1.6 Cr', land_area_acres: 102, total_units: 6000, floor: 'G+30',
    layouts: ['2 BHK', '3 BHK', '4 BHK'], configurations: ['Apartment'], completion_date: '2027-12-01',
    approval_date: '2019-03-01', master_plan_url: null, brochure_url: null, images: [],
    builder_name: 'Prestige Group', builder_logo_url: null, builder_contact_name: 'Ramesh Kumar',
    builder_contact_designation: 'Sales Head', builder_contact_mobile: '9800000001',
    created_at: '2026-07-20T09:00:00.000Z', published_at: '2026-07-20T09:00:00.000Z', is_live: true,
  },
  {
    id: 'P0002', name: 'Sobha Neopolis', codename: 'SN', description: 'Premium high-rise development off Panathur Road with a dedicated retail promenade.',
    rera_id: 'PRM/KA/RERA/1251/447/PR/210115/003890', launch_status: 'Developer', cover_image_url: null, notif_image: null,
    zone: 'East Bangalore', micromarket: 'Bellandur', corridor: ['Sarjapur Road'], latitude: 12.9351, longitude: 77.6812,
    kml_file_url: null, pricing: '₹1.8 Cr - 2.7 Cr', land_area_acres: 45, total_units: 2800, floor: 'G+40',
    layouts: ['3 BHK', '4 BHK'], configurations: ['Apartment', 'Penthouse'], completion_date: '2029-06-01',
    approval_date: '2025-01-15', master_plan_url: null, brochure_url: null, images: [],
    builder_name: 'Sobha Limited', builder_logo_url: null, builder_contact_name: 'Anitha Rao',
    builder_contact_designation: 'CRM Manager', builder_contact_mobile: '9800000002',
    created_at: '2026-07-25T09:00:00.000Z', published_at: null, is_live: false,
  },
  {
    id: 'P0003', name: 'Brigade Xanadu', codename: null, description: 'Mid-density gated community targeting first-time upgrader families in North Bangalore.',
    rera_id: 'PRM/KA/RERA/1251/448/PR/220310/004102', launch_status: 'RERA', cover_image_url: null, notif_image: null,
    zone: 'North Bangalore', micromarket: 'Yelahanka', corridor: ['Bellary Road'], latitude: 13.1007, longitude: 77.5963,
    kml_file_url: null, pricing: '₹0.8 Cr - 1.3 Cr', land_area_acres: 18, total_units: 720, floor: 'G+14',
    layouts: ['1 BHK', '2 BHK', '3 BHK'], configurations: ['Apartment'], completion_date: '2025-03-01',
    approval_date: '2021-06-01', master_plan_url: null, brochure_url: null, images: [],
    builder_name: 'Brigade Group', builder_logo_url: null, builder_contact_name: 'Vinay Shetty',
    builder_contact_designation: 'Regional Sales Manager', builder_contact_mobile: '9800000003',
    created_at: '2026-06-10T09:00:00.000Z', published_at: '2026-06-11T09:00:00.000Z', is_live: true,
  },
  {
    id: 'P0004', name: 'Godrej Air NXT', codename: 'GAN', description: 'Compact-format towers near Devanahalli aimed at the airport-corridor investor segment.',
    rera_id: 'PRM/KA/RERA/1251/449/PR/230702/004977', launch_status: 'Prelaunch', cover_image_url: null, notif_image: null,
    zone: 'North Bangalore', micromarket: 'Devanahalli', corridor: ['Airport Road NH44'], latitude: 13.2437, longitude: 77.6910,
    kml_file_url: null, pricing: '₹0.7 Cr - 1.2 Cr', land_area_acres: 12, total_units: 950, floor: 'G+22',
    layouts: ['1 BHK', '2 BHK'], configurations: ['Apartment'], completion_date: '2028-09-01',
    approval_date: '2026-02-01', master_plan_url: null, brochure_url: null, images: [],
    builder_name: 'Godrej Properties', builder_logo_url: null, builder_contact_name: 'Priya Menon',
    builder_contact_designation: 'Sales Head', builder_contact_mobile: '9800000004',
    created_at: '2026-08-02T09:00:00.000Z', published_at: null, is_live: false,
  },
  {
    id: 'P0005', name: 'Purva Atmosphere', codename: null, description: 'Fully sold-out reference project used for pricing/appreciation comparisons in South Bangalore.',
    rera_id: 'PRM/KA/RERA/1251/450/PR/180405/001820', launch_status: 'RERA', cover_image_url: null, notif_image: null,
    zone: 'South Bangalore', micromarket: 'Electronic City', corridor: ['Hosur Road'], latitude: 12.8452, longitude: 77.6602,
    kml_file_url: null, pricing: '₹0.9 Cr (last recorded resale)', land_area_acres: 22, total_units: 1400, floor: 'G+18',
    layouts: ['2 BHK', '3 BHK'], configurations: ['Apartment'], completion_date: '2022-01-01',
    approval_date: '2017-08-01', master_plan_url: null, brochure_url: null, images: [],
    builder_name: 'Puravankara', builder_logo_url: null, builder_contact_name: 'Suresh Iyer',
    builder_contact_designation: 'Customer Relations', builder_contact_mobile: '9800000005',
    created_at: '2026-05-14T09:00:00.000Z', published_at: '2026-05-14T09:00:00.000Z', is_live: true,
  },
  {
    id: 'P0006', name: 'Peenya Industrial Redevelopment Block A', codename: 'PIR-A', description: 'First residential-mixed-use phase carved out of the Peenya industrial belt redevelopment.',
    rera_id: 'PRM/KA/RERA/1251/451/PR/260115/005240', launch_status: 'Prelaunch', cover_image_url: null, notif_image: null,
    zone: 'West Bangalore', micromarket: 'Peenya', corridor: ['Tumkur Road'], latitude: 13.0281, longitude: 77.5199,
    kml_file_url: null, pricing: '₹0.6 Cr - 1.0 Cr', land_area_acres: 9, total_units: 640, floor: 'G+16',
    layouts: ['1 BHK', '2 BHK'], configurations: ['Apartment'], completion_date: '2029-12-01',
    approval_date: '2026-01-15', master_plan_url: null, brochure_url: null, images: [],
    builder_name: 'Salarpuria Sattva', builder_logo_url: null, builder_contact_name: 'Deepak Nair',
    builder_contact_designation: 'Sales Head', builder_contact_mobile: '9800000006',
    created_at: '2026-06-01T09:00:00.000Z', published_at: '2026-06-02T09:00:00.000Z', is_live: true,
  },
  {
    id: 'P0007', name: 'Adarsh Welkin Central', codename: null, description: 'Boutique low-rise development in the heart of Koramangala with a focus on large-format 3-4 BHK homes.',
    rera_id: 'PRM/KA/RERA/1251/452/PR/240601/004650', launch_status: 'Developer', cover_image_url: null, notif_image: null,
    zone: 'Central Bangalore', micromarket: 'Koramangala', corridor: ['MG Road'], latitude: 12.9352, longitude: 77.6146,
    kml_file_url: null, pricing: '₹3.4 Cr - 6.3 Cr', land_area_acres: 4, total_units: 180, floor: 'G+10',
    layouts: ['3 BHK', '4 BHK'], configurations: ['Apartment', 'Duplex'], completion_date: '2027-08-01',
    approval_date: '2024-05-01', master_plan_url: null, brochure_url: null, images: [],
    builder_name: 'Adarsh Developers', builder_logo_url: null, builder_contact_name: 'Kavya Reddy',
    builder_contact_designation: 'Sales Manager', builder_contact_mobile: '9800000007',
    created_at: '2026-05-20T09:00:00.000Z', published_at: '2026-05-21T09:00:00.000Z', is_live: true,
  },
  {
    id: 'P0008', name: 'Shriram Codename Winter Song', codename: 'Winter Song', description: 'Placeholder codename listing ahead of formal launch — pricing and unit mix still being finalised.',
    rera_id: null, launch_status: 'Prelaunch', cover_image_url: null, notif_image: null,
    zone: 'South Bangalore', micromarket: 'JP Nagar', corridor: ['Bannerghatta Road Corridor'], latitude: 12.9083, longitude: 77.5851,
    kml_file_url: null, pricing: null, land_area_acres: null, total_units: null, floor: null,
    layouts: [], configurations: [], completion_date: null,
    approval_date: null, master_plan_url: null, brochure_url: null, images: [],
    builder_name: 'Shriram Properties', builder_logo_url: null, builder_contact_name: null,
    builder_contact_designation: null, builder_contact_mobile: null,
    created_at: '2026-08-14T09:00:00.000Z', published_at: null, is_live: false,
  },
  {
    id: 'P0009', name: 'Century Rising Star', codename: null, description: 'Ready-to-move tower cluster near Hulimavu, popular with rental investors targeting Electronic City commuters.',
    rera_id: 'PRM/KA/RERA/1251/453/PR/210901/003415', launch_status: 'RERA', cover_image_url: null, notif_image: null,
    zone: 'South Bangalore', micromarket: 'Hulimavu', corridor: ['Bannerghatta Road Corridor'], latitude: 12.8760, longitude: 77.6018,
    kml_file_url: null, pricing: '₹0.8 Cr - 1.1 Cr', land_area_acres: 8, total_units: 512, floor: 'G+15',
    layouts: ['1 BHK', '2 BHK', '3 BHK'], configurations: ['Apartment'], completion_date: '2024-11-01',
    approval_date: '2021-09-01', master_plan_url: null, brochure_url: null, images: [],
    builder_name: 'Century Real Estate', builder_logo_url: null, builder_contact_name: 'Farhan Ali',
    builder_contact_designation: 'Regional Sales Manager', builder_contact_mobile: '9800000009',
    created_at: '2026-04-25T09:00:00.000Z', published_at: '2026-04-26T09:00:00.000Z', is_live: true,
  },
  {
    id: 'P0010', name: 'Mantri Espana', codename: null, description: 'Sold-out landmark project retained as a resale/appreciation benchmark for the HSR Layout micromarket.',
    rera_id: 'PRM/KA/RERA/1251/454/PR/160310/000980', launch_status: 'Developer', cover_image_url: null, notif_image: null,
    zone: 'Central Bangalore', micromarket: 'HSR Layout', corridor: ['MG Road'], latitude: 12.9121, longitude: 77.6446,
    kml_file_url: null, pricing: '₹1.6 Cr (last recorded resale)', land_area_acres: 15, total_units: 980, floor: 'G+20',
    layouts: ['2 BHK', '3 BHK', '4 BHK'], configurations: ['Apartment'], completion_date: '2020-06-01',
    approval_date: '2015-11-01', master_plan_url: null, brochure_url: null, images: [],
    builder_name: 'Mantri Developers', builder_logo_url: null, builder_contact_name: 'Neha Kapoor',
    builder_contact_designation: 'Customer Relations', builder_contact_mobile: '9800000010',
    created_at: '2026-03-02T09:00:00.000Z', published_at: '2026-03-02T09:00:00.000Z', is_live: true,
  },

  {
    "id": "P0011",
    "name": "Adarsh Group Heights",
    "codename": "Codename Prime",
    "description": "Premium lifestyle development offering world-class amenities.",
    "rera_id": null,
    "launch_status": "Prelaunch",
    "cover_image_url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500&q=80",
    "notif_image": null,
    "zone": "East Bangalore",
    "micromarket": "Varthur",
    "corridor": [
      "Hosur Road"
    ],
    "latitude": 12.903702188226301,
    "longitude": 77.58529633299072,
    "kml_file_url": null,
    "pricing": "\u20b90.5 Cr - 0.8 Cr",
    "land_area_acres": 26,
    "total_units": 578,
    "floor": "G+10",
    "layouts": [
      "4 BHK",
      "Penthouse",
      "Villa"
    ],
    "configurations": [
      "Apartment"
    ],
    "phase_details": [],
    "master_plan_url": "https://example.com/mp",
    "brochure_url": null,
    "images": [],
    "builder_id": "B0001",
    "rawBuilderName": "Adarsh Group",
    "restackProjectId": "RSTK-4945",
    "published_at": "2025-08-14T10:00:00Z",
    "status": "archive",
    "created_at": "2024-01-01T10:00:00Z"
  },
  {
    "id": "P0012",
    "name": "Shriram Properties Residences",
    "codename": "Codename Nova",
    "description": "Premium lifestyle development offering world-class amenities.",
    "rera_id": null,
    "launch_status": "Prelaunch",
    "cover_image_url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500&q=80",
    "notif_image": null,
    "zone": "Central Bangalore",
    "micromarket": "Richmond Town",
    "corridor": [
      "Bannerghatta Road Corridor"
    ],
    "latitude": 13.083435562933277,
    "longitude": 77.64655770029108,
    "kml_file_url": null,
    "pricing": "\u20b91.3 Cr - 1.8 Cr",
    "land_area_acres": 32,
    "total_units": 180,
    "floor": "G+25",
    "layouts": [
      "Plot",
      "1 BHK",
      "2 BHK"
    ],
    "configurations": [
      "Apartment"
    ],
    "phase_details": [],
    "master_plan_url": null,
    "brochure_url": null,
    "images": [],
    "builder_id": "B0002",
    "rawBuilderName": "Shriram Properties",
    "restackProjectId": "RSTK-8302",
    "published_at": "2025-07-18T10:00:00Z",
    "status": "resale",
    "created_at": "2024-01-01T10:00:00Z"
  },
  {
    "id": "P0013",
    "name": "Brigade Group Oasis",
    "codename": "Codename Prime",
    "description": "Premium lifestyle development offering world-class amenities.",
    "rera_id": "PRM/KA/RERA/1251/500/PR/28815",
    "launch_status": "Developer",
    "cover_image_url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500&q=80",
    "notif_image": null,
    "zone": "Central Bangalore",
    "micromarket": "Lavelle Road",
    "corridor": [
      "Hosur Road"
    ],
    "latitude": 13.014161903537534,
    "longitude": 77.5041977853771,
    "kml_file_url": null,
    "pricing": "\u20b90.5 Cr - 0.9 Cr",
    "land_area_acres": 49,
    "total_units": 100,
    "floor": "G+40",
    "layouts": [
      "1 BHK",
      "Villa",
      "2 BHK",
      "Plot"
    ],
    "configurations": [
      "Apartment"
    ],
    "phase_details": [
      {
        "phase_name": "Phase 1",
        "rera_id": "PRM/KA/RERA/1251/500/PR/28815",
        "approval_date": "2024-04-25",
        "handover_date": "2028-12-01"
      }
    ],
    "master_plan_url": null,
    "brochure_url": null,
    "images": [],
    "builder_id": null,
    "rawBuilderName": "Brigade Group",
    "restackProjectId": "RSTK-2033",
    "published_at": "2025-01-25T10:00:00Z",
    "status": "archive",
    "created_at": "2024-01-01T10:00:00Z"
  },
  {
    "id": "P0014",
    "name": "Brigade Group Enclave",
    "codename": "Codename Apex",
    "description": "Premium lifestyle development offering world-class amenities.",
    "rera_id": null,
    "launch_status": "RERA",
    "cover_image_url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500&q=80",
    "notif_image": null,
    "zone": "North Bangalore",
    "micromarket": "Yelahanka",
    "corridor": [
      "Outer Ring Road"
    ],
    "latitude": 13.098335188830891,
    "longitude": 77.56758329260782,
    "kml_file_url": null,
    "pricing": "\u20b90.8 Cr - 1.2 Cr",
    "land_area_acres": 6,
    "total_units": 1729,
    "floor": "G+25",
    "layouts": [
      "Penthouse",
      "1 BHK"
    ],
    "configurations": [
      "Apartment"
    ],
    "phase_details": [],
    "master_plan_url": "https://example.com/mp",
    "brochure_url": null,
    "images": [],
    "builder_id": null,
    "rawBuilderName": "Brigade Group",
    "restackProjectId": "RSTK-3421",
    "published_at": "2025-02-18T10:00:00Z",
    "status": "resale",
    "created_at": "2024-01-01T10:00:00Z"
  },
  {
    "id": "P0015",
    "name": "Salarpuria Sattva Park",
    "codename": "Codename Alpha",
    "description": "Premium lifestyle development offering world-class amenities.",
    "rera_id": "PRM/KA/RERA/1251/910/PR/22893",
    "launch_status": "RERA",
    "cover_image_url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500&q=80",
    "notif_image": null,
    "zone": "Central Bangalore",
    "micromarket": "MG Road",
    "corridor": [
      "Airport Road NH44"
    ],
    "latitude": 13.098707120838998,
    "longitude": 77.59061397527687,
    "kml_file_url": null,
    "pricing": "\u20b90.7 Cr - 1.2 Cr",
    "land_area_acres": 46,
    "total_units": 1629,
    "floor": "G+25",
    "layouts": [
      "Plot"
    ],
    "configurations": [
      "Apartment"
    ],
    "phase_details": [
      {
        "phase_name": "Phase 1",
        "rera_id": "PRM/KA/RERA/1251/910/PR/22893",
        "approval_date": "2024-03-22",
        "handover_date": "2026-11-01"
      }
    ],
    "master_plan_url": null,
    "brochure_url": "https://example.com/brochure",
    "images": [],
    "builder_id": null,
    "rawBuilderName": "Salarpuria Sattva",
    "restackProjectId": "RSTK-6312",
    "published_at": "2024-06-23T10:00:00Z",
    "status": "drafted",
    "created_at": "2024-01-01T10:00:00Z"
  },
  {
    "id": "P0016",
    "name": "Adarsh Group Valley",
    "codename": "Codename Delta",
    "description": "Premium lifestyle development offering world-class amenities.",
    "rera_id": null,
    "launch_status": "RERA",
    "cover_image_url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500&q=80",
    "notif_image": null,
    "zone": "East Bangalore",
    "micromarket": "Marathahalli",
    "corridor": [
      "Airport Road NH44"
    ],
    "latitude": 12.956462711252096,
    "longitude": 77.67670456215968,
    "kml_file_url": null,
    "pricing": "\u20b90.8 Cr - 1.2 Cr",
    "land_area_acres": 32,
    "total_units": 522,
    "floor": "G+38",
    "layouts": [
      "Plot",
      "1 BHK",
      "4 BHK",
      "2 BHK"
    ],
    "configurations": [
      "Apartment"
    ],
    "phase_details": [],
    "master_plan_url": "https://example.com/mp",
    "brochure_url": null,
    "images": [],
    "builder_id": "B0002",
    "rawBuilderName": "Adarsh Group",
    "restackProjectId": "RSTK-3285",
    "published_at": "2026-01-14T10:00:00Z",
    "status": "drafted",
    "created_at": "2024-01-01T10:00:00Z"
  },
  {
    "id": "P0017",
    "name": "Puravankara Meadows",
    "codename": "Codename Gamma",
    "description": "Premium lifestyle development offering world-class amenities.",
    "rera_id": null,
    "launch_status": "Prelaunch",
    "cover_image_url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500&q=80",
    "notif_image": null,
    "zone": "North Bangalore",
    "micromarket": "Hebbal",
    "corridor": [
      "Hosur Road"
    ],
    "latitude": 13.086293325448322,
    "longitude": 77.5101573419784,
    "kml_file_url": null,
    "pricing": "\u20b91.5 Cr - 2.1 Cr",
    "land_area_acres": 29,
    "total_units": 745,
    "floor": "G+33",
    "layouts": [
      "4 BHK"
    ],
    "configurations": [
      "Apartment"
    ],
    "phase_details": [],
    "master_plan_url": null,
    "brochure_url": null,
    "images": [],
    "builder_id": "B0001",
    "rawBuilderName": "Puravankara",
    "restackProjectId": "RSTK-2448",
    "published_at": "2024-04-22T10:00:00Z",
    "status": "live",
    "created_at": "2024-01-01T10:00:00Z"
  },
  {
    "id": "P0018",
    "name": "Shriram Properties Oasis",
    "codename": "Codename Alpha",
    "description": "Premium lifestyle development offering world-class amenities.",
    "rera_id": null,
    "launch_status": "Prelaunch",
    "cover_image_url": null,
    "notif_image": null,
    "zone": "East Bangalore",
    "micromarket": "Marathahalli",
    "corridor": [
      "Outer Ring Road"
    ],
    "latitude": 13.082268939222612,
    "longitude": 77.56821284111194,
    "kml_file_url": null,
    "pricing": "\u20b92.0 Cr - 3.2 Cr",
    "land_area_acres": 3,
    "total_units": 1068,
    "floor": "G+34",
    "layouts": [
      "4 BHK"
    ],
    "configurations": [
      "Apartment"
    ],
    "phase_details": [],
    "master_plan_url": "https://example.com/mp",
    "brochure_url": "https://example.com/brochure",
    "images": [],
    "builder_id": null,
    "rawBuilderName": "Shriram Properties",
    "restackProjectId": "RSTK-9807",
    "published_at": "2025-07-15T10:00:00Z",
    "status": "archive",
    "created_at": "2024-01-01T10:00:00Z"
  },
  {
    "id": "P0019",
    "name": "Shriram Properties Meadows",
    "codename": "Codename Apex",
    "description": "Premium lifestyle development offering world-class amenities.",
    "rera_id": null,
    "launch_status": "Prelaunch",
    "cover_image_url": null,
    "notif_image": null,
    "zone": "South Bangalore",
    "micromarket": "JP Nagar",
    "corridor": [
      "Outer Ring Road"
    ],
    "latitude": 13.079267856900302,
    "longitude": 77.51648247297581,
    "kml_file_url": null,
    "pricing": "\u20b90.9 Cr - 1.2 Cr",
    "land_area_acres": 26,
    "total_units": 1152,
    "floor": "G+10",
    "layouts": [
      "1 BHK"
    ],
    "configurations": [
      "Apartment"
    ],
    "phase_details": [],
    "master_plan_url": "https://example.com/mp",
    "brochure_url": "https://example.com/brochure",
    "images": [],
    "builder_id": "B0001",
    "rawBuilderName": "Shriram Properties",
    "restackProjectId": "RSTK-1036",
    "published_at": "2026-08-23T10:00:00Z",
    "status": "resale",
    "created_at": "2024-01-01T10:00:00Z"
  },
  {
    "id": "P0020",
    "name": "Brigade Group Park",
    "codename": "Codename Zenith",
    "description": "Premium lifestyle development offering world-class amenities.",
    "rera_id": null,
    "launch_status": "Prelaunch",
    "cover_image_url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500&q=80",
    "notif_image": null,
    "zone": "South Bangalore",
    "micromarket": "Bannerghatta Road",
    "corridor": [
      "Outer Ring Road"
    ],
    "latitude": 12.941710247194314,
    "longitude": 77.67870354950105,
    "kml_file_url": null,
    "pricing": "\u20b90.7 Cr - 1.1 Cr",
    "land_area_acres": 13,
    "total_units": 1986,
    "floor": "G+5",
    "layouts": [
      "Villa",
      "Plot",
      "1 BHK"
    ],
    "configurations": [
      "Apartment"
    ],
    "phase_details": [],
    "master_plan_url": null,
    "brochure_url": "https://example.com/brochure",
    "images": [],
    "builder_id": null,
    "rawBuilderName": "Brigade Group",
    "restackProjectId": "RSTK-8481",
    "published_at": "2026-08-20T10:00:00Z",
    "status": "resale",
    "created_at": "2024-01-01T10:00:00Z"
  },
  {
    "id": "P0021",
    "name": "Prestige Group Park",
    "codename": "Codename Alpha",
    "description": "Premium lifestyle development offering world-class amenities.",
    "rera_id": null,
    "launch_status": "Prelaunch",
    "cover_image_url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500&q=80",
    "notif_image": null,
    "zone": "South Bangalore",
    "micromarket": "Bannerghatta Road",
    "corridor": [
      "Hosur Road"
    ],
    "latitude": 13.062417276073376,
    "longitude": 77.6739310240816,
    "kml_file_url": null,
    "pricing": "\u20b91.9 Cr - 2.7 Cr",
    "land_area_acres": 10,
    "total_units": 1067,
    "floor": "G+32",
    "layouts": [
      "Villa",
      "1 BHK"
    ],
    "configurations": [
      "Apartment"
    ],
    "phase_details": [],
    "master_plan_url": null,
    "brochure_url": null,
    "images": [],
    "builder_id": null,
    "rawBuilderName": "Prestige Group",
    "restackProjectId": "RSTK-8312",
    "published_at": "2024-07-18T10:00:00Z",
    "status": "drafted",
    "created_at": "2024-01-01T10:00:00Z"
  },
  {
    "id": "P0022",
    "name": "Prestige Group Residences",
    "codename": "Codename Zenith",
    "description": "Premium lifestyle development offering world-class amenities.",
    "rera_id": "PRM/KA/RERA/1251/551/PR/89476",
    "launch_status": "Developer",
    "cover_image_url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500&q=80",
    "notif_image": null,
    "zone": "East Bangalore",
    "micromarket": "Varthur",
    "corridor": [
      "Airport Road NH44"
    ],
    "latitude": 13.091959399644374,
    "longitude": 77.57964658937847,
    "kml_file_url": null,
    "pricing": "\u20b91.5 Cr - 2.2 Cr",
    "land_area_acres": 46,
    "total_units": 906,
    "floor": "G+26",
    "layouts": [
      "Penthouse"
    ],
    "configurations": [
      "Apartment"
    ],
    "phase_details": [
      {
        "phase_name": "Phase 1",
        "rera_id": "PRM/KA/RERA/1251/551/PR/89476",
        "approval_date": "2022-06-14",
        "handover_date": "2027-12-01"
      }
    ],
    "master_plan_url": "https://example.com/mp",
    "brochure_url": "https://example.com/brochure",
    "images": [],
    "builder_id": null,
    "rawBuilderName": "Prestige Group",
    "restackProjectId": "RSTK-1350",
    "published_at": "2024-08-26T10:00:00Z",
    "status": "live",
    "created_at": "2024-01-01T10:00:00Z"
  },
  {
    "id": "P0023",
    "name": "Prestige Group Avenue",
    "codename": "Codename Delta",
    "description": "Premium lifestyle development offering world-class amenities.",
    "rera_id": "PRM/KA/RERA/1251/914/PR/88802",
    "launch_status": "RERA",
    "cover_image_url": null,
    "notif_image": null,
    "zone": "East Bangalore",
    "micromarket": "Varthur",
    "corridor": [
      "Tumkur Road"
    ],
    "latitude": 12.942159451109012,
    "longitude": 77.56638372317255,
    "kml_file_url": null,
    "pricing": "\u20b91.6 Cr - 2.6 Cr",
    "land_area_acres": 43,
    "total_units": 435,
    "floor": "G+36",
    "layouts": [
      "Villa"
    ],
    "configurations": [
      "Villa"
    ],
    "phase_details": [
      {
        "phase_name": "Phase 1",
        "rera_id": "PRM/KA/RERA/1251/914/PR/88802",
        "approval_date": "2024-05-22",
        "handover_date": "2025-12-01"
      }
    ],
    "master_plan_url": "https://example.com/mp",
    "brochure_url": null,
    "images": [],
    "builder_id": null,
    "rawBuilderName": "Prestige Group",
    "restackProjectId": "RSTK-5231",
    "published_at": "2024-04-23T10:00:00Z",
    "status": "live",
    "created_at": "2024-01-01T10:00:00Z"
  },
  {
    "id": "P0024",
    "name": "Sobha Limited Oasis",
    "codename": "Codename Nova",
    "description": "Premium lifestyle development offering world-class amenities.",
    "rera_id": null,
    "launch_status": "Prelaunch",
    "cover_image_url": null,
    "notif_image": null,
    "zone": "Central Bangalore",
    "micromarket": "MG Road",
    "corridor": [
      "Tumkur Road"
    ],
    "latitude": 12.981644425687367,
    "longitude": 77.53537347797747,
    "kml_file_url": null,
    "pricing": "\u20b91.8 Cr - 3.3 Cr",
    "land_area_acres": 19,
    "total_units": 244,
    "floor": "G+36",
    "layouts": [
      "4 BHK",
      "2 BHK",
      "Plot"
    ],
    "configurations": [
      "Apartment"
    ],
    "phase_details": [],
    "master_plan_url": null,
    "brochure_url": "https://example.com/brochure",
    "images": [],
    "builder_id": "B0001",
    "rawBuilderName": "Sobha Limited",
    "restackProjectId": "RSTK-3455",
    "published_at": "2025-05-26T10:00:00Z",
    "status": "resale",
    "created_at": "2024-01-01T10:00:00Z"
  },
  {
    "id": "P0025",
    "name": "Brigade Group Park",
    "codename": "Codename Nova",
    "description": "Premium lifestyle development offering world-class amenities.",
    "rera_id": null,
    "launch_status": "Developer",
    "cover_image_url": null,
    "notif_image": null,
    "zone": "West Bangalore",
    "micromarket": "Rajajinagar",
    "corridor": [
      "Airport Road NH44"
    ],
    "latitude": 13.096594746590757,
    "longitude": 77.5057533755736,
    "kml_file_url": null,
    "pricing": "\u20b90.5 Cr - 0.8 Cr",
    "land_area_acres": 27,
    "total_units": 634,
    "floor": "G+5",
    "layouts": [
      "Penthouse"
    ],
    "configurations": [
      "Apartment"
    ],
    "phase_details": [],
    "master_plan_url": null,
    "brochure_url": null,
    "images": [],
    "builder_id": "B0002",
    "rawBuilderName": "Brigade Group",
    "restackProjectId": "RSTK-1141",
    "published_at": "2025-02-11T10:00:00Z",
    "status": "resale",
    "created_at": "2024-01-01T10:00:00Z"
  },
  {
    "id": "P0026",
    "name": "Sobha Limited Greens",
    "codename": "Codename Alpha",
    "description": "Premium lifestyle development offering world-class amenities.",
    "rera_id": "PRM/KA/RERA/1251/801/PR/65141",
    "launch_status": "RERA",
    "cover_image_url": null,
    "notif_image": null,
    "zone": "West Bangalore",
    "micromarket": "Malleswaram",
    "corridor": [
      "Airport Road NH44"
    ],
    "latitude": 13.08815242893111,
    "longitude": 77.61651426309902,
    "kml_file_url": null,
    "pricing": "\u20b91.6 Cr - 2.3 Cr",
    "land_area_acres": 34,
    "total_units": 1439,
    "floor": "G+20",
    "layouts": [
      "Plot",
      "2 BHK"
    ],
    "configurations": [
      "Apartment"
    ],
    "phase_details": [
      {
        "phase_name": "Phase 1",
        "rera_id": "PRM/KA/RERA/1251/801/PR/65141",
        "approval_date": "2025-01-15",
        "handover_date": "2027-12-01"
      }
    ],
    "master_plan_url": null,
    "brochure_url": "https://example.com/brochure",
    "images": [],
    "builder_id": null,
    "rawBuilderName": "Sobha Limited",
    "restackProjectId": "RSTK-3727",
    "published_at": "2026-07-25T10:00:00Z",
    "status": "live",
    "created_at": "2024-01-01T10:00:00Z"
  },
  {
    "id": "P0027",
    "name": "Century Real Estate Avenue",
    "codename": "Codename Delta",
    "description": "Premium lifestyle development offering world-class amenities.",
    "rera_id": "PRM/KA/RERA/1251/571/PR/79783",
    "launch_status": "Developer",
    "cover_image_url": null,
    "notif_image": null,
    "zone": "Central Bangalore",
    "micromarket": "Lavelle Road",
    "corridor": [
      "Airport Road NH44"
    ],
    "latitude": 12.940974599228616,
    "longitude": 77.54147078290033,
    "kml_file_url": null,
    "pricing": "\u20b90.7 Cr - 1.1 Cr",
    "land_area_acres": 9,
    "total_units": 199,
    "floor": "G+14",
    "layouts": [
      "1 BHK",
      "Villa",
      "Plot"
    ],
    "configurations": [
      "Apartment"
    ],
    "phase_details": [
      {
        "phase_name": "Phase 1",
        "rera_id": "PRM/KA/RERA/1251/571/PR/79783",
        "approval_date": "2022-04-21",
        "handover_date": "2025-12-01"
      }
    ],
    "master_plan_url": "https://example.com/mp",
    "brochure_url": null,
    "images": [],
    "builder_id": null,
    "rawBuilderName": "Century Real Estate",
    "restackProjectId": "RSTK-6523",
    "published_at": "2024-06-24T10:00:00Z",
    "status": "archive",
    "created_at": "2024-01-01T10:00:00Z"
  },
  {
    "id": "P0028",
    "name": "Prestige Group Residences",
    "codename": "Codename Gamma",
    "description": "Premium lifestyle development offering world-class amenities.",
    "rera_id": null,
    "launch_status": "Prelaunch",
    "cover_image_url": null,
    "notif_image": null,
    "zone": "West Bangalore",
    "micromarket": "Yeshwanthpur",
    "corridor": [
      "Airport Road NH44"
    ],
    "latitude": 13.041535790499548,
    "longitude": 77.56014013105278,
    "kml_file_url": null,
    "pricing": "\u20b90.6 Cr - 1.0 Cr",
    "land_area_acres": 2,
    "total_units": 1905,
    "floor": "G+35",
    "layouts": [
      "Villa",
      "4 BHK",
      "2 BHK"
    ],
    "configurations": [
      "Apartment"
    ],
    "phase_details": [],
    "master_plan_url": null,
    "brochure_url": null,
    "images": [],
    "builder_id": "B0001",
    "rawBuilderName": "Prestige Group",
    "restackProjectId": "RSTK-6812",
    "published_at": "2025-05-23T10:00:00Z",
    "status": "live",
    "created_at": "2024-01-01T10:00:00Z"
  },
  {
    "id": "P0029",
    "name": "Century Real Estate Woods",
    "codename": "Codename Alpha",
    "description": "Premium lifestyle development offering world-class amenities.",
    "rera_id": null,
    "launch_status": "Prelaunch",
    "cover_image_url": null,
    "notif_image": null,
    "zone": "East Bangalore",
    "micromarket": "Bellandur",
    "corridor": [
      "Airport Road NH44"
    ],
    "latitude": 13.03377935518653,
    "longitude": 77.64752519944086,
    "kml_file_url": null,
    "pricing": "\u20b91.9 Cr - 3.2 Cr",
    "land_area_acres": 24,
    "total_units": 1540,
    "floor": "G+31",
    "layouts": [
      "1 BHK",
      "Penthouse",
      "Plot",
      "2 BHK"
    ],
    "configurations": [
      "Villa"
    ],
    "phase_details": [],
    "master_plan_url": "https://example.com/mp",
    "brochure_url": "https://example.com/brochure",
    "images": [],
    "builder_id": null,
    "rawBuilderName": "Century Real Estate",
    "restackProjectId": "RSTK-1896",
    "published_at": "2025-07-27T10:00:00Z",
    "status": "live",
    "created_at": "2024-01-01T10:00:00Z"
  },
  {
    "id": "P0030",
    "name": "Prestige Group Woods",
    "codename": "Codename Alpha",
    "description": "Premium lifestyle development offering world-class amenities.",
    "rera_id": "PRM/KA/RERA/1251/920/PR/57679",
    "launch_status": "Developer",
    "cover_image_url": null,
    "notif_image": null,
    "zone": "Central Bangalore",
    "micromarket": "MG Road",
    "corridor": [
      "Outer Ring Road"
    ],
    "latitude": 12.925147921526653,
    "longitude": 77.63433532624421,
    "kml_file_url": null,
    "pricing": "\u20b90.5 Cr - 0.8 Cr",
    "land_area_acres": 42,
    "total_units": 799,
    "floor": "G+17",
    "layouts": [
      "2 BHK",
      "Villa",
      "3 BHK"
    ],
    "configurations": [
      "Apartment"
    ],
    "phase_details": [
      {
        "phase_name": "Phase 1",
        "rera_id": "PRM/KA/RERA/1251/920/PR/57679",
        "approval_date": "2023-07-12",
        "handover_date": "2029-10-01"
      }
    ],
    "master_plan_url": "https://example.com/mp",
    "brochure_url": "https://example.com/brochure",
    "images": [],
    "builder_id": null,
    "rawBuilderName": "Prestige Group",
    "restackProjectId": "RSTK-7808",
    "published_at": "2025-07-16T10:00:00Z",
    "status": "archive",
    "created_at": "2024-01-01T10:00:00Z"
  },
  {
    "id": "P0031",
    "name": "Adarsh Group Park",
    "codename": "Codename Zenith",
    "description": "Premium lifestyle development offering world-class amenities.",
    "rera_id": null,
    "launch_status": "Prelaunch",
    "cover_image_url": null,
    "notif_image": null,
    "zone": "South Bangalore",
    "micromarket": "Bannerghatta Road",
    "corridor": [
      "Airport Road NH44"
    ],
    "latitude": 13.020932839284614,
    "longitude": 77.69944694933395,
    "kml_file_url": null,
    "pricing": "\u20b91.6 Cr - 3.1 Cr",
    "land_area_acres": 33,
    "total_units": 928,
    "floor": "G+36",
    "layouts": [
      "Plot",
      "3 BHK"
    ],
    "configurations": [
      "Villa"
    ],
    "phase_details": [],
    "master_plan_url": "https://example.com/mp",
    "brochure_url": "https://example.com/brochure",
    "images": [],
    "builder_id": null,
    "rawBuilderName": "Adarsh Group",
    "restackProjectId": "RSTK-4999",
    "published_at": "2025-05-13T10:00:00Z",
    "status": "drafted",
    "created_at": "2024-01-01T10:00:00Z"
  },
  {
    "id": "P0032",
    "name": "Sobha Limited Residences",
    "codename": "Codename Nova",
    "description": "Premium lifestyle development offering world-class amenities.",
    "rera_id": null,
    "launch_status": "RERA",
    "cover_image_url": null,
    "notif_image": null,
    "zone": "East Bangalore",
    "micromarket": "Varthur",
    "corridor": [
      "Bannerghatta Road Corridor"
    ],
    "latitude": 12.950412984497957,
    "longitude": 77.5585916864584,
    "kml_file_url": null,
    "pricing": "\u20b90.9 Cr - 1.2 Cr",
    "land_area_acres": 12,
    "total_units": 1744,
    "floor": "G+8",
    "layouts": [
      "Plot",
      "3 BHK",
      "Penthouse",
      "1 BHK"
    ],
    "configurations": [
      "Apartment"
    ],
    "phase_details": [],
    "master_plan_url": null,
    "brochure_url": null,
    "images": [],
    "builder_id": "B0001",
    "rawBuilderName": "Sobha Limited",
    "restackProjectId": "RSTK-6462",
    "published_at": "2026-07-22T10:00:00Z",
    "status": "drafted",
    "created_at": "2024-01-01T10:00:00Z"
  },
  {
    "id": "P0033",
    "name": "Prestige Group Enclave",
    "codename": "Codename Nova",
    "description": "Premium lifestyle development offering world-class amenities.",
    "rera_id": "PRM/KA/RERA/1251/310/PR/66018",
    "launch_status": "RERA",
    "cover_image_url": null,
    "notif_image": null,
    "zone": "Central Bangalore",
    "micromarket": "Lavelle Road",
    "corridor": [
      "Tumkur Road"
    ],
    "latitude": 12.94182610103515,
    "longitude": 77.53189165556874,
    "kml_file_url": null,
    "pricing": "\u20b91.5 Cr - 2.7 Cr",
    "land_area_acres": 29,
    "total_units": 205,
    "floor": "G+20",
    "layouts": [
      "4 BHK",
      "Villa",
      "1 BHK",
      "Penthouse"
    ],
    "configurations": [
      "Apartment"
    ],
    "phase_details": [
      {
        "phase_name": "Phase 1",
        "rera_id": "PRM/KA/RERA/1251/310/PR/66018",
        "approval_date": "2024-09-20",
        "handover_date": "2028-11-01"
      }
    ],
    "master_plan_url": "https://example.com/mp",
    "brochure_url": null,
    "images": [],
    "builder_id": null,
    "rawBuilderName": "Prestige Group",
    "restackProjectId": "RSTK-3625",
    "published_at": "2026-01-11T10:00:00Z",
    "status": "resale",
    "created_at": "2024-01-01T10:00:00Z"
  },
  {
    "id": "P0034",
    "name": "Prestige Group Enclave",
    "codename": "Codename Apex",
    "description": "Premium lifestyle development offering world-class amenities.",
    "rera_id": null,
    "launch_status": "Prelaunch",
    "cover_image_url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500&q=80",
    "notif_image": null,
    "zone": "North Bangalore",
    "micromarket": "Devanahalli",
    "corridor": [
      "Hosur Road"
    ],
    "latitude": 13.0551304309205,
    "longitude": 77.55402020921508,
    "kml_file_url": null,
    "pricing": "\u20b91.3 Cr - 1.9 Cr",
    "land_area_acres": 45,
    "total_units": 777,
    "floor": "G+36",
    "layouts": [
      "Penthouse",
      "Villa",
      "Plot",
      "2 BHK"
    ],
    "configurations": [
      "Apartment"
    ],
    "phase_details": [],
    "master_plan_url": null,
    "brochure_url": "https://example.com/brochure",
    "images": [],
    "builder_id": "B0001",
    "rawBuilderName": "Prestige Group",
    "restackProjectId": "RSTK-5877",
    "published_at": "2026-08-21T10:00:00Z",
    "status": "resale",
    "created_at": "2024-01-01T10:00:00Z"
  },
  {
    "id": "P0035",
    "name": "Sobha Limited Meadows",
    "codename": "Codename Delta",
    "description": "Premium lifestyle development offering world-class amenities.",
    "rera_id": "PRM/KA/RERA/1251/478/PR/80273",
    "launch_status": "Developer",
    "cover_image_url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500&q=80",
    "notif_image": null,
    "zone": "West Bangalore",
    "micromarket": "Yeshwanthpur",
    "corridor": [
      "Outer Ring Road"
    ],
    "latitude": 12.99010702375946,
    "longitude": 77.69621978338903,
    "kml_file_url": null,
    "pricing": "\u20b91.3 Cr - 1.8 Cr",
    "land_area_acres": 31,
    "total_units": 1433,
    "floor": "G+35",
    "layouts": [
      "Plot"
    ],
    "configurations": [
      "Apartment"
    ],
    "phase_details": [
      {
        "phase_name": "Phase 1",
        "rera_id": "PRM/KA/RERA/1251/478/PR/80273",
        "approval_date": "2024-02-11",
        "handover_date": "2026-10-01"
      }
    ],
    "master_plan_url": "https://example.com/mp",
    "brochure_url": "https://example.com/brochure",
    "images": [],
    "builder_id": "B0001",
    "rawBuilderName": "Sobha Limited",
    "restackProjectId": "RSTK-4502",
    "published_at": "2024-02-15T10:00:00Z",
    "status": "drafted",
    "created_at": "2024-01-01T10:00:00Z"
  },
  {
    "id": "P0036",
    "name": "Shriram Properties Valley",
    "codename": "Codename Alpha",
    "description": "Premium lifestyle development offering world-class amenities.",
    "rera_id": null,
    "launch_status": "Prelaunch",
    "cover_image_url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500&q=80",
    "notif_image": null,
    "zone": "South Bangalore",
    "micromarket": "Electronic City",
    "corridor": [
      "Bannerghatta Road Corridor"
    ],
    "latitude": 13.030863544411643,
    "longitude": 77.50352171405952,
    "kml_file_url": null,
    "pricing": "\u20b90.5 Cr - 0.7 Cr",
    "land_area_acres": 34,
    "total_units": 1790,
    "floor": "G+20",
    "layouts": [
      "3 BHK"
    ],
    "configurations": [
      "Apartment"
    ],
    "phase_details": [],
    "master_plan_url": "https://example.com/mp",
    "brochure_url": "https://example.com/brochure",
    "images": [],
    "builder_id": "B0002",
    "rawBuilderName": "Shriram Properties",
    "restackProjectId": "RSTK-7227",
    "published_at": "2025-04-25T10:00:00Z",
    "status": "live",
    "created_at": "2024-01-01T10:00:00Z"
  },
  {
    "id": "P0037",
    "name": "Puravankara Greens",
    "codename": "Codename Alpha",
    "description": "Premium lifestyle development offering world-class amenities.",
    "rera_id": "PRM/KA/RERA/1251/566/PR/80120",
    "launch_status": "RERA",
    "cover_image_url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500&q=80",
    "notif_image": null,
    "zone": "North Bangalore",
    "micromarket": "Thanisandra",
    "corridor": [
      "Hosur Road"
    ],
    "latitude": 13.06562996616084,
    "longitude": 77.66415853401591,
    "kml_file_url": null,
    "pricing": "\u20b90.7 Cr - 1.0 Cr",
    "land_area_acres": 24,
    "total_units": 339,
    "floor": "G+23",
    "layouts": [
      "4 BHK",
      "2 BHK",
      "Villa"
    ],
    "configurations": [
      "Apartment"
    ],
    "phase_details": [
      {
        "phase_name": "Phase 1",
        "rera_id": "PRM/KA/RERA/1251/566/PR/80120",
        "approval_date": "2022-01-13",
        "handover_date": "2026-12-01"
      }
    ],
    "master_plan_url": null,
    "brochure_url": null,
    "images": [],
    "builder_id": null,
    "rawBuilderName": "Puravankara",
    "restackProjectId": "RSTK-5900",
    "published_at": "2026-09-28T10:00:00Z",
    "status": "resale",
    "created_at": "2024-01-01T10:00:00Z"
  },
  {
    "id": "P0038",
    "name": "Shriram Properties Greens",
    "codename": "Codename Gamma",
    "description": "Premium lifestyle development offering world-class amenities.",
    "rera_id": "PRM/KA/RERA/1251/170/PR/23335",
    "launch_status": "RERA",
    "cover_image_url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500&q=80",
    "notif_image": null,
    "zone": "East Bangalore",
    "micromarket": "Sarjapur Road",
    "corridor": [
      "Airport Road NH44"
    ],
    "latitude": 12.965848400446038,
    "longitude": 77.62822056376064,
    "kml_file_url": null,
    "pricing": "\u20b91.0 Cr - 1.8 Cr",
    "land_area_acres": 31,
    "total_units": 255,
    "floor": "G+17",
    "layouts": [
      "Penthouse",
      "1 BHK",
      "2 BHK"
    ],
    "configurations": [
      "Apartment"
    ],
    "phase_details": [
      {
        "phase_name": "Phase 1",
        "rera_id": "PRM/KA/RERA/1251/170/PR/23335",
        "approval_date": "2023-01-28",
        "handover_date": "2027-10-01"
      }
    ],
    "master_plan_url": "https://example.com/mp",
    "brochure_url": "https://example.com/brochure",
    "images": [],
    "builder_id": "B0001",
    "rawBuilderName": "Shriram Properties",
    "restackProjectId": "RSTK-3494",
    "published_at": "2025-02-18T10:00:00Z",
    "status": "live",
    "created_at": "2024-01-01T10:00:00Z"
  },
  {
    "id": "P0039",
    "name": "Sobha Limited Greens",
    "codename": "Codename Apex",
    "description": "Premium lifestyle development offering world-class amenities.",
    "rera_id": "PRM/KA/RERA/1251/223/PR/68029",
    "launch_status": "Developer",
    "cover_image_url": null,
    "notif_image": null,
    "zone": "West Bangalore",
    "micromarket": "Malleswaram",
    "corridor": [
      "Bannerghatta Road Corridor"
    ],
    "latitude": 13.012674192250193,
    "longitude": 77.53496384338254,
    "kml_file_url": null,
    "pricing": "\u20b90.9 Cr - 1.3 Cr",
    "land_area_acres": 47,
    "total_units": 1200,
    "floor": "G+11",
    "layouts": [
      "3 BHK",
      "Villa",
      "Penthouse",
      "1 BHK"
    ],
    "configurations": [
      "Apartment"
    ],
    "phase_details": [
      {
        "phase_name": "Phase 1",
        "rera_id": "PRM/KA/RERA/1251/223/PR/68029",
        "approval_date": "2024-08-25",
        "handover_date": "2028-10-01"
      }
    ],
    "master_plan_url": "https://example.com/mp",
    "brochure_url": null,
    "images": [],
    "builder_id": "B0001",
    "rawBuilderName": "Sobha Limited",
    "restackProjectId": "RSTK-9177",
    "published_at": "2026-09-22T10:00:00Z",
    "status": "drafted",
    "created_at": "2024-01-01T10:00:00Z"
  },
  {
    "id": "P0040",
    "name": "Puravankara Meadows",
    "codename": "Codename Gamma",
    "description": "Premium lifestyle development offering world-class amenities.",
    "rera_id": "PRM/KA/RERA/1251/636/PR/74339",
    "launch_status": "RERA",
    "cover_image_url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500&q=80",
    "notif_image": null,
    "zone": "West Bangalore",
    "micromarket": "Peenya",
    "corridor": [
      "Hosur Road"
    ],
    "latitude": 13.08650263484609,
    "longitude": 77.55357422288537,
    "kml_file_url": null,
    "pricing": "\u20b90.6 Cr - 1.0 Cr",
    "land_area_acres": 40,
    "total_units": 724,
    "floor": "G+5",
    "layouts": [
      "1 BHK",
      "4 BHK",
      "Villa"
    ],
    "configurations": [
      "Apartment"
    ],
    "phase_details": [
      {
        "phase_name": "Phase 1",
        "rera_id": "PRM/KA/RERA/1251/636/PR/74339",
        "approval_date": "2022-08-18",
        "handover_date": "2028-11-01"
      }
    ],
    "master_plan_url": null,
    "brochure_url": "https://example.com/brochure",
    "images": [],
    "builder_id": null,
    "rawBuilderName": "Puravankara",
    "restackProjectId": "RSTK-8852",
    "published_at": "2025-09-12T10:00:00Z",
    "status": "archive",
    "created_at": "2024-01-01T10:00:00Z"
  },
  {
    "id": "P0041",
    "name": "Prestige Group Enclave",
    "codename": "Codename Apex",
    "description": "Premium lifestyle development offering world-class amenities.",
    "rera_id": "PRM/KA/RERA/1251/386/PR/85171",
    "launch_status": "RERA",
    "cover_image_url": null,
    "notif_image": null,
    "zone": "South Bangalore",
    "micromarket": "JP Nagar",
    "corridor": [
      "Hosur Road"
    ],
    "latitude": 13.095628456081872,
    "longitude": 77.6726526471555,
    "kml_file_url": null,
    "pricing": "\u20b91.5 Cr - 2.5 Cr",
    "land_area_acres": 21,
    "total_units": 675,
    "floor": "G+9",
    "layouts": [
      "4 BHK",
      "3 BHK",
      "2 BHK"
    ],
    "configurations": [
      "Apartment"
    ],
    "phase_details": [
      {
        "phase_name": "Phase 1",
        "rera_id": "PRM/KA/RERA/1251/386/PR/85171",
        "approval_date": "2024-08-24",
        "handover_date": "2028-10-01"
      }
    ],
    "master_plan_url": null,
    "brochure_url": null,
    "images": [],
    "builder_id": "B0002",
    "rawBuilderName": "Prestige Group",
    "restackProjectId": "RSTK-3465",
    "published_at": "2025-09-22T10:00:00Z",
    "status": "resale",
    "created_at": "2024-01-01T10:00:00Z"
  },
  {
    "id": "P0042",
    "name": "Adarsh Group Residences",
    "codename": "Codename Beta",
    "description": "Premium lifestyle development offering world-class amenities.",
    "rera_id": "PRM/KA/RERA/1251/468/PR/57995",
    "launch_status": "RERA",
    "cover_image_url": null,
    "notif_image": null,
    "zone": "East Bangalore",
    "micromarket": "Bellandur",
    "corridor": [
      "Tumkur Road"
    ],
    "latitude": 13.02343670010135,
    "longitude": 77.69041554257424,
    "kml_file_url": null,
    "pricing": "\u20b90.8 Cr - 1.2 Cr",
    "land_area_acres": 15,
    "total_units": 1374,
    "floor": "G+32",
    "layouts": [
      "2 BHK",
      "3 BHK"
    ],
    "configurations": [
      "Apartment"
    ],
    "phase_details": [
      {
        "phase_name": "Phase 1",
        "rera_id": "PRM/KA/RERA/1251/468/PR/57995",
        "approval_date": "2025-04-23",
        "handover_date": "2025-12-01"
      }
    ],
    "master_plan_url": null,
    "brochure_url": "https://example.com/brochure",
    "images": [],
    "builder_id": null,
    "rawBuilderName": "Adarsh Group",
    "restackProjectId": "RSTK-5007",
    "published_at": "2024-06-28T10:00:00Z",
    "status": "drafted",
    "created_at": "2024-01-01T10:00:00Z"
  },
  {
    "id": "P0043",
    "name": "Brigade Group Residences",
    "codename": "Codename Alpha",
    "description": "Premium lifestyle development offering world-class amenities.",
    "rera_id": "PRM/KA/RERA/1251/172/PR/81191",
    "launch_status": "RERA",
    "cover_image_url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500&q=80",
    "notif_image": null,
    "zone": "East Bangalore",
    "micromarket": "Sarjapur Road",
    "corridor": [
      "Airport Road NH44"
    ],
    "latitude": 12.913100358392779,
    "longitude": 77.58825139629586,
    "kml_file_url": null,
    "pricing": "\u20b91.5 Cr - 2.5 Cr",
    "land_area_acres": 50,
    "total_units": 1843,
    "floor": "G+39",
    "layouts": [
      "Penthouse",
      "Villa",
      "4 BHK",
      "Plot"
    ],
    "configurations": [
      "Apartment"
    ],
    "phase_details": [
      {
        "phase_name": "Phase 1",
        "rera_id": "PRM/KA/RERA/1251/172/PR/81191",
        "approval_date": "2022-02-21",
        "handover_date": "2028-10-01"
      }
    ],
    "master_plan_url": null,
    "brochure_url": "https://example.com/brochure",
    "images": [],
    "builder_id": null,
    "rawBuilderName": "Brigade Group",
    "restackProjectId": "RSTK-6031",
    "published_at": "2024-01-26T10:00:00Z",
    "status": "archive",
    "created_at": "2024-01-01T10:00:00Z"
  },
  {
    "id": "P0044",
    "name": "Century Real Estate Park",
    "codename": "Codename Zenith",
    "description": "Premium lifestyle development offering world-class amenities.",
    "rera_id": null,
    "launch_status": "Prelaunch",
    "cover_image_url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500&q=80",
    "notif_image": null,
    "zone": "East Bangalore",
    "micromarket": "Varthur",
    "corridor": [
      "Outer Ring Road"
    ],
    "latitude": 12.903735214876368,
    "longitude": 77.62583057965935,
    "kml_file_url": null,
    "pricing": "\u20b91.4 Cr - 1.9 Cr",
    "land_area_acres": 46,
    "total_units": 143,
    "floor": "G+17",
    "layouts": [
      "1 BHK",
      "Penthouse",
      "2 BHK",
      "3 BHK"
    ],
    "configurations": [
      "Villa"
    ],
    "phase_details": [],
    "master_plan_url": null,
    "brochure_url": null,
    "images": [],
    "builder_id": null,
    "rawBuilderName": "Century Real Estate",
    "restackProjectId": "RSTK-9737",
    "published_at": "2025-08-20T10:00:00Z",
    "status": "resale",
    "created_at": "2024-01-01T10:00:00Z"
  },
  {
    "id": "P0045",
    "name": "Century Real Estate Woods",
    "codename": "Codename Apex",
    "description": "Premium lifestyle development offering world-class amenities.",
    "rera_id": null,
    "launch_status": "Prelaunch",
    "cover_image_url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500&q=80",
    "notif_image": null,
    "zone": "South Bangalore",
    "micromarket": "HSR Layout",
    "corridor": [
      "Tumkur Road"
    ],
    "latitude": 12.900168617078442,
    "longitude": 77.61156099456963,
    "kml_file_url": null,
    "pricing": "\u20b91.5 Cr - 2.1 Cr",
    "land_area_acres": 23,
    "total_units": 281,
    "floor": "G+10",
    "layouts": [
      "Villa",
      "3 BHK"
    ],
    "configurations": [
      "Apartment"
    ],
    "phase_details": [],
    "master_plan_url": null,
    "brochure_url": null,
    "images": [],
    "builder_id": "B0002",
    "rawBuilderName": "Century Real Estate",
    "restackProjectId": "RSTK-7672",
    "published_at": "2024-02-21T10:00:00Z",
    "status": "live",
    "created_at": "2024-01-01T10:00:00Z"
  },
  {
    "id": "P0046",
    "name": "Puravankara Heights",
    "codename": "Codename Alpha",
    "description": "Premium lifestyle development offering world-class amenities.",
    "rera_id": "PRM/KA/RERA/1251/785/PR/17503",
    "launch_status": "RERA",
    "cover_image_url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500&q=80",
    "notif_image": null,
    "zone": "East Bangalore",
    "micromarket": "Bellandur",
    "corridor": [
      "Hosur Road"
    ],
    "latitude": 12.96376934090076,
    "longitude": 77.59748608919666,
    "kml_file_url": null,
    "pricing": "\u20b91.2 Cr - 1.8 Cr",
    "land_area_acres": 27,
    "total_units": 704,
    "floor": "G+23",
    "layouts": [
      "Villa",
      "3 BHK",
      "Penthouse",
      "4 BHK"
    ],
    "configurations": [
      "Apartment"
    ],
    "phase_details": [
      {
        "phase_name": "Phase 1",
        "rera_id": "PRM/KA/RERA/1251/785/PR/17503",
        "approval_date": "2024-05-14",
        "handover_date": "2027-11-01"
      }
    ],
    "master_plan_url": null,
    "brochure_url": "https://example.com/brochure",
    "images": [],
    "builder_id": "B0002",
    "rawBuilderName": "Puravankara",
    "restackProjectId": "RSTK-4280",
    "published_at": "2025-04-21T10:00:00Z",
    "status": "drafted",
    "created_at": "2024-01-01T10:00:00Z"
  },
  {
    "id": "P0047",
    "name": "Shriram Properties Greens",
    "codename": "Codename Zenith",
    "description": "Premium lifestyle development offering world-class amenities.",
    "rera_id": "PRM/KA/RERA/1251/693/PR/94956",
    "launch_status": "Developer",
    "cover_image_url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500&q=80",
    "notif_image": null,
    "zone": "South Bangalore",
    "micromarket": "HSR Layout",
    "corridor": [
      "Bannerghatta Road Corridor"
    ],
    "latitude": 12.963552256323329,
    "longitude": 77.5060339760135,
    "kml_file_url": null,
    "pricing": "\u20b91.9 Cr - 3.2 Cr",
    "land_area_acres": 35,
    "total_units": 1759,
    "floor": "G+37",
    "layouts": [
      "3 BHK",
      "2 BHK",
      "Plot"
    ],
    "configurations": [
      "Apartment"
    ],
    "phase_details": [
      {
        "phase_name": "Phase 1",
        "rera_id": "PRM/KA/RERA/1251/693/PR/94956",
        "approval_date": "2024-07-21",
        "handover_date": "2025-12-01"
      }
    ],
    "master_plan_url": "https://example.com/mp",
    "brochure_url": null,
    "images": [],
    "builder_id": null,
    "rawBuilderName": "Shriram Properties",
    "restackProjectId": "RSTK-8924",
    "published_at": "2026-07-15T10:00:00Z",
    "status": "drafted",
    "created_at": "2024-01-01T10:00:00Z"
  },
  {
    "id": "P0048",
    "name": "Century Real Estate Park",
    "codename": "Codename Delta",
    "description": "Premium lifestyle development offering world-class amenities.",
    "rera_id": "PRM/KA/RERA/1251/779/PR/80143",
    "launch_status": "RERA",
    "cover_image_url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500&q=80",
    "notif_image": null,
    "zone": "South Bangalore",
    "micromarket": "Electronic City",
    "corridor": [
      "Tumkur Road"
    ],
    "latitude": 12.944428652406883,
    "longitude": 77.6742180755737,
    "kml_file_url": null,
    "pricing": "\u20b91.9 Cr - 2.9 Cr",
    "land_area_acres": 20,
    "total_units": 341,
    "floor": "G+26",
    "layouts": [
      "3 BHK",
      "Penthouse",
      "2 BHK"
    ],
    "configurations": [
      "Apartment"
    ],
    "phase_details": [
      {
        "phase_name": "Phase 1",
        "rera_id": "PRM/KA/RERA/1251/779/PR/80143",
        "approval_date": "2022-06-11",
        "handover_date": "2029-10-01"
      }
    ],
    "master_plan_url": "https://example.com/mp",
    "brochure_url": "https://example.com/brochure",
    "images": [],
    "builder_id": "B0001",
    "rawBuilderName": "Century Real Estate",
    "restackProjectId": "RSTK-4561",
    "published_at": "2025-06-11T10:00:00Z",
    "status": "archive",
    "created_at": "2024-01-01T10:00:00Z"
  },
  {
    "id": "P0049",
    "name": "Adarsh Group Valley",
    "codename": "Codename Prime",
    "description": "Premium lifestyle development offering world-class amenities.",
    "rera_id": "PRM/KA/RERA/1251/723/PR/34668",
    "launch_status": "Developer",
    "cover_image_url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500&q=80",
    "notif_image": null,
    "zone": "East Bangalore",
    "micromarket": "Sarjapur Road",
    "corridor": [
      "Airport Road NH44"
    ],
    "latitude": 13.042585237551839,
    "longitude": 77.52717913778939,
    "kml_file_url": null,
    "pricing": "\u20b91.8 Cr - 2.7 Cr",
    "land_area_acres": 2,
    "total_units": 1747,
    "floor": "G+30",
    "layouts": [
      "2 BHK",
      "Plot",
      "Villa",
      "3 BHK"
    ],
    "configurations": [
      "Apartment"
    ],
    "phase_details": [
      {
        "phase_name": "Phase 1",
        "rera_id": "PRM/KA/RERA/1251/723/PR/34668",
        "approval_date": "2022-09-10",
        "handover_date": "2029-10-01"
      }
    ],
    "master_plan_url": null,
    "brochure_url": "https://example.com/brochure",
    "images": [],
    "builder_id": null,
    "rawBuilderName": "Adarsh Group",
    "restackProjectId": "RSTK-7847",
    "published_at": "2025-08-18T10:00:00Z",
    "status": "live",
    "created_at": "2024-01-01T10:00:00Z"
  },
  {
    "id": "P0050",
    "name": "Salarpuria Sattva Avenue",
    "codename": "Codename Delta",
    "description": "Premium lifestyle development offering world-class amenities.",
    "rera_id": "PRM/KA/RERA/1251/187/PR/92624",
    "launch_status": "Developer",
    "cover_image_url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500&q=80",
    "notif_image": null,
    "zone": "West Bangalore",
    "micromarket": "Rajajinagar",
    "corridor": [
      "Hosur Road"
    ],
    "latitude": 12.992392483624696,
    "longitude": 77.51727609170871,
    "kml_file_url": null,
    "pricing": "\u20b91.3 Cr - 2.2 Cr",
    "land_area_acres": 13,
    "total_units": 1544,
    "floor": "G+36",
    "layouts": [
      "Penthouse",
      "1 BHK"
    ],
    "configurations": [
      "Apartment"
    ],
    "phase_details": [
      {
        "phase_name": "Phase 1",
        "rera_id": "PRM/KA/RERA/1251/187/PR/92624",
        "approval_date": "2023-05-12",
        "handover_date": "2029-10-01"
      }
    ],
    "master_plan_url": "https://example.com/mp",
    "brochure_url": "https://example.com/brochure",
    "images": [],
    "builder_id": "B0001",
    "rawBuilderName": "Salarpuria Sattva",
    "restackProjectId": "RSTK-6660",
    "published_at": "2024-01-26T10:00:00Z",
    "status": "resale",
    "created_at": "2024-01-01T10:00:00Z"
  }

];

/** @type {HomeFeed} */
let homeFeed = {
  feed: ['A0001', 'C0001', 'A0003', 'C0002', 'V0002', 'C0003', 'A0006', 'V0004'],
  page_order: PAGE_ORDER_SECTIONS.map(name => ({ name, hidden: false })),
  project_page_order: PROJECT_PAGE_ORDER_SECTIONS.map(name => ({ name, hidden: false })),
};

function suggestId(list, type) {
  const prefix = type === 'article' ? 'A' : type === 'carousel' ? 'C' : 'V';
  const nums = list
    .filter(p => p.type === type)
    .map(p => parseInt(p.id.slice(1), 10))
    .filter(n => !isNaN(n));
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  return `${prefix}${String(next).padStart(4, '0')}`;
}

// ---- Posts ----
export function getPosts({ type } = {}) {
  const list = type && type !== 'all' ? posts.filter(p => p.type === type) : posts;
  return [...list].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export function getPost(id) {
  return posts.find(p => p.id === id);
}

export function createPost(data) {
  const type = data.type ?? 'article';
  const post = { ...blankPost(type), ...data, id: suggestId(posts, type), created_at: new Date().toISOString() };
  posts = [post, ...posts];
  return post;
}

export function updatePost(id, patch) {
  posts = posts.map(p => (p.id === id ? { ...p, ...patch } : p));
  return getPost(id);
}

export function deletePost(id) {
  posts = posts.filter(p => p.id !== id);
  homeFeed = { ...homeFeed, feed: homeFeed.feed.filter(x => x !== id) };
}

// ---- Builders ----
// category is an internal tiering (A = top-tier, D = smallest) — used to filter/prioritize
// which developers' projects surface first, independent of the project's own launch stage.
export const BUILDER_CATEGORIES = ['A', 'B', 'C', 'D'];

export function blankBuilder() {
  return {
    builderName: '',
    builderLogo: null,
    category: 'C',
    contacts: [],
  };
}

let builders = [
  { id: 'B0001', builderName: 'Prestige Group', builderLogo: null, category: 'A', contacts: [{ name: 'Ramesh Kumar', designation: 'Sales Head', mobile: '9800000001' }] },
  { id: 'B0002', builderName: 'Sobha Limited', builderLogo: null, category: 'A', contacts: [{ name: 'Anitha Rao', designation: 'CRM Manager', mobile: '9800000002' }] },
  { id: 'B0003', builderName: 'Brigade Group', builderLogo: null, category: 'B', contacts: [{ name: 'Kiran Shetty', designation: 'Sales Head', mobile: '9800000003' }] },
  { id: 'B0004', builderName: 'Puravankara', builderLogo: null, category: 'B', contacts: [{ name: 'Meera Nair', designation: 'CRM Manager', mobile: '9800000004' }] },
  { id: 'B0005', builderName: 'Adarsh Group', builderLogo: null, category: 'C', contacts: [{ name: 'Vikram Rao', designation: 'Sales Manager', mobile: '9800000005' }] },
  { id: 'B0006', builderName: 'Century Real Estate', builderLogo: null, category: 'C', contacts: [{ name: 'Divya Suresh', designation: 'Sales Manager', mobile: '9800000006' }] },
  { id: 'B0007', builderName: 'Shriram Properties', builderLogo: null, category: 'D', contacts: [{ name: 'Arjun Kumar', designation: 'Sales Executive', mobile: '9800000007' }] },
  { id: 'B0008', builderName: 'Salarpuria Sattva', builderLogo: null, category: 'D', contacts: [{ name: 'Pooja Iyer', designation: 'Sales Executive', mobile: '9800000008' }] },
];

export function getBuilders() { return [...builders]; }
export function getBuilder(id) { return builders.find(b => b.id === id); }
export function createBuilder(data) {
  const nums = builders.map(b => parseInt(b.id.slice(1), 10)).filter(n => !isNaN(n));
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  const id = `B${String(next).padStart(4, '0')}`;
  const builder = { ...blankBuilder(), ...data, id };
  builders = [builder, ...builders];
  return builder;
}
export function updateBuilder(id, patch) {
  builders = builders.map(b => (b.id === id ? { ...b, ...patch } : b));
  return getBuilder(id);
}
export function deleteBuilder(id) {
  builders = builders.filter(b => b.id !== id);
}


// ---- Projects ----
export function getProjects() {
  return [...projects].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export function getProject(id) {
  return projects.find(p => p.id === id);
}

export function createProject(data) {
  const nums = projects.map(p => parseInt(p.id.slice(1), 10)).filter(n => !isNaN(n));
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  const id = `P${String(next).padStart(4, '0')}`;
  const project = { ...blankProject(), ...data, id, created_at: new Date().toISOString() };
  projects = [project, ...projects];
  return project;
}

export function updateProject(id, patch) {
  projects = projects.map(p => (p.id === id ? { ...p, ...patch } : p));
  return getProject(id);
}

export function deleteProject(id) {
  projects = projects.filter(p => p.id !== id);
}

// ---- Home feed ----
export function getHomeFeed() {
  return homeFeed;
}

export function updateHomeFeed(patch) {
  homeFeed = { ...homeFeed, ...patch };
  return homeFeed;
}
