import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, UserCheck, Check, Search, Plus } from 'lucide-react';
import SegmentedToggle from '../shared/SegmentedToggle';
import { KAM_OPTIONS } from '../../data/mockLegalDoc';
import { addAgent } from '../../data/mockAgents';
import { mockFirms, addFirm } from '../../data/mockFirms';
import { updateLead } from '../../data/mockLeads';

const inputCls =
  'w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-[13px] text-neutral-800 placeholder:text-neutral-400 outline-none focus:border-neutral-400 transition-all';
const labelCls = 'text-[12px] text-neutral-500 font-medium mb-1 block';
// The divider is what separates one group of fields from the next — the field labels themselves
// (Name, RERA Number, Years of Experience, ...) already say what each one is, so a redundant
// "PERSONAL INFORMATION" / "PROFESSIONAL" category caption on top of that was just noise.
const dividedSectionCls = 'space-y-3 pt-5 border-t border-neutral-100';

// Red asterisk for a required field's label — so which fields are mandatory is visible at a
// glance instead of just implied by the label text.
const Req = () => <span className="text-red-500">*</span>;

const AREA_OF_OPERATION_ZONES = ['North', 'South', 'East', 'West', 'Central', 'Pan Bangalore'];
const BUSINESS_CATEGORIES = ['Resale', 'Rental', 'Primary'];
const LANGUAGE_OPTIONS = ['English', 'Hindi', 'Kannada', 'Tamil', 'Telugu', 'Malayalam', 'Marathi'];
const LEAD_SOURCE_OPTIONS = ['direct', 'organic', 'referral', 'marketing', 'app'];
const FIRM_SIZE_OPTIONS = ['1-10', '10-50', '50-100', '100+'];

// "+919999999993" -> "+91 99999 99993" — same 5-5 grouping convention the Agent Connect panel's
// own phone input uses, just also handling the leading country code here since this field gets
// prefilled straight from the lead's stored contact number rather than typed in digit by digit.
function formatPhone(raw) {
  if (!raw) return '';
  const hasPlus = raw.trim().startsWith('+');
  const digits = raw.replace(/\D/g, '');
  if (hasPlus && digits.length > 10) {
    const cc = digits.slice(0, digits.length - 10);
    const num = digits.slice(-10);
    return `+${cc} ${num.slice(0, 5)} ${num.slice(5)}`.trim();
  }
  if (digits.length <= 10) return digits.length > 5 ? `${digits.slice(0, 5)} ${digits.slice(5)}` : digits;
  return raw;
}

function emptyForm(lead) {
  return {
    name: lead?.name && lead.name !== '-' ? lead.name : '',
    phone: formatPhone(lead?.contact || ''),
    email: '',
    address: '',
    rera: '',
    workingAs: 'individual',
    firm: '',
    firmSize: '',
    kam: lead?.kam || KAM_OPTIONS[0].value,
    areaOfOperation: [],
    businessCategory: [],
    yearsOfExperience: '',
    alternateNumber: '',
    gst: '',
    heardFrom: '',
    bio: '',
    profileImageUrl: '',
    languages: [],
    otherLanguages: '',
    leadSource: 'direct',
  };
}

// A search-or-add field — there's no fixed firms list in this product (new firms show up as
// leads bring them in), so unlike a normal dropdown this lets a KAM pick an option already on
// the platform or add a brand new one right here instead of being blocked on it existing yet.
// Shared by Firm Name and Lead Source so both "type to search, or add a new one" the same way.
function SearchAddField({ value, onChange, options, placeholder, addNewLabel, emptyLabel }) {
  const [query, setQuery] = useState(value || '');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [query, options]);

  const exactMatch = options.some((o) => o.toLowerCase() === query.trim().toLowerCase());

  const choose = (val) => {
    onChange(val);
    setQuery(val);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
          className={`${inputCls} pl-8`}
        />
      </div>
      {open && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-neutral-200 rounded-xl shadow-lg max-h-48 overflow-y-auto p-1">
          {matches.map((o) => (
            <button
              key={o}
              type="button"
              onMouseDown={() => choose(o)}
              className="w-full text-left px-3 py-2 rounded-lg text-[13px] text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              {o}
            </button>
          ))}
          {query.trim() && !exactMatch && (
            <button
              type="button"
              onMouseDown={() => choose(query.trim())}
              className="w-full flex items-center gap-1.5 text-left px-3 py-2 rounded-lg text-[13px] text-neutral-900 font-medium hover:bg-neutral-50 transition-colors"
            >
              <Plus size={13} /> {addNewLabel(query.trim())}
            </button>
          )}
          {matches.length === 0 && !query.trim() && <p className="px-3 py-2 text-[12px] text-neutral-400">{emptyLabel}</p>}
        </div>
      )}
    </div>
  );
}

