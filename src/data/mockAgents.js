import { digitsOf } from '../utils/phone';

export const mockStats = [
  { label: 'Total Agents', value: '2615' },
  { label: 'Interested', value: '1274' },
  { label: 'Calls', value: '86' },
  { label: 'Connects', value: '53' },
  { label: 'Call Back', value: '0' },
  { label: 'RNR', value: '33' },
  { label: 'Enquiry', value: '39' },
  { label: 'Agents Enquired', value: '24' },
];

export const CONNECT_DIRECTION_OPTIONS = [
  { value: 'outbound', label: 'Outbound' },
  { value: 'inbound', label: 'Inbound' },
];

export const CONNECT_MEDIUM_OPTIONS = [
  { value: 'on call', label: 'On Call' },
  { value: 'on whatsapp', label: 'On WhatsApp' },
];

export const CONNECTION_STATUS_OPTIONS = [
  { value: 'connected', label: 'Connected' },
  { value: 'not connected', label: 'Not Connected' },
  { value: 'call back', label: 'Call Back' },
];

export const CONNECT_TOPIC_OPTIONS = [
  { value: 'inventory', label: 'Inventory' },
  { value: 'enquiry', label: 'Enquiry' },
  { value: 'mashal_ai', label: 'Masal AI' },
  { value: 'primary', label: 'Primary' },
  { value: 'services', label: 'Services' },
  { value: 'loan', label: 'Loan' },
];

// Appends a connect-history entry for an agent and, for a "call back" outcome,
// records/updates that KAM's pending callback so the sidebar's callback
// banner always reflects the latest scheduled one.
export function addConnectHistoryEntry(agentId, entry) {
  const agent = mockAgents.find((a) => a.agentId === agentId);
  if (!agent) return null;

  const newEntry = {
    id: `ch_${Date.now()}`,
    timestamp: Date.now(),
    direction: '',
    connectMedium: '',
    connection: '',
    note: '',
    topics: [],
    callbackAt: null,
    ...entry,
  };

  agent.connectHistory = [...(agent.connectHistory || []), newEntry];

  if (newEntry.connection === 'call back' && newEntry.callbackAt && newEntry.kamId) {
    agent.nextCallbacks = {
      ...(agent.nextCallbacks || {}),
      [newEntry.kamId]: { at: newEntry.callbackAt, entryId: newEntry.id },
    };
  }

  return newEntry;
}

