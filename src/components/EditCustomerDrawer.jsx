import { useState, useEffect } from 'react';
import { X, Calendar, ExternalLink } from 'lucide-react';

const EditCustomerDrawer = ({ open, onClose, selectedCustomer, onSave }) => {
	const [formData, setFormData] = useState({
		fullName: '',
		phone: '',
		email: '',
		gender: 'Other / Prefers not to disclose',
		birthdate: '',
		note: '',
		marketingConsent: false
	});

	// Populate form when selectedCustomer changes
	useEffect(() => {
		if (selectedCustomer) {
			setFormData({
				fullName: selectedCustomer.fullName || selectedCustomer.name || '',
				phone: selectedCustomer.phone || '',
				email: selectedCustomer.email || '',
				gender: selectedCustomer.gender || 'Other / Prefers not to disclose',
				birthdate: selectedCustomer.birthdate || '',
				note: selectedCustomer.note || '',
				marketingConsent: selectedCustomer.marketingConsent || false
			});
		}
	}, [selectedCustomer]);

	const handleChange = (field, value) => {
		setFormData(prev => ({
			...prev,
			[field]: value
		}));
	};

	const handleSave = () => {
		if (onSave) {
			onSave(formData);
		}
	};

	if (!open) return null;

	return (
		<>
			{/* Backdrop */}
			<div 
				className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
				onClick={onClose}
			/>

			{/* Drawer */}
			<div className={`fixed right-0 top-0 h-full w-[480px] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
				{/* Header */}
				<div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
					<h2 className="text-lg font-semibold text-gray-900">Edit customer</h2>
					<button 
						onClick={onClose}
						className="p-1 hover:bg-gray-100 rounded-full transition"
					>
						<X className="w-5 h-5 text-gray-500" />
					</button>
				</div>

				{/* Scrollable Content */}
				<div className="flex-1 overflow-y-auto px-6 py-6">
					<div className="space-y-5">
						{/* Full Name */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Full name
							</label>
							<input
								type="text"
								value={formData.fullName}
								onChange={(e) => handleChange('fullName', e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="Enter full name"
							/>
						</div>

						{/* Phone Number */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Phone number
							</label>
							<div className="flex gap-2">
								<div className="relative w-24">
									<select className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
										<option>🇱🇹 +370</option>
										<option>🇺🇸 +1</option>
										<option>🇬🇧 +44</option>
									</select>
									<div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
										<svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
										</svg>
									</div>
								</div>
								<input
									type="tel"
									value={formData.phone}
									onChange={(e) => handleChange('phone', e.target.value)}
									className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="Phone number"
								/>
							</div>
						</div>

						{/* Email */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Email
							</label>
							<input
								type="email"
								value={formData.email}
								onChange={(e) => handleChange('email', e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="Email address"
							/>
						</div>

						{/* Gender */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Gender
							</label>
							<div className="relative">
								<select
									value={formData.gender}
									onChange={(e) => handleChange('gender', e.target.value)}
									className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								>
									<option>Male</option>
									<option>Female</option>
									<option>Other / Prefers not to disclose</option>
								</select>
								<div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
									<svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
									</svg>
								</div>
							</div>
						</div>

						{/* Date of Birth */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Date of birth
							</label>
							<div className="relative">
								<input
									type="date"
									value={formData.birthdate}
									onChange={(e) => handleChange('birthdate', e.target.value)}
									className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
								<Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
							</div>
						</div>

						{/* Customer Message */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Customer message
							</label>
							<textarea
								value={formData.note}
								onChange={(e) => handleChange('note', e.target.value)}
								rows={4}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
								placeholder="Add any notes about this customer..."
							/>
						</div>

						{/* Client Settings Section */}
						<div className="pt-4 border-t border-gray-200">
							<h3 className="text-sm font-semibold text-gray-900 mb-4">Client settings</h3>

							{/* Marketing Communication Toggle */}
							<div className="flex items-start gap-3">
								<div className="flex items-center h-5">
									<input
										type="checkbox"
										checked={formData.marketingConsent}
										onChange={(e) => handleChange('marketingConsent', e.target.checked)}
										className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
									/>
								</div>
								<div className="flex-1">
									<label className="text-sm text-gray-700">
										Marketing communication
									</label>
									<p className="text-xs text-gray-500 mt-1 leading-relaxed">
										I confirm that I have received clear, informed and freely given consent from the client to receive marketing messages and other marketing messages.{' '}
										<a 
											href="https://support.phorest.com/hc/en-us/articles/360001468978" 
											target="_blank" 
											rel="noopener noreferrer"
											className="text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
										>
											Learn more about GDPR requirements
											<ExternalLink className="w-3 h-3" />
										</a>
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Footer - Sticky Save Button */}
				<div className="border-t border-gray-200 px-6 py-4 bg-white">
					<button
						onClick={handleSave}
						className="w-full bg-blue-600 text-white py-2.5 rounded-md font-medium hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
					>
						Save
					</button>
				</div>
			</div>
		</>
	);
};

export default EditCustomerDrawer;
