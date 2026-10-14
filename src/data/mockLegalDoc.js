// Fake in-memory "backend" for the Legal & Doc pipeline feature.
//
// Final schema (agreed on directly, supersedes the earlier docs/legal-doc-prd.md draft):
//   agent.legalAndLoan
//   ├─ status        'good' | 'maybe' | 'bad'
//   ├─ notes         [{ text, status: ''|good|maybe|bad, time, user }]
//   └─ legalRequests [{
//        id, source, createdAt,
//        status: [{ status: 'lead'|'qualify'|'service'|'lost', time, user }],
//        clients: [{
//          pocType: client|agent, name?, phone?, invoiceId: string|null,
//          connections (only if client): [{ id, timestamp, kamId, kamName, medium, direction,
//            status: CONNECTION_STATUS_OPTIONS, notes, callbackAt }],
//          services: [{ id, name: SERVICE_NAME_OPTIONS, documentsReceived, advanceReceived,
//            vaultServiceId: string|null, lost }]
//        }]
//      }]
// `status` is now a log, not a flat value — the request's current stage is its last entry
// (see `currentStatus`/`effectiveStage` below). A handful of fields the already-built UI depends
// on (leadBy/qualifiedBy/salesPoc, per-connection position/topics, per-service qty/chargeableAmount/
// documents checklist, RNR as a distinct connect outcome) aren't in this shape but are kept
// alongside it rather than deleted, since nothing asked for those features to go away.

export const AGENT_STATUS_OPTIONS = [
  { value: 'good', label: 'Good' },
  { value: 'maybe', label: 'Maybe' },
  { value: 'bad', label: 'Bad' },
];

export const SOURCE_OPTIONS = [
  { value: 'app', label: 'App' },
  { value: 'marketing', label: 'Marketing' },
];

// The request's lifecycle is now just these 4 broad stages (collapsed from the old granular
// new/rnr1-5/qualified/negotiation/.../service_delivered ladder).
export const REQUEST_STATUS_OPTIONS = [
  { value: 'lead', label: 'Lead' },
  { value: 'qualify', label: 'Qualify' },
  { value: 'service', label: 'Service' },
  { value: 'lost', label: 'Lost' },
];

// Shared across the Leads/Qualify/Service pages so the same status always reads the same color.
export const STATUS_STYLES = {
  lead: 'bg-blue-100 text-blue-700',
  qualify: 'bg-violet-100 text-violet-700',
  service: 'bg-emerald-100 text-emerald-700',
  lost: 'bg-red-100 text-red-700',
};

// The valid next stop(s) from each status — what the Qualify/Service pages offer as quick
// actions instead of a free-for-all dropdown. `lost` can reopen back to `lead`; `service` only
// moves on to `lost` (there's nothing past service fulfillment in this model).
export const NEXT_STATUS_MAP = {
  lead: ['qualify', 'lost'],
  qualify: ['service', 'lost'],
  service: ['lost'],
  lost: ['lead'],
};

// request.status groups, for pages that split by funnel stage (the Leads/Qualify/Service list
// pages). Each stage is now just its own single status value.
export const LEAD_STAGE_STATUSES = ['lead'];
export const QUALIFY_STAGE_STATUSES = ['qualify'];
export const SERVICE_STAGE_STATUSES = ['service'];

// The request's current status is the last entry in its `status` log.
export function currentStatus(request) {
  const log = request?.status;
  if (!Array.isArray(log) || log.length === 0) return 'lead';
  return log[log.length - 1].status;
}

// Status is now already the stage (lead/qualify/service) except for 'lost', which needs
// effectiveStage below to say which stage it was lost FROM.
export function stageForRequestStatus(status) {
  return status === 'lost' ? 'lead' : status;
}

// Stage and status are two different things: status is the current log entry (lead, qualify,
// service, lost), stage is just which of the three list pages (lead/qualify/service) a request
// belongs on. A request can go lost from any of the three stages, not only from lead — so this
// walks the status log backwards from the end to find the last non-'lost' entry, which is where
// it was lost from. The Leads/Qualify/Service pages filter by this, not currentStatus directly.
export function effectiveStage(request) {
  const cur = currentStatus(request);
  if (cur !== 'lost') return cur;
  const log = request?.status || [];
  for (let i = log.length - 2; i >= 0; i--) {
    if (log[i].status !== 'lost') return log[i].status;
  }
  return 'lead';
}

// Call log outcomes, logged per-client (not per-request) now.
export const CONNECTION_STATUS_OPTIONS = [
  { value: 'connected', label: 'Connected' },
  { value: 'rnr', label: 'RNR' },
  { value: 'not_reachable', label: 'Not reachable' },
  { value: 'switched_off', label: 'Switched off' },
  { value: 'call_back', label: 'Call back' },
];

export const POSITION_OPTIONS = [
  { value: 'lead', label: 'Lead' },
  { value: 'qualify', label: 'Qualify' },
  { value: 'service', label: 'Service' },
];

export const POC_TYPE_OPTIONS = [
  { value: 'client', label: 'Client' },
  { value: 'agent', label: 'Agent (self)' },
];

export const SERVICE_STATUS_OPTIONS = [
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'documents_collected', label: 'Documents Collected' },
  { value: 'invoice_sent', label: 'Invoice Sent' },
  { value: 'payment_received', label: 'Payment Received' },
  { value: 'service_forwarded', label: 'Service Forwarded' },
  { value: 'service_delivered', label: 'Service Delivered' },
  { value: 'lost', label: 'Lost' },
];

// Alphabetical by label (not grouped) — this is the order the Leads panel's service picker shows.
// `graha_jyoti` (Gruha Jyothi) was removed: not a service actually offered.
export const SERVICE_NAME_OPTIONS = [
  { group: 'Legal', value: 'assignment_agreement', label: 'Assignment Agreement' },
  { group: 'Documentation', value: 'b_to_a_khata', label: 'B to A Khata' },
  { group: 'Loans', value: 'balance_transfer', label: 'Balance Transfer' },
  { group: 'Legal', value: 'bda', label: 'BDA Khata' },
  { group: 'Utilities', value: 'bescom', label: 'BESCOM Name Change' },
  { group: 'Documentation', value: 'certified_copy', label: 'Certified Copy' },
  { group: 'Legal', value: 'due_diligence', label: 'Due Diligence' },
  { group: 'Documentation', value: 'e_to_e_khata', label: 'E to E Khata' },
  { group: 'Documentation', value: 'e_khata', label: 'E-Khata (BBMP)' },
  { group: 'Legal', value: 'ec', label: 'EC' },
  { group: 'Legal', value: 'family_tree', label: 'Family Tree' },
  { group: 'Legal', value: 'gift_deed', label: 'Gift Deed' },
  { group: 'Legal', value: 'gpa', label: 'GPA' },
  { group: 'Loans', value: 'home_loan', label: 'Home Loan' },
  { group: 'Documentation', value: 'khata_correction', label: 'Khata Correction' },
  { group: 'Documentation', value: 'khata_transfer', label: 'Khata Transfer' },
  { group: 'Legal', value: 'legal_consultation', label: 'Legal Consultation' },
  { group: 'Loans', value: 'loan_against_property', label: 'Loan Against Property' },
  { group: 'Legal', value: 'modt_cancellation', label: 'MODT Cancellation' },
  { group: 'Legal', value: 'mou', label: 'MoU' },
  { group: 'Documentation', value: 'new_khata', label: 'New Khata' },
  { group: 'Other', value: 'other', label: 'Other' },
  { group: 'Documentation', value: 'panchayat_khata', label: 'Panchayat Khata' },
  { group: 'Legal', value: 'partition_deed', label: 'Partition Deed' },
  { group: 'Legal', value: 'registration', label: 'Registration' },
  { group: 'Legal', value: 'release_deed', label: 'Release Deed' },
  { group: 'Documentation', value: 'rental_agreement', label: 'Rental Agreement' },
  { group: 'Legal', value: 'sale_agreement', label: 'Sale Agreement' },
  { group: 'Legal', value: 'sale_deed', label: 'Sale Deed' },
  { group: 'Documentation', value: 'tax_name_change', label: 'Tax Name Change' },
  { group: 'Legal', value: 'will_deed', label: 'Will Deed' },
];

// Current price list — docs/legal-doc-prd.md §5. Not yet linked to SERVICE_NAME_OPTIONS by id;
// matched by display name until a shared service-id scheme is settled on.
export const CATALOGUE = [
  { service: 'E-Khata (BBMP)', category: 'Documentation', agentPrice: 4500, clientPrice: 6000, referral: 1271 },
  { service: 'New Khata', category: 'Documentation', agentPrice: 15000, clientPrice: 20000, referral: 4237 },
  { service: 'Khata Transfer', category: 'Documentation', agentPrice: 12000, clientPrice: 16000, referral: 3390 },
  { service: 'BESCOM name change', category: 'Documentation', agentPrice: 5000, clientPrice: 7500, referral: 1589 },
  { service: 'Rental agreement', category: 'Documentation', agentPrice: 1000, clientPrice: 1500, referral: null },
  { service: 'Sale deed / release deed draft', category: 'Documentation', agentPrice: 7500, clientPrice: 10000, referral: 2119 },
  { service: 'Sale agreement draft', category: 'Documentation', agentPrice: 5000, clientPrice: 7000, referral: 1483 },
  { service: 'Gift deed draft', category: 'Documentation', agentPrice: 5000, clientPrice: 7000, referral: 1483 },
  { service: 'MODT cancellation', category: 'Legal', agentPrice: 8000, clientPrice: 10500, referral: 2225 },
  { service: 'Due diligence / legal opinion', category: 'Legal', agentPrice: 10500, clientPrice: 13500, referral: 2860 },
  { service: 'Tax name change', category: 'Legal', agentPrice: 1000, clientPrice: 1500, referral: 318 },
  { service: 'EC', category: 'Legal', agentPrice: 1500, clientPrice: 2000, referral: 424 },
  { service: 'Family tree', category: 'Legal', agentPrice: 25000, clientPrice: 30000, referral: 6356 },
  { service: 'MoU', category: 'Legal', agentPrice: 2000, clientPrice: 3000, referral: 636 },
  { service: 'Registration', category: 'Legal', agentPrice: 25000, clientPrice: 33500, referral: 7097 },
  { service: 'Registration package', category: 'Legal', agentPrice: 40000, clientPrice: 53500, referral: 10000 },
  { service: 'Gram Panchayat khata', category: 'Legal', agentPrice: 25000, clientPrice: 30000, referral: 6356 },
  { service: 'Khata correction', category: 'Legal', agentPrice: 3000, clientPrice: 4000, referral: 847 },
  { service: 'Assignment agreement', category: 'Legal', agentPrice: 10000, clientPrice: 13500, referral: 2860 },
  { service: 'Will deed draft', category: 'Legal', agentPrice: 5000, clientPrice: 7000, referral: 1483 },
  { service: 'GPA draft', category: 'Legal', agentPrice: 5000, clientPrice: 7000, referral: 1483 },
  { service: 'GPA registration', category: 'Legal', agentPrice: 30000, clientPrice: null, referral: 0 },
  { service: 'BDA khata', category: 'Legal', agentPrice: 25000, clientPrice: 30000, referral: 6356 },
  { service: 'Certified copy', category: 'Legal', agentPrice: 2500, clientPrice: null, referral: 0 },
  { service: 'DNV', category: 'Legal', agentPrice: 8000, clientPrice: 9000, referral: 1907 },
  { service: 'Doc review (sale agreement)', category: 'Legal', agentPrice: 1500, clientPrice: null, referral: 0 },
  { service: 'Sale agreement registration', category: 'Legal', agentPrice: null, clientPrice: 25000, referral: 5297 },
];