// A plain fixed-option dropdown styled to match the rest of the form (and the SearchAddField
// fields next to it) instead of the browser's own default <select> chrome — used for KAM, where
// picking from the existing roster is all that's allowed, no "add new" escape hatch like the
// search fields have.
function SelectDropdown({ value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`${inputCls} flex items-center justify-between gap-2 text-left`}
      >
        <span>{selected?.label || value}</span>
        <ChevronDown size={14} className={`text-neutral-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-neutral-200 rounded-xl shadow-lg max-h-48 overflow-y-auto p-1">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-[13px] transition-colors ${
                o.value === value ? 'bg-neutral-900 text-white font-medium' : 'text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Collapsible, same shape as the Agent Connect panel's "Legal Lead" section — converts a lead
// into a real agent record once a KAM has verified their details, rather than just logging a
// connect outcome. Kept to plain fields matching the rest of this panel's own styling instead of
// pulling in the heavier multi-step form chrome Add Inventory uses — this is one form, not a wizard.
const VerifyAgentSection = ({ lead, onConverted }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(() => emptyForm(lead));
  const [draftSaved, setDraftSaved] = useState(false);
  const [createdAgentId, setCreatedAgentId] = useState(lead?.convertedAgentId || null);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));
  const setField = (key) => (e) => set(key)(e.target.value);

  const toggleAreaOfOperation = (value) => {
    setForm((f) => ({
      ...f,
      areaOfOperation: f.areaOfOperation.includes(value)
        ? f.areaOfOperation.filter((v) => v !== value)
        : [...f.areaOfOperation, value],
    }));
  };

  const toggleBusinessCategory = (value) => {
    setForm((f) => ({
      ...f,
      businessCategory: f.businessCategory.includes(value)
        ? f.businessCategory.filter((v) => v !== value)
        : [...f.businessCategory, value],
    }));
  };

  const toggleLanguage = (value) => {
    setForm((f) => ({
      ...f,
      languages: f.languages.includes(value) ? f.languages.filter((v) => v !== value) : [...f.languages, value],
    }));
  };

  const canCreate = !!(form.name.trim() && form.phone.trim() && form.workingAs && form.kam);

  const handleSaveDraft = () => {
    updateLead(lead.id, { agentVerificationDraft: form });
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 2000);
  };

  const handleVerifyAndCreate = () => {
    if (!canCreate) return;
    if (form.workingAs === 'firm' && form.firm.trim()) addFirm(form.firm.trim());
    const languages = [
      ...form.languages.filter((l) => l !== 'Other'),
      ...form.otherLanguages.split(',').map((s) => s.trim()).filter(Boolean),
    ];
    const agent = addAgent({ ...form, languages });
    updateLead(lead.id, { connectStatus: 'Connected', convertedAgentId: agent.agentId });
    setCreatedAgentId(agent.agentId);
    onConverted?.(agent);
  };

  return (
    <div className="border border-neutral-200 rounded-2xl p-5 space-y-4">
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex items-center justify-between w-full text-left">
        <div className="flex items-center gap-2 text-[13px] font-semibold text-neutral-900">
          <UserCheck size={14} className="text-neutral-400" />
          <span>Verify Agent Information</span>
          {createdAgentId && (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">Verified · {createdAgentId}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {draftSaved && (
            <span className="text-[11px] font-medium text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Check size={11} /> Draft saved
            </span>
          )}
          {open ? <ChevronUp size={14} className="text-neutral-400" /> : <ChevronDown size={14} className="text-neutral-400" />}
        </div>
      </button>

      {open && (
        <div className="space-y-4">
          {createdAgentId ? (
            <div className="flex items-center gap-2 text-[13px] text-emerald-700 bg-emerald-50 rounded-xl px-3 py-2.5">
              <Check size={14} /> Agent created — {createdAgentId}
            </div>
          ) : (
            <>
              {/* Personal Information */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={labelCls}>Name <Req /></label>
                    <input type="text" value={form.name} onChange={setField('name')} placeholder="Agent's full name" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Phone Number <Req /></label>
                    <input type="text" value={form.phone} onChange={(e) => set('phone')(formatPhone(e.target.value))} placeholder="Phone number" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Email</label>
                    <input type="email" value={form.email} onChange={setField('email')} placeholder="Email address" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Address</label>
                    <input type="text" value={form.address} onChange={setField('address')} placeholder="Address" className={inputCls} />
                  </div>
                </div>
              </div>

              {/* Professional */}
              <div className={dividedSectionCls}>
                <div>
                  <label className={labelCls}>RERA Number</label>
                  <input type="text" value={form.rera} onChange={setField('rera')} placeholder="RERA registration number" className={inputCls} />
                </div>
                <div>
                  <label className="text-[12px] text-neutral-500 font-medium mb-1.5 block">
                    Working as <Req />
                  </label>
                  <SegmentedToggle
                    value={form.workingAs}
                    onChange={set('workingAs')}
                    ariaLabel="Working as"
                    options={[
                      { value: 'individual', label: 'Individual CP' },
                      { value: 'firm', label: 'Firm' },
                    ]}
                  />
                </div>
                {form.workingAs === 'firm' && (
                  <div className="space-y-3">
                    <div>
                      <label className={labelCls}>Firm Name</label>
                      <SearchAddField
                        value={form.firm}
                        onChange={set('firm')}
                        options={mockFirms}
                        placeholder="Search or add a firm..."
                        addNewLabel={(q) => `Add "${q}" as new firm`}
                        emptyLabel="No firms yet — start typing to add one."
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Firm Size</label>
                      <div className="flex flex-wrap gap-2">
                        {FIRM_SIZE_OPTIONS.map((size) => {
                          const isSelected = form.firmSize === size;
                          return (
                            <button
                              key={size}
                              type="button"
                              onClick={() => set('firmSize')(size)}
                              className={`px-3.5 py-2 rounded-full text-[12px] border outline-none focus-visible:ring-2 focus-visible:ring-neutral-300 transition-colors ${
                                isSelected ? 'bg-neutral-900 text-white border-neutral-900 font-semibold' : 'bg-white text-neutral-500 border-neutral-200 font-medium hover:bg-neutral-100'
                              }`}
                            >
                              {size}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* KAM, Area of Operation, Business Category, and Additional Details all live in
                  one combined block now — each still has its own field spacing, but they're no
                  longer broken up into four separate dividered sections. */}
              <div className={dividedSectionCls}>
                <div>
                  <label className={labelCls}>
                    KAM <Req />
                  </label>
                  <SelectDropdown value={form.kam} onChange={set('kam')} options={KAM_OPTIONS} />
                </div>

                <div>
                  <label className={labelCls}>Area</label>
                  <div className="flex flex-wrap gap-2">
                    {AREA_OF_OPERATION_ZONES.map((zone) => {
                      const isSelected = form.areaOfOperation.includes(zone);
                      return (
                        <button
                          key={zone}
                          type="button"
                          onClick={() => toggleAreaOfOperation(zone)}
                          className={`px-3.5 py-2 rounded-full text-[12px] border outline-none focus-visible:ring-2 focus-visible:ring-neutral-300 transition-colors ${
                            isSelected ? 'bg-neutral-900 text-white border-neutral-900 font-semibold' : 'bg-white text-neutral-500 border-neutral-200 font-medium hover:bg-neutral-100'
                          }`}
                        >
                          {zone}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Category</label>
                  <div className="flex flex-wrap gap-2">
                    {BUSINESS_CATEGORIES.map((cat) => {
                      const isSelected = form.businessCategory.includes(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => toggleBusinessCategory(cat)}
                          className={`px-3.5 py-2 rounded-full text-[12px] border outline-none focus-visible:ring-2 focus-visible:ring-neutral-300 transition-colors ${
                            isSelected ? 'bg-neutral-900 text-white border-neutral-900 font-semibold' : 'bg-white text-neutral-500 border-neutral-200 font-medium hover:bg-neutral-100'
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={labelCls}>GST Number</label>
                    <input type="text" value={form.gst} onChange={setField('gst')} placeholder="Enter GST number" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Alternate Number</label>
                    <input
                      type="text"
                      value={form.alternateNumber}
                      onChange={(e) => set('alternateNumber')(formatPhone(e.target.value))}
                      placeholder="Enter alternate number"
                      className={inputCls}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-[1fr_1.75fr] gap-2">
                  <div>
                    <label className={labelCls}>Years of Experience</label>
                    <input type="text" value={form.yearsOfExperience} onChange={setField('yearsOfExperience')} placeholder="e.g. 5" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Heard From</label>
                    <input type="text" value={form.heardFrom} onChange={setField('heardFrom')} placeholder="How the agent heard about us" className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Bio</label>
                  <textarea value={form.bio} onChange={setField('bio')} placeholder="Short bio / description" rows={2} className={`${inputCls} resize-none`} />
                </div>
                <div>
                  <label className={labelCls}>Profile Image URL</label>
                  <input type="text" value={form.profileImageUrl} onChange={setField('profileImageUrl')} placeholder="Enter profile image URL" className={inputCls} />
                </div>

                <div>
                  <label className={labelCls}>Languages</label>
                  <div className="flex flex-wrap gap-2">
                    {[...LANGUAGE_OPTIONS, 'Other'].map((lang) => {
                      const isSelected = form.languages.includes(lang);
                      return (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => toggleLanguage(lang)}
                          className={`px-3.5 py-2 rounded-full text-[12px] border outline-none focus-visible:ring-2 focus-visible:ring-neutral-300 transition-colors ${
                            isSelected ? 'bg-neutral-900 text-white border-neutral-900 font-semibold' : 'bg-white text-neutral-500 border-neutral-200 font-medium hover:bg-neutral-100'
                          }`}
                        >
                          {lang}
                        </button>
                      );
                    })}
                  </div>
                  {/* Only shows up once "Other" is actually ticked, instead of always sitting
                      there whether or not it applies. */}
                  {form.languages.includes('Other') && (
                    <input
                      type="text"
                      value={form.otherLanguages}
                      onChange={setField('otherLanguages')}
                      placeholder="Other languages (comma separated)"
                      className={`${inputCls} mt-2`}
                    />
                  )}
                </div>

                <div>
                  <label className={labelCls}>
                    Lead Source <Req />
                  </label>
                  <SearchAddField
                    value={form.leadSource}
                    onChange={set('leadSource')}
                    options={LEAD_SOURCE_OPTIONS}
                    placeholder="Search or add a lead source..."
                    addNewLabel={(q) => `Add "${q}" as new lead source`}
                    emptyLabel="No matching lead source — start typing to add one."
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2.5 rounded-full border border-neutral-200 text-neutral-600 text-[13px] font-medium hover:bg-neutral-50 transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-full font-semibold text-[13px] transition-colors"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={handleVerifyAndCreate}
                  disabled={!canCreate}
                  className="flex-1 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full font-semibold text-[13px] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Verify & Create Agent
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default VerifyAgentSection;
