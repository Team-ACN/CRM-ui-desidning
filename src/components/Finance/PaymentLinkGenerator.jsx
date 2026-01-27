import React, { useState, useEffect } from 'react';
import { Link, Copy, Search, UserCheck, AlertCircle } from 'lucide-react';
import { mockAgents } from '../../data/mockAgents';

const PaymentLinkGenerator = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        number: '',
        amount: '',
        purpose: 'Acn Premium Subscription'
    });
    const [showForm, setShowForm] = useState(false);
    const [foundAgent, setFoundAgent] = useState(null);
    const [error, setError] = useState('');

    // Handle number change and agent search
    useEffect(() => {
        if (formData.number.length >= 10) {
            const agent = mockAgents.find(a => a.contact.includes(formData.number));
            if (agent) {
                setFoundAgent(agent);
                // Auto-fill Name if empty
                if (!formData.name) {
                    setFormData(prev => ({ ...prev, name: agent.name }));
                }
            } else {
                setFoundAgent(null);
            }
        } else {
            setFoundAgent(null);
        }
    }, [formData.number]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCreate = () => {
        if (!formData.name || !formData.number || !formData.amount) {
            setError('Please fill in all mandatory fields (Name, Number, Amount).');
            return;
        }
        setError('');
        // Mock generation logic
        console.log('Generating link for:', formData);
        alert('Payment link generated! (Mock)');
        setShowForm(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header Actions */}
            <div className="flex justify-end">
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                >
                    <Link size={16} />
                    {showForm ? 'Cancel Generation' : 'Create Payment Link'}
                </button>
            </div>

            {/* Generator Form (Collapsible) */}
            {showForm && (
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                        <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Link size={20} className="text-gray-500" />
                                Generate Payment Link
                            </h3>
                        </div>
                        <span className="text-xs text-gray-500">SECURE • CASHFREE</span>
                    </div>

                    <div className="p-8 space-y-6">
                        {/* Phone Number Field with Search Indicator */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="number"
                                    value={formData.number}
                                    onChange={handleChange}
                                    placeholder="Enter agent number..."
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${foundAgent ? 'border-green-300 bg-green-50' : 'border-gray-300'}`}
                                />
                                 {formData.number.length >= 10 && !foundAgent && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                       <Search size={16} />
                                    </div>
                                 )}
                                 {foundAgent && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 flex items-center gap-1">
                                        <UserCheck size={16} />
                                        <span className="text-xs font-medium">Found</span>
                                    </div>
                                 )}
                            </div>
                            {foundAgent && (
                                <p className="mt-1 text-xs text-green-600 font-medium">
                                    Linked to: {foundAgent.name} ({foundAgent.agentId})
                                </p>
                            )}
                        </div>

                        {/* Name Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Customer Name"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                             <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="customer@example.com"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Plan Selector */}
                            <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-1">Select Plan</label>
                                 <div className="relative">
                                    <select 
                                        className="w-full appearance-none bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 outline-none block p-2.5 pr-8"
                                        onChange={(e) => {
                                            const plan = e.target.value;
                                            let amount = '';
                                            let purpose = '';
                                            
                                            if (plan === 'Premium Yearly') { amount = '14999'; purpose = 'ACN Annual Membership'; }
                                            else if (plan === 'Premium Monthly') { amount = '1999'; purpose = 'ACN Monthly Membership'; }
                                            else if (plan === 'Booster Credits') { amount = '249'; purpose = 'Booster Credits Pack'; }
                                            
                                            setFormData(prev => ({ ...prev, amount, purpose }));
                                        }}
                                        defaultValue=""
                                    >
                                        <option value="" disabled>Select a Plan...</option>
                                        <option value="Premium Yearly">Premium Yearly</option>
                                        <option value="Premium Monthly">Premium Monthly</option>
                                        <option value="Booster Credits">Booster Credits</option>
                                    </select>
                                 </div>
                            </div>

                            {/* Amount Field */}
                             <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-1">
                                     Amount (INR) <span className="text-red-500">*</span>
                                 </label>
                                 <div className="relative">
                                     <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                                     <input
                                        type="number"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                 </div>
                            </div>
                        </div>
                        
                        {/* Purpose Field */}
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                             <input
                                type="text"
                                name="purpose"
                                value={formData.purpose}
                                onChange={handleChange}
                                placeholder="Purpose"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}
                        
                        <div className="flex justify-end pt-4">
                            <button
                                onClick={handleCreate}
                                className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
                            >
                                <Link size={18} />
                                Generate Link
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Recently Generated Links - Bottom List */}
            <div>
                 <h4 className="font-semibold text-gray-900 mb-4">Recent Payment Links</h4>
                 <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-900 font-semibold border-b border-gray-200">
                                <tr>
                                    <th className="p-4">Amount</th>
                                    <th className="p-4">User</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Created At</th>
                                    <th className="p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {[
                                    { id: 1, amount: '2,500', name: 'Vedamurthy N', phone: '+91 9886...', status: 'Paid', date: '2 hours ago' },
                                    { id: 2, amount: '5,000', name: 'Amit Daga', phone: '+91 9876...', status: 'Pending', date: '5 hours ago' },
                                    { id: 3, amount: '1,000', name: 'Sandeep', phone: '+91 9123...', status: 'Expired', date: '1 day ago' },
                                ].map((link) => (
                                    <tr key={link.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-bold text-gray-900">₹{link.amount}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900">{link.name}</span>
                                                <span className="text-xs text-gray-500">{link.phone}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-medium border ${
                                                link.status === 'Paid' ? 'bg-green-50 text-green-700 border-green-200' :
                                                link.status === 'Pending' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                'bg-gray-50 text-gray-600 border-gray-200'
                                            }`}>
                                                {link.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">{link.date}</td>
                                        <td className="px-4 py-3">
                                            <button className="text-gray-400 hover:text-blue-600 p-1.5 rounded hover:bg-blue-50 transition-colors">
                                                <Copy size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                 </div>
            </div>
        </div>
    );
};

export default PaymentLinkGenerator;
