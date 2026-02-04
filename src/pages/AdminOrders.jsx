import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import axios from 'axios';
import { Eye, Package, DollarSign, Calendar } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminOrders = () => {
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState('all');
	const navigate = useNavigate();

	useEffect(() => {
		fetchOrders();
	}, []);

	const fetchOrders = async () => {
		try {
			setLoading(true);
			const token = localStorage.getItem('token');
			console.log('Fetching orders with token:', token ? 'Token exists' : 'No token');
			const response = await axios.get(`${API_URL}/orders`, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});
			console.log('Orders response:', response.data);
			setOrders(response.data);
		} catch (error) {
			console.error('Error fetching orders:', error);
			console.error('Error response:', error.response?.data);
			console.error('Error status:', error.response?.status);
		} finally {
			setLoading(false);
		}
	};

	const filteredOrders = filter === 'all'
		? orders
		: orders.filter(order => order.paymentStatus === filter);

	const getStatusColor = (status) => {
		switch (status) {
			case 'paid':
				return 'bg-green-100 text-green-800 border-green-300';
			case 'pending':
				return 'bg-yellow-100 text-yellow-800 border-yellow-300';
			case 'failed':
				return 'bg-red-100 text-red-800 border-red-300';
			case 'refunded':
				return 'bg-gray-100 text-gray-800 border-gray-300';
			default:
				return 'bg-gray-100 text-gray-800 border-gray-300';
		}
	};

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	const stats = {
		total: orders.length,
		paid: orders.filter(o => o.paymentStatus === 'paid').length,
		pending: orders.filter(o => o.paymentStatus === 'pending').length,
		totalRevenue: orders
			.filter(o => o.paymentStatus === 'paid')
			.reduce((sum, o) => sum + o.totalAmount, 0)
	};

	return (
		<AdminLayout>
			<div className="p-6">
				<div className="flex justify-between items-center mb-8">
					<div>
						<h1 className="text-3xl font-bold text-gray-800">Orders Management</h1>
						<p className="text-gray-600 mt-1">Manage and track all customer orders</p>
					</div>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
					<div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-600 mb-1">Total Orders</p>
								<p className="text-3xl font-bold text-gray-900">{stats.total}</p>
							</div>
							<Package className="w-12 h-12 text-blue-500 opacity-20" />
						</div>
					</div>

					<div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-600 mb-1">Paid Orders</p>
								<p className="text-3xl font-bold text-gray-900">{stats.paid}</p>
							</div>
							<Package className="w-12 h-12 text-green-500 opacity-20" />
						</div>
					</div>

					<div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-600 mb-1">Pending Orders</p>
								<p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
							</div>
							<Package className="w-12 h-12 text-yellow-500 opacity-20" />
						</div>
					</div>

					<div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-600 mb-1">Total Revenue</p>
								<p className="text-3xl font-bold text-gray-900">€{stats.totalRevenue.toFixed(2)}</p>
							</div>
							<DollarSign className="w-12 h-12 text-purple-500 opacity-20" />
						</div>
					</div>
				</div>

				{/* Filters */}
				<div className="bg-white rounded-lg shadow-md p-4 mb-6">
					<div className="flex gap-3">
						<button
							onClick={() => setFilter('all')}
							className={`px-4 py-2 rounded-md font-medium transition ${
								filter === 'all'
									? 'bg-[#d4af37] text-white'
									: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
							}`}
						>
							All Orders
						</button>
						<button
							onClick={() => setFilter('paid')}
							className={`px-4 py-2 rounded-md font-medium transition ${
								filter === 'paid'
									? 'bg-green-500 text-white'
									: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
							}`}
						>
							Paid
						</button>
						<button
							onClick={() => setFilter('pending')}
							className={`px-4 py-2 rounded-md font-medium transition ${
								filter === 'pending'
									? 'bg-yellow-500 text-white'
									: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
							}`}
						>
							Pending
						</button>
						<button
							onClick={() => setFilter('failed')}
							className={`px-4 py-2 rounded-md font-medium transition ${
								filter === 'failed'
									? 'bg-red-500 text-white'
									: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
							}`}
						>
							Failed
						</button>
					</div>
				</div>

				{/* Orders Table */}
				<div className="bg-white rounded-lg shadow-md overflow-hidden">
					{loading ? (
						<div className="text-center py-20">
							<div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#d4af37] mx-auto mb-4"></div>
							<p className="text-gray-600">Loading orders...</p>
						</div>
					) : filteredOrders.length > 0 ? (
						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="bg-gray-50">
									<tr>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Order Number
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Customer Name
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Email
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Total Amount
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Status
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Date
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Actions
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{filteredOrders.map((order) => (
										<tr key={order._id} className="hover:bg-gray-50 transition">
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="text-sm text-gray-900">{order.customerInfo.name}</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="text-sm text-gray-600">{order.customerInfo.email}</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="text-sm font-semibold text-gray-900">
													€{order.totalAmount.toFixed(2)}
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(order.paymentStatus)}`}>
													{order.paymentStatus.toUpperCase()}
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="text-sm text-gray-600 flex items-center gap-1">
													<Calendar className="w-4 h-4" />
													{formatDate(order.createdAt)}
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm">
												<button
													onClick={() => navigate(`/admin/orders/${order._id}`)}
													className="text-[#d4af37] hover:text-[#c49d2e] font-medium flex items-center gap-1"
												>
													<Eye className="w-4 h-4" />
													View Details
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					) : (
						<div className="text-center py-20">
							<Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
							<p className="text-gray-500 text-lg">No orders found</p>
						</div>
					)}
				</div>
			</div>
		</AdminLayout>
	);
};

export default AdminOrders;
