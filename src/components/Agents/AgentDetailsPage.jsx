import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Search, Plus, Phone, Copy, Edit, ChevronDown, Check, X, Upload } from 'lucide-react';

const mockInventories = [
  { id: 1, propId: 'PB1704', name: 'Testsigma', type: 'Apartment', price: '₹20.00 Lacs', sbua: '1200 sq ft', plot: '-', facing: 'east', micro: 'Koramangala', status: 'Hold', lastCheck: '5 days ago', img: true },
  { id: 2, propId: 'PB1703', name: 'Test Yantra Software Solutions India Pvt Ltd', type: 'Apartment', price: '₹1.00 Lacs', sbua: '1200 sq ft', plot: '-', facing: 'east', micro: 'Basavanagudi', status: 'Hold', lastCheck: '5 days ago', img: true },
  { id: 3, propId: 'PB1667', name: 'Independent Apartment for sale', type: 'Apartment', price: '₹23.46 Lacs', sbua: '2345 sq ft', plot: '-', facing: 'north', micro: 'HSR Layout', status: 'Available', lastCheck: '5 days ago', img: false },
  { id: 4, propId: 'PB0235', name: 'TruEstate (IQOL Technologies)', type: 'Plot', price: '₹0.02 Lacs', sbua: 'N/A', plot: '2000 sqft', facing: 'east', micro: 'HSR Layout', status: 'Sold', lastCheck: '5 days ago', img: true },
  { id: 5, propId: 'PA9895', name: 'Testsigma', type: 'Apartment', price: '₹10.00 Lacs', sbua: '1200 sq ft', plot: '-', facing: 'north', micro: 'Koramangala', status: 'Available', lastCheck: '7 days ago', img: true },
  { id: 6, propId: 'PA9830', name: 'Independent Apartment for sale', type: 'Apartment', price: '₹1000.00 Cr', sbua: '1500 sq ft', plot: '-', facing: 'west', micro: 'HSR Layout', status: 'Sold', lastCheck: '5 days ago', img: false },
  { id: 7, propId: 'PA9292', name: 'Presidency College', type: 'Apartment', price: '₹0.01 Lacs', sbua: '1200 sq ft', plot: '-', facing: 'north', micro: 'Hebbal', status: 'Available', lastCheck: '5 days ago', img: true },
  { id: 8, propId: 'PA7865', name: 'Independent Apartment for sale', type: 'Apartment', price: '₹2.00 Cr', sbua: '12000 sq ft', plot: '-', facing: 'east', micro: 'HSR Layout', status: 'Available', lastCheck: '9 days ago', img: true },
  { id: 9, propId: 'PA7744', name: 'Sobha Dream Acres', type: 'Apartment', price: '₹2.00 Cr', sbua: '1400 sq ft', plot: '-', facing: 'east', micro: 'Varthur', status: 'Available', lastCheck: '7 days ago', img: true },
  { id: 10, propId: 'PA7743', name: 'Independent Apartment for sale', type: 'Apartment', price: '₹1.00 Cr', sbua: '1000 sq ft', plot: '-', facing: 'north', micro: 'HSR Layout', status: 'Hold', lastCheck: '114 days ago', img: true },
  { id: 11, propId: 'PA3565', name: 'Test name change', type: 'Plot', price: '₹2.34 Cr', sbua: 'N/A', plot: '6969 sqft', facing: 'south', micro: 'N/A', status: 'Available', lastCheck: '4 days ago', img: true }
];

