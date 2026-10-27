import { digitsOf } from '../utils/phone';

export const mockLeadsStats = [
  { label: 'Total Leads', value: '16267' },
  { label: 'Not Contacted', value: '1' },
  { label: 'Total Interested', value: '2' },
  { label: 'Total Verified', value: '7' },
  { label: 'Calls', value: '80' },
  { label: 'Connects', value: '43' },
  { label: 'Call Back', value: '2' },
  { label: 'RNR', value: '37' },
];

export const mockLeads = [
  {
    id: 1,
    leadId: 'LDB9024',
    name: '-',
    contact: '+919999999993',
    verificationStatus: 'Not Started',
    lastTried: '32 minutes ago',
    lastConnect: 'Never',
    leadStatus: 'No Contact Yet',
    connectStatus: 'RNR-1',
    kam: 'Sandeep',
    source: 'direct',
    joinedCommunity: false,
    onBroadcast: false,
    connectHistory: [
      {
        id: 'ch_lead_1001',
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 2,
        kamId: 'sandeep',
        kamName: 'Sandeep',
        direction: 'outbound',
        connectMedium: 'on call',
        connection: 'call back',
        note: 'Asked to call back after work hours.',
        callbackAt: Date.now() - 1000 * 60 * 60 * 20,
      },
      {
        id: 'ch_lead_1002',
        timestamp: Date.now() - 1000 * 60 * 32,
        kamId: 'sandeep',
        kamName: 'Sandeep',
        direction: 'outbound',
        connectMedium: 'on call',
        connection: 'rnr1',
        note: '',
        callbackAt: null,
      },
    ],
  },
  {
    id: 2,
    leadId: 'LDB9021',
    name: '-',
    contact: '+918105063334',
    verificationStatus: 'Not Started',
    lastTried: '1 hour ago',
    lastConnect: '1 hour ago',
    leadStatus: 'Interested',
    connectStatus: 'Connected',
    kam: 'Sandeep',
    source: 'organic',
    joinedCommunity: false,
    onBroadcast: false
  },
  {
    id: 3,
    leadId: 'LDB9020',
    name: '-',
    contact: '+918971920860',
    verificationStatus: 'Not Started',
    lastTried: '1 hour ago',
    lastConnect: '1 hour ago',
    leadStatus: 'Interested',
    connectStatus: 'Connected',
    kam: 'Sandeep',
    source: 'organic',
    joinedCommunity: false,
    onBroadcast: false
  },
  {
    id: 4,
    leadId: 'LDB9019',
    name: '-',
    contact: '+919886079465',
    verificationStatus: 'Not Started',
    lastTried: '1 hour ago',
    lastConnect: 'Never',
    leadStatus: 'Select Status',
    connectStatus: 'Not Contacted Yet',
    kam: 'Sandeep',
    source: 'organic',
    joinedCommunity: false,
    onBroadcast: false
  },
  {
    id: 5,
    leadId: 'LDB9018',
    name: '-',
    contact: '+919900166502',
    verificationStatus: 'Not Started',
    lastTried: '1 hour ago',
    lastConnect: 'Never',
    leadStatus: 'Select Status',
    connectStatus: 'Not Contacted Yet',
    kam: 'Sandeep',
    source: 'organic',
    joinedCommunity: false,
    onBroadcast: false
  },
  {
    id: 6,
    leadId: 'LDB9017',
    name: '-',
    contact: '+919901436190',
    verificationStatus: 'Not Started',
    lastTried: '1 hour ago',
    lastConnect: 'Never',
    leadStatus: 'Select Status',
    connectStatus: 'Not Contacted Yet',
    kam: 'Sandeep',
    source: 'organic',
    joinedCommunity: false,
    onBroadcast: false
  },
  {
    id: 7,
    leadId: 'LDB9016',
    name: '-',
    contact: '+918884745748',
    verificationStatus: 'Not Started',
    lastTried: '1 hour ago',
    lastConnect: 'Never',
    leadStatus: 'Select Status',
    connectStatus: 'Not Contacted Yet',
    kam: 'Sandeep',
    source: 'organic',
    joinedCommunity: false,
    onBroadcast: false
  },
  {
    id: 8,
    leadId: 'LDB9015',
    name: '-',
    contact: '+918951876815',
    verificationStatus: 'Not Started',
    lastTried: '1 hour ago',
    lastConnect: 'Never',
    leadStatus: 'Not Interested',
    connectStatus: 'Not Contacted Yet',
    kam: 'Sandeep',
    source: 'organic',
    joinedCommunity: false,
    onBroadcast: false
  },
  {
    id: 9,
    leadId: 'LDB9013',
    name: '-',
    contact: '+919900004902',
    verificationStatus: 'Not Started',
    lastTried: '43 minutes ago',
    lastConnect: 'Never',
    leadStatus: 'Select Status',
    connectStatus: 'Not Contacted Yet',
    kam: 'Sandeep',
    source: 'organic',
    joinedCommunity: false,
    onBroadcast: false
  },
  {
    id: 10,
    leadId: 'LDB9012',
    name: '-',
    contact: '+918951984867',
    verificationStatus: 'Not Started',
    lastTried: '43 minutes ago',
    lastConnect: 'Never',
    leadStatus: 'Not Interested',
    connectStatus: 'Not Contacted Yet',
    kam: 'Sandeep',
    source: 'organic',
    joinedCommunity: false,
    onBroadcast: false
  }
];