// Real KAM roster — matches src/data/mockHome.js's kamList (minus the synthetic "All KAMs" row).
// Used both as the agent-level `kam` and as the userId values for leadBy/qualifiedBy/salesPoc/user.
export const KAM_OPTIONS = [
  { value: 'Samarth', label: 'Samarth' },
  { value: 'Sandeep', label: 'Sandeep' },
  { value: 'Rasranjan', label: 'Rasranjan' },
  { value: 'Siddharth', label: 'Siddharth' },
  { value: 'Surendra', label: 'Surendra' },
  { value: 'Qalandar', label: 'Qalandar' },
];

const DAY = 86400000;
const now = () => Date.now();

// Spreads a sequence of values evenly across the time between `daysAgo` and now, oldest first.
function spreadOverTime(steps, daysAgo, mapEntry) {
  if (steps.length === 0) return [];
  const span = Math.max(daysAgo, steps.length - 1);
  return steps.map((step, i) => {
    const t = steps.length === 1 ? 0 : Math.round((span * (steps.length - 1 - i)) / (steps.length - 1));
    return mapEntry(step, now() - DAY * t);
  });
}

const AGENT_NOTE_TEXT = {
  maybe: (source, service) => `Lead came in via ${source}, wants ${service.replace(/_/g, ' ')}`,
  good: () => 'Progressing well',
  bad: () => 'Marked bad — lost or unresponsive',
};

// The granular old-style statuses the seed generator below still authors internally (it's easier
// to describe a realistic lead path this way) before `toSavedShape` coarsens everything down to
// the saved lead/qualify/service/lost model.
const OLD_LEAD_STATUSES = ['new', 'rnr1', 'rnr2', 'rnr3', 'rnr4', 'rnr5'];
const OLD_SERVICE_STATUSES = ['negotiation', 'documents_collected', 'invoice_sent', 'payment_received', 'service_forwarded', 'service_delivered'];

function stageForOldStatus(status) {
  if (status === 'qualified') return 'qualify';
  if (OLD_SERVICE_STATUSES.includes(status)) return 'service';
  if (status === 'lost') return 'lost';
  return 'lead';
}

// A client's call-log history leading up to the request's current status — RNR depth comes from
// how far into the rnr1-5 ladder the request got, capped at 2 visible attempts; a status that
// implies an actual conversation happened (qualified onward) always ends on "connected".
function buildClientConnections({ requestStatus, lastCallStatus, lastCallNotes, daysAgo, kam }) {
  const normalizedLast = { rnr_1: 'rnr', rnr_2: 'rnr', wrong_number: 'not_reachable' }[lastCallStatus] || lastCallStatus;
  const rnrDepth = Math.min({ rnr1: 1, rnr2: 1, rnr3: 2, rnr4: 2, rnr5: 2 }[requestStatus] || 0, 2);
  const impliesConnected =
    !OLD_LEAD_STATUSES.includes(requestStatus) || normalizedLast === 'connected';

  const steps = [];
  for (let i = 0; i < rnrDepth; i++) steps.push('rnr');
  if (impliesConnected) steps.push('connected');
  else if (normalizedLast) steps.push(normalizedLast);
  if (steps.length === 0) return [];

  const entries = spreadOverTime(steps, daysAgo, (step, time) => ({
    status: step,
    position: 'lead',
    notes: '',
    time,
    user: kam,
  }));
  entries[entries.length - 1].notes = lastCallNotes || '';
  return entries;
}

function buildAgentNotes({ agentStatus, source, service, statusNote, daysAgo, kam }) {
  const path = agentStatus === 'good' ? ['maybe', 'good'] : agentStatus === 'bad' ? ['maybe', 'bad'] : ['maybe'];
  const entries = spreadOverTime(path, daysAgo, (step, time) => ({
    text: AGENT_NOTE_TEXT[step](source, service),
    status: step,
    time,
    user: kam,
  }));
  if (statusNote) entries[entries.length - 1].text = statusNote;
  return entries;
}

// Compact generator — one client (pocType "agent", i.e. no end-client identified yet) holding the
// one service the lead came in for. Keeps the Leads page populated with a realistic spread without
// hand-writing every field for each agent.
// The request's own status history leading up to its final `status` — not in the schema as given
// (request.status is a flat value there), added because the panel needs something to show as a
// timeline beyond just "here's the current value".
function requestStatusPath(finalStatus) {
  if (finalStatus === 'new') return ['new'];
  const rnrMatch = /^rnr([1-5])$/.exec(finalStatus);
  if (rnrMatch) {
    const n = Number(rnrMatch[1]);
    return ['new', ...Array.from({ length: n }, (_, i) => `rnr${i + 1}`)];
  }
  return ['new', finalStatus];
}

function makeLeadAgent({ agentId, agentName, contact, kam, source, status, service, daysAgo, lastCallStatus, lastCallNotes = '', statusNote, agentStatus }) {
  const overallStatus = agentStatus || (status === 'lost' ? 'bad' : 'maybe');
  const connections = buildClientConnections({ requestStatus: status, lastCallStatus, lastCallNotes, daysAgo, kam });
  const statusLog = spreadOverTime(requestStatusPath(status), daysAgo, (step, time) => ({
    status: step,
    notes: '',
    time,
    user: kam,
  }));
  if (statusLog.length) statusLog[statusLog.length - 1].notes = lastCallNotes || '';

  return {
    agentId,
    agentName,
    contact,
    kam,
    legalAndLoan: {
      status: overallStatus,
      notes: buildAgentNotes({ agentStatus: overallStatus, source, service, statusNote, daysAgo, kam }),
      requests: [
        {
          id: 'R1',
          source,
          status,
          statusLog,
          leadBy: kam,
          qualifiedBy: stageForOldStatus(status) === 'qualify' || stageForOldStatus(status) === 'service' ? kam : null,
          salesPoc: null,
          createdAt: now() - DAY * daysAgo,
          clients: [
            {
              pocType: 'agent',
              connections,
              invoice: { piId: '', total: 0 },
              paymentReceived: false,
              services: [{ name: service, chargeableAmount: null, documents: [], status: 'negotiation' }],
            },
          ],
        },
      ],
    },
  };
}