const AgentDetailsPage = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('inventory');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [transactionType, setTransactionType] = useState('resale');

  // Accordion states
  const [openSections, setOpenSections] = useState({
    user: true,
    plan: true,
    transactionDetails: true,
    enquiry: true,
    credits: true
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };
  
  const statusColors = {
    'Hold': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Available': 'bg-green-100 text-green-800 border-green-200',
    'Sold': 'bg-red-100 text-red-800 border-red-200'
  };

  const AccordionHeader = ({ title, section, hasEdit = false }) => (
    <div 
      className="flex items-center justify-between py-4 cursor-pointer hover:bg-gray-50 px-6 border-b border-gray-100 bg-white sticky top-0 z-10"
      onClick={() => toggleSection(section)}
    >
      <div className="flex items-center gap-2">
        <h3 className="font-bold text-sm text-gray-900">{title}</h3>
        {hasEdit && <Edit size={14} className="text-gray-400" />}
      </div>
      <ChevronDown 
        size={18} 
        className={`text-gray-500 transition-transform ${openSections[section] ? 'rotate-180' : ''}`} 
      />
    </div>
  );

  const InfoRow = ({ label, value }) => (
    <div className="flex justify-between py-2 text-sm px-6">
      <span className="text-gray-500 font-medium">{label}</span>
      <span className="text-gray-900 font-semibold text-right">{value || <span className="invisible">-</span>}</span>
    </div>
  );

  // Mock toggle rendering - in reality, rental data would be different.
  const displayedInventories = transactionType === 'rental' 
    ? mockInventories.slice(0, 4) // Show fewer mock results just for visual feedback of toggle
    : mockInventories;

  return (
    <div className="flex flex-col h-full bg-white relative w-full pt-16 overflow-hidden">
      {/* Absolute Header so it acts like the rest of the pages */}
      <header className="absolute top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between z-10 w-full">
        <div className="flex items-center text-sm">
          <Link to="/agents" className="text-gray-500 hover:text-gray-900 font-semibold text-lg mr-2 leading-none">Agents</Link>
          <span className="text-gray-400 mx-2 text-lg">/</span>
          <span className="text-gray-900 font-semibold text-lg leading-none">{id || 'INT001'}</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search" 
              className="pl-10 pr-4 py-2 w-64 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
          <button className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus size={16} />
            Add Inventory
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-white relative">
        <div className="p-6 pb-0">
          <div className="flex items-start justify-between mb-6">
            <div className="flex flex-col gap-4 w-full">
              {/* Tabs and Right Side Profile */}
              <div className="flex justify-between items-start w-full">
                
                {/* Left side: Tabs and toggles */}
                <div className="flex items-center gap-6">
                  <div className="flex space-x-6 border-b border-gray-200 pb-2">
                    {[{id: 'inventory', label: 'Inventory (11)'}, {id: 'requirement', label: 'Requirement (29)'}, {id: 'enqp', label: 'Enq P (66)'}, {id: 'enqr', label: 'Enq R (76)'}, {id: 'qc', label: 'QC (1)'}].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`pb-2 -mb-2.5 text-sm font-medium transition-colors ${
                          activeTab === tab.id 
                            ? 'text-gray-900 border-b-2 border-gray-900' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="bg-gray-800 rounded-md flex p-1 ml-4 mt-[-10px]">
                    <button 
                      onClick={() => setTransactionType('resale')}
                      className={`px-4 py-1.5 text-sm font-medium rounded shadow-sm transition-colors ${transactionType === 'resale' ? 'bg-white text-gray-900' : 'text-gray-400 hover:text-white'}`}
                    >
                      Resale
                    </button>
                    <button 
                      onClick={() => setTransactionType('rental')}
                      className={`px-4 py-1.5 text-sm font-medium rounded transition-colors ${transactionType === 'rental' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-white'}`}
                    >
                      Rental
                    </button>
                  </div>
                </div>

                {/* Right side: Profile Card to toggle sidebar */}
                {!isSidebarOpen && (
                  <div 
                    onClick={() => setIsSidebarOpen(true)}
                    className="bg-gray-50 rounded-lg p-3 flex items-center gap-4 py-2.5 min-w-[320px] shadow-sm ml-auto mt-[-10px] cursor-pointer hover:bg-gray-100 border border-gray-200 transition-colors"
                  >
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-semibold text-gray-600">
                      SJ
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate flex items-center gap-2">
                        Samarth Jangir
                        <ChevronDown size={14} className="text-gray-400" />
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5 truncate flex items-center gap-2">
                        {id || 'INT001'} | +918118823650
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Filters below tabs */}
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 bg-gray-50 text-gray-600 rounded-md text-sm hover:bg-gray-100">
                  Inventory Status
                  <ChevronDown size={14} />
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 bg-gray-50 text-gray-600 rounded-md text-sm hover:bg-gray-100">
                  Property Type
                  <ChevronDown size={14} />
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Table */}
        <div className="px-6 pb-6 w-full">
          <div className="bg-white border text-sm border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-gray-50 text-gray-900 font-semibold border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 w-4"><input type="checkbox" className="rounded border-gray-300" /></th>
                    <th className="px-4 py-3 min-w-[100px]">Property ID</th>
                    <th className="px-4 py-3 min-w-[200px]">Property Name</th>
                    <th className="px-4 py-3">Asset Type</th>
                    <th className="px-4 py-3 min-w-[100px]">Sale Price</th>
                    <th className="px-4 py-3">SBUA</th>
                    <th className="px-4 py-3">Plot Size</th>
                    <th className="px-4 py-3">Facing</th>
                    <th className="px-4 py-3 min-w-[120px]">Micromarket</th>
                    <th className="px-4 py-3 min-w-[120px]">Status</th>
                    <th className="px-4 py-3 min-w-[100px]">Last Check</th>
                    <th className="px-4 py-3 text-center">Img/Vid</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {displayedInventories.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3"><input type="checkbox" className="rounded border-gray-300" /></td>
                      <td className="px-4 py-3 text-gray-500">{row.propId}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{row.name}</td>
                      <td className="px-4 py-3 text-gray-600">{row.type}</td>
                      <td className="px-4 py-3 text-gray-600 font-medium">{row.price}</td>
                      <td className="px-4 py-3 text-gray-600">{row.sbua}</td>
                      <td className="px-4 py-3 text-gray-600">{row.plot}</td>
                      <td className="px-4 py-3 text-gray-600">{row.facing}</td>
                      <td className="px-4 py-3 text-gray-600">{row.micro}</td>
                      <td className="px-4 py-3">
                        <div className={`inline-flex items-center justify-between w-full px-2 py-1 rounded border text-xs font-medium ${statusColors[row.status]}`}>
                          {row.status}
                          <ChevronDown size={12} className="opacity-50 ml-2" />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{row.lastCheck}</td>
                      <td className="px-4 py-3 text-center">
                        {row.img ? 
                          <span className="inline-flex justify-center flex-1 w-full text-gray-600"><Check size={14} /></span> : 
                          <span className="inline-flex justify-center flex-1 w-full text-gray-900 font-bold"><X size={14} /></span>
                        }
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button className="p-1.5 text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded transition-colors inline-block mx-auto">
                          <Upload size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {displayedInventories.length === 0 && (
                    <tr>
                      <td colSpan="13" className="px-4 py-8 text-center text-gray-500">
                        No properties found for this transaction type.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Right Sidebar Dropdown overlay */}
      {isSidebarOpen && (
        <>
          <div 
            className="fixed inset-0 z-20 bg-transparent" 
            onClick={() => setIsSidebarOpen(false)}
          />
          <div className="absolute top-[80px] right-6 z-30 w-[420px] bg-white border border-gray-200 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.1)] rounded-lg flex flex-col max-h-[calc(100vh-100px)] overflow-hidden">
            {/* Sidebar Profile Header */}
            <div className="p-6 border-b border-gray-100 bg-white">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-lg font-semibold text-gray-600 shrink-0">
                    SJ
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-base font-bold text-gray-900">Samarth Jangir</h2>
                    <p className="text-xs text-gray-500 mt-0.5">{id || 'INT001'} | +918118823650</p>
                    <p className="text-xs text-gray-500 mt-3 font-medium">Credits: <span className="text-gray-900 font-bold">80</span> &nbsp;&nbsp;&nbsp; Plan: <span className="text-gray-900 font-bold">Trial</span></p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsSidebarOpen(false)} 
                  className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                >
                  <ChevronDown size={20} className="rotate-180" />
                </button>
              </div>

              {/* Icons */}
              <div className="flex items-center gap-2 mt-[-24px] justify-end">
                <button className="p-2 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-lg text-gray-500">
                  <Phone size={16} />
                </button>
                <button className="p-2 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-lg text-gray-500">
                  <Copy size={16} />
                </button>
                <button className="p-2 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-lg text-gray-500">
                  <Upload size={16} />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto pb-6">
              
              <AccordionHeader title="User Details" section="user" hasEdit />
              {openSections.user && (
                <div className="pb-4 pt-2">
                  <InfoRow label="Name" value="Samarth Jangir" />
                  <InfoRow label="Phone Number" value="+918118823650" />
                  <InfoRow label="Address" value="" />
                  <InfoRow label="Mail" value="" />
                  <InfoRow label="Firm" value="IQOL" />
                  <InfoRow label="Rera Id" value="Na" />
                  <InfoRow label="Firm Size" value="" />
                  <InfoRow label="Area Of Operation" value="PAN Bangalore" />
                  <InfoRow label="Business Category" value="N/A" />
                  <InfoRow label="Kam" value="Samarth" />
                  <InfoRow label="In Whatsapp Community" value="No" />
                  <InfoRow label="In Whatsapp Broadcast" value="" />
                  <InfoRow label="Date Of Verification" value="22/11/2024" />
                </div>
              )}

              <AccordionHeader title="Plan Details" section="plan" />
              {openSections.plan && (
                <div className="pb-4 pt-2">
                  <InfoRow label="Plan" value="trial" />
                  <InfoRow label="Expiry" value="106668435212845" />
                  <div className="px-6 flex flex-col gap-2.5 mt-4">
                    <button className="w-full bg-[#1A1F2E] hover:bg-gray-900 text-white font-medium py-2.5 rounded-lg text-sm">Upgrade to Premium</button>
                    <button className="w-full bg-black hover:bg-gray-900 text-white font-medium py-2.5 rounded-lg text-sm">Blacklist</button>
                    <button className="w-full bg-black hover:bg-gray-900 text-white font-medium py-2.5 rounded-lg text-sm">Remove Free Trial</button>
                  </div>
                </div>
              )}

              {/* Dynamic Resale / Rental Section instead of having them both in parallel */}
              <AccordionHeader 
                title={transactionType === 'resale' ? 'Resale Details' : 'Rental Details'} 
                section="transactionDetails" 
              />
              {openSections.transactionDetails && (
                <div className="pb-4 pt-2">
                  <InfoRow label="Inventory" value={transactionType === 'resale' ? "19" : "5"} />
                  <InfoRow label="Requirement" value={transactionType === 'resale' ? "38" : "12"} />
                  <InfoRow label="Enquiries Did" value={transactionType === 'resale' ? "252" : "8"} />
                  <InfoRow label="Enquiries Received" value="" />
                </div>
              )}

              <AccordionHeader title="Enquiry Details" section="enquiry" />
              {openSections.enquiry && (
                <div className="pb-4 pt-2">
                  <InfoRow label="Enquiry Today" value="" />
                  <InfoRow label="Enquiry This Week" value="" />
                  <InfoRow label="Enquiry This Month" value="" />
                </div>
              )}

              <AccordionHeader title="Credits" section="credits" />
              {openSections.credits && (
                <div className="pb-4 pt-2">
                  <InfoRow label="Monthly" value="80" />
                  <InfoRow label="Purchased" value="" />
                </div>
              )}

            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default AgentDetailsPage;
