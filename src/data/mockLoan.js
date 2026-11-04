// Fake in-memory "backend" for the Home Loan module — mirrors the Legal & Doc module's shape
// (mockLegalDoc.js) but for Home Loan's own three pages: Agents, Leads, Cases.

import { digitsOf } from '../utils/phone';

export const LOAN_KAM_OPTIONS = ['Samarth', 'Sandeep', 'Rasranjan', 'Siddharth', 'Surendra', 'Qalandar'];

export const LOAN_SOURCE_OPTIONS = ['App', 'Marketing', 'Referral', 'Direct'];

export const LOAN_CONNECTION_SOURCE_OPTIONS = ['On Call', 'WhatsApp', 'App'];
export const LOAN_CONNECTION_SOURCE_STYLES = {
  'On Call': 'bg-blue-100 text-blue-700',
  WhatsApp: 'bg-emerald-100 text-emerald-700',
  App: 'bg-neutral-100 text-neutral-600',
};

// Agents page — tracks whether an agent has shared a home loan lead yet.
// Colors match the Legal & Doc tables' badge styling (bg-*-100); amber uses text-amber-600 — not
// Legal Doc's text-amber-500, which reads too faint against the bg-amber-100 fill to be legible.
export const LOAN_AGENT_STATUS_OPTIONS = ['New', 'Lead Shared', 'Lost'];
export const LOAN_AGENT_STATUS_STYLES = {
  New: 'bg-blue-100 text-blue-700',
  'Lead Shared': 'bg-emerald-100 text-emerald-700',
  Lost: 'bg-red-100 text-red-700',
};

// A separate quality rating for the agent relationship itself — same Good/Maybe/Bad "Agent
// Status" concept used on the Legal & Doc pages, independent of the pipeline status above.
export const LOAN_AGENT_QUALITY_OPTIONS = ['Good', 'Maybe', 'Bad'];
export const LOAN_AGENT_QUALITY_STYLES = {
  Good: 'bg-emerald-100 text-emerald-700',
  Maybe: 'bg-amber-100 text-amber-600',
  Bad: 'bg-red-100 text-red-700',
};

// Leads page — who referred the lead in. Fixed list — never freeform.
export const LOAN_REFERRAL_SOURCE_OPTIONS = ['Agent', 'All Doors', 'Vault', 'Banker', 'Direct', 'Lead'];
// Bordered pill (bg-*-50 + border-*-100), same POC-badge style Legal Doc's Qualify page uses to
// tell Agent/Client referrals apart at a glance in a table cell.
export const LOAN_REFERRAL_SOURCE_STYLES = {
  Agent: 'bg-orange-50 text-orange-700 border border-orange-100',
  'All Doors': 'bg-green-50 text-green-700 border border-green-100',
  Vault: 'bg-blue-50 text-blue-700 border border-blue-100',
  Banker: 'bg-purple-50 text-purple-700 border border-purple-100',
  Direct: 'bg-neutral-50 text-neutral-600 border border-neutral-200',
  Lead: 'bg-yellow-50 text-yellow-700 border border-yellow-100',
};
export const LOAN_LEAD_STATUS_OPTIONS = ['New', 'Lost'];
export const LOAN_LEAD_STATUS_STYLES = {
  New: 'bg-blue-100 text-blue-700',
  Lost: 'bg-red-100 text-red-700',
};

// Cases page — the loan application itself, once a lead converts.
export const LOAN_CASE_STAGE_OPTIONS = ['Case', 'Login', 'Sanctioned', 'Loan Agreement', 'Disbursement', 'Rejected', 'Lost'];

// Searchable dropdown options for the Case panel — seeded from real case data. Both arrays are
// mutable so the user can add new entries from within the panel (they persist for the session).
export const LOAN_PROJECT_OPTIONS = [
  'Prestige Lakeside Habitat',
  'Prestige Falcon City',
  'Sobha Dream Acres',
  'Sobha Royal Pavilion',
  'Brigade Cornerstone Utopia',
  'Godrej Reflections',
  'Purva Atmosphere',
  'Assetz Marq 3.0',
  'Salarpuria Sattva Magnificence',
  'Embassy Springs',
  'Shriram Chirping Woods',
  'Total Environment Windmills',
];

export const LOAN_BANK_OPTIONS = [
  'HDFC Bank',
  'ICICI Bank',
  'State Bank of India',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Bank of Baroda',
  'Punjab National Bank',
  'Bank of India',
  'Canara Bank',
  'LIC Housing Finance',
];
export const LOAN_CASE_STAGE_STYLES = {
  Case: 'bg-neutral-100 text-neutral-600',
  Login: 'bg-indigo-100 text-indigo-700',
  Sanctioned: 'bg-blue-100 text-blue-700',
  'Loan Agreement': 'bg-amber-100 text-amber-600',
  Disbursement: 'bg-emerald-100 text-emerald-700',
  Rejected: 'bg-red-100 text-red-700',
  Lost: 'bg-rose-100 text-rose-700',
};

