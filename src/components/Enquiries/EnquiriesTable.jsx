import React, { useState } from 'react';
import { NotepadText, Phone } from 'lucide-react';
import StatusDropdown from './StatusDropdown';
import NotesPanel from './NotesPanel';
import CallPanel from './CallPanel';
import SoldStatusModal from './SoldStatusModal';
import {
  PROPERTY_STATUS_OPTIONS,
  PROPERTY_STATUS_STYLES,
  SOLD_STATUS,
  STATUS_OPTIONS,
  STATUS_STYLES,
} from './enquiryConstants';

const ELLIPSIS = '...';
const PAGES = [1, 2, 3, 4, 5, 6, 7, ELLIPSIS, 64];

const countNotes = (notesByParty) =>
  Object.values(notesByParty || {}).reduce((total, notes) => total + notes.length, 0);

const ICON_BUTTON_STYLES =
  'w-9 h-9 shrink-0 flex items-center justify-center rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors';

const EnquiriesTable = ({ enquiries }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [statuses, setStatuses] = useState(() =>
    Object.fromEntries(enquiries.map((enq) => [enq.id, enq.status]))
  );

  const [notesByEnquiry, setNotesByEnquiry] = useState({});
  const [notesEnquiry, setNotesEnquiry] = useState(null);
  const [callResultsByEnquiry, setCallResultsByEnquiry] = useState({});
  const [callEnquiry, setCallEnquiry] = useState(null);
  const [propertyStatuses, setPropertyStatuses] = useState(() =>
    Object.fromEntries(enquiries.map((enq) => [enq.id, enq.currentPropertyStatus]))
  );
  const [soldDetailsByEnquiry, setSoldDetailsByEnquiry] = useState({});
  const [soldEnquiry, setSoldEnquiry] = useState(null);

  const handleStatusChange = (id, status) =>
    setStatuses((prev) => ({ ...prev, [id]: status }));

  // Notes are kept per contact (buyer / seller) on each enquiry
  const handleAddNote = (id, party, text) =>
    setNotesByEnquiry((prev) => {
      const forEnquiry = prev[id] || {};
      const forParty = forEnquiry[party] || [];

      return {
        ...prev,
        [id]: {
          ...forEnquiry,
          [party]: [
            ...forParty,
            {
              id: `${id}-${party}-${forParty.length + 1}`,
              text,
              createdAt: new Date().toLocaleString(),
            },
          ],
        },
      };
    });

  const handleSaveCallResults = (id, results) =>
    setCallResultsByEnquiry((prev) => ({ ...prev, [id]: results }));

  // Sold needs the extra sale details, so it goes through the modal instead of applying directly
  const handlePropertyStatusChange = (enq, status) => {
    if (status === SOLD_STATUS) {
      setSoldEnquiry(enq);
      return;
    }
    setPropertyStatuses((prev) => ({ ...prev, [enq.id]: status }));
  };

  const handleSoldUpdate = (id, status, details) => {
    setPropertyStatuses((prev) => ({ ...prev, [id]: status }));
    setSoldDetailsByEnquiry((prev) => ({ ...prev, [id]: details }));
    setSoldEnquiry(null);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-auto max-h-[calc(100vh-270px)]">
        <table className="min-w-full text-sm text-left">
          <thead className="text-gray-900 font-semibold sticky top-0 z-10 bg-white shadow-[inset_0_-1px_0_0_rgb(229,231,235)]">
            <tr>
              <th className="h-[52px] px-4 min-w-[100px]">Property ID</th>
              <th className="h-[52px] px-4 min-w-[220px]">Property Name</th>
              <th className="h-[52px] px-4 min-w-[160px]">Buyer Name</th>
              <th className="h-[52px] px-4 min-w-[150px]">Buyer Number</th>
              <th className="h-[52px] px-4 min-w-[140px]">Buyer KAM</th>
              <th className="h-[52px] px-4 min-w-[160px]">Seller Name</th>
              <th className="h-[52px] px-4 min-w-[150px]">Seller Number</th>
              <th className="h-[52px] px-4 min-w-[140px]">Seller KAM</th>
              <th className="h-[52px] px-4 min-w-[130px]">Date of Enquiry</th>
              <th className="h-[52px] px-4 min-w-[120px] text-center">Status</th>
              <th className="h-[52px] px-4 min-w-[110px] text-center">Contacted</th>
              <th className="h-[52px] px-4 min-w-[130px] text-center">Property Status</th>
              <th className="h-[52px] px-4 min-w-[160px]">Current Property Status</th>
              <th className="h-[52px] px-4 min-w-[250px] text-center sticky right-0 z-20 bg-white shadow-[inset_1px_0_0_0_rgb(229,231,235)]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {enquiries.map((enq) => (
              <tr key={enq.id} className="group hover:bg-gray-50">
                <td className="h-[52px] px-4 text-gray-600">{enq.propertyId}</td>
                <td className="h-[52px] px-4 font-semibold text-gray-900">
                  <span className="block max-w-[220px] truncate" title={enq.propertyName}>
                    {enq.propertyName}
                  </span>
                </td>
                <td className="h-[52px] px-4 font-semibold text-gray-900">{enq.buyerName}</td>
                <td className="h-[52px] px-4 text-gray-600">{enq.buyerNumber}</td>
                <td className="h-[52px] px-4 text-gray-600">{enq.buyerKam}</td>
                <td className="h-[52px] px-4 font-semibold text-gray-900">{enq.sellerName}</td>
                <td className="h-[52px] px-4 text-gray-600">{enq.sellerNumber}</td>
                <td className="h-[52px] px-4 text-gray-600">{enq.sellerKam}</td>
                <td className="h-[52px] px-4 text-gray-600">{enq.dateOfEnquiry}</td>
                <td className="h-[52px] px-4">
                  <StatusDropdown
                    value={statuses[enq.id]}
                    options={STATUS_OPTIONS}
                    styles={STATUS_STYLES}
                    onChange={(status) => handleStatusChange(enq.id, status)}
                  />
                </td>
                <td className="h-[52px] px-4 text-center">
                  {enq.contacted
                    ? <span className="text-green-600 font-medium">Contacted</span>
                    : <span className="text-gray-400">—</span>}
                </td>
                <td className="h-[52px] px-4 text-center">
                  {enq.propertyStatus
                    ? <span className="text-red-600 font-medium">{enq.propertyStatus}</span>
                    : <span className="text-gray-400">—</span>}
                </td>
                <td className="h-[52px] px-4">
                  <StatusDropdown
                    value={propertyStatuses[enq.id]}
                    options={PROPERTY_STATUS_OPTIONS}
                    styles={PROPERTY_STATUS_STYLES}
                    onChange={(status) => handlePropertyStatusChange(enq, status)}
                  />
                </td>
                <td className="h-[52px] px-4 sticky right-0 z-10 bg-white group-hover:bg-gray-50 shadow-[inset_1px_0_0_0_rgb(229,231,235)]">
                  <div className="flex items-center justify-end gap-2">
                    {enq.feedbackAdded
                      ? <span className="text-gray-400">Added</span>
                      : (
                        <button className="bg-black hover:bg-gray-800 text-white px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap">
                          Add Feedback
                        </button>
                      )}
                    <button
                      onClick={() => setCallEnquiry(enq)}
                      className={ICON_BUTTON_STYLES}
                      aria-label="Log a call"
                      title="Log a call"
                    >
                      <Phone size={16} />
                    </button>
                    <button
                      onClick={() => setNotesEnquiry(enq)}
                      className={ICON_BUTTON_STYLES}
                      aria-label="Notes"
                      title={
                        countNotes(notesByEnquiry[enq.id])
                          ? `Notes (${countNotes(notesByEnquiry[enq.id])})`
                          : 'Notes'
                      }
                    >
                      <NotepadText size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex justify-center p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          {PAGES.map((page, i) => (
            page === ELLIPSIS
              ? (
                <span key={i} className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">
                  {ELLIPSIS}
                </span>
              )
              : (
                <button
                  key={i}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    page === currentPage
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {page}
                </button>
              )
          ))}
        </div>
      </div>

      {notesEnquiry && (
        <NotesPanel
          enquiry={notesEnquiry}
          notesByParty={notesByEnquiry[notesEnquiry.id]}
          onAddNote={handleAddNote}
          onClose={() => setNotesEnquiry(null)}
        />
      )}

      {soldEnquiry && (
        <SoldStatusModal
          enquiry={soldEnquiry}
          details={soldDetailsByEnquiry[soldEnquiry.id]}
          onCancel={() => setSoldEnquiry(null)}
          onUpdate={handleSoldUpdate}
        />
      )}

      {callEnquiry && (
        <CallPanel
          enquiry={callEnquiry}
          savedResults={callResultsByEnquiry[callEnquiry.id]}
          onSave={handleSaveCallResults}
          onClose={() => setCallEnquiry(null)}
        />
      )}
    </div>
  );
};

export default EnquiriesTable;
