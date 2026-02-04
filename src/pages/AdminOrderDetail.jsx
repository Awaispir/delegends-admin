import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import axios from 'axios';
import { ArrowLeft, Package, User, Mail, Phone, MapPin, CreditCard } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminOrderDetail = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [order, setOrder] = useState(null);
	const [loading, setLoading] = useState(true);
	const [updating, setUpdating] = useState(false);

	useEffect(() => {
		fetchOrderDetail();
	}, [id]);

	const fetchOrderDetail = async () => {
		try {
			setLoading(true);
			const token = localStorage.getItem('token');
			const response = await axios.get(`${API_URL}/orders/${id}`, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});
			setOrder(response.data);
		} catch (error) {
			console.error('Error fetching order details:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleStatusUpdate = async (newStatus) => {
		try {
			setUpdating(true);
			const token = localStorage.getItem('token');
			await axios.patch(
				`${API_URL}/orders/${id}/status`,
				{ paymentStatus: newStatus },
				{
					headers: {
						Authorization: `Bearer ${token}`
					}
				}
			);
			setOrder({ ...order, paymentStatus: newStatus });
		} catch (error) {
			console.error('Error updating order status:', error);
			alert('Failed to update order status');
		} finally {
			setUpdating(false);
		}
	};

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
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	if (loading) {
		return (
			<AdminLayout>
				<div className="flex items-center justify-center h-96">
					<div className="text-center">
						<div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#d4af37] mx-auto mb-4"></div>
						<p className="text-gray-600">Loading order details...</p>
					</div>
				</div>
			</AdminLayout>
		);
	}

	if (!order) {
		return (
			<AdminLayout>
				<div className="flex items-center justify-center h-96">
					<div className="text-center">
						<p className="text-gray-600 text-xl mb-4">Order not found</p>
						<button
							onClick={() => navigate('/admin/orders')}
							className="bg-[#d4af37] text-white px-6 py-2 rounded-md hover:bg-[#c49d2e]"
						>
							Back to Orders
						</button>
					</div>
				</div>
			</AdminLayout>
		);
	}

	return (
		<AdminLayout>
			<div className="p-6">
				<button
					onClick={() => navigate('/admin/orders')}
					className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition"
				>
					<ArrowLeft className="w-5 h-5" />
					Back to Orders
				</button>

				<div className="flex justify-between items-start mb-8">
					<div>
						<h1 className="text-3xl font-bold text-gray-800">Order Details</h1>
						<p className="text-gray-600 mt-1">Order #{order.orderNumber}</p>
					</div>
					<span className={`px-4 py-2 inline-flex text-sm font-semibold rounded-full border ${getStatusColor(order.paymentStatus)}`}>
						{order.paymentStatus.toUpperCase()}
					</span>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Customer Information */}
					<div className="lg:col-span-2 space-y-6">
						<div className="bg-white rounded-lg shadow-md p-6">
							<h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
								<User className="w-5 h-5" />
								Customer Information
							</h2>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="flex items-start gap-3">
									<User className="w-5 h-5 text-gray-400 mt-1" />
									<div>
										<p className="text-sm text-gray-600">Name</p>
										<p className="font-semibold text-gray-900">{order.customerInfo.name}</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<Mail className="w-5 h-5 text-gray-400 mt-1" />
									<div>
										<p className="text-sm text-gray-600">Email</p>
										<p className="font-semibold text-gray-900">{order.customerInfo.email}</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<Phone className="w-5 h-5 text-gray-400 mt-1" />
									<div>
										<p className="text-sm text-gray-600">Phone</p>
										<p className="font-semibold text-gray-900">{order.customerInfo.phone}</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<MapPin className="w-5 h-5 text-gray-400 mt-1" />
									<div>
										<p className="text-sm text-gray-600">Address</p>
										<p className="font-semibold text-gray-900">{order.customerInfo.address}</p>
									</div>
								</div>
							</div>
						</div>

						{/* Order Items */}
						<div className="bg-white rounded-lg shadow-md p-6">
							<h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
								<Package className="w-5 h-5" />
								Order Items
							</h2>
							<div className="space-y-4">
								{order.items.map((item, index) => (
									<div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
										<img
											src={item.imageUrl}
											alt={item.title}
											className="w-20 h-20 object-contain rounded-md bg-white"
											onError={(e) => {
												e.target.src = 'https://via.placeholder.com/80x80?text=No+Image';
											}}
										/>
										<div className="flex-1">
											<h3 className="font-semibold text-gray-800 mb-1">{item.title}</h3>
											<p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
											<p className="text-sm text-gray-600">Price: €{item.price.toFixed(2)}</p>
										</div>
										<div className="text-right">
											<p className="text-lg font-bold text-gray-900">
												€{(item.price * item.quantity).toFixed(2)}
											</p>
										</div>
									</div>
								))}
							</div>

							<div className="mt-6 pt-6 border-t">
								<div className="flex justify-between items-center text-xl font-bold text-gray-900">
									<span>Total Amount</span>
									<span>€{order.totalAmount.toFixed(2)}</span>
								</div>
							</div>
						</div>
					</div>

					{/* Order Summary & Actions */}
					<div className="space-y-6">
						<div className="bg-white rounded-lg shadow-md p-6">
							<h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
							<div className="space-y-3">
								<div>
									<p className="text-sm text-gray-600">Order Number</p>
									<p className="font-semibold text-gray-900">{order.orderNumber}</p>
								</div>
								<div>
									<p className="text-sm text-gray-600">Order Date</p>
									<p className="font-semibold text-gray-900">{formatDate(order.createdAt)}</p>
								</div>
								<div>
									<p className="text-sm text-gray-600">Payment Status</p>
									<span className={`mt-1 px-3 py-1 inline-flex text-xs font-semibold rounded-full border ${getStatusColor(order.paymentStatus)}`}>
										{order.paymentStatus.toUpperCase()}
									</span>
								</div>
								<div>
									<p className="text-sm text-gray-600">Total Amount</p>
									<p className="text-2xl font-bold text-gray-900">€{order.totalAmount.toFixed(2)}</p>
								</div>
							</div>
						</div>

						{/* Payment Information */}
						{order.stripeSessionId && (
							<div className="bg-white rounded-lg shadow-md p-6">
								<h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
									<CreditCard className="w-5 h-5" />
									Payment Information
								</h2>
								<div className="space-y-3">
									<div>
										<p className="text-sm text-gray-600">Stripe Session ID</p>
										<p className="font-mono text-xs text-gray-900 break-all">{order.stripeSessionId}</p>
									</div>
									{order.stripePaymentIntentId && (
										<div>
											<p className="text-sm text-gray-600">Payment Intent ID</p>
											<p className="font-mono text-xs text-gray-900 break-all">{order.stripePaymentIntentId}</p>
										</div>
									)}
								</div>
							</div>
						)}

						{/* Status Update Actions */}
						<div className="bg-white rounded-lg shadow-md p-6">
							<h2 className="text-xl font-bold text-gray-800 mb-4">Update Status</h2>
							<div className="space-y-2">
								<button
									onClick={() => handleStatusUpdate('paid')}
									disabled={updating || order.paymentStatus === 'paid'}
									className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
								>
									Mark as Paid
								</button>
								<button
									onClick={() => handleStatusUpdate('pending')}
									disabled={updating || order.paymentStatus === 'pending'}
									className="w-full bg-yellow-500 text-white py-2 rounded-md hover:bg-yellow-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
								>
									Mark as Pending
								</button>
								<button
									onClick={() => handleStatusUpdate('failed')}
									disabled={updating || order.paymentStatus === 'failed'}
									className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
								>
									Mark as Failed
								</button>
								<button
									onClick={() => handleStatusUpdate('refunded')}
									disabled={updating || order.paymentStatus === 'refunded'}
									className="w-full bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
								>
									Mark as Refunded
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</AdminLayout>
	);
};

export default AdminOrderDetail;