export const mockLoanAgents = [
  { id: 1, cpid: 'CPC980', time: '27/10/2026', name: 'Ramesh Gowda', number: '+91 98450 19980', status: 'Lead Shared', agentStatus: 'Good', kam: 'Sandeep', source: 'App' },
  {
    id: 2,
    cpid: 'CPC301',
    time: '27/10/2026',
    name: 'Ravi Kumar',
    number: '+91 98450 11301',
    status: 'New',
    agentStatus: 'Maybe',
    kam: 'Sandeep',
    source: 'Marketing',
    connectHistory: [
      {
        id: 'ch_loan_1001',
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 3,
        kamId: 'sandeep',
        kamName: 'Sandeep',
        direction: 'outbound',
        connectMedium: 'on call',
        connection: 'rnr1',
        note: '',
        topics: ['loan'],
        callbackAt: null,
      },
      {
        id: 'ch_loan_1002',
        timestamp: Date.now() - 1000 * 60 * 60 * 20,
        kamId: 'sandeep',
        kamName: 'Sandeep',
        direction: 'outbound',
        connectMedium: 'on call',
        connection: 'connected',
        note: 'Interested in sharing a referral next week, follow up then.',
        topics: ['loan'],
        callbackAt: null,
      },
    ],
  },
  { id: 3, cpid: 'CPC410', time: '26/10/2026', name: 'Nikhil Bansal', number: '+91 98450 11410', status: 'New', agentStatus: 'Good', kam: 'Samarth', source: 'App' },
  { id: 4, cpid: 'CPC448', time: '26/10/2026', name: 'Vikram Joshi', number: '+91 98450 11448', status: 'Lead Shared', agentStatus: 'Good', kam: 'Samarth', source: 'Referral' },
  { id: 5, cpid: 'CPC455', time: '25/10/2026', name: 'Neha Kapoor', number: '+91 98450 11455', status: 'Lost', agentStatus: 'Bad', kam: 'Sandeep', source: 'Marketing' },
  { id: 6, cpid: 'CPC474', time: '25/10/2026', name: 'Abhishek Rao', number: '+91 98450 11474', status: 'New', agentStatus: 'Maybe', kam: 'Surendra', source: 'App' },
  { id: 7, cpid: 'CPC501', time: '24/10/2026', name: 'Ananya Krishnan', number: '+91 98450 11501', status: 'Lead Shared', agentStatus: 'Good', kam: 'Qalandar', source: 'Direct' },
  { id: 8, cpid: 'CPC540', time: '23/10/2026', name: 'Arvind Nair', number: '+91 98450 11540', status: 'New', agentStatus: 'Maybe', kam: 'Qalandar', source: 'App' },
  { id: 9, cpid: 'CPC546', time: '22/10/2026', name: 'Shalini Reddy', number: '+91 98450 11546', status: 'Lost', agentStatus: 'Bad', kam: 'Samarth', source: 'Marketing' },
  { id: 10, cpid: 'CPC968', time: '21/10/2026', name: 'Vedamurthy N', number: '+91 98861 14107', status: 'Lead Shared', agentStatus: 'Good', kam: 'Sandeep', source: 'App' },
  { id: 11, cpid: 'CPC112', time: '20/10/2026', name: 'Pooja Iyer', number: '+91 98450 11112', status: 'New', agentStatus: 'Maybe', kam: 'Rasranjan', source: 'Direct' },
  { id: 12, cpid: 'CPC178', time: '20/10/2026', name: 'Rajesh Khanna', number: '+91 98450 11178', status: 'Lost', agentStatus: 'Bad', kam: 'Siddharth', source: 'Marketing' },
  { id: 13, cpid: 'CPC203', time: '19/10/2026', name: 'Divya Menon', number: '+91 98450 11203', status: 'New', agentStatus: 'Good', kam: 'Surendra', source: 'App' },
  { id: 14, cpid: 'CPC259', time: '19/10/2026', name: 'Suresh Pillai', number: '+91 98450 11259', status: 'Lead Shared', agentStatus: 'Good', kam: 'Qalandar', source: 'Referral' },
  { id: 15, cpid: 'CPC312', time: '18/10/2026', name: 'Kavita Nair', number: '+91 98450 11312', status: 'New', agentStatus: 'Maybe', kam: 'Samarth', source: 'App' },
  { id: 16, cpid: 'CPC367', time: '18/10/2026', name: 'Manoj Tiwari', number: '+91 98450 11367', status: 'Lost', agentStatus: 'Bad', kam: 'Sandeep', source: 'Marketing' },
  { id: 17, cpid: 'CPC389', time: '17/10/2026', name: 'Harish Chandran', number: '+91 98450 11389', status: 'New', agentStatus: 'Good', kam: 'Rasranjan', source: 'Direct' },
  { id: 18, cpid: 'CPC421', time: '17/10/2026', name: 'Farhan Ahmed', number: '+91 98450 11421', status: 'New', agentStatus: 'Maybe', kam: 'Siddharth', source: 'App' },
  { id: 19, cpid: 'CPC456', time: '16/10/2026', name: 'Deepika Shetty', number: '+91 98450 11456', status: 'Lead Shared', agentStatus: 'Good', kam: 'Surendra', source: 'Referral' },
  { id: 20, cpid: 'CPC489', time: '16/10/2026', name: 'Vikas Agarwal', number: '+91 98450 11489', status: 'New', agentStatus: 'Maybe', kam: 'Qalandar', source: 'App' },
  { id: 21, cpid: 'CPC512', time: '15/10/2026', name: 'Sunita Verma', number: '+91 98450 11512', status: 'Lost', agentStatus: 'Bad', kam: 'Samarth', source: 'Marketing' },
  { id: 22, cpid: 'CPC567', time: '15/10/2026', name: 'Rahul Mehta', number: '+91 98450 11567', status: 'New', agentStatus: 'Good', kam: 'Sandeep', source: 'Direct' },
  { id: 23, cpid: 'CPC598', time: '14/10/2026', name: 'Priyanka Das', number: '+91 98450 11598', status: 'New', agentStatus: 'Maybe', kam: 'Rasranjan', source: 'App' },
  { id: 24, cpid: 'CPC612', time: '14/10/2026', name: 'Anil Kumar', number: '+91 98450 11612', status: 'Lead Shared', agentStatus: 'Good', kam: 'Siddharth', source: 'Referral' },
  { id: 25, cpid: 'CPC645', time: '13/10/2026', name: 'Swati Jain', number: '+91 98450 11645', status: 'Lost', agentStatus: 'Bad', kam: 'Surendra', source: 'Marketing' },
  { id: 26, cpid: 'CPC678', time: '13/10/2026', name: 'Gaurav Malhotra', number: '+91 98450 11678', status: 'New', agentStatus: 'Maybe', kam: 'Qalandar', source: 'App' },
  { id: 27, cpid: 'CPC701', time: '12/10/2026', name: 'Meena Pillai', number: '+91 98450 11701', status: 'New', agentStatus: 'Good', kam: 'Samarth', source: 'Direct' },
  { id: 28, cpid: 'CPC734', time: '12/10/2026', name: 'Rajesh Sinha', number: '+91 98450 11734', status: 'Lost', agentStatus: 'Bad', kam: 'Sandeep', source: 'App' },
  { id: 29, cpid: 'CPC767', time: '11/10/2026', name: 'Lakshmi Narayan', number: '+91 98450 11767', status: 'New', agentStatus: 'Maybe', kam: 'Rasranjan', source: 'Marketing' },
  { id: 30, cpid: 'CPC799', time: '11/10/2026', name: 'Vivek Chopra', number: '+91 98450 11799', status: 'Lead Shared', agentStatus: 'Good', kam: 'Siddharth', source: 'Referral' },
];

// A few realistic notes per Agent Status bucket, cycled across the seed rows so the identity
// card's note line (text + "Xd ago by KAM") has something real to show instead of being empty.
const AGENT_STATUS_SEED_NOTES = {
  Good: [
    'Always responsive, shares quality home loan leads regularly.',
    'Reliable agent, clients usually come pre-qualified.',
    'Great relationship, follows up on referrals promptly.',
    'Consistently brings serious buyers looking for home loans.',
  ],
  Maybe: [
    'New agent, still building trust — leads are hit or miss.',
    'Occasionally shares leads, needs more follow-up from our side.',
    'Promising but inconsistent, waiting to see more referrals.',
    'Slow to respond sometimes, but leads have converted before.',
  ],
  Bad: [
    'Leads shared so far have gone cold, low response rate.',
    "Difficult to reach, hasn't shared a quality lead in a while.",
    'Clients referred were not genuinely interested in a loan.',
    'Stopped responding to follow-ups, relationship needs review.',
  ],
};

