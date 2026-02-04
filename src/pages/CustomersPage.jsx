import { useState, useEffect } from 'react';
import { ArrowUp, Mail, Download, Plus, AlertCircle, Check, X, ChevronRight, FileText } from 'lucide-react';
import { customersAPI } from '../utils/api';

const CustomersPage = () => {
	const [customers, setCustomers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [selectedCustomer, setSelectedCustomer] = useState(null);
	const [showSidebar, setShowSidebar] = useState(false);

	useEffect(() => {
		fetchCustomers();
	}, []);

	const fetchCustomers = async () => {
		try {
			const response = await customersAPI.getAll();
			setCustomers(response.data);
			setLoading(false);
		} catch (error) {
			console.error('Error fetching customers:', error);
			setLoading(false);
		}
	};

	const formatDate = (date) => {
		const d = new Date(date);
		const year = d.getFullYear();
		const month = String(d.getMonth() + 1).padStart(2, '0');
		const day = String(d.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	};

	const calculateDaysAgo = (date) => {
		const today = new Date();
		const lastVisit = new Date(date);
		const diffTime = Math.abs(today - lastVisit);
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays;
	};

	// Split name into first and last name
	const splitName = (fullName) => {
		const parts = fullName.trim().split(' ');
		if (parts.length === 1) {
			return { firstName: parts[0], lastName: '' };
		}
		const firstName = parts[0];
		const lastName = parts.slice(1).join(' ');
		return { firstName, lastName };
	};

	// Handle customer row click
	const handleCustomerClick = (customer) => {
		console.log('Customer clicked:', customer);
		setSelectedCustomer(customer);
		setShowSidebar(true);
		console.log('Sidebar should be shown:', true);
	};

	// Close sidebar
	const handleCloseSidebar = () => {
		setShowSidebar(false);
		setSelectedCustomer(null);
	};

	// Get initials from name
	const getInitials = (name) => {
		const parts = name.split(' ');
		if (parts.length >= 2) {
			return parts[0][0] + parts[1][0];
		}
		return name.substring(0, 2);
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="text-lg text-gray-600">Loading customers...</div>
			</div>
		);
	}

	return (
		<div className="flex h-screen bg-gray-50">
			{/* Main Content Area */}
			<div className={`flex-1 overflow-hidden flex flex-col transition-all duration-300 ${showSidebar ? 'mr-96' : ''}`}>
			{/* Table Container */}
			<div className="flex-1 overflow-auto bg-white">
				<table className="w-full border-collapse">
					<thead className="sticky top-0 bg-white border-b border-gray-200">
						<tr>
							<th className="text-left py-3 px-4 text-sm font-normal text-gray-600">
								<div className="flex items-center gap-1">
									<ArrowUp className="w-3 h-3 text-green-600" />
									<span>Name</span>
								</div>
							</th>
							<th className="text-left py-3 px-4 text-sm font-normal text-gray-600">Last name</th>
							<th className="text-left py-3 px-4 text-sm font-normal text-gray-600">Phone</th>
							<th className="text-left py-3 px-4 text-sm font-normal text-gray-600">Email</th>
							<th className="text-left py-3 px-4 text-sm font-normal text-gray-600">
								<div className="flex items-center gap-1">
									<span>Selected</span>
									<ArrowUp className="w-3 h-3 text-gray-400 rotate-180" />
								</div>
							</th>
							<th className="text-left py-3 px-4 text-sm font-normal text-gray-600">
								<div className="flex items-center gap-1">
									<span>Orders</span>
									<ArrowUp className="w-3 h-3 text-gray-400" />
								</div>
							</th>
							<th className="text-left py-3 px-4 text-sm font-normal text-gray-600">Last visit</th>
						</tr>
					</thead>
					<tbody>
						{customers.map((customer) => {
							const { firstName, lastName } = splitName(customer.name);
							const daysAgo = calculateDaysAgo(customer.lastVisit);
							
							return (
								<tr 
									key={customer._id} 
									className="border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer"
									onClick={() => handleCustomerClick(customer)}
								>
									<td className="py-3 px-4 text-sm text-gray-900">{firstName}</td>
									<td className="py-3 px-4 text-sm text-gray-900">{lastName}</td>
									<td className="py-3 px-4 text-sm text-gray-900">
										<div className="flex items-center gap-2">
											{customer.phone || '-'}
										</div>
									</td>
									<td className="py-3 px-4 text-sm text-blue-600">{customer.email}</td>
									<td className="py-3 px-4 text-sm">
										{/* Add selected logic here if needed */}
									</td>
									<td className="py-3 px-4 text-sm text-gray-900">{customer.totalBookings || 0}</td>
									<td className="py-3 px-4 text-sm text-gray-500">
										<div>
											<div className="text-gray-900">{formatDate(customer.lastVisit)}</div>
											<div className="text-xs text-gray-400">{daysAgo} days ago</div>
										</div>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>

			{/* Footer Bar */}
			<div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between">
				{/* Left Side */}
				<div className="flex items-center gap-3">
					<span className="text-sm text-gray-700">Total {customers.length}</span>
					<button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition text-sm font-medium">
						<Mail className="w-4 h-4" />
						Send email
					</button>
				</div>

				{/* Right Side */}
				<div className="flex items-center gap-2">
					<button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition text-sm font-medium text-gray-700">
						<Download className="w-4 h-4" />
						Export
					</button>
					<button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition text-sm font-medium text-gray-700">
						<Plus className="w-4 h-4" />
						Create
					</button>
				</div>
			</div>
		</div>

		{/* Customer Detail Sidebar */}
		{showSidebar && selectedCustomer && (
			<div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl border-l border-gray-200 z-50 flex flex-col">
				{/* Sidebar Header */}
				<div className="flex items-center justify-between p-4 border-b">
					<div className="flex items-center gap-3">
						{/* Avatar */}
						<div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
							{getInitials(selectedCustomer.name)}
						</div>
						<div>
							<h2 className="text-lg font-bold text-gray-900">{selectedCustomer.name}</h2>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<button className="text-sm text-blue-600 hover:text-blue-700 font-medium">Edit data</button>
						<button onClick={handleCloseSidebar} className="p-1 hover:bg-gray-100 rounded">
							<X className="w-5 h-5 text-gray-500" />
						</button>
					</div>
				</div>

				{/* Sidebar Content */}
				<div className="flex-1 overflow-y-auto p-6 space-y-6">
					{/* Contact Information */}
					<div>
						<div className="text-lg font-semibold text-gray-900 mb-3">{selectedCustomer.phone}</div>
						<div className="text-base text-gray-700">{selectedCustomer.email}</div>
						<button className="text-sm text-blue-600 hover:text-blue-700 mt-2 flex items-center gap-1">
							View all information
							<ChevronRight className="w-4 h-4" />
						</button>
					</div>

					{/* Notes Section */}
					<div>
						<div className="flex items-center justify-between mb-3">
							<h3 className="text-sm font-semibold text-gray-900">Notes</h3>
							<span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">0</span>
						</div>
						<div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
							<FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
							<p className="text-sm font-semibold text-gray-700 mb-1">No customer comments</p>
							<p className="text-xs text-gray-500 mb-3">There are no notes created for this customer.</p>
							<button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 mx-auto">
								<Plus className="w-4 h-4" />
								Add a note
							</button>
						</div>
					</div>

					{/* Meetings Section */}
					<div>
						<div className="flex items-center justify-between mb-3">
							<h3 className="text-sm font-semibold text-gray-900">Meetings</h3>
							<div className="flex items-center gap-2">
								<span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{selectedCustomer.totalBookings || 0}</span>
								<button className="text-sm text-blue-600 hover:text-blue-700">View all</button>
							</div>
						</div>
						<div className="bg-gray-50 rounded-lg p-4">
							<div className="text-sm text-gray-700 mb-1">{formatDate(selectedCustomer.lastVisit)}</div>
							<div className="text-xs text-gray-500 mb-2">{calculateDaysAgo(selectedCustomer.lastVisit)} days ago</div>
							<div className="flex items-center gap-2 text-sm">
								<div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center">
									<Mail className="w-4 h-4 text-blue-600" />
								</div>
								<div>
									<div className="font-semibold text-gray-900">Product Order</div>
									<div className="text-xs text-gray-500">Total Orders: {selectedCustomer.totalBookings}</div>
								</div>
							</div>
						</div>
					</div>

					{/* Consultation Forms Section */}
					<div>
						<div className="flex items-center justify-between mb-3">
							<h3 className="text-sm font-semibold text-gray-900">Consultation forms</h3>
							<span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">0</span>
						</div>
						<div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
							<FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
							<p className="text-sm font-semibold text-gray-700 mb-1">No forms</p>
							<p className="text-xs text-gray-500">There are no forms created for this customer.</p>
						</div>
					</div>
				</div>

				{/* Sidebar Footer */}
				<div className="border-t p-4 flex gap-2">
					<button className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm font-medium text-gray-700">
						Other actions
					</button>
					<button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium">
						Register for a visit
					</button>
				</div>
			</div>
		)}
	</div>
	);
	};

export default CustomersPage;
