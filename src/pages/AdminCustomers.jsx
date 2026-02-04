import { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { customersAPI } from '../utils/api';
import { X, ChevronRight, FileText, Plus, Mail, ArrowUp, Download } from 'lucide-react';
import EditCustomerDrawer from '../components/EditCustomerDrawer';

const AdminCustomers = () => {
	const [customers, setCustomers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [sortBy, setSortBy] = useState('name');
	const [sortOrder, setSortOrder] = useState('asc');
	const [selectedCustomer, setSelectedCustomer] = useState(null);
	const [showSidebar, setShowSidebar] = useState(false);
	const [showEditDrawer, setShowEditDrawer] = useState(false);

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

	const handleSort = (field) => {
		if (sortBy === field) {
			setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
		} else {
			setSortBy(field);
			setSortOrder('asc');
		}
	};

	const filteredAndSortedCustomers = customers
		.filter(customer => 
			customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(customer.phone && customer.phone.includes(searchTerm))
		)
		.sort((a, b) => {
			let aValue = a[sortBy];
			let bValue = b[sortBy];
			
			if (sortBy === 'name') {
				aValue = a.name.toLowerCase();
				bValue = b.name.toLowerCase();
			} else if (sortBy === 'lastVisit') {
				aValue = new Date(a.lastVisit);
				bValue = new Date(b.lastVisit);
			}
			
			if (sortOrder === 'asc') {
				return aValue > bValue ? 1 : -1;
			} else {
				return aValue < bValue ? 1 : -1;
			}
		});
		
		// Handle customer row click
		const handleCustomerClick = (customer) => {
			console.log('Customer clicked:', customer);
			setSelectedCustomer(customer);
			setShowSidebar(true);
		};
		
		// Close sidebar
		const handleCloseSidebar = () => {
			setShowSidebar(false);
			setSelectedCustomer(null);
		};
		
		
		const getInitials = (name) => {
			const parts = name.split(' ');
			if (parts.length >= 2) {
				return parts[0][0] + parts[1][0];
			}
			return name.substring(0, 2);
		};
		
		// Handle edit button click
		const handleEditClick = () => {
			setShowEditDrawer(true);
		};
		
		// Handle save customer
		const handleSaveCustomer = async (updatedData) => {
			try {
				await customersAPI.update(selectedCustomer._id, updatedData);
				await fetchCustomers();
				setShowEditDrawer(false);
				alert('Customer updated successfully!');
			} catch (error) {
				console.error('Error updating customer:', error);
				alert('Failed to update customer');
			}
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

	return (
		<AdminLayout>
			<div className={`flex h-full transition-all duration-300 ${showSidebar ? 'mr-96' : ''}`}>
				<div className="flex-1 p-8">
					<div className="bg-white rounded-lg shadow">
						<div className="p-4 border-b border-gray-200">
							<div className="flex items-center gap-2">
								<span className="text-gray-400">🔍</span>
								<input
									type="text"
									placeholder="Search..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="flex-1 outline-none text-gray-700"
								/>
							</div>
						</div>

					{loading ? (
						<div className="p-8 text-center text-gray-500">Loading...</div>
					) : (
						<>
							<div className="overflow-x-auto">
								<table className="w-full">
									<thead className="bg-gray-50 border-b border-gray-200">
										<tr>
											<th 
												className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
												onClick={() => handleSort('name')}
											>
												<div className="flex items-center gap-2">
													<span className="text-green-500">↑</span>
													Name
													{sortBy === 'name' && (
														<span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
													)}
												</div>
												<div className="text-xs text-gray-400 normal-case mt-1">Last name</div>
											</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Phone
											</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Email
											</th>
											<th 
												className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
												onClick={() => handleSort('totalBookings')}
											>
												<div className="flex items-center gap-2">
													Selected
													{sortBy === 'totalBookings' && (
														<span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
													)}
												</div>
											</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Orders
											</th>
											<th 
												className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
												onClick={() => handleSort('lastVisit')}
											>
												<div className="flex items-center gap-2">
													Last visit
													{sortBy === 'lastVisit' && (
														<span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
													)}
												</div>
											</th>
										</tr>
									</thead>
									<tbody className="bg-white divide-y divide-gray-200">
										{filteredAndSortedCustomers.map((customer) => {
											const { firstName, lastName } = splitName(customer.name);
																			
											return (
												<tr 
													key={customer._id} 
													className="hover:bg-gray-50 cursor-pointer"
													onClick={() => handleCustomerClick(customer)}
												>
													<td className="px-6 py-4 whitespace-nowrap">
														<div className="text-sm font-medium text-gray-900">
															{firstName}
														</div>
														<div className="text-xs text-gray-400 mt-1">{lastName}</div>
													</td>
													<td className="px-6 py-4 whitespace-nowrap">
														<div className="text-sm text-gray-900">
															{customer.phone || '-'}
														</div>
													</td>
													<td className="px-6 py-4 whitespace-nowrap">
														<div className="text-sm text-blue-600">
															{customer.email}
														</div>
													</td>
													<td className="px-6 py-4 whitespace-nowrap text-center">
														<div className="text-sm text-gray-900">
															{customer.totalBookings}
														</div>
													</td>
													<td className="px-6 py-4 whitespace-nowrap text-center">
														<div className="text-sm text-gray-900">
															{customer.totalBookings}
														</div>
													</td>
													<td className="px-6 py-4 whitespace-nowrap">
														<div className="text-sm text-gray-900">
															{formatDate(customer.lastVisit)}
														</div>
														<div className="text-xs text-gray-400">
															{calculateDaysAgo(customer.lastVisit)} days ago
														</div>
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>

							<div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
								<div className="text-sm text-gray-700">
									Total <span className="font-semibold">{filteredAndSortedCustomers.length}</span>
								</div>
								<div className="flex gap-2">
									<button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
										📧 Send email
									</button>
									<button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
										⬇️ Export
									</button>
									<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
										+ Create
									</button>
								</div>
							</div>
						</>
					)}
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
							<button 
								onClick={handleEditClick}
								className="text-sm text-blue-600 hover:text-blue-700 font-medium"
							>
								Edit data
							</button>
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
								<h3 className="text-sm font-semibold text-gray-900">Appointments</h3>
								<div className="flex items-center gap-2">
									<span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{selectedCustomer.totalBookings || 0}</span>
									<button className="text-sm text-blue-600 hover:text-blue-700">View all</button>
								</div>
							</div>
												
							{/* Services List */}
							{selectedCustomer.servicesBooked && selectedCustomer.servicesBooked.length > 0 ? (
								<div className="space-y-3 max-h-64 overflow-y-auto">
									{selectedCustomer.servicesBooked.slice(0, 5).map((service, index) => (
										<div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
											<div className="flex items-start justify-between mb-2">
												<div className="flex items-center gap-2">
													<div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center">
														<Mail className="w-4 h-4 text-blue-600" />
													</div>
													<div>
														<div className="font-semibold text-gray-900 text-sm">{service.name || 'Service'}</div>
														{service.barber && (
															<div className="text-xs text-gray-500">with {service.barber}</div>
														)}
													</div>
												</div>
												<span className={`text-xs px-2 py-1 rounded-full font-medium ${
													service.status === 'completed' ? 'bg-green-100 text-green-700' :
													service.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
													service.status === 'cancelled' ? 'bg-red-100 text-red-700' :
													'bg-yellow-100 text-yellow-700'
												}`}>
													{service.status}
												</span>
											</div>
											<div className="flex items-center justify-between text-xs">
												<div className="text-gray-600">
													{new Date(service.date).toLocaleDateString('en-US', { 
														weekday: 'short', 
														month: 'short', 
														day: 'numeric' 
													})} • {service.time}
												</div>
												<div className="font-semibold text-gray-900">${service.price}</div>
											</div>
										</div>
									))}
									{selectedCustomer.servicesBooked.length > 5 && (
										<button className="w-full text-sm text-blue-600 hover:text-blue-700 py-2 text-center">
											View all {selectedCustomer.servicesBooked.length} appointments
										</button>
									)}
								</div>
							) : (
								<div className="bg-gray-50 rounded-lg p-4 text-center">
									<div className="text-sm text-gray-600">No appointments found</div>
								</div>
							)}
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
			
			{/* Edit Customer Drawer */}
			<EditCustomerDrawer
				open={showEditDrawer}
				onClose={() => setShowEditDrawer(false)}
				selectedCustomer={selectedCustomer}
				onSave={handleSaveCustomer}
			/>
		</div>
		</AdminLayout>
	);
};

export default AdminCustomers;