// Seed each row with a staggered "last changed" time for both statuses, so the table shows
// varied relative times ("Xd ago") the same way the Legal & Doc tables do, without hand-writing
// a timestamp on every row above.
mockLoanAgents.forEach((a, i) => {
  a.agentStatusTime = Date.now() - (i + 2) * 86400000;
  a.agentStatusBy = a.kam;
  a.statusTime = Date.now() - (i + 1) * 86400000;
  const notePool = AGENT_STATUS_SEED_NOTES[a.agentStatus] || AGENT_STATUS_SEED_NOTES.Maybe;
  a.notes = [{ text: notePool[i % notePool.length], time: a.agentStatusTime, user: a.kam }];
});

export const mockLoanLeads = [
  {
    id: 1,
    leadId: 'HLL001',
    name: 'Ramesh Gowda',
    number: '+91 98450 19980',
    date: '27/10/2026',
    referralName: 'Ravi Kumar',
    referralNumber: '+91 98450 11301',
    loan: 'Home Loan',
    referralSource: 'Agent',
    status: 'New',
    kam: 'Sandeep',
    connectionSource: 'On Call',
  },
  {
    id: 2,
    leadId: 'HLL002',
    name: 'Deepa Suresh',
    number: '+91 98450 22310',
    date: '27/10/2026',
    referralName: 'Vault Team',
    referralNumber: '—',
    loan: 'Home Loan',
    referralSource: 'Vault',
    status: 'New',
    kam: 'Samarth',
    connectionSource: 'WhatsApp',
  },
  {
    id: 3,
    leadId: 'HLL003',
    name: 'Mohammed Irfan',
    number: '+91 98450 33421',
    date: '26/10/2026',
    referralName: 'HDFC — Rajiv Menon',
    referralNumber: '+91 98450 00011',
    loan: 'Home Loan',
    referralSource: 'Banker',
    status: 'New',
    kam: 'Rasranjan',
    connectionSource: 'On Call',
  },
  {
    id: 4,
    leadId: 'HLL004',
    name: 'Priya Varma',
    number: '+91 98450 44532',
    date: '25/10/2026',
    referralName: 'All Doors',
    referralNumber: '—',
    loan: 'Home Loan',
    referralSource: 'All Doors',
    status: 'New',
    kam: 'Siddharth',
    connectionSource: 'App',
  },
  {
    id: 5,
    leadId: 'HLL005',
    name: 'Karthik Subramanian',
    number: '+91 98450 55643',
    date: '24/10/2026',
    referralName: 'Vikram Joshi',
    referralNumber: '+91 98450 11448',
    loan: 'Home Loan',
    referralSource: 'Agent',
    status: 'New',
    kam: 'Samarth',
    connectionSource: 'On Call',
  },
  {
    id: 6,
    leadId: 'HLL006',
    name: 'Fathima Noor',
    number: '+91 98450 66754',
    date: '23/10/2026',
    referralName: 'Vault Team',
    referralNumber: '—',
    loan: 'Home Loan',
    referralSource: 'Vault',
    status: 'Lost',
    kam: 'Qalandar',
    connectionSource: 'WhatsApp',
  },
  {
    id: 7,
    leadId: 'HLL007',
    name: 'Arvind Nair',
    number: '+91 98450 11540',
    date: '22/10/2026',
    referralName: 'ICICI — Sunita Pai',
    referralNumber: '+91 98450 00022',
    loan: 'Home Loan',
    referralSource: 'Banker',
    status: 'New',
    kam: 'Qalandar',
    connectionSource: 'On Call',
  },
  {
    id: 8,
    leadId: 'HLL008',
    name: 'Sunil Rao',
    number: '+91 98450 77865',
    date: '21/10/2026',
    referralName: 'Ravi Kumar',
    referralNumber: '+91 98450 11301',
    loan: 'Home Loan',
    referralSource: 'Agent',
    status: 'New',
    kam: 'Sandeep',
    connectionSource: 'On Call',
  },
  {
    id: 9,
    leadId: 'HLL009',
    name: 'Meenakshi Iyer',
    number: '+91 98450 88976',
    date: '21/10/2026',
    referralName: 'Walk-in',
    referralNumber: '—',
    loan: 'Home Loan',
    referralSource: 'Direct',
    status: 'New',
    kam: 'Surendra',
    connectionSource: 'WhatsApp',
  },
  {
    id: 10,
    leadId: 'HLL010',
    name: 'Imran Shaikh',
    number: '+91 98450 99087',
    date: '20/10/2026',
    referralName: 'Axis — Neha Bhatt',
    referralNumber: '+91 98450 00033',
    loan: 'Home Loan',
    referralSource: 'Banker',
    status: 'New',
    kam: 'Rasranjan',
    connectionSource: 'On Call',
  },
  {
    id: 11,
    leadId: 'HLL011',
    name: 'Divya Krishnan',
    number: '+91 98450 10198',
    date: '20/10/2026',
    referralName: 'All Doors',
    referralNumber: '—',
    loan: 'Home Loan',
    referralSource: 'All Doors',
    status: 'Lost',
    kam: 'Siddharth',
    connectionSource: 'App',
  },
  {
    id: 12,
    leadId: 'HLL012',
    name: 'Rohit Malhotra',
    number: '+91 98450 21209',
    date: '19/10/2026',
    referralName: 'Nikhil Bansal',
    referralNumber: '+91 98450 11410',
    loan: 'Home Loan',
    referralSource: 'Agent',
    status: 'New',
    kam: 'Samarth',
    connectionSource: 'On Call',
  },
  {
    id: 13,
    leadId: 'HLL013',
    name: 'Sneha Bhat',
    number: '+91 98450 32310',
    date: '19/10/2026',
    referralName: 'Vault Team',
    referralNumber: '—',
    loan: 'Home Loan',
    referralSource: 'Vault',
    status: 'New',
    kam: 'Qalandar',
    connectionSource: 'WhatsApp',
  },
  {
    id: 14,
    leadId: 'HLL014',
    name: 'Abdul Kareem',
    number: '+91 98450 43421',
    date: '18/10/2026',
    referralName: 'HDFC — Rajiv Menon',
    referralNumber: '+91 98450 00011',
    loan: 'Home Loan',
    referralSource: 'Banker',
    status: 'New',
    kam: 'Sandeep',
    connectionSource: 'On Call',
  },
  {
    id: 15,
    leadId: 'HLL015',
    name: 'Lakshmi Narayan',
    number: '+91 98450 54532',
    date: '18/10/2026',
    referralName: 'Website Lead',
    referralNumber: '—',
    loan: 'Home Loan',
    referralSource: 'Lead',
    status: 'New',
    kam: 'Surendra',
    connectionSource: 'App',
  },
  {
    id: 16,
    leadId: 'HLL016',
    name: 'Faisal Ahmed',
    number: '+91 98450 65643',
    date: '17/10/2026',
    referralName: 'Vikram Joshi',
    referralNumber: '+91 98450 11448',
    loan: 'Home Loan',
    referralSource: 'Agent',
    status: 'New',
    kam: 'Rasranjan',
    connectionSource: 'On Call',
  },
  {
    id: 17,
    leadId: 'HLL017',
    name: 'Pallavi Deshmukh',
    number: '+91 98450 76754',
    date: '17/10/2026',
    referralName: 'ICICI — Sunita Pai',
    referralNumber: '+91 98450 00022',
    loan: 'Home Loan',
    referralSource: 'Banker',
    status: 'Lost',
    kam: 'Siddharth',
    connectionSource: 'On Call',
  },
  {
    id: 18,
    leadId: 'HLL018',
    name: 'Gaurav Khanna',
    number: '+91 98450 87540',
    date: '16/10/2026',
    referralName: 'Vault Team',
    referralNumber: '—',
    loan: 'Home Loan',
    referralSource: 'Vault',
    status: 'New',
    kam: 'Samarth',
    connectionSource: 'WhatsApp',
  },
  {
    id: 19,
    leadId: 'HLL019',
    name: 'Ayesha Siddiqui',
    number: '+91 98450 98546',
    date: '16/10/2026',
    referralName: 'All Doors',
    referralNumber: '—',
    loan: 'Home Loan',
    referralSource: 'All Doors',
    status: 'New',
    kam: 'Qalandar',
    connectionSource: 'App',
  },
  {
    id: 20,
    leadId: 'HLL020',
    name: 'Manish Tiwari',
    number: '+91 98450 19112',
    date: '15/10/2026',
    referralName: 'Ravi Kumar',
    referralNumber: '+91 98450 11301',
    loan: 'Home Loan',
    referralSource: 'Agent',
    status: 'New',
    kam: 'Sandeep',
    connectionSource: 'On Call',
  },
  {
    id: 21,
    leadId: 'HLL021',
    name: 'Kavitha Reddy',
    number: '+91 98450 21178',
    date: '15/10/2026',
    referralName: 'Axis — Neha Bhatt',
    referralNumber: '+91 98450 00033',
    loan: 'Home Loan',
    referralSource: 'Banker',
    status: 'New',
    kam: 'Surendra',
    connectionSource: 'On Call',
  },
  {
    id: 22,
    leadId: 'HLL022',
    name: 'Nitin Agarwal',
    number: '+91 98450 32203',
    date: '14/10/2026',
    referralName: 'App Lead',
    referralNumber: '—',
    loan: 'Home Loan',
    referralSource: 'Lead',
    status: 'Lost',
    kam: 'Rasranjan',
    connectionSource: 'WhatsApp',
  },
  {
    id: 23,
    leadId: 'HLL023',
    name: 'Farheen Khan',
    number: '+91 98450 43259',
    date: '14/10/2026',
    referralName: 'All Doors',
    referralNumber: '—',
    loan: 'Home Loan',
    referralSource: 'All Doors',
    status: 'New',
    kam: 'Siddharth',
    connectionSource: 'App',
  },
  {
    id: 24,
    leadId: 'HLL024',
    name: 'Varun Saxena',
    number: '+91 98450 54312',
    date: '13/10/2026',
    referralName: 'Nikhil Bansal',
    referralNumber: '+91 98450 11410',
    loan: 'Home Loan',
    referralSource: 'Agent',
    status: 'New',
    kam: 'Samarth',
    connectionSource: 'On Call',
  },
  {
    id: 25,
    leadId: 'HLL025',
    name: 'Anjali Pillai',
    number: '+91 98450 65367',
    date: '13/10/2026',
    referralName: 'HDFC — Rajiv Menon',
    referralNumber: '+91 98450 00011',
    loan: 'Home Loan',
    referralSource: 'Banker',
    status: 'New',
    kam: 'Qalandar',
    connectionSource: 'On Call',
  },
  {
    id: 26,
    leadId: 'HLL026',
    name: 'Rajeev Menon',
    number: '+91 98450 76389',
    date: '12/10/2026',
    referralName: 'Vault Team',
    referralNumber: '—',
    loan: 'Home Loan',
    referralSource: 'Vault',
    status: 'New',
    kam: 'Sandeep',
    connectionSource: 'WhatsApp',
  },
  {
    id: 27,
    leadId: 'HLL027',
    name: 'Shalini Verma',
    number: '+91 98450 87421',
    date: '12/10/2026',
    referralName: 'Vikram Joshi',
    referralNumber: '+91 98450 11448',
    loan: 'Home Loan',
    referralSource: 'Agent',
    status: 'New',
    kam: 'Surendra',
    connectionSource: 'On Call',
  },
  {
    id: 28,
    leadId: 'HLL028',
    name: 'Tarun Oberoi',
    number: '+91 98450 98456',
    date: '11/10/2026',
    referralName: 'Walk-in',
    referralNumber: '—',
    loan: 'Home Loan',
    referralSource: 'Direct',
    status: 'Lost',
    kam: 'Rasranjan',
    connectionSource: 'App',
  },
  {
    id: 29,
    leadId: 'HLL029',
    name: 'Neelam Joshi',
    number: '+91 98450 19489',
    date: '11/10/2026',
    referralName: 'ICICI — Sunita Pai',
    referralNumber: '+91 98450 00022',
    loan: 'Home Loan',
    referralSource: 'Banker',
    status: 'New',
    kam: 'Siddharth',
    connectionSource: 'On Call',
  },
  {
    id: 30,
    leadId: 'HLL030',
    name: 'Harshad Patil',
    number: '+91 98450 21512',
    date: '10/10/2026',
    referralName: 'Vault Team',
    referralNumber: '—',
    loan: 'Home Loan',
    referralSource: 'Vault',
    status: 'New',
    kam: 'Samarth',
    connectionSource: 'WhatsApp',
  },
];

