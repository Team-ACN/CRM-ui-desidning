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
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            {/* Generator Form */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gray-100 text-black rounded-lg">
                        <Link size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Create Payment Link</h3>
                        <p className="text-sm text-gray-500">Secure link via Cashfree</p>
                    </div>
                </div>

                <div className="space-y-4">
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
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}
                    
                    <button
                        onClick={handleCreate}
                        className="w-full bg-black hover:bg-black text-white font-medium py-2.5 rounded-lg transition-colors mt-2 shadow-sm"
                    >
                        Create Payment Link
                    </button>
                </div>
            </div>

            {/* Recently Generated Links - Bottom List */}
            <div>
                 <h4 className="font-semibold text-gray-900 mb-4">Recent Payment Links</h4>
                 <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="divide-y divide-gray-100">
                        {[
                            { id: 1, amount: '2,500', name: 'Vedamurthy N', phone: '+91 9886...', status: 'Paid', date: '2 hours ago' },
                            { id: 2, amount: '5,000', name: 'Amit Daga', phone: '+91 9876...', status: 'Pending', date: '5 hours ago' },
                            { id: 3, amount: '1,000', name: 'Sandeep', phone: '+91 9123...', status: 'Expired', date: '1 day ago' },
                        ].map((link) => (
                            <div key={link.id} className="p-4 flex items-center justify-between hover:bg-gray-50 group">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                        link.status === 'Paid' ? 'bg-green-100 text-green-600' :
                                        link.status === 'Pending' ? 'bg-orange-100 text-orange-600' :
                                        'bg-gray-100 text-gray-500'
                                    }`}>
                                        <Link size={18} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-gray-900">₹{link.amount}</span>
                                            <span className="text-xs text-gray-500">• {link.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                                                link.status === 'Paid' ? 'bg-green-50 text-green-700 border-green-100' :
                                                link.status === 'Pending' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                                'bg-gray-50 text-gray-600 border-gray-100'
                                            }`}>
                                                {link.status}
                                            </span>
                                            <span className="text-[10px] text-gray-400">{link.date}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                     <button className="p-2 text-gray-400 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors">
                                        <Copy size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentLinkGenerator;