const EXTRA_LEAD_SEED = [
  { agentId: 'CPC410', agentName: 'Nikhil Bansal', contact: '+919845011410', kam: 'Samarth', source: 'app', status: 'new', service: 'e_khata', daysAgo: 1, agentStatus: 'maybe' },
  { agentId: 'CPC417', agentName: 'Shreya Pillai', contact: '+919845011417', kam: 'Sandeep', source: 'app', status: 'qualified', service: 'registration', daysAgo: 3, lastCallStatus: 'connected', lastCallNotes: 'Very keen, wants a quote', agentStatus: 'good' },
  { agentId: 'CPC423', agentName: 'Manoj Tiwari', contact: '+919845011423', kam: 'Rasranjan', source: 'marketing', status: 'rnr1', service: 'home_loan', daysAgo: 2, lastCallStatus: 'rnr_1', agentStatus: 'good' },
  { agentId: 'CPC430', agentName: 'Pooja Agarwal', contact: '+919845011430', kam: 'Siddharth', source: 'app', status: 'new', service: 'khata_transfer', daysAgo: 4, lastCallStatus: 'connected', lastCallNotes: 'Will share documents by Friday', agentStatus: 'good' },
  { agentId: 'CPC436', agentName: 'Rahul Verma', contact: '+919845011436', kam: 'Surendra', source: 'marketing', status: 'qualified', service: 'due_diligence', daysAgo: 2, lastCallStatus: 'connected', agentStatus: 'good' },
  { agentId: 'CPC442', agentName: 'Lakshmi Menon', contact: '+919845011442', kam: 'Qalandar', source: 'app', status: 'lost', service: 'ec', daysAgo: 6, lastCallStatus: 'connected', lastCallNotes: 'Already used their own vendor' },
  { agentId: 'CPC448', agentName: 'Vikram Joshi', contact: '+919845011448', kam: 'Samarth', source: 'app', status: 'new', service: 'new_khata', daysAgo: 1, lastCallStatus: 'call_back', lastCallNotes: 'Call after the weekend' },
  { agentId: 'CPC455', agentName: 'Neha Kapoor', contact: '+919845011455', kam: 'Sandeep', source: 'marketing', status: 'new', service: 'loan_against_property', daysAgo: 1, agentStatus: 'maybe' },
  { agentId: 'CPC461', agentName: 'Suresh Gowda', contact: '+919845011461', kam: 'Rasranjan', source: 'app', status: 'qualified', service: 'legal_consultation', daysAgo: 5, lastCallStatus: 'connected', lastCallNotes: 'Wants in-person meeting', agentStatus: 'good' },
  { agentId: 'CPC468', agentName: 'Ritu Malhotra', contact: '+919845011468', kam: 'Siddharth', source: 'marketing', status: 'lost', service: 'bescom', daysAgo: 12, lastCallStatus: 'not_reachable', lastCallNotes: 'Three attempts, giving up', agentStatus: 'bad' },
  { agentId: 'CPC474', agentName: 'Abhishek Rao', contact: '+919845011474', kam: 'Surendra', source: 'app', status: 'rnr1', service: 'b_to_a_khata', daysAgo: 1, lastCallStatus: 'switched_off' },
  { agentId: 'CPC480', agentName: 'Meenakshi Sundaram', contact: '+919845011480', kam: 'Qalandar', source: 'app', status: 'new', service: 'modt_cancellation', daysAgo: 3, lastCallStatus: 'connected', lastCallNotes: 'Needs MODT cancellation urgently', agentStatus: 'good' },
  { agentId: 'CPC486', agentName: 'Harish Chandran', contact: '+919845011486', kam: 'Samarth', source: 'marketing', status: 'new', service: 'panchayat_khata', daysAgo: 2, lastCallStatus: 'call_back', agentStatus: 'maybe' },
  { agentId: 'CPC493', agentName: 'Swati Deshmukh', contact: '+919845011493', kam: 'Sandeep', source: 'app', status: 'lost', service: 'rental_agreement', daysAgo: 7, lastCallStatus: 'connected', lastCallNotes: 'Doing it themselves' },
  { agentId: 'CPC501', agentName: 'Ananya Krishnan', contact: '+919845011501', kam: 'Qalandar', source: 'app', status: 'new', service: 'new_khata', daysAgo: 1, agentStatus: 'good' },
  { agentId: 'CPC508', agentName: 'Rajesh Pillai', contact: '+919845011508', kam: 'Samarth', source: 'marketing', status: 'qualified', service: 'registration', daysAgo: 3, lastCallStatus: 'connected', lastCallNotes: 'Ready to proceed', agentStatus: 'good' },
  { agentId: 'CPC514', agentName: 'Farhan Ahmed', contact: '+919845011514', kam: 'Sandeep', source: 'app', status: 'rnr1', service: 'home_loan', daysAgo: 2, lastCallStatus: 'rnr_2' },
  { agentId: 'CPC520', agentName: 'Kavitha Subramaniam', contact: '+919845011520', kam: 'Rasranjan', source: 'marketing', status: 'new', service: 'khata_transfer', daysAgo: 4, lastCallStatus: 'connected', lastCallNotes: 'Will confirm budget', agentStatus: 'good' },
  { agentId: 'CPC527', agentName: 'Dinesh Kumar', contact: '+919845011527', kam: 'Siddharth', source: 'app', status: 'qualified', service: 'due_diligence', daysAgo: 2, lastCallStatus: 'connected', lastCallNotes: 'Urgent, wants fast turnaround', agentStatus: 'good' },
  { agentId: 'CPC533', agentName: 'Fatima Sheikh', contact: '+919845011533', kam: 'Surendra', source: 'marketing', status: 'lost', service: 'ec', daysAgo: 8, lastCallStatus: 'connected', lastCallNotes: 'Not needed anymore', agentStatus: 'bad' },
  { agentId: 'CPC540', agentName: 'Arvind Nair', contact: '+919845011540', kam: 'Qalandar', source: 'app', status: 'new', service: 'new_khata', daysAgo: 1, lastCallStatus: 'call_back', lastCallNotes: 'Travelling, call next week' },
  { agentId: 'CPC546', agentName: 'Shalini Reddy', contact: '+919845011546', kam: 'Samarth', source: 'marketing', status: 'new', service: 'loan_against_property', daysAgo: 1 },
  { agentId: 'CPC552', agentName: 'Mohammed Irfan', contact: '+919845011552', kam: 'Sandeep', source: 'app', status: 'lost', service: 'bescom', daysAgo: 14, lastCallStatus: 'wrong_number', lastCallNotes: 'Number invalid' },
  { agentId: 'CPC559', agentName: 'Geeta Iyengar', contact: '+919845011559', kam: 'Rasranjan', source: 'app', status: 'qualified', service: 'legal_consultation', daysAgo: 3, lastCallStatus: 'connected', lastCallNotes: 'Wants to discuss family property', agentStatus: 'good' },
];