// Seed each row with a staggered "last changed" time for the pipeline Status, and a last-connect
// outcome (connected / rnr / call back) for the Connection column, cycling through all three so
// the table shows a realistic mix without hand-writing one on every row above.
const LEAD_CONNECTION_SEED_OUTCOMES = ['connected', 'rnr1', 'call back'];
mockLoanLeads.forEach((l, i) => {
  l.statusTime = Date.now() - (i + 1) * 86400000;
  l.connectHistory = [];
  l.lastConnection = { status: LEAD_CONNECTION_SEED_OUTCOMES[i % LEAD_CONNECTION_SEED_OUTCOMES.length], time: Date.now() - (i + 1) * 43200000 };
});

export const mockLoanCases = [
  {
    id: 1,
    caseId: 'HLC001',
    leadName: 'Mohammed Irfan',
    leadNumber: '+91 98450 33421',
    stage: 'Loan Agreement',
    stageTime: Date.now() - 2 * 86400000,
    connection: 'connected',
    connectionTime: Date.now() - 1 * 86400000,
    lastConnection: { status: 'connected', time: Date.now() - 1 * 86400000 },
    date: '27/10/2026',
    project: 'Prestige Lakeside Habitat',
    bankName: 'HDFC Bank',
    addedDate: '20/10/2026',
    lan: 'LAN-884210',
    sanctionedAmount: null,
    disbursedAmount: null,
    referralSource: 'Banker',
    referralName: 'HDFC — Rajiv Menon',
    referralNumber: '+91 98450 00011',
    source: 'Banker',
    connectHistory: [
      {
        id: 'ch_case_101',
        timestamp: Date.now() - 1 * 86400000,
        direction: 'outbound',
        connectMedium: 'on call',
        connection: 'connected',
        note: 'Submitted KYC and last 3 years ITR to HDFC branch. Valuation in progress.',
        topics: ['loan'],
        callbackAt: null,
        kamName: 'Rasranjan',
      },
    ],
  },
  {
    id: 2,
    caseId: 'HLC002',
    leadName: 'Arvind Nair',
    leadNumber: '+91 98450 11540',
    stage: 'Sanctioned',
    stageTime: Date.now() - 1 * 86400000,
    connection: 'connected',
    connectionTime: Date.now() - 1 * 86400000,
    lastConnection: { status: 'connected', time: Date.now() - 1 * 86400000 },
    date: '26/10/2026',
    project: 'Sobha Dream Acres',
    bankName: 'ICICI Bank',
    addedDate: '15/10/2026',
    lan: 'LAN-884155',
    sanctionedAmount: 5600000,
    disbursedAmount: null,
    referralSource: 'Banker',
    referralName: 'ICICI — Sunita Pai',
    referralNumber: '+91 98450 00022',
    source: 'Banker',
    connectHistory: [
      {
        id: 'ch_case_102',
        timestamp: Date.now() - 1 * 86400000,
        direction: 'outbound',
        connectMedium: 'on call',
        connection: 'connected',
        note: 'Sanction letter issued for ₹56 Lakhs @ 8.45%. Awaiting MODT scheduling.',
        topics: ['loan'],
        callbackAt: null,
        kamName: 'Qalandar',
      },
    ],
  },
  {
    id: 3,
    caseId: 'HLC003',
    leadName: 'Rohit Malhotra',
    leadNumber: '+91 98450 77865',
    stage: 'Disbursement',
    stageTime: Date.now() - 3 * 86400000,
    connection: 'connected',
    connectionTime: Date.now() - 2 * 86400000,
    lastConnection: { status: 'connected', time: Date.now() - 2 * 86400000 },
    date: '24/10/2026',
    project: 'Brigade Cornerstone Utopia',
    bankName: 'State Bank of India',
    addedDate: '05/10/2026',
    lan: 'LAN-883920',
    sanctionedAmount: 4800000,
    disbursedAmount: 4800000,
    referralSource: 'Vault',
    referralName: '—',
    referralNumber: '—',
    source: 'Vault',
    connectHistory: [
      {
        id: 'ch_case_103',
        timestamp: Date.now() - 2 * 86400000,
        direction: 'outbound',
        connectMedium: 'on call',
        connection: 'connected',
        note: 'First tranche of ₹48L disbursed directly to builder account. Case completed.',
        topics: ['loan'],
        callbackAt: null,
        kamName: 'Samarth',
      },
    ],
  },
  {
    id: 4,
    caseId: 'HLC004',
    leadName: 'Sneha Bhat',
    leadNumber: '+91 98450 88976',
    stage: 'Login',
    stageTime: Date.now() - 4 * 86400000,
    connection: 'call back',
    connectionTime: Date.now() - 4 * 86400000,
    lastConnection: { status: 'call back', time: Date.now() - 4 * 86400000 },
    date: '23/10/2026',
    project: 'Godrej Reflections',
    bankName: 'Axis Bank',
    addedDate: '23/10/2026',
    lan: null,
    sanctionedAmount: null,
    disbursedAmount: null,
    referralSource: 'Agent',
    referralName: 'Vikram Joshi',
    referralNumber: '+91 98450 11448',
    source: 'Agent',
    nextCallbacks: {
      Samarth: { at: Date.now() + 86400000, entryId: 'ch_case_104' },
    },
    connectHistory: [
      {
        id: 'ch_case_104',
        timestamp: Date.now() - 4 * 86400000,
        direction: 'outbound',
        connectMedium: 'on call',
        connection: 'call back',
        note: 'Customer requested follow-up tomorrow to collect salary slips and bank statements.',
        topics: ['loan'],
        callbackAt: Date.now() + 86400000,
        kamName: 'Samarth',
      },
    ],
  },
  {
    id: 5,
    caseId: 'HLC005',
    leadName: 'Imran Shaikh',
    leadNumber: '+91 98450 99087',
    stage: 'Rejected',
    stageTime: Date.now() - 5 * 86400000,
    connection: 'rnr1',
    connectionTime: Date.now() - 5 * 86400000,
    lastConnection: { status: 'rnr1', time: Date.now() - 5 * 86400000 },
    date: '21/10/2026',
    project: 'Purva Atmosphere',
    bankName: 'HDFC Bank',
    addedDate: '10/10/2026',
    lan: 'LAN-883711',
    sanctionedAmount: null,
    disbursedAmount: null,
    referralSource: 'All Doors',
    referralName: '—',
    referralNumber: '—',
    source: 'All Doors',
    connectHistory: [
      {
        id: 'ch_case_105',
        timestamp: Date.now() - 5 * 86400000,
        direction: 'outbound',
        connectMedium: 'on call',
        connection: 'rnr1',
        note: 'Called to explain rejection due to low CIBIL score (642). Phone rang without answer.',
        topics: ['loan'],
        callbackAt: null,
        kamName: 'Siddharth',
      },
    ],
  },
  {
    id: 6,
    caseId: 'HLC006',
    leadName: 'Ramesh Gowda',
    leadNumber: '+91 98450 19980',
    stage: 'Sanctioned',
    stageTime: Date.now() - 3 * 86400000,
    connection: 'connected',
    connectionTime: Date.now() - 2 * 86400000,
    lastConnection: { status: 'connected', time: Date.now() - 2 * 86400000 },
    date: '20/10/2026',
    project: 'Assetz Marq 3.0',
    bankName: 'Kotak Mahindra Bank',
    addedDate: '08/10/2026',
    lan: 'LAN-883540',
    sanctionedAmount: 7200000,
    disbursedAmount: null,
    referralSource: 'Agent',
    referralName: 'Ravi Kumar',
    referralNumber: '+91 98450 11301',
    source: 'Agent',
    connectHistory: [
      {
        id: 'ch_case_106',
        timestamp: Date.now() - 2 * 86400000,
        direction: 'outbound',
        connectMedium: 'on call',
        connection: 'connected',
        note: 'Kotak Bank sanctioned ₹72L loan. Customer agreed on agreement signing next Monday.',
        topics: ['loan'],
        callbackAt: null,
        kamName: 'Sandeep',
      },
    ],
  },
  {
    id: 7,
    caseId: 'HLC007',
    leadName: 'Deepa Suresh',
    leadNumber: '+91 98450 22310',
    stage: 'Loan Agreement',
    stageTime: Date.now() - 4 * 86400000,
    connection: 'connected',
    connectionTime: Date.now() - 3 * 86400000,
    lastConnection: { status: 'connected', time: Date.now() - 3 * 86400000 },
    date: '19/10/2026',
    project: 'Salarpuria Sattva Magnificence',
    bankName: 'State Bank of India',
    addedDate: '12/10/2026',
    lan: 'LAN-883490',
    sanctionedAmount: null,
    disbursedAmount: null,
    referralSource: 'Vault',
    referralName: '—',
    referralNumber: '—',
    source: 'Vault',
    connectHistory: [
      {
        id: 'ch_case_107',
        timestamp: Date.now() - 3 * 86400000,
        direction: 'outbound',
        connectMedium: 'on call',
        connection: 'connected',
        note: 'SBI legal vetting completed. Awaiting final credit committee signoff.',
        topics: ['loan'],
        callbackAt: null,
        kamName: 'Samarth',
      },
    ],
  },
  {
    id: 8,
    caseId: 'HLC008',
    leadName: 'Priya Varma',
    leadNumber: '+91 98450 44532',
    stage: 'Disbursement',
    stageTime: Date.now() - 6 * 86400000,
    connection: 'connected',
    connectionTime: Date.now() - 5 * 86400000,
    lastConnection: { status: 'connected', time: Date.now() - 5 * 86400000 },
    date: '18/10/2026',
    project: 'Embassy Springs',
    bankName: 'HDFC Bank',
    addedDate: '01/10/2026',
    lan: 'LAN-883200',
    sanctionedAmount: 6400000,
    disbursedAmount: 6400000,
    referralSource: 'All Doors',
    referralName: '—',
    referralNumber: '—',
    source: 'All Doors',
    connectHistory: [
      {
        id: 'ch_case_108',
        timestamp: Date.now() - 5 * 86400000,
        direction: 'outbound',
        connectMedium: 'on call',
        connection: 'connected',
        note: 'Disbursement cheque issued to seller. Welcome kit delivered to client.',
        topics: ['loan'],
        callbackAt: null,
        kamName: 'Siddharth',
      },
    ],
  },
  {
    id: 9,
    caseId: 'HLC009',
    leadName: 'Karthik Subramanian',
    leadNumber: '+91 98450 55643',
    stage: 'Login',
    stageTime: Date.now() - 2 * 86400000,
    connection: 'connected',
    connectionTime: Date.now() - 1 * 86400000,
    lastConnection: { status: 'connected', time: Date.now() - 1 * 86400000 },
    date: '17/10/2026',
    project: 'Shriram Chirping Woods',
    bankName: 'Axis Bank',
    addedDate: '17/10/2026',
    lan: null,
    sanctionedAmount: null,
    disbursedAmount: null,
    referralSource: 'Lead',
    referralName: 'Sneha Rao',
    referralNumber: '+91 98450 99887',
    source: 'Lead',
    connectHistory: [
      {
        id: 'ch_case_109',
        timestamp: Date.now() - 1 * 86400000,
        direction: 'outbound',
        connectMedium: 'on call',
        connection: 'connected',
        note: 'Case initiated. Customer is providing property agreement copy by tomorrow.',
        topics: ['loan'],
        callbackAt: null,
        kamName: 'Surendra',
      },
    ],
  },
  {
    id: 10,
    caseId: 'HLC010',
    leadName: 'Fathima Noor',
    leadNumber: '+91 98450 66754',
    stage: 'Loan Agreement',
    stageTime: Date.now() - 5 * 86400000,
    connection: 'connected',
    connectionTime: Date.now() - 3 * 86400000,
    lastConnection: { status: 'connected', time: Date.now() - 3 * 86400000 },
    date: '16/10/2026',
    project: 'Total Environment Windmills',
    bankName: 'Bank of Baroda',
    addedDate: '09/10/2026',
    lan: 'LAN-883044',
    sanctionedAmount: null,
    disbursedAmount: null,
    referralSource: 'Direct',
    referralName: '—',
    referralNumber: '—',
    source: 'Direct',
    connectHistory: [
      {
        id: 'ch_case_110',
        timestamp: Date.now() - 3 * 86400000,
        direction: 'outbound',
        connectMedium: 'on call',
        connection: 'connected',
        note: 'Income tax documents re-submitted. Bank credit team review scheduled for Friday.',
        topics: ['loan'],
        callbackAt: null,
        kamName: 'Qalandar',
      },
    ],
  },
  {
    id: 11,
    caseId: 'HLC011',
    leadName: 'Divya Krishnan',
    leadNumber: '+91 98450 10198',
    stage: 'Sanctioned',
    stageTime: Date.now() - 1 * 86400000,
    connection: 'connected',
    connectionTime: Date.now() - 1 * 86400000,
    lastConnection: { status: 'connected', time: Date.now() - 1 * 86400000 },
    date: '15/10/2026',
    project: 'Prestige Falcon City',
    bankName: 'HDFC Bank',
    addedDate: '05/10/2026',
    lan: 'LAN-882980',
    sanctionedAmount: 5100000,
    disbursedAmount: null,
    referralSource: 'Banker',
    referralName: 'HDFC — Neha Bhatt',
    referralNumber: '+91 98450 00033',
    source: 'Banker',
    connectHistory: [
      {
        id: 'ch_case_111',
        timestamp: Date.now() - 1 * 86400000,
        direction: 'outbound',
        connectMedium: 'on call',
        connection: 'connected',
        note: 'Sanctioned ₹51 Lakhs. Property inspection successful.',
        topics: ['loan'],
        callbackAt: null,
        kamName: 'Rasranjan',
      },
    ],
  },
  {
    id: 12,
    caseId: 'HLC012',
    leadName: 'Sunil Rao',
    leadNumber: '+91 98450 77865',
    stage: 'Disbursement',
    stageTime: Date.now() - 7 * 86400000,
    connection: 'connected',
    connectionTime: Date.now() - 4 * 86400000,
    lastConnection: { status: 'connected', time: Date.now() - 4 * 86400000 },
    date: '14/10/2026',
    project: 'Sobha Royal Pavilion',
    bankName: 'ICICI Bank',
    addedDate: '28/09/2026',
    lan: 'LAN-882750',
    sanctionedAmount: 8200000,
    disbursedAmount: 8200000,
    referralSource: 'Agent',
    referralName: 'Nikhil Bansal',
    referralNumber: '+91 98450 11410',
    source: 'Agent',
    connectHistory: [
      {
        id: 'ch_case_112',
        timestamp: Date.now() - 4 * 86400000,
        direction: 'outbound',
        connectMedium: 'on call',
        connection: 'connected',
        note: 'Final disbursement completed. Registration done.',
        topics: ['loan'],
        callbackAt: null,
        kamName: 'Sandeep',
      },
    ],
  },
];