export const mockAgents = [
  {
    id: 9,
    name: 'Ramesh Gowda',
    contact: '+919845019980',
    agentId: 'CPC980',
    plan: 'Premium',
    credits: 300,
    renewal: 'In 90 days',
    inventories: 8,
    enquiriesDid: 20,
    enquiriesRec: 14,
    lastConnected: '2 hours ago',
    lastTried: '2 hours ago',
    lastStatus: 'Connected',
    kam: 'Sandeep',
    agentStatus: 'Interested',
  },
  {
    id: 10,
    name: 'Deepika Nair',
    contact: '+919845019981',
    agentId: 'CPC981',
    plan: 'Trial',
    credits: 100,
    renewal: 'In 29 days',
    inventories: 0,
    enquiriesDid: 0,
    enquiriesRec: 0,
    lastConnected: 'Never',
    lastTried: 'Never',
    lastStatus: 'No Contact',
    kam: 'Siddharth',
    agentStatus: 'Not Contact',
  },
  {
    id: 1,
    name: 'Vedamurthy N',
    contact: '+919886114107',
    agentId: 'CPC968',
    plan: 'Trial',
    credits: 100,
    renewal: 'In 29 days',
    inventories: 0,
    enquiriesDid: 0,
    enquiriesRec: 0,
    lastConnected: '1 hour ago',
    lastTried: '1 hour ago',
    lastStatus: 'Connected',
    kam: 'Sandeep',
    agentStatus: 'Interested',
    connectHistory: [
      {
        id: 'ch_1001',
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 3,
        kamId: 'sandeep',
        kamName: 'Sandeep',
        direction: 'outbound',
        connectMedium: 'on call',
        connection: 'not connected',
        note: 'RNR, will retry tomorrow.',
        topics: ['primary'],
        callbackAt: null,
      },
      {
        id: 'ch_1002',
        timestamp: Date.now() - 1000 * 60 * 60 * 20,
        kamId: 'sandeep',
        kamName: 'Sandeep',
        direction: 'outbound',
        connectMedium: 'on whatsapp',
        connection: 'call back',
        note: 'Asked to call back after 6pm, interested in inventory listing.',
        topics: ['inventory', 'primary'],
        callbackAt: Date.now() + 1000 * 60 * 60 * 5,
      },
      {
        id: 'ch_1003',
        timestamp: Date.now() - 1000 * 60 * 60,
        kamId: 'sandeep',
        kamName: 'Sandeep',
        direction: 'inbound',
        connectMedium: 'on call',
        connection: 'connected',
        note: 'Asked about Masal AI credits and loan services.',
        topics: ['mashal_ai', 'loan'],
        callbackAt: null,
      },
    ],
    nextCallbacks: {
      sandeep: { at: Date.now() + 1000 * 60 * 60 * 5, entryId: 'ch_1002' },
    },
  },
  {
    id: 2,
    name: 'Sahul (Internal)',
    contact: '+918310323438',
    agentId: 'CPC964',
    plan: 'Trial',
    credits: 100,
    renewal: 'In 29 days',
    inventories: 0,
    enquiriesDid: 0,
    enquiriesRec: 0,
    lastConnected: 'Never',
    lastTried: 'Never',
    lastStatus: 'Not Contact',
    kam: 'Rasranjan',
    agentStatus: 'Not Contact'
  },
  {
    id: 3,
    name: 'Sagardeep (Internal)',
    contact: '+919071593782',
    agentId: 'CPC965',
    plan: 'Premium',
    credits: 500,
    renewal: 'In 180 days',
    inventories: 12,
    enquiriesDid: 45,
    enquiriesRec: 32,
    lastConnected: '2 days ago',
    lastTried: '2 days ago',
    lastStatus: 'Connected',
    kam: 'Siddharth',
    agentStatus: 'Active',
    connectHistory: [
      {
        id: 'ch_2001',
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 4,
        kamId: 'siddharth',
        kamName: 'Siddharth',
        direction: 'outbound',
        connectMedium: 'on call',
        connection: 'rnr1',
        note: 'Did not pick up, will try again.',
        topics: ['enquiry'],
        callbackAt: null,
      },
      {
        id: 'ch_2002',
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 2,
        kamId: 'siddharth',
        kamName: 'Siddharth',
        direction: 'outbound',
        connectMedium: 'on call',
        connection: 'connected',
        note: 'Wants to list 3 more inventories this week.',
        topics: ['inventory'],
        callbackAt: null,
      },
    ],
  },
  {
    id: 4,
    name: 'Mangal',
    contact: '+919916735999',
    agentId: 'CPC969',
    plan: 'Basic',
    credits: 50,
    renewal: 'In 14 days',
    inventories: 3,
    enquiriesDid: 8,
    enquiriesRec: 2,
    lastConnected: 'Never',
    lastTried: '1 hour ago',
    lastStatus: 'Connected',
    kam: 'Surendra',
    agentStatus: 'Not Contact',
    connectHistory: [
      {
        id: 'ch_2101',
        timestamp: Date.now() - 1000 * 60 * 60 * 3,
        kamId: 'surendra',
        kamName: 'Surendra',
        direction: 'inbound',
        connectMedium: 'on whatsapp',
        connection: 'call back',
        note: 'Wants to discuss loan against property for a client, asked to call back tomorrow morning.',
        topics: ['loan', 'services'],
        callbackAt: Date.now() + 1000 * 60 * 60 * 18,
      },
    ],
    nextCallbacks: {
      surendra: { at: Date.now() + 1000 * 60 * 60 * 18, entryId: 'ch_2101' },
    },
  },
  {
    id: 5,
    name: 'Raj shekar',
    contact: '+919965011885',
    agentId: 'CPC959',
    plan: 'Basic',
    credits: 5,
    renewal: 'In 28 days',
    inventories: 0,
    enquiriesDid: 0,
    enquiriesRec: 0,
    lastConnected: 'Never',
    lastTried: 'Never',
    lastStatus: 'No Contact',
    kam: 'Qalandar',
    agentStatus: 'Not Contact'
  },
  {
    id: 6,
    name: 'Priya Sharma',
    contact: '+919876543210',
    agentId: 'CPC970',
    plan: 'Premium',
    credits: 450,
    renewal: 'In 150 days',
    inventories: 25,
    enquiriesDid: 78,
    enquiriesRec: 56,
    lastConnected: '3 hours ago',
    lastTried: '3 hours ago',
    lastStatus: 'Connected',
    kam: 'Sandeep',
    agentStatus: 'Active',
    connectHistory: [
      {
        id: 'ch_2201',
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 5,
        kamId: 'sandeep',
        kamName: 'Sandeep',
        direction: 'outbound',
        connectMedium: 'on call',
        connection: 'rnr1',
        note: 'No answer, tried again later same day.',
        topics: ['primary'],
        callbackAt: null,
      },
      {
        id: 'ch_2202',
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 5 + 1000 * 60 * 60 * 2,
        kamId: 'sandeep',
        kamName: 'Sandeep',
        direction: 'outbound',
        connectMedium: 'on call',
        connection: 'rnr2',
        note: 'Still no answer.',
        topics: ['primary'],
        callbackAt: null,
      },
      {
        id: 'ch_2203',
        timestamp: Date.now() - 1000 * 60 * 60 * 3,
        kamId: 'sandeep',
        kamName: 'Sandeep',
        direction: 'inbound',
        connectMedium: 'on whatsapp',
        connection: 'connected',
        note: 'Asked about Masal AI for her team, very interested.',
        topics: ['mashal_ai', 'primary'],
        callbackAt: null,
      },
      {
        id: 'ch_2204',
        timestamp: Date.now() - 1000 * 60 * 60 * 26,
        kamId: 'sandeep',
        kamName: 'Sandeep',
        direction: 'outbound',
        connectMedium: 'on call',
        connection: 'call back',
        note: 'Asked to call back the next morning.',
        topics: ['primary'],
        callbackAt: Date.now() - 1000 * 60 * 60 * 2,
      },
    ],
    nextCallbacks: {
      sandeep: { at: Date.now() - 1000 * 60 * 60 * 2, entryId: 'ch_2204' },
    },
  },
  {
    id: 7,
    name: 'Kumar Ravi',
    contact: '+919988776655',
    agentId: 'CPC971',
    plan: 'Trial',
    credits: 95,
    renewal: 'In 25 days',
    inventories: 1,
    enquiriesDid: 2,
    enquiriesRec: 0,
    lastConnected: 'Never',
    lastTried: '5 hours ago',
    lastStatus: 'RNR',
    kam: 'Rasranjan',
    agentStatus: 'Not Contact'
  },
  {
    id: 8,
    name: 'Anita Desai',
    contact: '+919012345678',
    agentId: 'CPC972',
    plan: 'Basic',
    credits: 20,
    renewal: 'In 7 days',
    inventories: 5,
    enquiriesDid: 12,
    enquiriesRec: 8,
    lastConnected: '1 day ago',
    lastTried: '1 day ago',
    lastStatus: 'Connected',
    kam: 'Siddharth',
    agentStatus: 'Interested',
    connectHistory: [
      {
        id: 'ch_2301',
        timestamp: Date.now() - 1000 * 60 * 60 * 24,
        kamId: 'siddharth',
        kamName: 'Siddharth',
        direction: 'inbound',
        connectMedium: 'on whatsapp',
        connection: 'connected',
        note: 'Asked how to raise an enquiry for a client property.',
        topics: ['enquiry'],
        callbackAt: null,
      },
    ],
  },
  {
    id: 9,
    name: 'Karthik Rajan',
    contact: '+919845098712',
    agentId: 'CPC975',
    plan: 'Premium',
    credits: 320,
    renewal: 'In 60 days',
    inventories: 14,
    enquiriesDid: 22,
    enquiriesRec: 9,
    lastConnected: '1 day ago',
    lastTried: '1 day ago',
    lastStatus: 'Call Back',
    kam: 'Samarth',
    agentStatus: 'Interested',
    connectHistory: [
      {
        id: 'ch_2401',
        timestamp: Date.now() - 1000 * 60 * 60 * 20,
        kamId: 'samarth',
        kamName: 'Samarth',
        direction: 'outbound',
        connectMedium: 'on call',
        connection: 'call back',
        note: 'Wants to discuss renewal pricing before he decides, asked to call tomorrow afternoon.',
        topics: ['primary'],
        callbackAt: Date.now() + 1000 * 60 * 60 * 24 * 14 + 1000 * 60 * 60 * 6,
      },
    ],
    nextCallbacks: {
      samarth: { at: Date.now() + 1000 * 60 * 60 * 24 * 14 + 1000 * 60 * 60 * 6, entryId: 'ch_2401' },
    },
  },
  {
    id: 10,
    name: 'Meenal Joshi',
    contact: '+919845098713',
    agentId: 'CPC976',
    plan: 'Trial',
    credits: 100,
    renewal: 'In 20 days',
    inventories: 2,
    enquiriesDid: 4,
    enquiriesRec: 1,
    lastConnected: '2 days ago',
    lastTried: '2 days ago',
    lastStatus: 'Call Back',
    kam: 'Samarth',
    agentStatus: 'Interested',
    connectHistory: [
      {
        id: 'ch_2402',
        timestamp: Date.now() - 1000 * 60 * 60 * 30,
        kamId: 'samarth',
        kamName: 'Samarth',
        direction: 'outbound',
        connectMedium: 'on whatsapp',
        connection: 'call back',
        note: 'Travelling, asked to call back once she lands this evening.',
        topics: ['enquiry'],
        callbackAt: Date.now() - 1000 * 60 * 60 * 4,
      },
    ],
    nextCallbacks: {
      samarth: { at: Date.now() - 1000 * 60 * 60 * 4, entryId: 'ch_2402' },
    },
  },
  {
    id: 11,
    name: 'Rohit Bhatia',
    contact: '+919845098714',
    agentId: 'CPC977',
    plan: 'Basic',
    credits: 60,
    renewal: 'In 10 days',
    inventories: 1,
    enquiriesDid: 2,
    enquiriesRec: 0,
    lastConnected: '3 days ago',
    lastTried: '3 days ago',
    lastStatus: 'Call Back',
    kam: 'Samarth',
    agentStatus: 'Interested',
    connectHistory: [
      {
        id: 'ch_2403',
        timestamp: Date.now() - 1000 * 60 * 60 * 50,
        kamId: 'samarth',
        kamName: 'Samarth',
        direction: 'outbound',
        connectMedium: 'on call',
        connection: 'call back',
        note: 'Was in a meeting, asked to try again same time next day.',
        topics: ['inventory'],
        callbackAt: Date.now() - 1000 * 60 * 60 * 26,
      },
    ],
    nextCallbacks: {
      samarth: { at: Date.now() - 1000 * 60 * 60 * 26, entryId: 'ch_2403' },
    },
  },
  {
    id: 12,
    name: 'Divya Kulkarni',
    contact: '+919845098715',
    agentId: 'CPC978',
    plan: 'Premium',
    credits: 280,
    renewal: 'In 40 days',
    inventories: 9,
    enquiriesDid: 15,
    enquiriesRec: 6,
    lastConnected: '4 hours ago',
    lastTried: '4 hours ago',
    lastStatus: 'Call Back',
    kam: 'Samarth',
    agentStatus: 'Interested',
    connectHistory: [
      {
        id: 'ch_2404',
        timestamp: Date.now() - 1000 * 60 * 60 * 4,
        kamId: 'samarth',
        kamName: 'Samarth',
        direction: 'inbound',
        connectMedium: 'on call',
        connection: 'call back',
        note: 'Wants a detailed walkthrough of the Masal AI credit system before renewing her plan, also asked whether the referral payout structure has changed this quarter and if older inventories need to be re-verified.',
        topics: ['mashal_ai', 'primary'],
        callbackAt: Date.now() + 1000 * 60 * 60 * 24 * 14 + 1000 * 60 * 60 * 2,
      },
    ],
    nextCallbacks: {
      samarth: { at: Date.now() + 1000 * 60 * 60 * 24 * 14 + 1000 * 60 * 60 * 2, entryId: 'ch_2404' },
    },
  },
  {
    id: 13,
    name: 'Arvind Nambiar',
    contact: '+919845098716',
    agentId: 'CPC979',
    plan: 'Trial',
    credits: 100,
    renewal: 'In 25 days',
    inventories: 0,
    enquiriesDid: 1,
    enquiriesRec: 0,
    lastConnected: '1 day ago',
    lastTried: '1 day ago',
    lastStatus: 'Call Back',
    kam: 'Samarth',
    agentStatus: 'Interested',
    connectHistory: [
      {
        id: 'ch_2405',
        timestamp: Date.now() - 1000 * 60 * 60 * 10,
        kamId: 'samarth',
        kamName: 'Samarth',
        direction: 'outbound',
        connectMedium: 'on whatsapp',
        connection: 'call back',
        note: 'Asked to call back after his client meeting ends.',
        topics: ['enquiry'],
        callbackAt: Date.now() + 1000 * 60 * 60 * 24 * 14 + 1000 * 60 * 60 * 9,
      },
    ],
    nextCallbacks: {
      samarth: { at: Date.now() + 1000 * 60 * 60 * 24 * 14 + 1000 * 60 * 60 * 9, entryId: 'ch_2405' },
    },
  }
];

