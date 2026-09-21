import React, { useState } from 'react';
import { Check, Search, User, UserX } from 'lucide-react';
import { mockAgents } from '../../data/mockAgents';

const digitsOf = (value) => String(value ?? '').replace(/\D/g, '').slice(-10);

const findAgentByPhone = (phone) => {
  const digits = digitsOf(phone);
  return digits.length === 10 ? mockAgents.find((agent) => digitsOf(agent.contact) === digits) ?? null : null;
};

/** Phone-first agent lookup — the same starting point the live form uses. */
const FindAgentBar = ({ agent, onAgentFound }) => {
  const [phone, setPhone] = useState('');
  const [notFound, setNotFound] = useState(false);

  const handleSearch = () => {
    const match = findAgentByPhone(phone);

    setNotFound(!match);
    if (match) {
      onAgentFound({ cpId: match.agentId, agentName: match.name, agentPhoneNumber: digitsOf(match.contact) });
    }
  };

  return (
    <div className="bg-blue-50 border-b border-blue-100 px-8 py-5">
      <div className="flex items-center gap-2 mb-3 text-blue-800">
        <User size={18} />
        <h2 className="text-lg font-bold">Find Agent</h2>
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          value={phone}
          onChange={(event) => {
            setPhone(event.target.value);
            setNotFound(false);
          }}
          onKeyDown={(event) => event.key === 'Enter' && handleSearch()}
          placeholder="Enter agent phone number (e.g., 9876543210)"
          className="flex-1 px-4 py-3 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
        />
        <button
          type="button"
          onClick={handleSearch}
          className="flex items-center gap-2 px-7 py-3 rounded-lg bg-indigo-400 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
        >
          <Search size={16} />
          Search
        </button>
      </div>

      {agent.cpId && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-700">
          <Check size={14} />
          Linked to {agent.agentName || 'agent'} · {agent.cpId}
        </p>
      )}

      {notFound && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-red-600">
          <UserX size={14} />
          No agent with that number.
        </p>
      )}
    </div>
  );
};

export default FindAgentBar;