// Seed each case with a short Stage-history trail (Login -> current stage) — same shape as
// addLoanCaseStageLog's entries below — so the Stage History list isn't empty for pre-existing
// cases.
const CASE_STAGE_NOTE_TEMPLATES = {
  Case: 'Case created in pipeline, initial file preparation underway.',
  Login: 'Case logged with the bank, document collection and processing started.',
  Sanctioned: 'Bank sanctioned the loan after document and credit checks.',
  'Loan Agreement': 'Loan agreement signed by the client.',
  Disbursement: 'Loan amount disbursed to the builder/seller account.',
  Rejected: 'Bank declined the application after underwriting review.',
};
mockLoanCases.forEach((c) => {
  const kam = c.connectHistory?.[0]?.kamName || 'User';
  const history = [];
  if (c.stage !== 'Case') {
    history.push({ stage: 'Case', text: CASE_STAGE_NOTE_TEMPLATES.Case, time: c.stageTime - 4 * 86400000, user: kam });
  }
  if (c.stage !== 'Case' && c.stage !== 'Login') {
    history.push({ stage: 'Login', text: CASE_STAGE_NOTE_TEMPLATES.Login, time: c.stageTime - 3 * 86400000, user: kam });
  }
  history.push({ stage: c.stage, text: CASE_STAGE_NOTE_TEMPLATES[c.stage] || '', time: c.stageTime, user: kam });
  c.stageHistory = history;
});