// Every pending callback across every agent, flattened — one entry per (agent, KAM) pair, since
// nextCallbacks is keyed by kamId. Used by the Home page's callback list, same data the Agent
// Connect panel's banner reads per-agent. Pass a kamId to see only that KAM's own callbacks —
// the Home page's "mine" view, not everyone's.
export function getAllPendingCallbacks(kamId) {
  const out = [];
  mockAgents.forEach((agent) => {
    Object.entries(agent.nextCallbacks || {}).forEach(([entryKamId, cb]) => {
      if (kamId && entryKamId !== kamId) return;
      const sourceEntry = (agent.connectHistory || []).find((h) => h.id === cb.entryId);
      out.push({
        agentId: agent.agentId,
        agentName: agent.name,
        contact: agent.contact,
        kamId: entryKamId,
        kamName: sourceEntry?.kamName || entryKamId,
        note: sourceEntry?.note || '',
        topics: sourceEntry?.topics || [],
        at: cb.at,
      });
    });
  });
  return out.sort((a, b) => a.at - b.at);
}

// Clears one KAM's pending callback for an agent — called once the KAM has actually made that
// call, from either the Agent Connect panel's banner or the Home page's callback list.
export function resolveCallback(agentId, kamId) {
  const agent = mockAgents.find((a) => a.agentId === agentId);
  if (!agent || !agent.nextCallbacks) return;
  const next = { ...agent.nextCallbacks };
  delete next[kamId];
  agent.nextCallbacks = next;
}

