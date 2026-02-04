import { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { servicesAPI } from '../utils/api';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const AdminMenu = () => {
	const [services, setServices] = useState([]);
	const [showModal, setShowModal] = useState(false);
	const [editingService, setEditingService] = useState(null);
	const [formData, setFormData] = useState({
		name: '',
		description: '',
		price: '',
		duration: '',
	});

	useEffect(() => {
		fetchServices();
	}, []);

	const fetchServices = async () => {
		try {
			const response = await servicesAPI.getAllServices();
			setServices(response.data);
		} catch (error) {
			console.error('Error fetching services:', error);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			if (editingService) {
				await servicesAPI.update(editingService._id, formData);
			} else {
				await servicesAPI.create(formData);
			}

			fetchServices();
			setShowModal(false);
			setEditingService(null);
			setFormData({ name: '', description: '', price: '', duration: '' });
		} catch (error) {
			console.error('Error saving service:', error);
			alert('Failed to save service');
		}
	};

	const handleEdit = (service) => {
		setEditingService(service);
		setFormData({
			name: service.name,
			description: service.description || '',
			price: service.price,
			duration: service.duration,
		});
		setShowModal(true);
	};

	const handleDelete = async (id) => {
		if (!confirm('Are you sure you want to delete this service?')) return;
		try {
			await servicesAPI.delete(id);
			fetchServices();
		} catch (error) {
			console.error('Error deleting service:', error);
			alert('Failed to delete service');
		}
	};

	const toggleActive = async (service) => {
		try {
			await servicesAPI.update(service._id, { ...service, isActive: !service.isActive });
			fetchServices();
		} catch (error) {
			console.error('Error updating service:', error);
		}
	};

	return (
		<AdminLayout>
			<div className="p-8">
				<div className="flex justify-between items-center mb-8">
					<h1 className="text-3xl font-bold">Services Menu</h1>
					<button
						onClick={() => {
							setEditingService(null);
							setFormData({ name: '', description: '', price: '', duration: '' });
							setShowModal(true);
						}}
						className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
					>
						<Plus className="w-5 h-5" />
						<span>Add Service</span>
					</button>
				</div>

				<div className="bg-white rounded-lg shadow overflow-hidden">
					<table className="w-full">
						<thead className="bg-gray-50">
							<tr>
								<th className="text-left py-3 px-6">Service Name</th>
								<th className="text-left py-3 px-6">Description</th>
								<th className="text-left py-3 px-6">Price</th>
								<th className="text-left py-3 px-6">Duration</th>
								<th className="text-left py-3 px-6">Status</th>
								<th className="text-left py-3 px-6">Actions</th>
							</tr>
						</thead>
						<tbody>
							{services.map((service) => (
								<tr key={service._id} className="border-b hover:bg-gray-50">
									<td className="py-4 px-6 font-semibold">{service.name}</td>
									<td className="py-4 px-6 text-sm text-gray-600">
										{service.description || 'No description'}
									</td>
									<td className="py-4 px-6 font-semibold text-green-600">€{service.price}</td>
									<td className="py-4 px-6 text-sm">{service.duration} min</td>
									<td className="py-4 px-6">
										<button
											onClick={() => toggleActive(service)}
											className={`px-3 py-1 rounded text-sm font-semibold ${
												service.isActive
													? 'bg-green-100 text-green-800'
													: 'bg-gray-100 text-gray-800'
											}`}
										>
											{service.isActive ? 'Active' : 'Inactive'}
										</button>
									</td>
									<td className="py-4 px-6">
										<div className="flex space-x-2">
											<button
												onClick={() => handleEdit(service)}
												className="p-2 text-blue-600 hover:bg-blue-50 rounded"
											>
												<Edit2 className="w-4 h-4" />
											</button>
											<button
												onClick={() => handleDelete(service._id)}
												className="p-2 text-red-600 hover:bg-red-50 rounded"
											>
												<Trash2 className="w-4 h-4" />
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
					{services.length === 0 && (
						<div className="text-center py-12 text-gray-500">
							<p>No services yet. Add your first service!</p>
						</div>
					)}
				</div>

				{/* Modal */}
				{showModal && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
						<div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
							<h2 className="text-2xl font-bold mb-6">
								{editingService ? 'Edit Service' : 'Add New Service'}
							</h2>
							<form onSubmit={handleSubmit} className="space-y-4">
								<div>
									<label className="block text-sm font-medium mb-2">Service Name *</label>
									<input
										type="text"
										required
										className="w-full px-4 py-2 border rounded-lg"
										value={formData.name}
										onChange={(e) => setFormData({ ...formData, name: e.target.value })}
									/>
								</div>
								<div>
									<label className="block text-sm font-medium mb-2">Description</label>
									<textarea
										className="w-full px-4 py-2 border rounded-lg"
										rows="3"
										value={formData.description}
										onChange={(e) => setFormData({ ...formData, description: e.target.value })}
									/>
								</div>
								<div>
									<label className="block text-sm font-medium mb-2">Price (€) *</label>
									<input
										type="number"
										required
										min="0"
										step="0.01"
										className="w-full px-4 py-2 border rounded-lg"
										value={formData.price}
										onChange={(e) => setFormData({ ...formData, price: e.target.value })}
									/>
								</div>
								<div>
									<label className="block text-sm font-medium mb-2">Duration (minutes) *</label>
									<input
										type="number"
										required
										min="1"
										className="w-full px-4 py-2 border rounded-lg"
										value={formData.duration}
										onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
									/>
								</div>
								<div className="flex space-x-3 pt-4">
									<button
										type="button"
										onClick={() => {
											setShowModal(false);
											setEditingService(null);
											setFormData({ name: '', description: '', price: '', duration: '' });
										}}
										className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
									>
										Cancel
									</button>
									<button
										type="submit"
										className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
									>
										{editingService ? 'Update' : 'Add'}
									</button>
								</div>
							</form>
						</div>
					</div>
				)}
			</div>
		</AdminLayout>
	);
};

export default AdminMenu;