function nextId(items, key, prefix) {
  const max = items.reduce((m, i) => {
    const n = parseInt(String(i[key] || '').replace(prefix, ''), 10);
    return Number.isFinite(n) && n > m ? n : m;
  }, 0);
  return `${prefix}${String(max + 1).padStart(3, '0')}`;
}

export function addLoanAgent(data) {
  const agent = {
    id: Math.max(0, ...mockLoanAgents.map((a) => a.id)) + 1,
    cpid: data.cpid || nextId(mockLoanAgents, 'cpid', 'CPC'),
    time: data.time || new Date().toLocaleDateString('en-GB'),
    name: data.name || '',
    number: data.number || '',
    status: data.status || 'New',
    statusTime: Date.now(),
    agentStatus: data.agentStatus || 'Maybe',
    agentStatusTime: Date.now(),
    agentStatusBy: data.kam || LOAN_KAM_OPTIONS[0],
    kam: data.kam || '—',
    source: data.source || 'App',
    notes: [],
  };
  mockLoanAgents.push(agent);
  return agent;
}

export function updateLoanAgent(id, patch) {
  const agent = mockLoanAgents.find((a) => a.id === id);
  if (!agent) return null;
  Object.assign(agent, patch);
  return agent;
}

// Stamping "last changed" time here (rather than having the caller pass Date.now() in) keeps that
// impure call out of component render/handler bodies, same as addLoanAgentNote below.
export function setLoanAgentStatus(id, status) {
  return updateLoanAgent(id, { status, statusTime: Date.now() });
}