function nextAgentId() {
  const max = mockAgents.reduce((m, a) => {
    const n = parseInt(String(a.agentId || '').replace('CPC', ''), 10);
    return Number.isFinite(n) && n > m ? n : m;
  }, 980);
  return `CPC${max + 1}`;
}

// Promotes a verified lead into a real agent record — used by the Leads panel's "Verify & Create
// Agent" action. Takes whatever the verification form collected and fills in the rest of the
// fields AgentsTable/AgentDetailsPage expect so the new row renders the same as any other agent.
export function addAgent(data) {
  const agent = {
    id: Math.max(0, ...mockAgents.map((a) => a.id)) + 1,
    agentId: nextAgentId(),
    name: data.name,
    contact: data.phone,
    email: data.email || '',
    address: data.address || '',
    rera: data.rera || '',
    workingAs: data.workingAs || 'individual',
    firm: data.workingAs === 'firm' ? data.firm || '' : '',
    firmSize: data.workingAs === 'firm' ? data.firmSize || '' : '',
    kam: data.kam || '',
    areaOfOperation: data.areaOfOperation || [],
    businessCategory: data.businessCategory || [],
    yearsOfExperience: data.yearsOfExperience || '',
    alternateNumber: data.alternateNumber || '',
    gst: data.gst || '',
    heardFrom: data.heardFrom || '',
    bio: data.bio || '',
    profileImageUrl: data.profileImageUrl || '',
    languages: data.languages || [],
    leadSource: data.leadSource || 'direct',
    plan: 'Trial',
    credits: 100,
    renewal: 'In 29 days',
    inventories: 0,
    enquiriesDid: 0,
    enquiriesRec: 0,
    lastConnected: 'Never',
    lastTried: 'Never',
    lastStatus: 'No Contact',
    agentStatus: 'Interested',
  };
  mockAgents.push(agent);
  return agent;
}

// Looks up an agent by phone number regardless of formatting (+91 98450 11287 vs 9845011287) —
// used by the Legal Doc "Add Lead" flow to detect whether a typed number already belongs to an
// agent before creating a fresh lead for it.
export function findAgentByPhone(phone) {
  const digits = digitsOf(phone);
  return digits.length === 10 ? mockAgents.find((a) => digitsOf(a.contact) === digits) || null : null;
}