// Mutates the in-memory list in place (same pattern as updateEcScrape) so LeadsTable's row
// panel can log a connect outcome and have it show up immediately in the table/stats.
export function updateLead(id, patch) {
  const lead = mockLeads.find((l) => l.id === id);
  if (!lead) return null;
  Object.assign(lead, patch);
  return lead;
}

// Same shape and behavior as mockAgents.js's addConnectHistoryEntry — appends a history entry
// and, for a "call back" outcome, records that KAM's pending callback.
export function addLeadConnectHistoryEntry(leadId, entry) {
  const lead = mockLeads.find((l) => l.id === leadId);
  if (!lead) return null;

  const newEntry = {
    id: `ch_${Date.now()}`,
    timestamp: Date.now(),
    direction: '',
    connectMedium: '',
    connection: '',
    note: '',
    callbackAt: null,
    ...entry,
  };

  lead.connectHistory = [...(lead.connectHistory || []), newEntry];

  if (newEntry.connection === 'call back' && newEntry.callbackAt && newEntry.kamId) {
    lead.nextCallbacks = {
      ...(lead.nextCallbacks || {}),
      [newEntry.kamId]: { at: newEntry.callbackAt, entryId: newEntry.id },
    };
  }

  return newEntry;
}

// Clears one KAM's pending callback for a lead — mirrors mockAgents.js's resolveCallback.
export function resolveLeadCallback(leadId, kamId) {
  const lead = mockLeads.find((l) => l.id === leadId);
  if (!lead || !lead.nextCallbacks) return;
  const next = { ...lead.nextCallbacks };
  delete next[kamId];
  lead.nextCallbacks = next;
}

// Looks up a lead by phone number regardless of formatting — same matching rule as
// mockAgents.js's findAgentByPhone, so a number can be checked against both lists the same way.
export function findLeadByPhone(phone) {
  const digits = digitsOf(phone);
  return digits.length === 10 ? mockLeads.find((l) => digitsOf(l.contact) === digits) || null : null;
}

function nextLeadId() {
  let id;
  do {
    id = `LDX${Math.floor(1000 + Math.random() * 9000)}`;
  } while (mockLeads.some((l) => l.leadId === id));
  return id;
}

// Creates a brand-new lead from scratch — used by the Legal Doc "Add Lead" flow when a typed
// phone number matches no existing agent or lead, so it still lands in the main Leads list
// (not just the Legal Doc pipeline) with its originating source recorded.
export function addLead(data) {
  const lead = {
    id: Math.max(0, ...mockLeads.map((l) => l.id)) + 1,
    leadId: nextLeadId(),
    name: data.name?.trim() || '-',
    contact: data.contact || '',
    verificationStatus: 'Not Started',
    lastTried: 'Never',
    lastConnect: 'Never',
    leadStatus: 'No Contact Yet',
    connectStatus: 'Not Contacted Yet',
    kam: data.kam || 'Sandeep',
    source: data.source || 'direct',
    joinedCommunity: false,
    onBroadcast: false,
  };
  mockLeads.push(lead);
  return lead;
}