// Four hand-written "showcase" records exercising the parts the generator doesn't: an explicit
// client POC with documents/invoice, an "agent as POC" service in progress, a request with two
// different clients each wanting their own set of services, and a lead with two clients added
// straight from the Agent Connect panel (to exercise the multi-client "Client 1" / "Client 2" view).
// Authored in the old flat-status/statusLog/invoice shape (easier to write a realistic path this
// way) — `buildSeedRecords` below runs every request through `toSavedShape` to produce the saved
// shape before anything else sees it.
function buildLegacySeedRecords() {
  return [
    {
      agentId: 'CPC980',
      agentName: 'Ramesh Gowda',
      contact: '+919845019980',
      kam: 'Sandeep',
      legalAndLoan: {
        status: 'good',
        notes: [
          {
            text: 'Lead came in via app, agent and two clients all need legal help.',
            status: 'good',
            time: now() - DAY * 1,
            user: 'Sandeep',
          },
        ],
        requests: [
          {
            id: 'R_CPC980_1',
            source: 'app',
            status: 'new',
            statusLog: [
              { status: 'new', notes: 'Lead created via connect', time: now() - DAY * 1, user: 'Sandeep' },
            ],
            leadBy: 'Sandeep',
            qualifiedBy: null,
            salesPoc: null,
            createdAt: now() - DAY * 1,
            clients: [
              {
                pocType: 'agent',
                connections: [
                  {
                    status: 'connected',
                    position: 'lead',
                    notes: 'Needs Registration done for own plot',
                    time: now() - DAY * 1,
                    user: 'Sandeep',
                  },
                ],
                invoice: { piId: '', total: 0 },
                paymentReceived: false,
                services: [{ name: 'registration', qty: 1, chargeableAmount: 7000, documents: [], status: 'negotiation' }],
              },
              {
                pocType: 'client',
                name: 'Kiran Reddy',
                phone: '9845123456',
                connections: [
                  {
                    status: 'connected',
                    position: 'lead',
                    notes: 'Client requested Due Diligence verification',
                    time: now() - DAY * 1,
                    user: 'Sandeep',
                  },
                ],
                invoice: { piId: '', total: 0 },
                paymentReceived: false,
                services: [{ name: 'due_diligence', qty: 1, chargeableAmount: 10500, documents: [], status: 'negotiation' }],
              },
              {
                pocType: 'client',
                name: 'Meera Pillai',
                phone: '9845198765',
                connections: [
                  {
                    status: 'connected',
                    position: 'lead',
                    notes: 'Second client, wants Sale Agreement drafted',
                    time: now() - DAY * 1,
                    user: 'Sandeep',
                  },
                ],
                invoice: { piId: '', total: 0 },
                paymentReceived: false,
                services: [{ name: 'sale_agreement', qty: 1, chargeableAmount: 6000, documents: [], status: 'negotiation' }],
              },
            ],
          },
        ],
      },
    },
    {
      agentId: 'CPC968',
      agentName: 'Vedamurthy N',
      contact: '+919886114107',
      kam: 'Sandeep',
      legalAndLoan: {
        status: 'good',
        notes: [
          {
            text: 'Lead came in via app, interested in Sale Agreement and EC for client.',
            status: 'good',
            time: now() - DAY * 2,
            user: 'Sandeep',
          },
        ],
        requests: [
          {
            id: 'R1',
            source: 'app',
            status: 'new',
            statusLog: [
              { status: 'new', notes: 'Lead created via connect', time: now() - DAY * 2, user: 'Sandeep' },
            ],
            leadBy: 'Sandeep',
            qualifiedBy: null,
            salesPoc: null,
            createdAt: now() - DAY * 2,
            clients: [
              {
                pocType: 'agent',
                connections: [
                  {
                    status: 'connected',
                    position: 'lead',
                    notes: 'Needs Sale Agreement and 2 EC copies',
                    time: now() - DAY * 2,
                    user: 'Sandeep',
                  },
                ],
                invoice: { piId: '', total: 0 },
                paymentReceived: false,
                services: [
                  { name: 'sale_agreement', qty: 1, chargeableAmount: 5000, documents: [], status: 'negotiation' },
                  { name: 'ec', qty: 2, chargeableAmount: 3000, documents: [], status: 'negotiation' },
                ],
              },
              {
                pocType: 'client',
                name: 'Kiran Reddy',
                phone: '+919845123456',
                connections: [
                  {
                    status: 'connected',
                    position: 'lead',
                    notes: 'Client requested Due Diligence verification',
                    time: now() - DAY * 1,
                    user: 'Sandeep',
                  },
                ],
                invoice: { piId: '', total: 0 },
                paymentReceived: false,
                services: [
                  { name: 'due_diligence', qty: 1, chargeableAmount: 10500, documents: [], status: 'negotiation' },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      agentId: 'CPC287',
      agentName: 'Priya Chandra',
      contact: '+919845011287',
      kam: 'Samarth',
      legalAndLoan: {
        status: 'good',
        notes: [
          { text: 'Lead came in via app, wants e-Khata for a client in Whitefield.', status: 'maybe', time: now() - DAY * 9, user: 'Samarth' },
          { text: 'Price agreed, negotiating documents.', status: 'good', time: now() - DAY * 7, user: 'Samarth' },
        ],
        requests: [
          {
            id: 'R1',
            source: 'app',
            status: 'negotiation',
            statusLog: [
              { status: 'new', notes: '', time: now() - DAY * 9, user: 'Samarth' },
              { status: 'qualified', notes: 'Spoke to client, interested', time: now() - DAY * 8, user: 'Samarth' },
              { status: 'negotiation', notes: 'Discussing price', time: now() - DAY * 5, user: 'Samarth' },
            ],
            leadBy: 'Samarth',
            qualifiedBy: 'Samarth',
            salesPoc: 'Samarth',
            createdAt: now() - DAY * 9,
            clients: [
              {
                pocType: 'client',
                name: 'Rakesh',
                phone: '9876543210',
                connections: [
                  { status: 'rnr', position: 'lead', notes: 'No answer, will retry tomorrow', time: now() - DAY * 9, user: 'Samarth' },
                  { status: 'connected', position: 'lead', notes: 'Spoke to client, interested', time: now() - DAY * 8, user: 'Samarth' },
                  { status: 'connected', position: 'service', notes: 'Discussing price', time: now() - DAY * 5, user: 'Samarth' },
                ],
                invoice: { piId: '', total: 0 },
                paymentReceived: false,
                services: [
                  {
                    name: 'e_khata',
                    chargeableAmount: 6000,
                    documents: [
                      { name: 'Sale deed', received: true },
                      { name: 'Tax receipt', received: false },
                    ],
                    status: 'negotiation',
                  },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      agentId: 'CPC402',
      agentName: 'Divya Iyer',
      contact: '+919845011402',
      kam: 'Rasranjan',
      legalAndLoan: {
        status: 'good',
        notes: [
          { text: 'Lead came in via app, wants khata transfer and registration.', status: 'maybe', time: now() - DAY * 12, user: 'Rasranjan' },
          { text: 'Advance received on khata transfer.', status: 'good', time: now() - DAY * 8, user: 'Rasranjan' },
        ],
        requests: [
          {
            id: 'R1',
            source: 'app',
            status: 'documents_collected',
            statusLog: [
              { status: 'new', notes: '', time: now() - DAY * 12, user: 'Rasranjan' },
              { status: 'qualified', notes: 'Interested in both khata transfer and registration', time: now() - DAY * 12, user: 'Rasranjan' },
              { status: 'negotiation', notes: '', time: now() - DAY * 10, user: 'Rasranjan' },
              { status: 'documents_collected', notes: 'Advance received', time: now() - DAY * 8, user: 'Rasranjan' },
            ],
            leadBy: 'Rasranjan',
            qualifiedBy: 'Rasranjan',
            salesPoc: 'Rasranjan',
            createdAt: now() - DAY * 12,
            clients: [
              {
                // Divya is handling this herself — no separate end-client identified yet.
                pocType: 'agent',
                connections: [
                  { status: 'connected', position: 'lead', notes: 'Interested in both khata transfer and registration', time: now() - DAY * 12, user: 'Rasranjan' },
                  { status: 'connected', position: 'service', notes: 'Advance received', time: now() - DAY * 8, user: 'Rasranjan' },
                ],
                invoice: { piId: 'PI-1042', total: 16000 },
                paymentReceived: false,
                services: [
                  {
                    name: 'khata_transfer',
                    chargeableAmount: 16000,
                    documents: [
                      { name: 'Sale deed', received: true },
                      { name: 'Khata certificate', received: true },
                      { name: 'Tax receipt', received: false },
                    ],
                    status: 'documents_collected',
                  },
                  {
                    name: 'registration',
                    chargeableAmount: 33500,
                    documents: [],
                    status: 'negotiation',
                  },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      agentId: 'CPC212',
      agentName: 'Sunita Reddy',
      contact: '+919845011212',
      kam: 'Rasranjan',
      legalAndLoan: {
        status: 'maybe',
        notes: [
          { text: 'Lead came in via app, wants due diligence for two family members.', status: 'maybe', time: now() - DAY * 6, user: 'Rasranjan' },
          { text: 'Client is in a hurry, wants this closed within the week.', status: '', time: now() - DAY * 4, user: 'Rasranjan' },
        ],
        requests: [
          {
            id: 'R1',
            source: 'app',
            status: 'qualified',
            statusLog: [
              { status: 'new', notes: '', time: now() - DAY * 6, user: 'Rasranjan' },
              { status: 'qualified', notes: 'Both family members on board', time: now() - DAY * 5, user: 'Rasranjan' },
            ],
            leadBy: 'Rasranjan',
            qualifiedBy: 'Rasranjan',
            salesPoc: null,
            createdAt: now() - DAY * 6,
            // Two different clients on the same lead, each wanting their own service(s).
            clients: [
              {
                pocType: 'client',
                name: 'Ramesh Gupta',
                phone: '9845098450',
                connections: [{ status: 'connected', position: 'lead', notes: 'Spoke to Ramesh, very interested', time: now() - DAY * 6, user: 'Rasranjan' }],
                invoice: { piId: '', total: 0 },
                paymentReceived: false,
                services: [{ name: 'due_diligence', chargeableAmount: 13500, documents: [], status: 'negotiation' }],
              },
              {
                pocType: 'client',
                name: 'Lakshmi Gupta',
                phone: '9845098451',
                connections: [{ status: 'connected', position: 'lead', notes: 'Spoke to Lakshmi, wants EC too', time: now() - DAY * 5, user: 'Rasranjan' }],
                invoice: { piId: '', total: 0 },
                paymentReceived: false,
                services: [{ name: 'ec', chargeableAmount: 2000, documents: [], status: 'negotiation' }],
              },
            ],
          },
        ],
      },
    },
    {
      agentId: 'CPC301',
      agentName: 'Ravi Kumar',
      contact: '+919845011301',
      kam: 'Sandeep',
      legalAndLoan: {
        status: 'maybe',
        notes: [{ text: 'Lead came in via marketing campaign, wants a home loan.', status: 'maybe', time: now() - DAY * 1, user: 'Sandeep' }],
        requests: [
          {
            id: 'R1',
            source: 'marketing',
            status: 'new',
            statusLog: [{ status: 'new', notes: '', time: now() - DAY * 1, user: 'Sandeep' }],
            leadBy: 'Sandeep',
            qualifiedBy: null,
            salesPoc: null,
            createdAt: now() - DAY * 1,
            clients: [{ pocType: 'agent', connections: [], invoice: { piId: '', total: 0 }, paymentReceived: false, services: [{ name: 'home_loan', chargeableAmount: null, documents: [], status: 'negotiation' }] }],
          },
        ],
      },
    },
    {
      agentId: 'CPC145',
      agentName: 'Anjali Rao',
      contact: '+919845011145',
      kam: 'Sandeep',
      legalAndLoan: {
        status: 'maybe',
        notes: [{ text: 'Lead came in via app, wants a new Khata.', status: 'maybe', time: now() - DAY * 2, user: 'Sandeep' }],
        requests: [
          {
            id: 'R1',
            source: 'app',
            status: 'rnr1',
            statusLog: [
              { status: 'new', notes: '', time: now() - DAY * 2, user: 'Sandeep' },
              { status: 'rnr1', notes: 'No answer', time: now() - DAY * 2, user: 'Sandeep' },
            ],
            leadBy: 'Sandeep',
            qualifiedBy: null,
            salesPoc: null,
            createdAt: now() - DAY * 2,
            clients: [
              {
                pocType: 'agent',
                connections: [{ status: 'rnr', position: 'lead', notes: 'No answer', time: now() - DAY * 2, user: 'Sandeep' }],
                invoice: { piId: '', total: 0 },
                paymentReceived: false,
                services: [{ name: 'new_khata', chargeableAmount: null, documents: [], status: 'negotiation' }],
              },
            ],
          },
        ],
      },
    },
    {
      agentId: 'CPC098',
      agentName: 'Deepak Shah',
      contact: '+919845011098',
      kam: 'Samarth',
      legalAndLoan: {
        status: 'maybe',
        notes: [{ text: 'Lead came in via app, wants registration help.', status: 'maybe', time: now() - DAY * 3, user: 'Samarth' }],
        requests: [
          {
            id: 'R1',
            source: 'app',
            status: 'new',
            statusLog: [{ status: 'new', notes: 'Spoke briefly, will share docs', time: now() - DAY * 1, user: 'Samarth' }],
            leadBy: 'Samarth',
            qualifiedBy: null,
            salesPoc: null,
            createdAt: now() - DAY * 3,
            clients: [
              {
                pocType: 'agent',
                connections: [
                  { status: 'switched_off', position: 'lead', notes: '', time: now() - DAY * 3, user: 'Samarth' },
                  { status: 'connected', position: 'lead', notes: 'Spoke briefly, will share docs', time: now() - DAY * 1, user: 'Samarth' },
                ],
                invoice: { piId: '', total: 0 },
                paymentReceived: false,
                services: [{ name: 'registration', chargeableAmount: null, documents: [], status: 'negotiation' }],
              },
            ],
          },
        ],
      },
    },
    {
      agentId: 'CPC176',
      agentName: 'Imran Sheikh',
      contact: '+919845011176',
      kam: 'Siddharth',
      legalAndLoan: {
        status: 'bad',
        notes: [
          { text: 'Lead came in via marketing, flagged for EC.', status: 'maybe', time: now() - DAY * 10, user: 'Siddharth' },
          { text: 'Not interested right now.', status: 'bad', time: now() - DAY * 9, user: 'Siddharth' },
        ],
        requests: [
          {
            id: 'R1',
            source: 'marketing',
            status: 'lost',
            statusLog: [
              { status: 'new', notes: '', time: now() - DAY * 10, user: 'Siddharth' },
              { status: 'lost', notes: 'Not interested right now', time: now() - DAY * 9, user: 'Siddharth' },
            ],
            leadBy: 'Siddharth',
            qualifiedBy: null,
            salesPoc: null,
            createdAt: now() - DAY * 10,
            clients: [
              {
                pocType: 'agent',
                connections: [{ status: 'connected', position: 'lead', notes: 'Not interested right now', time: now() - DAY * 9, user: 'Siddharth' }],
                invoice: { piId: '', total: 0 },
                paymentReceived: false,
                services: [{ name: 'ec', chargeableAmount: null, documents: [], status: 'lost' }],
              },
            ],
          },
        ],
      },
    },
    {
      agentId: 'CPC053',
      agentName: 'Kavya Nair',
      contact: '+919845011053',
      kam: 'Surendra',
      legalAndLoan: {
        status: 'maybe',
        notes: [{ text: 'Lead came in via app, wants a Khata transfer.', status: 'maybe', time: now() - DAY * 2, user: 'Surendra' }],
        requests: [
          {
            id: 'R1',
            source: 'app',
            status: 'new',
            statusLog: [{ status: 'new', notes: 'Asked to call back next Monday', time: now() - DAY * 2, user: 'Surendra' }],
            leadBy: 'Surendra',
            qualifiedBy: null,
            salesPoc: null,
            createdAt: now() - DAY * 2,
            clients: [
              {
                pocType: 'agent',
                connections: [{ status: 'call_back', position: 'lead', notes: 'Asked to call back next Monday', time: now() - DAY * 2, user: 'Surendra' }],
                invoice: { piId: '', total: 0 },
                paymentReceived: false,
                services: [{ name: 'khata_transfer', chargeableAmount: null, documents: [], status: 'negotiation' }],
              },
            ],
          },
        ],
      },
    },
    {
      agentId: 'CPC319',
      agentName: 'Arjun Mehta',
      contact: '+919845011319',
      kam: 'Qalandar',
      legalAndLoan: {
        status: 'bad',
        notes: [
          { text: 'Lead came in via marketing, flagged for BESCOM name change.', status: 'maybe', time: now() - DAY * 15, user: 'Qalandar' },
          { text: 'Unreachable after three attempts.', status: 'bad', time: now() - DAY * 11, user: 'Qalandar' },
        ],
        requests: [
          {
            id: 'R1',
            source: 'marketing',
            status: 'lost',
            statusLog: [
              { status: 'new', notes: '', time: now() - DAY * 15, user: 'Qalandar' },
              { status: 'rnr1', notes: '', time: now() - DAY * 13, user: 'Qalandar' },
              { status: 'lost', notes: 'Unreachable after three attempts', time: now() - DAY * 11, user: 'Qalandar' },
            ],
            leadBy: 'Qalandar',
            qualifiedBy: null,
            salesPoc: null,
            createdAt: now() - DAY * 15,
            clients: [
              {
                pocType: 'agent',
                connections: [
                  { status: 'rnr', position: 'lead', notes: '', time: now() - DAY * 15, user: 'Qalandar' },
                  { status: 'rnr', position: 'lead', notes: '', time: now() - DAY * 13, user: 'Qalandar' },
                  { status: 'not_reachable', position: 'lead', notes: 'Giving up for now', time: now() - DAY * 11, user: 'Qalandar' },
                ],
                invoice: { piId: '', total: 0 },
                paymentReceived: false,
                services: [{ name: 'bescom', chargeableAmount: null, documents: [], status: 'lost' }],
              },
            ],
          },
        ],
      },
    },
    {
      agentId: 'CPC624',
      agentName: 'Arjun Mehta',
      contact: '+919845011624',
      kam: 'Sandeep',
      legalAndLoan: {
        status: 'good',
        notes: [
          { text: 'Lead came in via app — wants a home loan and legal consult for himself, plus two clients need their own services.', status: 'maybe', time: now() - DAY * 5, user: 'Sandeep' },
          { text: 'Qualified everyone in one call.', status: 'good', time: now() - DAY * 4, user: 'Sandeep' },
        ],
        requests: [
          {
            id: 'R1',
            source: 'app',
            status: 'qualified',
            statusLog: [
              { status: 'new', notes: '', time: now() - DAY * 5, user: 'Sandeep' },
              { status: 'qualified', notes: 'Qualified everyone in one call', time: now() - DAY * 4, user: 'Sandeep' },
            ],
            leadBy: 'Sandeep',
            qualifiedBy: 'Sandeep',
            salesPoc: null,
            createdAt: now() - DAY * 5,
            // Agent wants two services for himself, on top of two separate clients each
            // wanting their own — exercises the Agent + Client(2) badges together.
            clients: [
              {
                pocType: 'agent',
                connections: [{ status: 'connected', position: 'lead', notes: 'Wants a home loan and a legal consult for himself', time: now() - DAY * 5, user: 'Sandeep' }],
                invoice: { piId: '', total: 0 },
                paymentReceived: false,
                services: [
                  { name: 'home_loan', chargeableAmount: null, documents: [], status: 'negotiation' },
                  { name: 'legal_consultation', chargeableAmount: 2500, documents: [], status: 'negotiation' },
                ],
              },
              {
                pocType: 'client',
                name: 'Varun Mehta',
                phone: '9845098460',
                connections: [{ status: 'connected', position: 'lead', notes: 'Brother wants registration done', time: now() - DAY * 4, user: 'Sandeep' }],
                invoice: { piId: '', total: 0 },
                paymentReceived: false,
                services: [{ name: 'registration', chargeableAmount: 8000, documents: [], status: 'negotiation' }],
              },
              {
                pocType: 'client',
                name: 'Priyanka Mehta',
                phone: '9845098461',
                connections: [{ status: 'connected', position: 'lead', notes: 'Wants an e-Khata for her flat', time: now() - DAY * 4, user: 'Sandeep' }],
                invoice: { piId: '', total: 0 },
                paymentReceived: false,
                services: [{ name: 'e_khata', chargeableAmount: 4000, documents: [], status: 'negotiation' }],
              },
            ],
          },
        ],
      },
    },
    {
      agentId: 'CPC631',
      agentName: 'Divya Nair',
      contact: '+919845011631',
      kam: 'Siddharth',
      legalAndLoan: {
        status: 'good',
        notes: [
          { text: 'Lead came in via marketing — whole family wants partition work done, nothing for herself.', status: 'maybe', time: now() - DAY * 7, user: 'Siddharth' },
          { text: 'All three on board.', status: 'good', time: now() - DAY * 6, user: 'Siddharth' },
        ],
        requests: [
          {
            id: 'R1',
            source: 'marketing',
            status: 'qualified',
            statusLog: [
              { status: 'new', notes: '', time: now() - DAY * 7, user: 'Siddharth' },
              { status: 'qualified', notes: 'All three family members on board', time: now() - DAY * 6, user: 'Siddharth' },
            ],
            leadBy: 'Siddharth',
            qualifiedBy: 'Siddharth',
            salesPoc: null,
            createdAt: now() - DAY * 7,
            // Three real clients, nothing for the agent herself — exercises Client(3) alone.
            clients: [
              {
                pocType: 'client',
                name: 'Divya Nair',
                phone: '9845098470',
                connections: [{ status: 'connected', position: 'lead', notes: 'Wants the partition deed drafted', time: now() - DAY * 7, user: 'Siddharth' }],
                invoice: { piId: '', total: 0 },
                paymentReceived: false,
                services: [{ name: 'partition_deed', chargeableAmount: 15000, documents: [], status: 'negotiation' }],
              },
              {
                pocType: 'client',
                name: 'Ravi Nair',
                phone: '9845098471',
                connections: [{ status: 'connected', position: 'lead', notes: 'Needs the family tree document', time: now() - DAY * 6, user: 'Siddharth' }],
                invoice: { piId: '', total: 0 },
                paymentReceived: false,
                services: [{ name: 'family_tree', chargeableAmount: 3500, documents: [], status: 'negotiation' }],
              },
              {
                pocType: 'client',
                name: 'Meera Nair',
                phone: '9845098472',
                connections: [{ status: 'connected', position: 'lead', notes: 'Wants a gift deed for her share', time: now() - DAY * 6, user: 'Siddharth' }],
                invoice: { piId: '', total: 0 },
                paymentReceived: false,
                services: [{ name: 'gift_deed', chargeableAmount: 9000, documents: [], status: 'negotiation' }],
              },
            ],
          },
        ],
      },
    },
    {
      agentId: 'CPC645',
      agentName: 'Sunita Rao',
      contact: '+919845011645',
      kam: 'Qalandar',
      legalAndLoan: {
        status: 'good',
        notes: [
          { text: 'Lead came in via app — wants a balance transfer, a home loan, and an MoU drafted, all for herself.', status: 'maybe', time: now() - DAY * 4, user: 'Qalandar' },
          { text: 'Confirmed all three services.', status: 'good', time: now() - DAY * 3, user: 'Qalandar' },
        ],
        requests: [
          {
            id: 'R1',
            source: 'app',
            status: 'qualified',
            statusLog: [
              { status: 'new', notes: '', time: now() - DAY * 4, user: 'Qalandar' },
              { status: 'qualified', notes: 'Confirmed all three services', time: now() - DAY * 3, user: 'Qalandar' },
            ],
            leadBy: 'Qalandar',
            qualifiedBy: 'Qalandar',
            salesPoc: null,
            createdAt: now() - DAY * 4,
            // Agent wants three services for herself, no real clients — exercises Agent
            // alone with a multi-service list in the Agent Services column.
            clients: [
              {
                pocType: 'agent',
                connections: [{ status: 'connected', position: 'lead', notes: 'Confirmed all three services', time: now() - DAY * 3, user: 'Qalandar' }],
                invoice: { piId: '', total: 0 },
                paymentReceived: false,
                services: [
                  { name: 'balance_transfer', chargeableAmount: null, documents: [], status: 'negotiation' },
                  { name: 'home_loan', chargeableAmount: null, documents: [], status: 'negotiation' },
                  { name: 'mou', chargeableAmount: 2000, documents: [], status: 'negotiation' },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      agentId: 'CPC658',
      agentName: 'Manoj Deshpande',
      contact: '+919845011658',
      kam: 'Sandeep',
      legalAndLoan: {
        status: 'good',
        notes: [
          { text: 'Qualified for registration and due diligence on a client purchase.', status: 'maybe', time: now() - DAY * 14, user: 'Sandeep' },
          { text: 'Documents mostly in, invoice sent.', status: 'good', time: now() - DAY * 4, user: 'Samarth' },
        ],
        requests: [
          {
            id: 'R1',
            source: 'app',
            status: 'invoice_sent',
            statusLog: [
              { status: 'new', notes: '', time: now() - DAY * 14, user: 'Sandeep' },
              { status: 'qualified', notes: 'Client confirmed both services', time: now() - DAY * 13, user: 'Sandeep' },
              { status: 'negotiation', notes: 'Price agreed', time: now() - DAY * 10, user: 'Samarth' },
              { status: 'documents_collected', notes: 'Most documents collected', time: now() - DAY * 6, user: 'Samarth' },
              { status: 'invoice_sent', notes: 'Invoice sent, awaiting payment', time: now() - DAY * 4, user: 'Samarth' },
            ],
            leadBy: 'Sandeep',
            qualifiedBy: 'Sandeep',
            salesPoc: 'Samarth',
            createdAt: now() - DAY * 14,
            clients: [
              {
                pocType: 'client',
                name: 'Deepak Deshpande',
                phone: '9845098480',
                connections: [{ status: 'connected', position: 'service', notes: 'Shared most documents already', time: now() - DAY * 6, user: 'Samarth' }],
                invoice: { piId: 'PI-2201', total: 18500 },
                paymentReceived: false,
                services: [
                  {
                    name: 'registration',
                    qty: 1,
                    chargeableAmount: 12000,
                    status: 'invoice_sent',
                    documents: [
                      { name: 'Sale agreement', received: true },
                      { name: 'ID proof', received: true },
                      { name: 'Address proof', received: false },
                    ],
                  },
                  {
                    name: 'due_diligence',
                    qty: 1,
                    chargeableAmount: 6500,
                    status: 'invoice_sent',
                    documents: [
                      { name: 'EC copy', received: true },
                      { name: 'Khata certificate', received: false },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      agentId: 'CPC667',
      agentName: 'Shalini Kapoor',
      contact: '+919845011667',
      kam: 'Siddharth',
      legalAndLoan: {
        status: 'good',
        notes: [
          { text: 'Agent wanted a home loan for herself and an e-Khata for her sister.', status: 'maybe', time: now() - DAY * 20, user: 'Siddharth' },
          { text: 'Payment received for both.', status: 'good', time: now() - DAY * 2, user: 'Siddharth' },
        ],
        requests: [
          {
            id: 'R1',
            source: 'app',
            status: 'payment_received',
            statusLog: [
              { status: 'new', notes: '', time: now() - DAY * 20, user: 'Siddharth' },
              { status: 'qualified', notes: '', time: now() - DAY * 19, user: 'Siddharth' },
              { status: 'negotiation', notes: '', time: now() - DAY * 15, user: 'Siddharth' },
              { status: 'documents_collected', notes: 'All documents in', time: now() - DAY * 9, user: 'Siddharth' },
              { status: 'invoice_sent', notes: '', time: now() - DAY * 6, user: 'Siddharth' },
              { status: 'payment_received', notes: 'Full payment received for both', time: now() - DAY * 2, user: 'Siddharth' },
            ],
            leadBy: 'Siddharth',
            qualifiedBy: 'Siddharth',
            salesPoc: 'Siddharth',
            createdAt: now() - DAY * 20,
            clients: [
              {
                pocType: 'agent',
                connections: [],
                invoice: { piId: 'PI-2198', total: 8000 },
                paymentReceived: true,
                services: [
                  {
                    name: 'home_loan',
                    qty: 1,
                    chargeableAmount: 8000,
                    status: 'payment_received',
                    documents: [
                      { name: 'Salary slips', received: true },
                      { name: 'Bank statements', received: true },
                    ],
                  },
                ],
              },
              {
                pocType: 'client',
                name: 'Reema Kapoor',
                phone: '9845098490',
                connections: [{ status: 'connected', position: 'service', notes: 'Payment confirmed', time: now() - DAY * 2, user: 'Siddharth' }],
                invoice: { piId: 'PI-2199', total: 4000 },
                paymentReceived: true,
                services: [
                  {
                    name: 'e_khata',
                    qty: 1,
                    chargeableAmount: 4000,
                    status: 'payment_received',
                    documents: [
                      { name: 'Sale deed', received: true },
                      { name: 'Tax receipt', received: true },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      agentId: 'CPC679',
      agentName: 'Ramesh Iyer',
      contact: '+919845011679',
      kam: 'Rasranjan',
      legalAndLoan: {
        status: 'good',
        notes: [
          { text: 'Wanted a gift deed drafted for his son.', status: 'maybe', time: now() - DAY * 25, user: 'Rasranjan' },
          { text: 'Fully completed and forwarded.', status: 'good', time: now() - DAY * 1, user: 'Rasranjan' },
        ],
        requests: [
          {
            id: 'R1',
            source: 'marketing',
            status: 'service_forwarded',
            statusLog: [
              { status: 'new', notes: '', time: now() - DAY * 25, user: 'Rasranjan' },
              { status: 'qualified', notes: '', time: now() - DAY * 24, user: 'Rasranjan' },
              { status: 'negotiation', notes: '', time: now() - DAY * 20, user: 'Rasranjan' },
              { status: 'documents_collected', notes: '', time: now() - DAY * 12, user: 'Rasranjan' },
              { status: 'invoice_sent', notes: '', time: now() - DAY * 7, user: 'Rasranjan' },
              { status: 'payment_received', notes: '', time: now() - DAY * 3, user: 'Rasranjan' },
              { status: 'service_forwarded', notes: 'Forwarded to the drafting team', time: now() - DAY * 1, user: 'Rasranjan' },
            ],
            leadBy: 'Rasranjan',
            qualifiedBy: 'Rasranjan',
            salesPoc: 'Rasranjan',
            createdAt: now() - DAY * 25,
            clients: [
              {
                pocType: 'agent',
                connections: [],
                invoice: { piId: 'PI-2175', total: 9000 },
                paymentReceived: true,
                services: [
                  {
                    name: 'gift_deed',
                    qty: 1,
                    chargeableAmount: 9000,
                    status: 'service_forwarded',
                    documents: [
                      { name: 'ID proof', received: true },
                      { name: 'Property papers', received: true },
                      { name: 'Relationship proof', received: true },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      agentId: 'CPC685',
      agentName: 'Anjali Bhatt',
      contact: '+919845011685',
      kam: 'Surendra',
      legalAndLoan: {
        status: 'bad',
        notes: [
          { text: 'Client wanted a balance transfer and legal consult.', status: 'maybe', time: now() - DAY * 18, user: 'Surendra' },
          { text: 'Client backed out mid-negotiation, went with another vendor.', status: 'bad', time: now() - DAY * 5, user: 'Surendra' },
        ],
        requests: [
          {
            id: 'R1',
            source: 'app',
            status: 'lost',
            // Seeded directly with lostFromStage since this record didn't go through
            // updateRequestStatus — this is what keeps it on the Service page instead of
            // falling back to Leads (see effectiveStage in this file).
            lostFromStage: 'service',
            statusLog: [
              { status: 'new', notes: '', time: now() - DAY * 18, user: 'Surendra' },
              { status: 'qualified', notes: '', time: now() - DAY * 17, user: 'Surendra' },
              { status: 'negotiation', notes: 'Discussing pricing', time: now() - DAY * 12, user: 'Surendra' },
              { status: 'lost', notes: 'Client backed out, went with another vendor', time: now() - DAY * 5, user: 'Surendra' },
            ],
            leadBy: 'Surendra',
            qualifiedBy: 'Surendra',
            salesPoc: 'Surendra',
            createdAt: now() - DAY * 18,
            clients: [
              {
                pocType: 'client',
                name: 'Vinay Bhatt',
                phone: '9845098495',
                connections: [{ status: 'connected', position: 'service', notes: 'Backed out of the deal', time: now() - DAY * 5, user: 'Surendra' }],
                invoice: { piId: '', total: 0 },
                paymentReceived: false,
                services: [
                  {
                    name: 'balance_transfer',
                    qty: 1,
                    chargeableAmount: null,
                    status: 'lost',
                    documents: [{ name: 'Loan statement', received: true }],
                  },
                  {
                    name: 'legal_consultation',
                    qty: 1,
                    chargeableAmount: null,
                    status: 'lost',
                    documents: [],
                  },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      agentId: 'CPC692',
      agentName: 'Harpreet Singh',
      contact: '+919845011692',
      kam: 'Samarth',
      legalAndLoan: {
        status: 'good',
        notes: [
          { text: 'Client wants a straightforward registration done.', status: 'maybe', time: now() - DAY * 9, user: 'Samarth' },
          { text: 'Price agreed, in negotiation.', status: 'good', time: now() - DAY * 2, user: 'Samarth' },
        ],
        requests: [
          {
            id: 'R1',
            source: 'app',
            status: 'negotiation',
            statusLog: [
              { status: 'new', notes: '', time: now() - DAY * 9, user: 'Samarth' },
              { status: 'qualified', notes: 'Client confirmed registration', time: now() - DAY * 8, user: 'Samarth' },
              { status: 'negotiation', notes: 'Price agreed', time: now() - DAY * 2, user: 'Samarth' },
            ],
            leadBy: 'Samarth',
            qualifiedBy: 'Samarth',
            salesPoc: 'Samarth',
            createdAt: now() - DAY * 9,
            // Single client, single service — the simplest possible Service-stage row.
            clients: [
              {
                pocType: 'client',
                name: 'Gurpreet Singh',
                phone: '9845098500',
                connections: [{ status: 'connected', position: 'service', notes: 'Price agreed', time: now() - DAY * 2, user: 'Samarth' }],
                invoice: { piId: '', total: 0 },
                paymentReceived: false,
                services: [
                  {
                    name: 'registration',
                    qty: 1,
                    chargeableAmount: 9500,
                    status: 'negotiation',
                    documents: [{ name: 'Sale agreement', received: false }],
                  },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      agentId: 'CPC704',
      agentName: 'Nisha Pillai',
      contact: '+919845011704',
      kam: 'Rasranjan',
      legalAndLoan: {
        status: 'good',
        notes: [
          { text: 'Agent wants her own Khata correction done, nothing for a client.', status: 'maybe', time: now() - DAY * 11, user: 'Rasranjan' },
          { text: 'Documents fully collected.', status: 'good', time: now() - DAY * 3, user: 'Rasranjan' },
        ],
        requests: [
          {
            id: 'R1',
            source: 'marketing',
            status: 'documents_collected',
            statusLog: [
              { status: 'new', notes: '', time: now() - DAY * 11, user: 'Rasranjan' },
              { status: 'qualified', notes: '', time: now() - DAY * 10, user: 'Rasranjan' },
              { status: 'negotiation', notes: '', time: now() - DAY * 7, user: 'Rasranjan' },
              { status: 'documents_collected', notes: 'All documents in', time: now() - DAY * 3, user: 'Rasranjan' },
            ],
            leadBy: 'Rasranjan',
            qualifiedBy: 'Rasranjan',
            salesPoc: 'Rasranjan',
            createdAt: now() - DAY * 11,
            // Agent-only, single service — exercises the "one service per POC" limit on the
            // agent's own card too, not just on client cards.
            clients: [
              {
                pocType: 'agent',
                connections: [],
                invoice: { piId: 'PI-2210', total: 5500 },
                paymentReceived: false,
                services: [
                  {
                    name: 'khata_correction',
                    qty: 1,
                    chargeableAmount: 5500,
                    status: 'documents_collected',
                    documents: [
                      { name: 'Khata certificate', received: true },
                      { name: 'ID proof', received: true },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    },
    ...EXTRA_LEAD_SEED.map(makeLeadAgent),
  ];
}

let seedReqIdSeq = 1;
let seedConnIdSeq = 1;
let seedSvcIdSeq = 1;
const pad2 = (n) => String(n).padStart(2, '0');

// Converts one request from the old flat-status/statusLog/invoice shape into the saved shape:
// a `status` log array coarsened to lead/qualify/service/lost (consecutive same-stage entries
// collapsed into one), `invoiceId` instead of `invoice.piId`, and per-connection/per-service
// `id`s plus the new `medium`/`vaultServiceId`/`documentsReceived`/`advanceReceived`/`lost`
// fields — added alongside (not replacing) the legacy fields already-built UI reads from
// (qty, chargeableAmount, documents, position, topics, leadBy/qualifiedBy/salesPoc).
function toSavedShape(oldRequest) {
  const rawLog = oldRequest.statusLog?.length
    ? oldRequest.statusLog
    : [{ status: oldRequest.status, time: oldRequest.createdAt, user: oldRequest.leadBy }];

  const status = [];
  rawLog.forEach((entry) => {
    const stage = stageForOldStatus(entry.status);
    const prev = status[status.length - 1];
    if (!prev || prev.status !== stage) {
      status.push({ status: stage, time: entry.time, user: entry.user });
    }
  });
  const finalStage = stageForOldStatus(oldRequest.status);
  if (status[status.length - 1]?.status !== finalStage) {
    const last = rawLog[rawLog.length - 1];
    status.push({ status: finalStage, time: last.time, user: last.user });
  }

  return {
    id: pad2(seedReqIdSeq++),
    source: oldRequest.source,
    createdAt: oldRequest.createdAt,
    status,
    leadBy: oldRequest.leadBy,
    qualifiedBy: oldRequest.qualifiedBy,
    salesPoc: oldRequest.salesPoc,
    clients: oldRequest.clients.map((c) => ({
      pocType: c.pocType,
      ...(c.pocType === 'client' ? { name: c.name, phone: c.phone } : {}),
      invoiceId: c.invoice?.piId || null,
      paymentReceived: !!c.paymentReceived,
      connections: (c.connections || []).map((conn) => ({
        id: `conn_${seedConnIdSeq++}`,
        timestamp: conn.time,
        time: conn.time,
        kamId: (conn.user || '').toLowerCase(),
        kamName: conn.user,
        user: conn.user,
        medium: conn.connectMedium || 'on call',
        connectMedium: conn.connectMedium || 'on call',
        direction: conn.direction || 'outbound',
        status: conn.status,
        notes: conn.notes || '',
        callbackAt: conn.callbackAt || null,
        position: conn.position,
        topics: conn.topics || [],
      })),
      services: (c.services || []).map((s) => ({
        id: `svc_${seedSvcIdSeq++}`,
        name: s.name,
        documentsReceived: !!(s.documents?.length && s.documents.every((d) => d.received)),
        advanceReceived: !!c.paymentReceived,
        vaultServiceId: null,
        lost: s.status === 'lost',
        qty: s.qty || 1,
        chargeableAmount: s.chargeableAmount ?? null,
        documents: s.documents || [],
        status: s.status,
      })),
    })),
  };
}

// The seed data above is authored in the old shape (see buildLegacySeedRecords) because it's
// easier to describe a realistic path that way — this runs every request through toSavedShape
// so everything downstream only ever sees the final saved shape.
function buildSeedRecords() {
  return buildLegacySeedRecords().map((r) => ({
    ...r,
    legalAndLoan: {
      status: r.legalAndLoan.status,
      notes: r.legalAndLoan.notes,
      legalRequests: r.legalAndLoan.requests.map(toSavedShape),
    },
  }));
}

// Bump this whenever the seed shape/content changes meaningfully, so a browser holding stale
// cached data gets the fresh seed instead of silently keeping the old one.
// v9: full schema migration — legalAndLoan.status is now just good/maybe/bad, requests carry
// `status` (the funnel stage, no more separate `stage`/`level`) plus `leadBy`/`qualifiedBy`/
// `salesPoc`, and `lead`/`qualify`/`service` sub-objects are replaced by `clients[]` (each with its
// own POC, connections, invoice, paymentReceived and services). v10: every lead-stage EXTRA_LEAD_SEED
// entry previously ended up 'maybe' or 'bad' (the 'good' ones were all paired with a 'qualified'
// request status, so they never actually showed up on the Leads page) — gave 5 of them explicit
// agentStatus: 'good' so Good/Maybe/Bad are all visible there. v11: added `request.statusLog` (not
// in the schema as given — request.status was a flat value with no history) so the Status box can
// show a full timeline instead of just the current value. v14: added three more qualified-stage
// seed records (CPC624, CPC631, CPC645) covering multiple clients and multiple agent services at
// once, so the Qualify page's Client(N)/Agent-Services columns have real variety to show. v15:
// added four Service-stage seed records (CPC658 invoice_sent, CPC667 payment_received, CPC679
// service_forwarded, CPC685 lost-from-service via `lostFromStage`) with document checklists, so
// the Service page's status range, document tracking and lost-from-service handling all have
// real data to exercise. v16: added CPC692 (single client, single service) and CPC704
// (agent-only, single service), for the simple single-service-per-POC case. v17: added CPC980
// (Ramesh Gowda) — a lead-stage request with the agent plus two clients, for exercising the Agent
// Connect panel's multi-client "Client 1" / "Client 2" boxes. v18: final schema — `requests` is
// now `legalRequests`, request.status is a log array collapsed to lead/qualify/service/lost
// (was the granular new/rnr1-5/qualified/negotiation/.../service_delivered ladder), client
// invoice.piId is now invoiceId, connections/services carry id/medium/vaultServiceId/
// documentsReceived/advanceReceived/lost alongside their existing fields, and request ids are
// sequential two-digit numbers instead of "R1".
const STORAGE_KEY = 'acn_legal_doc_records_v18';

function loadRecords() {
  const seeds = buildSeedRecords();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Always restore test seed agent CPC968 (Vedamurthy N) to its initial seed lead data on page refresh
        const seedCpc = seeds.find((r) => r.agentId === 'CPC968');
        if (seedCpc) {
          const idx = parsed.findIndex((r) => r.agentId === 'CPC968');
          if (idx !== -1) parsed[idx] = JSON.parse(JSON.stringify(seedCpc));
          else parsed.unshift(JSON.parse(JSON.stringify(seedCpc)));
        }
        return parsed;
      }
    }
  } catch {
    // ignore — fall through to seed
  }
  return seeds;
}

function persist() {
  try {
    // In-memory changes allow qualifying CPC968 temporarily during the session,
    // but we avoid permanently writing CPC968 qualified status so a page refresh restores it immediately
    const toSave = legalDocRecords.map((r) => {
      if (r.agentId === 'CPC968') {
        const seedCpc = buildSeedRecords().find((s) => s.agentId === 'CPC968');
        return seedCpc ? JSON.parse(JSON.stringify(seedCpc)) : r;
      }
      return r;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // storage unavailable (private mode, quota, etc.) — in-memory state still works this session
  }
}

let legalDocRecords = loadRecords();
persist();

export function getLegalDocRecords() {
  return legalDocRecords;
}

export function getLegalDocRecord(agentId) {
  return legalDocRecords.find((r) => r.agentId === agentId) || null;
}

function getRequest(agentId, requestId) {
  const record = getLegalDocRecord(agentId);
  return record?.legalAndLoan.legalRequests.find((r) => r.id === requestId) || null;
}

export function updateLegalDocRecord(agentId, patch) {
  const record = getLegalDocRecord(agentId);
  if (!record) return null;
  Object.assign(record.legalAndLoan, patch);
  persist();
  return record;
}

// Sets an agent's overall legal status (good/maybe/bad) and logs a note for it, creating the
// record if one doesn't exist yet. This status is one value per agent (not scoped to any single
// request), so the Agent Connect panel and every Legal Doc side panel read and write the exact
// same field through this one function — editing it anywhere updates it everywhere.
export function setAgentLegalStatus(agentId, { agentName = '', contact = '', kam = '' } = {}, newStatus, user) {
  let record = getLegalDocRecord(agentId);
  const note = { text: `Status set to ${newStatus}`, status: newStatus, time: now(), user };
  if (!record) {
    record = {
      agentId,
      agentName,
      contact,
      kam,
      legalAndLoan: { status: newStatus, notes: [note], legalRequests: [] },
    };
    legalDocRecords.push(record);
  } else {
    record.legalAndLoan.status = newStatus;
    record.legalAndLoan.notes = [...(record.legalAndLoan.notes || []), note];
  }
  persist();
  return record;
}

// The time the agent's current status was actually set — the most recent note carrying a status
// tag, not just the most recent note overall (a later general comment shouldn't look like it
// refreshed the status).
export function getLatestAgentStatusTime(record) {
  const notes = record?.legalAndLoan?.notes || [];
  for (let i = notes.length - 1; i >= 0; i--) {
    if (notes[i].status) return notes[i].time;
  }
  return notes.length ? notes[notes.length - 1].time : null;
}

// legalAndLoan.notes is the agent's status history — each note can optionally tag a new
// good/maybe/bad status, which becomes legalAndLoan.status. A note with no status (status: '') is
// just a freeform comment, same as a plain text log entry.
export function addAgentNote(agentId, text, status = '', user = 'Samarth') {
  const record = getLegalDocRecord(agentId);
  if (!record) return null;
  record.legalAndLoan.notes.push({ text, status, time: now(), user });
  if (status) record.legalAndLoan.status = status;
  persist();
  return record;
}

// request.status is a log array — appending to it both records the change and (via
// effectiveStage, above) is what lets a request lost out of Qualify stay on the Qualify page
// instead of falling back to Leads. `notes` isn't in the schema as given (each status entry is
// just {status, time, user} there) but is kept on the entry anyway since the Qualify/Service
// pages' "Reason" input and Drop Lead's canned note both rely on it.
export function updateRequestStatus(agentId, requestId, status, { notes = '', user = '' } = {}) {
  const request = getRequest(agentId, requestId);
  if (!request) return null;
  if (!Array.isArray(request.status)) request.status = [];
  request.status.push({ status, notes, time: now(), user });
  if (status === 'qualify' && !request.qualifiedBy) request.qualifiedBy = user;
  persist();
  return request;
}

// Nothing else sets qualifiedBy directly — it's otherwise only a side effect of the first
// transition into `qualified` above — so the Qualify page needs this to let a KAM claim or
// reassign a request explicitly.
export function setQualifiedBy(agentId, requestId, user) {
  const request = getRequest(agentId, requestId);
  if (!request) return null;
  request.qualifiedBy = user;
  persist();
  return request;
}

// Same idea as setQualifiedBy, but for the Service stage — nothing else sets salesPoc either.
export function setSalesPoc(agentId, requestId, user) {
  const request = getRequest(agentId, requestId);
  if (!request) return null;
  request.salesPoc = user;
  persist();
  return request;
}

function findService(agentId, requestId, clientIndex, serviceName) {
  const request = getRequest(agentId, requestId);
  const client = request?.clients[clientIndex];
  const service = client?.services.find((s) => s.name === serviceName);
  return service ? { request, service } : {};
}

// Documents tracking — this is how the Service stage shows progress toward a service being
// ready to forward (e.g. "2/4 collected"), per service per client.
export function addDocumentToService(agentId, requestId, clientIndex, serviceName, docName) {
  const { request, service } = findService(agentId, requestId, clientIndex, serviceName);
  if (!service || !docName.trim()) return null;
  if (!service.documents) service.documents = [];
  service.documents.push({ name: docName.trim(), received: false });
  persist();
  return request;
}

export function toggleDocumentReceived(agentId, requestId, clientIndex, serviceName, docIndex) {
  const { request, service } = findService(agentId, requestId, clientIndex, serviceName);
  const doc = service?.documents?.[docIndex];
  if (!doc) return null;
  doc.received = !doc.received;
  persist();
  return request;
}

export function removeDocumentFromService(agentId, requestId, clientIndex, serviceName, docIndex) {
  const { request, service } = findService(agentId, requestId, clientIndex, serviceName);
  if (!service?.documents?.[docIndex]) return null;
  service.documents.splice(docIndex, 1);
  persist();
  return request;
}

// Attaches an uploaded file to a document requirement — uploading it implies it's received.
// `fileUrl` is a local object URL (URL.createObjectURL), so it only stays valid for this
// browser session; there's no real file storage behind this mock backend.
export function attachDocumentFile(agentId, requestId, clientIndex, serviceName, docIndex, { fileName, fileUrl }) {
  const { request, service } = findService(agentId, requestId, clientIndex, serviceName);
  const doc = service?.documents?.[docIndex];
  if (!doc) return null;
  doc.fileName = fileName;
  doc.fileUrl = fileUrl;
  doc.received = true;
  persist();
  return request;
}

export function addClient(agentId, requestId, { pocType, name = '', phone = '' }) {
  const request = getRequest(agentId, requestId);
  if (!request) return null;
  request.clients.push({
    pocType,
    ...(pocType === 'client' ? { name, phone } : {}),
    invoiceId: null,
    paymentReceived: false,
    connections: [],
    services: [],
  });
  persist();
  return request;
}

// The agent-self POC can have zero services, but it can't be removed outright — there always
// needs to be at least one POC on a request, and this is the one that starts out there.
export function removeClient(agentId, requestId, clientIndex) {
  const request = getRequest(agentId, requestId);
  const client = request?.clients[clientIndex];
  if (!client || client.pocType === 'agent') return request || null;
  request.clients.splice(clientIndex, 1);
  persist();
  return request;
}

export function updateClient(agentId, requestId, clientIndex, patch) {
  const request = getRequest(agentId, requestId);
  const client = request?.clients[clientIndex];
  if (!client) return null;
  Object.assign(client, patch);
  persist();
  return request;
}

// The "-" counterpart to addServiceToClient: decrements qty, or drops the service entirely once
// qty would hit 0.
export function removeServiceFromClient(agentId, requestId, clientIndex, serviceName) {
  const request = getRequest(agentId, requestId);
  const client = request?.clients[clientIndex];
  if (!client) return null;
  const idx = client.services.findIndex((s) => s.name === serviceName);
  if (idx === -1) return request;
  const service = client.services[idx];
  if ((service.qty || 1) > 1) {
    service.qty -= 1;
  } else {
    client.services.splice(idx, 1);
  }
  persist();
  return request;
}

// Adding a service that's already on this client bumps its `qty` instead of being a no-op — a
// client can want, say, two separate E-Khata cases. `qty` isn't in the schema as given; it's added
// because nothing else there lets the same service be requested more than once.
export function addServiceToClient(agentId, requestId, clientIndex, serviceName, chargeableAmount = null) {
  const request = getRequest(agentId, requestId);
  const client = request?.clients[clientIndex];
  if (!client) return null;
  const existing = client.services.find((s) => s.name === serviceName);
  if (existing) {
    existing.qty = (existing.qty || 1) + 1;
  } else {
    client.services.push({
      id: `svc_${now()}_${Math.round(Math.random() * 1000)}`,
      name: serviceName,
      documentsReceived: false,
      advanceReceived: false,
      vaultServiceId: null,
      lost: false,
      qty: 1,
      chargeableAmount,
      documents: [],
      status: 'negotiation',
    });
  }
  persist();
  return request;
}

// Sets (not increments) a service's negotiated price — used by the Service page's quick-add
// form, since the Service page's panel no longer lets anyone edit a service after creation.
export function setServiceChargeableAmount(agentId, requestId, clientIndex, serviceName, amount) {
  const request = getRequest(agentId, requestId);
  const service = request?.clients[clientIndex]?.services.find((s) => s.name === serviceName);
  if (!service) return null;
  service.chargeableAmount = amount;
  persist();
  return request;
}

export function addClientConnection(
  agentId,
  requestId,
  clientIndex,
  { status, position = 'lead', notes = '', topics = [], connectMedium = 'on call', direction = 'outbound', user = 'Samarth' }
) {
  const request = getRequest(agentId, requestId);
  const client = request?.clients[clientIndex];
  if (!client) return null;
  const time = now();
  client.connections.push({
    id: `conn_${time}_${Math.round(Math.random() * 1000)}`,
    timestamp: time,
    time,
    kamId: user.toLowerCase(),
    kamName: user,
    user,
    medium: connectMedium,
    connectMedium,
    direction,
    status,
    notes,
    callbackAt: null,
    position,
    topics,
  });
  persist();
  return request;
}

export function addLeadRequest({ agentId, agentName, contact = '', kam = KAM_OPTIONS[0].value, source, serviceName }) {
  let record = getLegalDocRecord(agentId);
  if (!record) {
    record = {
      agentId,
      agentName,
      contact,
      kam,
      legalAndLoan: {
        status: 'maybe',
        notes: [{ text: `New lead added via ${source}`, status: 'maybe', time: now(), user: kam }],
        legalRequests: [],
      },
    };
    legalDocRecords.push(record);
  }
  const nextId = pad2(record.legalAndLoan.legalRequests.length + 1);
  const request = {
    id: nextId,
    source,
    createdAt: now(),
    status: [{ status: 'lead', time: now(), user: kam }],
    leadBy: kam,
    qualifiedBy: null,
    salesPoc: null,
    clients: [
      {
        pocType: 'agent',
        invoiceId: null,
        paymentReceived: false,
        connections: [],
        services: [
          {
            id: `svc_${now()}`,
            name: serviceName,
            documentsReceived: false,
            advanceReceived: false,
            vaultServiceId: null,
            lost: false,
            qty: 1,
            chargeableAmount: null,
            documents: [],
            status: 'negotiation',
          },
        ],
      },
    ],
  };
  record.legalAndLoan.legalRequests.push(request);
  persist();
  return request;
}

export function resetLegalDocData() {
  legalDocRecords = buildSeedRecords();
  persist();
  return legalDocRecords;
}

export function optionLabel(options, value) {
  return options.find((o) => o.value === value)?.label || value;
}