// Logs a status-tagged note alongside the change (mirrors mockLegalDoc.js's setAgentLegalStatus)
// so the Loan Status badge has the same "who changed it, with what note" history as Legal Status.
export function setLoanAgentQuality(id, agentStatus, by = '', noteText = '') {
  const agent = updateLoanAgent(id, { agentStatus, agentStatusTime: Date.now(), agentStatusBy: by });
  if (agent) {
    const note = { text: noteText || `Status set to ${agentStatus}`, status: agentStatus, time: Date.now(), user: by };
    agent.notes = [...(agent.notes || []), note];
  }
  return agent;
}

export function addLoanAgentNote(id, text, user = '') {
  const agent = mockLoanAgents.find((a) => a.id === id);
  if (!agent || !text.trim()) return null;
  const note = { text: text.trim(), time: Date.now(), user };
  agent.notes = [...(agent.notes || []), note];
  return note;
}

// Same shape and behavior as mockAgents.js's addConnectHistoryEntry / mockLeads.js's
// addLeadConnectHistoryEntry — appends a connect-log entry and, for a "call back" outcome,
// records that KAM's pending callback.
export function addLoanAgentConnectHistoryEntry(id, entry) {
  const agent = mockLoanAgents.find((a) => a.id === id);
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

// Clears one KAM's pending callback for a loan agent — mirrors mockAgents.js's resolveCallback.
export function resolveLoanAgentCallback(id, kamId) {
  const agent = mockLoanAgents.find((a) => a.id === id);
  if (!agent || !agent.nextCallbacks) return;
  const next = { ...agent.nextCallbacks };
  delete next[kamId];
  agent.nextCallbacks = next;
}

// A client an agent has shared — distinct from a full Loan Lead until the agent's overall
// "Add Lead" is clicked, so an agent can hand over several names/numbers up front before any of
// them become real leads.
export function addLoanAgentClient(agentId, data) {
  const agent = mockLoanAgents.find((a) => a.id === agentId);
  if (!agent) return null;
  const client = {
    id: `client_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: data.name || '',
    number: data.number || '',
    status: 'pending', // pending | lead_added
    createdAt: Date.now(),
    leadId: null,
  };
  agent.clients = [...(agent.clients || []), client];
  return client;
}

// Drops a client that hasn't been turned into a lead yet (fixing a typo'd entry before committing).
export function removeLoanAgentClient(agentId, clientId) {
  const agent = mockLoanAgents.find((a) => a.id === agentId);
  if (!agent) return;
  agent.clients = (agent.clients || []).filter((c) => c.id !== clientId);
}

// "Add Lead" / "Lost" are decided once for the agent as a whole, not per client — converts every
// still-pending client into its own row on the Loan Leads page, referral-attributed back to this
// agent, and advances the agent's own pipeline Status to Lead Shared.
export function addLoanLeadsFromAgentClients(agentId) {
  const agent = mockLoanAgents.find((a) => a.id === agentId);
  if (!agent) return [];
  const pending = (agent.clients || []).filter((c) => c.status === 'pending');
  if (pending.length === 0) return [];
  pending.forEach((client) => {
    const lead = addLoanLead({
      name: client.name,
      number: client.number,
      referralName: agent.name,
      referralNumber: agent.number,
      referralSource: 'Agent',
      kam: agent.kam,
    });
    client.status = 'lead_added';
    client.leadId = lead.leadId;
  });
  setLoanAgentStatus(agentId, 'Lead Shared');
  return pending;
}

// Looks up a Loan agent by phone number regardless of formatting (+91 98450 11287 vs 9845011287)
// — used by the Loan "Add Lead" flow to detect whether a typed number already belongs to an agent
// before creating a fresh, unattributed lead for it.
export function findLoanAgentByPhone(phone) {
  const digits = digitsOf(phone);
  return digits.length === 10 ? mockLoanAgents.find((a) => digitsOf(a.number) === digits) || null : null;
}

// Same lookup, against existing Loan leads instead — so the Add Lead flow catches a number that's
// already a lead and shows that lead instead of creating a duplicate.
export function findLoanLeadByPhone(phone) {
  const digits = digitsOf(phone);
  return digits.length === 10 ? mockLoanLeads.find((l) => digitsOf(l.number) === digits) || null : null;
}

// Looks up a Loan agent by CPID — the id the rest of the app (mockAgents.js's roster, the Legal &
// Doc module) identifies an agent by, as opposed to this module's own internal numeric `id`.
export function findLoanAgentByCpid(cpid) {
  if (!cpid) return null;
  return mockLoanAgents.find((a) => a.cpid === cpid) || null;
}

// The Agent Connect panel's "Loan Lead" section works against this module's own agent record,
// which may not exist yet for an agent the Loan module has never seen — this finds it by CPID, or
// seeds one on first use (e.g. the first client added from that panel) so the rest of the Loan
// Lead flow (addLoanAgentClient, addLoanLeadsFromAgentClients, ...) has a record to operate on.
export function getOrCreateLoanAgentByCpid(cpid, defaults = {}) {
  return findLoanAgentByCpid(cpid) || addLoanAgent({ cpid, ...defaults });
}

export function addLoanLead(data) {
  const lead = {
    id: Math.max(0, ...mockLoanLeads.map((l) => l.id)) + 1,
    leadId: nextId(mockLoanLeads, 'leadId', 'HLL'),
    name: data.name || '',
    number: data.number || '',
    date: data.date || new Date().toLocaleDateString('en-GB'),
    referralName: data.referralName || '',
    referralNumber: data.referralNumber || '—',
    loan: 'Home Loan',
    referralSource: data.referralSource || LOAN_REFERRAL_SOURCE_OPTIONS[0],
    status: data.status || 'New',
    statusTime: Date.now(),
    kam: data.kam || '—',
    connectionSource: data.connectionSource || 'On Call',
    connectHistory: [],
    lastConnection: null,
  };
  mockLoanLeads.push(lead);
  return lead;
}

// Marks a Lead's own pipeline status — New / Lost, set from the Lead panel.
export function setLoanLeadStatus(id, status) {
  const lead = mockLoanLeads.find((l) => l.id === id);
  if (!lead) return null;
  lead.status = status;
  lead.statusTime = Date.now();
  return lead;
}

// Reassigns the KAM on a Lead row directly from the table's inline dropdown.
export function setLoanLeadKam(id, kam) {
  const lead = mockLoanLeads.find((l) => l.id === id);
  if (!lead) return null;
  lead.kam = kam;
  return lead;
}

// Same shape and behavior as addLoanAgentConnectHistoryEntry — appends a connect-log entry for a
// Lead, updates its lastConnection summary (what the table's Connection column reads), and for a
// "call back" outcome records that KAM's pending callback.
export function addLoanLeadConnectHistoryEntry(id, entry) {
  const lead = mockLoanLeads.find((l) => l.id === id);
  if (!lead) return null;

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

  lead.connectHistory = [...(lead.connectHistory || []), newEntry];
  lead.lastConnection = { status: newEntry.connection, time: newEntry.timestamp };

  if (newEntry.connection === 'call back' && newEntry.callbackAt && newEntry.kamId) {
    lead.nextCallbacks = {
      ...(lead.nextCallbacks || {}),
      [newEntry.kamId]: { at: newEntry.callbackAt, entryId: newEntry.id },
    };
  }

  return newEntry;
}

// Clears one KAM's pending callback for a Lead — mirrors resolveLoanAgentCallback.
export function resolveLoanLeadCallback(id, kamId) {
  const lead = mockLoanLeads.find((l) => l.id === id);
  if (!lead || !lead.nextCallbacks) return;
  const next = { ...lead.nextCallbacks };
  delete next[kamId];
  lead.nextCallbacks = next;
}

export function addLoanCase(data) {
  const loanCase = {
    id: Math.max(0, ...mockLoanCases.map((c) => c.id)) + 1,
    caseId: nextId(mockLoanCases, 'caseId', 'HLC'),
    leadName: data.leadName || '',
    leadNumber: data.leadNumber || '',
    connection: data.connection || 'connected',
    connectionTime: Date.now(),
    lastConnection: { status: data.connection || 'connected', time: Date.now() },
    connectHistory: [],
    referralNumber: data.referralNumber || '—',
    referralName: data.referralName || '',
    referralSource: data.referralSource || LOAN_REFERRAL_SOURCE_OPTIONS[0],
    stage: data.stage || 'Case',
    stageTime: Date.now(),
    date: data.date || new Date().toLocaleDateString('en-GB'),
    project: data.project || '',
    bankName: data.bankName || 'HDFC Bank',
    addedDate: data.addedDate || new Date().toLocaleDateString('en-GB'),
    lan: data.lan || null,
    sanctionedAmount: data.sanctionedAmount || null,
    disbursedAmount: data.disbursedAmount || null,
    source: data.source || data.referralSource || LOAN_REFERRAL_SOURCE_OPTIONS[0],
  };
  mockLoanCases.push(loanCase);
  return loanCase;
}

export function updateLoanCase(id, updates) {
  const loanCase = mockLoanCases.find((c) => c.id === id);
  if (!loanCase) return null;
  const oldStage = loanCase.stage;
  Object.assign(loanCase, updates);
  if (updates.stage && updates.stage !== oldStage) {
    loanCase.stageTime = Date.now();
  }
  return loanCase;
}

export function setLoanCaseStage(id, stage) {
  const loanCase = mockLoanCases.find((c) => c.id === id);
  if (!loanCase) return null;
  loanCase.stage = stage;
  loanCase.stageTime = Date.now();
  return loanCase;
}

// Logs a Stage update — like addLoanCaseConnectHistoryEntry, but for stage changes: a case can
// log several notes against the same stage, not just one note per stage change. Updates the
// case's current stage (and stamps stageTime) whenever the logged stage differs from it.
export function addLoanCaseStageLog(id, { stage, text = '', user = '' }) {
  const loanCase = mockLoanCases.find((c) => c.id === id);
  if (!loanCase) return null;
  const entry = { stage, text: text.trim(), time: Date.now(), user };
  loanCase.stageHistory = [...(loanCase.stageHistory || []), entry];
  if (stage && stage !== loanCase.stage) {
    loanCase.stage = stage;
    loanCase.stageTime = entry.time;
  }
  return entry;
}

export function addLoanCaseConnectHistoryEntry(id, entry) {
  const loanCase = mockLoanCases.find((c) => c.id === id);
  if (!loanCase) return null;

  const newEntry = {
    id: `ch_case_${Date.now()}`,
    timestamp: Date.now(),
    direction: '',
    connectMedium: '',
    connection: '',
    note: '',
    topics: [],
    callbackAt: null,
    ...entry,
  };

  loanCase.connectHistory = [...(loanCase.connectHistory || []), newEntry];
  loanCase.lastConnection = { status: newEntry.connection, time: newEntry.timestamp };
  loanCase.connection = newEntry.connection;
  loanCase.connectionTime = newEntry.timestamp;

  if (newEntry.connection === 'call back' && newEntry.callbackAt && newEntry.kamId) {
    loanCase.nextCallbacks = {
      ...(loanCase.nextCallbacks || {}),
      [newEntry.kamId]: { at: newEntry.callbackAt, entryId: newEntry.id },
    };
  }

  return newEntry;
}

export function resolveLoanCaseCallback(id, kamId) {
  const loanCase = mockLoanCases.find((c) => c.id === id);
  if (!loanCase || !loanCase.nextCallbacks) return;
  const next = { ...loanCase.nextCallbacks };
  delete next[kamId];
  loanCase.nextCallbacks = next;
}
